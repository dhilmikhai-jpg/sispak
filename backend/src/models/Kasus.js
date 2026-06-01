const db = require("../config/database");

const KasusModel = {
  // Ambil semua kasus
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT k.*, kr.nama_kerusakan
       FROM kasus_cbr k
       LEFT JOIN kerusakan kr ON k.kode_kerusakan = kr.kode_kerusakan
       ORDER BY k.created_at DESC`
    );
    // Parse gejala_vektor JSON
    return rows.map((row) => ({
      ...row,
      gejala_vektor:
        typeof row.gejala_vektor === "string"
          ? JSON.parse(row.gejala_vektor)
          : row.gejala_vektor,
    }));
  },

  // Ambil kasus yang sudah diverifikasi saja (untuk proses CBR)
  findVerified: async () => {
    const [rows] = await db.query(
      `SELECT k.*, kr.nama_kerusakan
       FROM kasus_cbr k
       LEFT JOIN kerusakan kr ON k.kode_kerusakan = kr.kode_kerusakan
       WHERE k.status = 'verified'
       ORDER BY k.created_at DESC`
    );
    return rows.map((row) => ({
      ...row,
      gejala_vektor:
        typeof row.gejala_vektor === "string"
          ? JSON.parse(row.gejala_vektor)
          : row.gejala_vektor,
    }));
  },

  // Ambil kasus berdasarkan ID
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT k.*, kr.nama_kerusakan, kr.solusi
       FROM kasus_cbr k
       LEFT JOIN kerusakan kr ON k.kode_kerusakan = kr.kode_kerusakan
       WHERE k.id = ?`,
      [id]
    );
    if (!rows[0]) return null;
    return {
      ...rows[0],
      gejala_vektor:
        typeof rows[0].gejala_vektor === "string"
          ? JSON.parse(rows[0].gejala_vektor)
          : rows[0].gejala_vektor,
    };
  },

  // Ambil kasus berdasarkan kerusakan
  findByKerusakan: async (kodeKerusakan) => {
    const [rows] = await db.query(
      "SELECT * FROM kasus_cbr WHERE kode_kerusakan = ? ORDER BY created_at DESC",
      [kodeKerusakan]
    );
    return rows.map((row) => ({
      ...row,
      gejala_vektor:
        typeof row.gejala_vektor === "string"
          ? JSON.parse(row.gejala_vektor)
          : row.gejala_vektor,
    }));
  },

  // Buat kasus baru (RETAIN)
  create: async ({ nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status = "unverified" }) => {
    const vektorStr =
      typeof gejala_vektor === "string"
        ? gejala_vektor
        : JSON.stringify(gejala_vektor);

    const [result] = await db.query(
      `INSERT INTO kasus_cbr (nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status)
       VALUES (?, ?, ?, ?, ?)`,
      [nama_kasus, kode_kerusakan, vektorStr, cf_nilai, status]
    );
    return result;
  },

  // Update kasus
  update: async (id, { nama_kasus, kode_kerusakan, gejala_vektor, cf_nilai, status }) => {
    const vektorStr =
      typeof gejala_vektor === "string"
        ? gejala_vektor
        : JSON.stringify(gejala_vektor);

    const [result] = await db.query(
      `UPDATE kasus_cbr
       SET nama_kasus = ?, kode_kerusakan = ?, gejala_vektor = ?, cf_nilai = ?, status = ?
       WHERE id = ?`,
      [nama_kasus, kode_kerusakan, vektorStr, cf_nilai, status, id]
    );
    return result;
  },

  // Verifikasi kasus oleh pakar
  verify: async (id) => {
    const [result] = await db.query(
      "UPDATE kasus_cbr SET status = 'verified' WHERE id = ?",
      [id]
    );
    return result;
  },

  // Hapus kasus
  delete: async (id) => {
    const [result] = await db.query(
      "DELETE FROM kasus_cbr WHERE id = ?",
      [id]
    );
    return result;
  },

  // Hitung total kasus
  count: async () => {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM kasus_cbr");
    return rows[0].total;
  },

  // Hitung kasus per status
  countByStatus: async () => {
    const [rows] = await db.query(
      `SELECT status, COUNT(*) as total
       FROM kasus_cbr
       GROUP BY status`
    );
    return rows;
  },
};

module.exports = KasusModel;
