/**
 * ============================================================
 * CASE-BASED REASONING (CBR) ENGINE
 * ============================================================
 * Siklus 4R:
 * 1. RETRIEVE  - Cari kasus paling mirip dari basis kasus
 * 2. REUSE     - Gunakan solusi kasus tersebut
 * 3. REVISE    - Sesuaikan jika perlu (via CF)
 * 4. RETAIN    - Simpan kasus baru ke basis kasus
 *
 * Similarity menggunakan: Weighted Hamming Similarity
 * sim(Q, C) = Σ(w_i * match_i) / Σ(w_i)
 * di mana w_i = MB gejala ke-i (bobot kepercayaan)
 * ============================================================
 */

/**
 * Konversi array kode gejala ke vektor biner
 * @param {Array} kodeGejalaList  - ["G01","G04","G07"]
 * @param {Array} semuaKodeGejala - ["G01","G02",...,"G39"]
 * @returns {Object} { G01: 1, G02: 0, ... }
 */
const buatVektor = (kodeGejalaList, semuaKodeGejala) => {
  const vektor = {};
  for (const kode of semuaKodeGejala) {
    vektor[kode] = kodeGejalaList.includes(kode) ? 1 : 0;
  }
  return vektor;
};

/**
 * Hitung Weighted Hamming Similarity antara query dan satu kasus
 * @param {Object} vektorQuery  - { G01:1, G02:0, ... }
 * @param {Object} vektorKasus  - { G01:1, G02:1, ... }
 * @param {Array}  semuaGejala  - [{ kode_gejala, mb }, ...]
 * @returns {number} similarity score (0-1)
 */
const hitungSimilarity = (vektorQuery, vektorKasus, semuaGejala) => {
  let totalBobot = 0;
  let bobotCocok = 0;

  for (const gejala of semuaGejala) {
    const kode = gejala.kode_gejala;
    const bobot = parseFloat(gejala.mb) || 0.5; // MB sebagai bobot

    const queryVal = vektorQuery[kode] || 0;
    const kasusVal = vektorKasus[kode] !== undefined ? vektorKasus[kode] : 0;

    totalBobot += bobot;
    if (queryVal === kasusVal) {
      bobotCocok += bobot;
    }
  }

  if (totalBobot === 0) return 0;
  return parseFloat((bobotCocok / totalBobot).toFixed(6));
};

/**
 * Hitung Cosine Similarity (alternatif)
 * @param {Object} vektorA
 * @param {Object} vektorB
 * @returns {number} cosine similarity (0-1)
 */
const hitungCosineSimilarity = (vektorA, vektorB) => {
  const keys = Object.keys(vektorA);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  for (const key of keys) {
    const a = vektorA[key] || 0;
    const b = vektorB[key] || 0;
    dotProduct += a * b;
    magA += a * a;
    magB += b * b;
  }

  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  if (magnitude === 0) return 0;
  return parseFloat((dotProduct / magnitude).toFixed(6));
};

/**
 * RETRIEVE - Cari kasus-kasus paling mirip dari basis kasus
 * @param {Array}  gejalaDipilih  - ["G01","G04","G07"]
 * @param {Array}  semuaKasus     - Array kasus dari DB
 * @param {Array}  semuaGejala    - Array semua gejala dari DB
 * @param {number} threshold      - Batas minimum similarity (default 0.5)
 * @param {number} topN           - Ambil N kasus teratas (default 3)
 * @returns {Array} kasus terurut berdasarkan similarity
 */
const retrieve = (
  gejalaDipilih,
  semuaKasus,
  semuaGejala,
  threshold = 0.5,
  topN = 3
) => {
  const semuaKodeGejala = semuaGejala.map((g) => g.kode_gejala);
  const vektorQuery = buatVektor(gejalaDipilih, semuaKodeGejala);

  const hasilSimilarity = [];

  for (const kasus of semuaKasus) {
    // Parse gejala_vektor dari JSON jika masih string
    let vektorKasus = kasus.gejala_vektor;
    if (typeof vektorKasus === "string") {
      try {
        vektorKasus = JSON.parse(vektorKasus);
      } catch {
        continue;
      }
    }

    // Hitung dua metode similarity, ambil rata-rata
    const simHamming = hitungSimilarity(vektorQuery, vektorKasus, semuaGejala);
    const simCosine = hitungCosineSimilarity(vektorQuery, vektorKasus);
    const simRataRata = (simHamming + simCosine) / 2;

    if (simRataRata >= threshold) {
      hasilSimilarity.push({
        ...kasus,
        similarity_hamming: simHamming,
        similarity_cosine: simCosine,
        similarity_score: parseFloat(simRataRata.toFixed(6)),
        similarity_persen: parseFloat((simRataRata * 100).toFixed(2)),
      });
    }
  }

  // Urutkan dari similarity tertinggi
  hasilSimilarity.sort((a, b) => b.similarity_score - a.similarity_score);

  return hasilSimilarity.slice(0, topN);
};

/**
 * REUSE - Ambil solusi dari kasus paling mirip
 * @param {Array} kasusRetrieve - hasil dari retrieve()
 * @returns {Object|null} kasus terbaik atau null
 */
const reuse = (kasusRetrieve) => {
  if (!kasusRetrieve || kasusRetrieve.length === 0) return null;
  return kasusRetrieve[0]; // kasus dengan similarity tertinggi
};

/**
 * REVISE - Sesuaikan hasil dengan CF
 * Jika similarity < 0.7, CF dikombinasikan dengan bobot similarity
 * @param {Object} kasusReuse   - kasus hasil reuse
 * @param {number} cfHasil      - nilai CF dari cfEngine
 * @param {string} kodeKerusakanCF - kode kerusakan dari CF engine
 * @returns {Object} hasil revisi
 */
const revise = (kasusReuse, cfHasil, kodeKerusakanCF) => {
  // Jika tidak ada kasus CBR, gunakan CF murni
  if (!kasusReuse) {
    return {
      metode: "CF_only",
      kode_kerusakan_final: kodeKerusakanCF,
      confidence: cfHasil,
      keterangan: "Tidak ditemukan kasus serupa, menggunakan CF murni",
    };
  }

  const sim = kasusReuse.similarity_score;

  // Jika similarity sangat tinggi (≥ 0.85), percayai CBR
  if (sim >= 0.85) {
    return {
      metode: "CBR_dominant",
      kode_kerusakan_final: kasusReuse.kode_kerusakan,
      confidence: cfHasil,
      similarity: sim,
      keterangan: `Kasus sangat mirip (${(sim * 100).toFixed(1)}%), menggunakan solusi CBR`,
    };
  }

  // Jika similarity sedang (0.5-0.85), kombinasikan CBR + CF
  if (sim >= 0.5) {
    // Jika CBR dan CF sepakat pada kerusakan yang sama
    if (kasusReuse.kode_kerusakan === kodeKerusakanCF) {
      return {
        metode: "CBR_CF_agree",
        kode_kerusakan_final: kodeKerusakanCF,
        confidence: cfHasil,
        similarity: sim,
        keterangan: `CBR dan CF sepakat: kerusakan ${kodeKerusakanCF}`,
      };
    }

    // CBR dan CF tidak sepakat, pilih berdasarkan confidence
    const cfBobot = cfHasil * (1 - sim);
    const cbrBobot = sim;

    if (cbrBobot >= cfBobot) {
      return {
        metode: "CBR_CF_disagree_CBR_wins",
        kode_kerusakan_final: kasusReuse.kode_kerusakan,
        confidence: cfHasil,
        similarity: sim,
        keterangan: `CBR lebih dominan (sim=${(sim * 100).toFixed(1)}%)`,
      };
    } else {
      return {
        metode: "CBR_CF_disagree_CF_wins",
        kode_kerusakan_final: kodeKerusakanCF,
        confidence: cfHasil,
        similarity: sim,
        keterangan: `CF lebih dominan (cf=${(cfHasil * 100).toFixed(1)}%)`,
      };
    }
  }

  // Similarity rendah, gunakan CF
  return {
    metode: "CF_dominant",
    kode_kerusakan_final: kodeKerusakanCF,
    confidence: cfHasil,
    similarity: sim,
    keterangan: "Kemiripan rendah, menggunakan CF sebagai acuan utama",
  };
};

/**
 * RETAIN - Buat data kasus baru untuk disimpan ke DB
 * @param {Array}  gejalaDipilih        - gejala yang dipilih user
 * @param {Array}  semuaKodeGejala      - semua kode gejala
 * @param {string} kodeKerusakanFinal   - hasil diagnosis akhir
 * @param {number} cfNilai              - nilai CF final
 * @param {string} namaUser             - nama user (opsional)
 * @returns {Object} data siap INSERT ke tabel kasus_cbr
 */
const retain = (
  gejalaDipilih,
  semuaKodeGejala,
  kodeKerusakanFinal,
  cfNilai,
  namaUser = null
) => {
  const vektorGejala = buatVektor(gejalaDipilih, semuaKodeGejala);

  return {
    nama_kasus: namaUser
      ? `Kasus dari ${namaUser} - ${new Date().toLocaleDateString("id-ID")}`
      : `Kasus baru - ${new Date().toLocaleDateString("id-ID")}`,
    kode_kerusakan: kodeKerusakanFinal,
    gejala_vektor: JSON.stringify(vektorGejala),
    cf_nilai: cfNilai,
    status: "unverified", // Perlu diverifikasi oleh pakar
  };
};

module.exports = {
  buatVektor,
  hitungSimilarity,
  hitungCosineSimilarity,
  retrieve,
  reuse,
  revise,
  retain,
};
