/**
 * ============================================================
 * CERTAINTY FACTOR (CF) ENGINE
 * ============================================================
 * Berdasarkan metode CF dari skripsi Muhammad Rifai (2018)
 * Rumus: CF[h,e] = MB[h,e] - MD[h,e]
 *
 * Kombinasi multiple evidence:
 * CF_combined = CF_old + CF_new * (1 - CF_old)
 * ============================================================
 */

/**
 * Hitung CF untuk satu gejala
 * @param {number} mb - Measure of Belief (0-1)
 * @param {number} md - Measure of Disbelief (0-1)
 * @returns {number} nilai CF
 */
const hitungCFSatuGejala = (mb, md) => {
  return mb - md;
};

/**
 * Kombinasikan dua nilai CF secara sekuensial
 * @param {number} cfLama - CF yang sudah ada
 * @param {number} cfBaru - CF baru yang akan digabung
 * @returns {number} CF kombinasi
 */
const kombinasiCF = (cfLama, cfBaru) => {
  // Keduanya positif
  if (cfLama >= 0 && cfBaru >= 0) {
    return cfLama + cfBaru * (1 - cfLama);
  }
  // Keduanya negatif
  if (cfLama < 0 && cfBaru < 0) {
    return cfLama + cfBaru * (1 + cfLama);
  }
  // Berbeda tanda
  return (cfLama + cfBaru) / (1 - Math.min(Math.abs(cfLama), Math.abs(cfBaru)));
};

/**
 * Hitung total CF dari sekumpulan gejala untuk satu kerusakan
 * @param {Array} gejalaList - Array of { mb, md } dari gejala yang dipilih
 * @returns {Object} { mb_total, md_total, cf_final, cf_persen }
 */
const hitungCFKerusakan = (gejalaList) => {
  if (!gejalaList || gejalaList.length === 0) {
    return { mb_total: 0, md_total: 0, cf_final: 0, cf_persen: 0 };
  }

  // --- Hitung kombinasi MB ---
  let mbKombinasi = gejalaList[0].mb;
  for (let i = 1; i < gejalaList.length; i++) {
    mbKombinasi = kombinasiCF(mbKombinasi, gejalaList[i].mb);
  }

  // --- Hitung kombinasi MD ---
  let mdKombinasi = gejalaList[0].md;
  for (let i = 1; i < gejalaList.length; i++) {
    mdKombinasi = kombinasiCF(mdKombinasi, gejalaList[i].md);
  }

  // --- CF Final ---
  const cfFinal = mbKombinasi - mdKombinasi;
  const cfPersen = parseFloat((cfFinal * 100).toFixed(4));

  return {
    mb_total: parseFloat(mbKombinasi.toFixed(6)),
    md_total: parseFloat(mdKombinasi.toFixed(6)),
    cf_final: parseFloat(cfFinal.toFixed(6)),
    cf_persen: cfPersen,
  };
};

/**
 * Interpretasi nilai CF menjadi keterangan
 * @param {number} cfNilai - nilai CF (0-1)
 * @returns {string} interpretasi
 */
const interpretasiCF = (cfNilai) => {
  if (cfNilai <= 0) return "Tidak Ada Kepastian";
  if (cfNilai <= 0.2) return "Tidak Tahu";
  if (cfNilai <= 0.4) return "Mungkin";
  if (cfNilai <= 0.6) return "Kemungkinan Besar";
  if (cfNilai <= 0.8) return "Hampir Pasti";
  return "Pasti";
};

/**
 * Proses CF untuk semua kerusakan berdasarkan gejala yang dipilih user
 * @param {Array} gejalaDipilih - Array kode gejala yang dipilih: ["G01","G04",...]
 * @param {Array} semuaGejala  - Array semua gejala dari DB: [{kode_gejala, mb, md}, ...]
 * @param {Array} relasiGejalaKerusakan - Array relasi: [{kode_kerusakan, kode_gejala}, ...]
 * @param {Array} semuaKerusakan - Array kerusakan: [{kode_kerusakan, nama_kerusakan, ...}, ...]
 * @returns {Array} hasil CF per kerusakan, diurutkan dari tertinggi
 */
const prosesCFSemua = (gejalaDipilih, semuaGejala, relasiGejalaKerusakan, semuaKerusakan) => {
  const hasilPerKerusakan = [];

  for (const kerusakan of semuaKerusakan) {
    // Ambil gejala yang relevan untuk kerusakan ini
    const relasiKerusakan = relasiGejalaKerusakan.filter(
      (r) => r.kode_kerusakan === kerusakan.kode_kerusakan
    );

    const kodeGejalaTerkait = relasiKerusakan.map((r) => r.kode_gejala);

    // Filter: hanya gejala yang dipilih user DAN relevan untuk kerusakan ini
    const gejalaMatch = gejalaDipilih.filter((kode) =>
      kodeGejalaTerkait.includes(kode)
    );

    if (gejalaMatch.length === 0) continue;

    // Ambil nilai MB/MD dari gejala yang match
    const gejalaDetail = gejalaMatch.map((kode) => {
      const gejala = semuaGejala.find((g) => g.kode_gejala === kode);
      return {
        kode_gejala: kode,
        nama_gejala: gejala ? gejala.nama_gejala : kode,
        mb: gejala ? parseFloat(gejala.mb) : 0.5,
        md: gejala ? parseFloat(gejala.md) : 0.1,
      };
    });

    const hasilCF = hitungCFKerusakan(gejalaDetail);

    hasilPerKerusakan.push({
      kode_kerusakan: kerusakan.kode_kerusakan,
      nama_kerusakan: kerusakan.nama_kerusakan,
      keterangan: kerusakan.keterangan,
      solusi: kerusakan.solusi,
      gejala_cocok: gejalaDetail,
      jumlah_gejala_cocok: gejalaMatch.length,
      jumlah_gejala_tersedia: kodeGejalaTerkait.length,
      ...hasilCF,
      interpretasi: interpretasiCF(hasilCF.cf_final),
    });
  }

  // Urutkan dari CF tertinggi
  hasilPerKerusakan.sort((a, b) => b.cf_final - a.cf_final);

  return hasilPerKerusakan;
};

module.exports = {
  hitungCFSatuGejala,
  kombinasiCF,
  hitungCFKerusakan,
  interpretasiCF,
  prosesCFSemua,
};
