const db = require("../config/database");

const GejalaModel = {
  // Ambil semua gejala
  findAll: async () => {
    const [rows] = await db.query(
      "SELECT * FROM gejala ORDER BY kode_gejala ASC"
    );
    return rows;
  },

  // Ambil gejala berdasarkan kode
  findByKode: async (kode) => {
    const [rows] = await db.query(
      "SELECT * FROM gejala WHERE kode_gejala = ?",
      [kode]
    );
    return rows[0] || null;
  },

  // Ambil gejala berdasarkan array kode
  findByKodeBatch: async (kodeList) => {
    if (!kodeList || kodeList.length === 0) return [];
    const placeholders = kodeList.map(() => "?").join(",");
    const [rows] = await db.query(
      `SELECT * FROM gejala WHERE kode_gejala IN (${placeholders})`,
      kodeList
    );
    return rows;
  },

  // Ambil gejala berdasarkan kerusakan (via relasi)
  findByKerusakan: async (kodeKerusakan) => {
    const [rows] = await db.query(
      `SELECT g.* FROM gejala g
       INNER JOIN relasi_gejala_kerusakan r ON g.kode_gejala = r.kode_gejala
       WHERE r.kode_kerusakan = ?
       ORDER BY g.kode_gejala ASC`,
      [kodeKerusakan]
    );
    return rows;
  },

  // Buat gejala baru
  create: async ({ kode_gejala, nama_gejala, mb, md }) => {
    const [result] = await db.query(
      "INSERT INTO gejala (kode_gejala, nama_gejala, mb, md) VALUES (?, ?, ?, ?)",
      [kode_gejala, nama_gejala, mb, md]
    );
    return result;
  },

  // Update gejala
  update: async (kode, { nama_gejala, mb, md }) => {
    const [result] = await db.query(
      "UPDATE gejala SET nama_gejala = ?, mb = ?, md = ? WHERE kode_gejala = ?",
      [nama_gejala, mb, md, kode]
    );
    return result;
  },

  // Hapus gejala
  delete: async (kode) => {
    // Hapus relasi dulu
    await db.query(
      "DELETE FROM relasi_gejala_kerusakan WHERE kode_gejala = ?",
      [kode]
    );
    const [result] = await db.query(
      "DELETE FROM gejala WHERE kode_gejala = ?",
      [kode]
    );
    return result;
  },

  // Cek apakah kode sudah ada
  isKodeExist: async (kode) => {
    const [rows] = await db.query(
      "SELECT kode_gejala FROM gejala WHERE kode_gejala = ?",
      [kode]
    );
    return rows.length > 0;
  },

  // Hitung total gejala
  count: async () => {
    const [rows] = await db.query("SELECT COUNT(*) as total FROM gejala");
    return rows[0].total;
  },
};

module.exports = GejalaModel;
