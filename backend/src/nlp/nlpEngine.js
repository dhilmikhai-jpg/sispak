/**
 * ============================================================
 * NLP ENGINE - Bahasa Alamiah
 * ============================================================
 * Pipeline:
 * 1. Text Preprocessing  (P10): lowercase, tokenisasi,
 *                                stopword removal, normalisasi
 * 2. Stemming            (P11): hapus afiks Bahasa Indonesia
 * 3. Semantic Matching       : cocokkan token ke kode gejala
 * ============================================================
 */

const synonyms = require('./synonyms');

// ── 1. DATA PREPROCESSING ────────────────────────────────────

/** Daftar stopword Bahasa Indonesia */
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

/** Kamus normalisasi kata tidak baku / singkatan */
const NORMALISASI = {
  // Negasi
  'ga':       'tidak',
  'gak':      'tidak',
  'ngga':     'tidak',
  'nggak':    'tidak',
  'gk':       'tidak',
  'tdk':      'tidak',
  'ga bisa':  'tidak bisa',
  'gak bisa': 'tidak bisa',
  // Waktu/kondisi
  'blm':      'belum',
  'udh':      'sudah',
  'udah':     'sudah',
  'bgt':      'banget',
  // Hardware slang
  'idup':     'hidup',
  'nyala':    'hidup',
  'bunyi':    'suara',
  'fan':      'kipas',
  'hdd':      'harddisk',
  'ssd':      'harddisk',
  'hardisk':  'harddisk',
  'hard disk':'harddisk',
  'memori':   'ram',
  'memory':   'ram',
  'psu':      'power supply',
  'gpu':      'vga',
  'mobo':     'motherboard',
  'ngeprint': 'printer',
  'ngecas':   'charger',
  'cas':      'charger',
  'charge':   'charger',
  'charger':  'charger',
  'ngisi':    'charger',
  'isi daya': 'charger',
  'baterai':  'charger',
  'batere':   'charger',
  'matot':    'mati total',
  'hang':     'macet',
  'freeze':   'macet',
  'ngehang':  'macet',
  'lemot':    'lambat',
  'lelet':    'lambat',
  'rusak':    'bermasalah',
  'error':    'bermasalah',
  'kena air': 'terkena air',
  'kebasahan':'terkena air',
  'kecipratan':'terkena air',
};

// ── 1.5 NEGATION HANDLING ────────────────────────────────────

/** Kata-kata negasi Bahasa Indonesia */
const NEGASI = new Set([
  'tidak', 'bukan', 'belum', 'tanpa', 'jangan',
  'ga', 'gak', 'ngga', 'nggak', 'gk', 'tak',
]);

/**
 * Tandai token yang berada dalam jangkauan negasi
 * Jika token ke-i adalah negasi, token ke i+1 sampai i+3 ditandai sebagai ternegasi
 * @param {Array} tokens - array token hasil preprocessing
 * @returns {Set} set index token yang ternegasi
 */
const getNegatedIndices = (tokens) => {
  const negated = new Set();
  for (let i = 0; i < tokens.length; i++) {
    if (NEGASI.has(tokens[i])) {
      // Tandai 1-2 token setelah kata negasi (jangkauan diperkecil)
      for (let j = i + 1; j <= i + 2 && j < tokens.length; j++) {
        negated.add(j);
      }
    }
  }
  return negated;
};

// ── 2. STEMMING SEDERHANA ────────────────────────────────────

/** Aturan afiks Bahasa Indonesia yang umum */
const PREFIKS = ['me', 'di', 'ke', 'ter', 'ber', 'pe', 'se'];
const SUFIKS  = ['kan', 'an', 'nya', 'i', 'lah', 'kah'];

/**
 * Stemming sederhana: hapus prefiks dan sufiks umum
 * Contoh: "dimatikan" → "mati", "berputar" → "putar"
 */
const stem = (kata) => {
  let hasil = kata;

  // Hapus sufiks
  for (const sufiks of SUFIKS) {
    if (hasil.endsWith(sufiks) && hasil.length > sufiks.length + 2) {
      hasil = hasil.slice(0, -sufiks.length);
      break;
    }
  }

  // Hapus prefiks
  for (const prefiks of PREFIKS) {
    if (hasil.startsWith(prefiks) && hasil.length > prefiks.length + 2) {
      hasil = hasil.slice(prefiks.length);
      break;
    }
  }

  return hasil;
};

// ── 3. PIPELINE UTAMA ────────────────────────────────────────

/**
 * STEP 1 - Text Preprocessing
 * lowercase → normalisasi → tokenisasi → stopword removal
 * Returns tokens beserta set index yang ternegasi
 */
const preprocess = (teks) => {
  // Lowercase
  let hasil = teks.toLowerCase();

  // Normalisasi kata tidak baku
  for (const [slang, baku] of Object.entries(NORMALISASI)) {
    hasil = hasil.replace(new RegExp(`\\b${slang}\\b`, 'g'), baku);
  }

  // Hapus tanda baca, ganti dengan spasi
  hasil = hasil.replace(/[^a-z0-9\s]/g, ' ');

  // Tokenisasi (sebelum stopword removal, untuk deteksi negasi)
  const tokensRaw = hasil.split(/\s+/).filter(t => t.length > 1);

  // Deteksi negasi SEBELUM stopword removal (agar "tidak", "bukan" masih ada)
  const negatedIndices = getNegatedIndices(tokensRaw);

  // Stopword removal — tapi simpan info negasi per token
  const filtered = [];
  const filteredNegated = new Set();

  tokensRaw.forEach((token, i) => {
    if (!STOPWORDS.has(token)) {
      const newIdx = filtered.length;
      filtered.push(token);
      if (negatedIndices.has(i)) {
        filteredNegated.add(newIdx);
      }
    }
  });

  return { tokens: filtered, negatedIndices: filteredNegated };
};

/**
 * STEP 2 - Stemming
 * Terapkan stemming ke setiap token
 */
const stemTokens = (tokens) => {
  return tokens.map(t => stem(t));
};

/**
 * STEP 3 - Semantic Matching
 * Cocokkan teks asli dan token ke kode gejala via synonyms
 * Token yang ternegasi diabaikan saat pencocokan
 */
const semanticMatch = (teksAsli, tokens, tokensStem, negatedIndices) => {
  const gejalaDitemukan = new Set();
  const teksBersih = teksAsli.toLowerCase();

  // Normalisasi teks asli juga untuk matching
  let teksNormal = teksBersih;
  for (const [slang, baku] of Object.entries(NORMALISASI)) {
    teksNormal = teksNormal.replace(new RegExp(`\\b${slang}\\b`, 'g'), baku);
  }

  // Buat versi tokens yang sudah difilter negasi
  const tokensPositif     = tokens.filter((_, i) => !negatedIndices.has(i));
  const tokensStemPositif = tokensStem.filter((_, i) => !negatedIndices.has(i));

  // Buat teks bersih tanpa kata-kata yang ternegasi (untuk substring match)
  // Caranya: hapus kata negasi beserta 1-3 kata setelahnya dari teks
  let teksPositif = teksNormal;
  const negasiPattern = Array.from(NEGASI).join('|');
  teksPositif = teksPositif.replace(
    new RegExp(`\\b(${negasiPattern})\\b(\\s+\\S+){1,3}`, 'g'), ' '
  );

  for (const [kodeGejala, keywords] of Object.entries(synonyms)) {
    for (const keyword of keywords) {
      // Strategi 1: exact substring di teks positif (sudah tanpa negasi)
      if (teksPositif.includes(keyword) || teksBersih.includes(keyword) && !teksNormal.replace(teksPositif, '').includes(keyword)) {
        // Pastikan keyword tidak ada di bagian yang ternegasi
        if (teksPositif.includes(keyword)) {
          gejalaDitemukan.add(kodeGejala);
          break;
        }
      }

      // Strategi 2 & 3: token-based matching (hanya token positif)
      const keywordTokens = keyword.split(' ').filter(k => k.length > 1);

      if (keywordTokens.length === 1) {
        const kt = keywordTokens[0];
        if (tokensPositif.includes(kt) || tokensStemPositif.includes(stem(kt))) {
          gejalaDitemukan.add(kodeGejala);
          break;
        }
      } else {
        let cocokCount = 0;
        for (const kt of keywordTokens) {
          if (tokensPositif.includes(kt) || tokensStemPositif.includes(stem(kt))) {
            cocokCount++;
          }
        }
        const threshold = Math.max(2, Math.ceil(keywordTokens.length * 0.6));
        if (cocokCount >= threshold) {
          gejalaDitemukan.add(kodeGejala);
          break;
        }
      }
    }
  }

  return Array.from(gejalaDitemukan);
};

// ── 4. FUNGSI UTAMA ──────────────────────────────────────────

/**
 * Proses teks input user → array kode gejala
 * @param {string} teks - input bebas dari user
 * @returns {Object} { gejala, tokens, tokensStem, debug }
 */
const prosesNLP = (teks) => {
  if (!teks || teks.trim() === '') {
    return { gejala: [], tokens: [], tokensStem: [], debug: [] };
  }

  // Step 1: Preprocessing + deteksi negasi
  const { tokens, negatedIndices } = preprocess(teks);

  // Step 2: Stemming
  const tokensStem = stemTokens(tokens);

  // Step 3: Semantic Matching (dengan negation handling)
  const gejala = semanticMatch(teks, tokens, tokensStem, negatedIndices);

  // Info token yang ternegasi untuk debug
  const tokensNegated = tokens
    .map((t, i) => negatedIndices.has(i) ? `[NEGASI:${t}]` : t);

  return {
    gejala,
    tokens,
    tokensStem,
    debug: {
      input: teks,
      setelah_preprocessing: tokens,
      token_negasi: tokensNegated.filter(t => t.startsWith('[NEGASI')),
      setelah_stemming: tokensStem,
      gejala_terdeteksi: gejala,
    },
  };
};

module.exports = { prosesNLP };
