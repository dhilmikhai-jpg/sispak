const db = require("../config/database");

const KerusakanModel = {
  // Ambil semua kerusakan
  findAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM kerusakan ORDER BY kode_kerusakan ASC"
    );
    return rows;
  },

  // Ambil kerusakan dengan jumlah gejalanya
  findAllWithGejalaCount: async () => {
    const [rows] = await db.query(
      `SELECT k.*, COUNT(r.kode_gejala) as jumlah_gejala
       FROM kerusakan k
       LEFT JOIN relasi_gejala_kerusakan r ON k.kode_kerusakan = r.kode_kerusakan
       GROUP BY k.kode_kerusakan
       ORDER BY k.kode_kerusakan ASC`
    );
    return rows;
  },

  // Ambil kerusakan berdasarkan kode
  findByKode: async (kode) => {
    const [rows] = await db.query(
      "SELECT * FROM kerusakan WHERE kode_kerusakan = ?",
      [kode]
    );
    return rows[0] || null;
  },

  // Ambil kerusakan beserta gejala-gejalanya
  findByKodeWithGejala: async (kode) => {
    const [kerusakan] = await db.query(
      "SELECT * FROM kerusakan WHERE kode_kerusakan = ?",
      [kode]
    );
    if (!kerusakan[0]) return null;

    const [gejala] = await db.query(
      `SELECT g.* FROM gejala g
       INNER JOIN relasi_gejala_kerusakan r ON g.kode_gejala = r.kode_gejala
       WHERE r.kode_kerusakan = ?
       ORDER BY g.kode_gejala ASC`,
      [kode]
    );

    return { ...kerusakan[0], gejala };
  },

  // Buat kerusakan baru
  create: async ({ kode_kerusakan, nama_kerusakan, keterangan, solusi }) => {
    const [result] = await db.query(
      "INSERT INTO kerusakan (kode_kerusakan, nama_kerusakan, keterangan, solusi) VALUES (?, ?, ?, ?)",
      [kode_kerusakan, nama_kerusakan, keterangan, solusi]
    );
    return result;
  },

  // Update kerusakan
  update: async (kode, { nama_kerusakan, keterangan, solusi }) => {
    const [result] = await db.query(
      "UPDATE kerusakan SET nama_kerusakan = ?, keterangan = ?, solusi = ? WHERE kode_kerusakan = ?",
      [nama_kerusakan, keterangan, solusi, kode]
    );
    return result;
  },

  // Hapus kerusakan
  delete: async (kode) => {
    await db.query(
      "DELETE FROM relasi_gejala_kerusakan WHERE kode_kerusakan = ?",
      [kode]
    );
    await db.query("DELETE FROM kasus_cbr WHERE kode_kerusakan = ?", [kode]);
    const [result] = await db.query(
      "DELETE FROM kerusakan WHERE kode_kerusakan = ?",
      [kode]
    );
    return result;
  },

  // Cek apakah kode sudah ada
  isKodeExist: async (kode) => {
    const [rows] = await db.query(
      "SELECT kode_kerusakan FROM kerusakan WHERE kode_kerusakan = ?",
      [kode]
    );
    return rows.length > 0;
  },

  // Hitung total kerusakan
  count: async () => {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM kerusakan");
    return rows[0].total;
  },
};

module.exports = KerusakanModel;
