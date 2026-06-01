const db = require("../config/database");

const RelasiModel = {
  // Ambil semua relasi
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT r.*, g.nama_gejala, k.nama_kerusakan
       FROM relasi_gejala_kerusakan r
       LEFT JOIN gejala g ON r.kode_gejala = g.kode_gejala
       LEFT JOIN kerusakan k ON r.kode_kerusakan = k.kode_kerusakan
       ORDER BY r.kode_kerusakan, r.kode_gejala`
    );
    return rows;
  },

  // Ambil relasi tanpa join (untuk CBR engine)
  findAllRaw: async () => {
    const [rows] = await db.query(
      "SELECT kode_kerusakan, kode_gejala FROM relasi_gejala_kerusakan"
    );
    return rows;
  },

  // Tambah relasi
  create: async (kodeKerusakan, kodeGejala) => {
    // Cek duplikat dulu
    const [existing] = await db.query(
      "SELECT id FROM relasi_gejala_kerusakan WHERE kode_kerusakan = ? AND kode_gejala = ?",
      [kodeKerusakan, kodeGejala]
    );
    if (existing.length > 0) return null; // sudah ada

    const [result] = await db.query(
      "INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES (?, ?)",
      [kodeKerusakan, kodeGejala]
    );
    return result;
  },

  // Hapus relasi spesifik
  delete: async (kodeKerusakan, kodeGejala) => {
    const [result] = await db.query(
      "DELETE FROM relasi_gejala_kerusakan WHERE kode_kerusakan = ? AND kode_gejala = ?",
      [kodeKerusakan, kodeGejala]
    );
    return result;
  },

  // Replace semua relasi untuk satu kerusakan
  replaceForKerusakan: async (kodeKerusakan, kodeGejalaList) => {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query(
        "DELETE FROM relasi_gejala_kerusakan WHERE kode_kerusakan = ?",
        [kodeKerusakan]
      );
      for (const kodeGejala of kodeGejalaList) {
        await conn.query(
          "INSERT INTO relasi_gejala_kerusakan (kode_kerusakan, kode_gejala) VALUES (?, ?)",
          [kodeKerusakan, kodeGejala]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },
};

module.exports = RelasiModel;
