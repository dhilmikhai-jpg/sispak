/**
 * ============================================================
 * NLP ENGINE - Bahasa Alamiah
 * Sistem Pakar Diagnosa Kerusakan Komputer - Kelompok 8
 * ============================================================
 * Pipeline (5 tahap):
 * 1. Parsing        : normalisasi, case folding, hapus tanda baca
 * 2. Tokenisasi     : split kata + stopword removal + deteksi negasi
 * 3. Stemming       : hapus afiks Bahasa Indonesia (prefiks & sufiks)
 * 4. Indexing       : inverted index kata → kode gejala
 * 5. Matching       : lookup index + phrase match
 * ============================================================
 */

const synonyms = require('./synonyms');

// ============================================================
// TAHAP 1 — PARSING
// ============================================================

/**
 * Kamus normalisasi: kata tidak baku / slang → bentuk baku
 * Digunakan saat parsing teks sebelum tokenisasi
 */
const NORMALISASI = {
  // Negasi informal
  'ga':          'tidak',
  'gak':         'tidak',
  'ngga':        'tidak',
  'nggak':       'tidak',
  'gk':          'tidak',
  'tdk':         'tidak',
  'ga bisa':     'tidak bisa',
  'gak bisa':    'tidak bisa',
  // Waktu / kondisi
  'blm':         'belum',
  'udh':         'sudah',
  'udah':        'sudah',
  'bgt':         'banget',
  // Slang hardware
  'idup':        'hidup',
  'nyala':       'hidup',
  'bunyi':       'suara',
  'fan':         'kipas',
  'hdd':         'harddisk',
  'ssd':         'harddisk',
  'hardisk':     'harddisk',
  'hard disk':   'harddisk',
  'memori':      'ram',
  'memory':      'ram',
  'psu':         'power supply',
  'gpu':         'vga',
  'mobo':        'motherboard',
  'ngeprint':    'printer',
  'ngecas':      'charger',
  'cas':         'charger',
  'charge':      'charger',
  'ngisi':       'charger',
  'isi daya':    'charger',
  'baterai':     'charger',
  'batere':      'charger',
  'matot':       'mati total',
  'hang':        'macet',
  'freeze':      'macet',
  'ngehang':     'macet',
  'lemot':       'lambat',
  'lelet':       'lambat',
  'rusak':       'bermasalah',
  'error':       'bermasalah',
  'kena air':    'terkena air',
  'kebasahan':   'terkena air',
  'kecipratan':  'terkena air',
};

/**
 * Parsing: normalisasi teks mentah
 * - Case folding (ubah ke huruf kecil)
 * - Normalisasi kata tidak baku
 * - Hapus tanda baca
 * @param {string} teks - teks input mentah dari user
 * @returns {string} teks hasil parsing
 */
const parse = (teks) => {
  // Case folding
  let hasil = teks.toLowerCase();

  // Normalisasi slang dan singkatan
  for (const [slang, baku] of Object.entries(NORMALISASI)) {
    hasil = hasil.replace(new RegExp(`\\b${slang}\\b`, 'g'), baku);
  }

  // Hapus tanda baca, ganti dengan spasi
  hasil = hasil.replace(/[^a-z0-9\s]/g, ' ');

  return hasil;
};

// ============================================================
// TAHAP 2 — TOKENISASI & NEGATION HANDLING
// ============================================================

/**
 * Daftar stopword Bahasa Indonesia
 * Kata-kata ini tidak memiliki makna signifikan untuk pencocokan gejala
 */
const STOPWORDS = new Set([
  'yang', 'dan', 'di', 'ke', 'dari', 'ini', 'itu', 'dengan', 'untuk',
  'pada', 'adalah', 'atau', 'juga', 'sudah', 'saya', 'aku', 'kamu',
  'dia', 'kami', 'kita', 'mereka', 'ada', 'tidak', 'bisa', 'akan',
  'saat', 'ketika', 'setelah', 'sebelum', 'karena', 'jika', 'kalau',
  'tapi', 'namun', 'tetapi', 'maka', 'lalu', 'kemudian', 'nya', 'si',
  'pun', 'lah', 'kah', 'ya', 'nih', 'sih', 'deh', 'dong', 'kok',
  'banget', 'sekali', 'sangat', 'agak', 'cukup', 'lebih', 'paling',
  'sudah', 'telah', 'sedang', 'masih', 'belum', 'pernah', 'selalu',
  'sering', 'jarang', 'kadang', 'terkadang', 'biasanya', 'umumnya',
  'laptop', 'komputer', 'pc', 'kompi', 'notebook',
]);

/**
 * Kata-kata negasi Bahasa Indonesia
 * Token setelah kata negasi akan diabaikan saat semantic matching
 */
const NEGASI = new Set([
  'tidak', 'bukan', 'belum', 'tanpa', 'jangan',
  'ga', 'gak', 'ngga', 'nggak', 'gk', 'tak',
]);

/**
 * Deteksi indeks token yang berada dalam jangkauan negasi
 * Jangkauan: 2 token setelah kata negasi
 * Contoh: "layar tidak blank tapi panas"
 *          → "blank" ternegasi, "tapi" dan "panas" tidak
 * @param {Array} tokens - array token sebelum stopword removal
 * @returns {Set} set indeks token yang ternegasi
 */
const getNegatedIndices = (tokens) => {
  const negated = new Set();
  for (let i = 0; i < tokens.length; i++) {
    if (NEGASI.has(tokens[i])) {
      for (let j = i + 1; j <= i + 2 && j < tokens.length; j++) {
        negated.add(j);
      }
    }
  }
  return negated;
};

/**
 * Tokenisasi: pecah teks menjadi array token
 * - Split berdasarkan spasi
 * - Deteksi negasi sebelum stopword removal
 * - Hapus stopword, pertahankan info negasi
 * @param {string} teksParsed - teks hasil parsing (tahap 1)
 * @returns {{ tokens: Array, negatedIndices: Set }}
 */
const tokenize = (teksParsed) => {
  // Split menjadi token mentah
  const tokensRaw = teksParsed.split(/\s+/).filter(t => t.length > 1);

  // Deteksi negasi SEBELUM stopword removal
  const negatedIndices = getNegatedIndices(tokensRaw);

  // Stopword removal, pertahankan info negasi per token
  const tokens          = [];
  const filteredNegated = new Set();

  tokensRaw.forEach((token, i) => {
    if (!STOPWORDS.has(token)) {
      const newIdx = tokens.length;
      tokens.push(token);
      if (negatedIndices.has(i)) filteredNegated.add(newIdx);
    }
  });

  return { tokens, negatedIndices: filteredNegated };
};

// ============================================================
// TAHAP 3 — STEMMING
// ============================================================

/**
 * Daftar afiks Bahasa Indonesia yang dikenali
 * Sufiks dihapus lebih dulu, kemudian prefiks
 */
const PREFIKS = ['me', 'di', 'ke', 'ter', 'ber', 'pe', 'se'];
const SUFIKS  = ['kan', 'an', 'nya', 'i', 'lah', 'kah'];

/**
 * Stemming satu kata: hapus prefiks dan sufiks
 * Aturan: hasil stem harus >= 3 karakter
 * Contoh:
 *   "dimatikan" → hapus -kan → "dimati" → hapus di- → "mati"
 *   "berputar"  → hapus ber- → "putar"
 *   "layarnya"  → hapus -nya → "layar"
 * @param {string} kata
 * @returns {string} kata dasar
 */
const stem = (kata) => {
  let hasil = kata;

  for (const sufiks of SUFIKS) {
    if (hasil.endsWith(sufiks) && hasil.length > sufiks.length + 2) {
      hasil = hasil.slice(0, -sufiks.length);
      break;
    }
  }

  for (const prefiks of PREFIKS) {
    if (hasil.startsWith(prefiks) && hasil.length > prefiks.length + 2) {
      hasil = hasil.slice(prefiks.length);
      break;
    }
  }

  return hasil;
};

/**
 * Terapkan stemming ke seluruh array token
 * @param {Array} tokens
 * @returns {Array} token hasil stemming
 */
const stemTokens = (tokens) => tokens.map(t => stem(t));

// ============================================================
// TAHAP 4 — INDEXING (INVERTED INDEX)
// ============================================================

/**
 * Bangun inverted index dari kamus sinonim (synonyms.js)
 *
 * Struktur index:
 *   { kata → Set([kodeGejala, ...]) }
 *
 * Contoh:
 *   "mati"  → Set(["G01", "G02", "G07", "G09"])
 *   "blank" → Set(["G23", "G27", "G28", "G29"])
 *   "panas" → Set(["G08"])
 *   "kipas" → Set(["G04", "G12"])
 *
 * Index dibangun sekali saat module di-load → lookup O(1) per token
 * @returns {Object} inverted index
 */
const buildIndex = () => {
  const index = {};

  for (const [kodeGejala, keywords] of Object.entries(synonyms)) {
    for (const keyword of keywords) {
      const keywordTokens = keyword.split(' ').filter(k => k.length > 1);

      for (const kt of keywordTokens) {
        // Index token asli
        if (!index[kt]) index[kt] = new Set();
        index[kt].add(kodeGejala);

        // Index bentuk stem (jika berbeda)
        const stemmed = stem(kt);
        if (stemmed !== kt) {
          if (!index[stemmed]) index[stemmed] = new Set();
          index[stemmed].add(kodeGejala);
        }
      }

      // Index frasa lengkap untuk exact phrase match
      if (!index[keyword]) index[keyword] = new Set();
      index[keyword].add(kodeGejala);
    }
  }

  return index;
};

// Index dibangun sekali saat modul di-load
const INVERTED_INDEX = buildIndex();

/**
 * Lookup satu token di inverted index
 * @param {string} token
 * @returns {Set} set kode gejala
 */
const lookupIndex = (token) => INVERTED_INDEX[token] || new Set();

// ============================================================
// TAHAP 5 — SEMANTIC MATCHING
// ============================================================

/**
 * Cocokkan token dengan gejala menggunakan inverted index
 * Token yang ternegasi diabaikan
 *
 * Strategi matching (3 lapis):
 * 1. Exact phrase match  : frasa lengkap di teks positif
 * 2. Token lookup        : setiap token di-lookup ke index
 * 3. Stem lookup         : token hasil stemming di-lookup ke index
 *
 * @param {string} teksAsli   - input asli dari user
 * @param {Array}  tokens     - token hasil tokenisasi
 * @param {Array}  tokensStem - token hasil stemming
 * @param {Set}    negatedIndices - indeks token yang ternegasi
 * @returns {Array} array kode gejala yang terdeteksi
 */
const semanticMatch = (teksAsli, tokens, tokensStem, negatedIndices) => {
  const gejalaDitemukan  = new Set();
  const gejalaCandidates = {};

  // Teks ternormalisasi untuk substring match
  let teksNormal = teksAsli.toLowerCase();
  for (const [slang, baku] of Object.entries(NORMALISASI)) {
    teksNormal = teksNormal.replace(new RegExp(`\\b${slang}\\b`, 'g'), baku);
  }

  // Hapus bagian ternegasi dari teks (untuk phrase match)
  const negasiPattern = Array.from(NEGASI).join('|');
  const teksPositif   = teksNormal.replace(
    new RegExp(`\\b(${negasiPattern})\\b(\\s+\\S+){1,2}`, 'g'), ' '
  );

  // Token yang tidak ternegasi
  const tokensPositif     = tokens.filter((_, i) => !negatedIndices.has(i));
  const tokensStemPositif = tokensStem.filter((_, i) => !negatedIndices.has(i));

  // Strategi 1: exact phrase match
  for (const [frasa, kodeSet] of Object.entries(INVERTED_INDEX)) {
    if (frasa.includes(' ') && teksPositif.includes(frasa)) {
      for (const kode of kodeSet) gejalaDitemukan.add(kode);
    }
  }

  // Strategi 2 & 3: token lookup + stem lookup
  for (const token of [...tokensPositif, ...tokensStemPositif]) {
    const matches = lookupIndex(token);
    for (const kode of matches) {
      gejalaCandidates[kode] = (gejalaCandidates[kode] || 0) + 1;
    }
  }

  for (const [kode] of Object.entries(gejalaCandidates)) {
    gejalaDitemukan.add(kode);
  }

  return Array.from(gejalaDitemukan);
};

// ============================================================
// FUNGSI UTAMA
// ============================================================

/**
 * Proses teks input user melalui pipeline NLP lengkap
 * Parsing → Tokenisasi → Stemming → Indexing → Matching
 *
 * @param {string} teks - input bebas dari user
 * @returns {Object} { gejala, tokens, tokensStem, debug }
 */
const prosesNLP = (teks) => {
  if (!teks || teks.trim() === '') {
    return { gejala: [], tokens: [], tokensStem: [], debug: {} };
  }

  // Tahap 1: Parsing
  const teksParsed = parse(teks);

  // Tahap 2: Tokenisasi + deteksi negasi
  const { tokens, negatedIndices } = tokenize(teksParsed);

  // Tahap 3: Stemming
  const tokensStem = stemTokens(tokens);

  // Tahap 4 & 5: Index lookup + Semantic Matching
  const gejala = semanticMatch(teks, tokens, tokensStem, negatedIndices);

  // Info token ternegasi untuk debug/tampilan
  const tokenNegasi = tokens
    .filter((_, i) => negatedIndices.has(i))
    .map(t => `[NEGASI:${t}]`);

  return {
    gejala,
    tokens,
    tokensStem,
    debug: {
      input              : teks,
      setelah_parsing    : teksParsed,
      setelah_tokenisasi : tokens,
      token_negasi       : tokenNegasi,
      setelah_stemming   : tokensStem,
      gejala_terdeteksi  : gejala,
    },
  };
};

module.exports = { prosesNLP, lookupIndex, INVERTED_INDEX };
