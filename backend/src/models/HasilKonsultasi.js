const db = require("../config/database");

const HasilKonsultasiModel = {
  // Ambil semua hasil konsultasi
  findAll: async (limit = 50, offset = 0) => {
    const [rows] = await db.query(
      `SELECT h.*, k.nama_kerusakan, k.solusi
       FROM hasil_konsultasi h
       LEFT JOIN kerusakan k ON h.kode_kerusakan_hasil = k.kode_kerusakan
       ORDER BY h.tanggal DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    return rows.map((row) => ({
      ...row,
      gejala_dipilih:
        typeof row.gejala_dipilih === "string"
          ? JSON.parse(row.gejala_dipilih)
          : row.gejala_dipilih,
    }));
  },

  // Ambil hasil berdasarkan ID
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT h.*, k.nama_kerusakan, k.keterangan, k.solusi
       FROM hasil_konsultasi h
       LEFT JOIN kerusakan k ON h.kode_kerusakan_hasil = k.kode_kerusakan
       WHERE h.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      gejala_dipilih:
        typeof rows[0].gejala_dipilih === "string"
          ? JSON.parse(rows[0].gejala_dipilih)
          : rows[0].gejala_dipilih,
    };
  },

  // Simpan hasil konsultasi
  create: async ({
    nama_user,
    gejala_dipilih,
    kode_kerusakan_hasil,
    cf_hasil,
    similarity_score,
    kasus_referensi_id,
    metode_diagnosis,
  }) => {
    const gejalStr =
      typeof gejala_dipilih === "string"
        ? gejala_dipilih
        : JSON.stringify(gejala_dipilih);

    const [result] = await db.query(
      `INSERT INTO hasil_konsultasi
       (nama_user, gejala_dipilih, kode_kerusakan_hasil, cf_hasil, similarity_score, kasus_referensi_id, metode_diagnosis)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nama_user,
        gejalStr,
        kode_kerusakan_hasil,
        cf_hasil,
        similarity_score || null,
        kasus_referensi_id || null,
        metode_diagnosis || "CBR_CF",
      ]
    );
    return result;
  },

  // Hitung total konsultasi
  count: async () => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as total FROM hasil_konsultasi"
    );
    return rows[0].total;
  },

  // Statistik kerusakan terbanyak
  statKerusakanTerbanyak: async (limit = 5) => {
    const [rows] = await db.query(
      `SELECT h.kode_kerusakan_hasil, k.nama_kerusakan, COUNT(*) as jumlah
       FROM hasil_konsultasi h
       LEFT JOIN kerusakan k ON h.kode_kerusakan_hasil = k.kode_kerusakan
       GROUP BY h.kode_kerusakan_hasil
       ORDER BY jumlah DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },

  // Statistik konsultasi per bulan
  statPerBulan: async () => {
    const [rows] = await db.query(
      `SELECT
         DATE_FORMAT(tanggal, '%Y-%m') as bulan,
         COUNT(*) as jumlah
       FROM hasil_konsultasi
       GROUP BY bulan
       ORDER BY bulan DESC
       LIMIT 12`
    );
    return rows;
  },
};

module.exports = HasilKonsultasiModel;
