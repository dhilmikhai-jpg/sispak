const db = require("../config/database");
const bcrypt = require("bcryptjs");

const PakarModel = {
  // Cari pakar berdasarkan username
  findByUsername: async (username) => {
    const [rows] = await db.query(
      "SELECT * FROM pakar WHERE username = ?",
      [username]
    );
    return rows[0] || null;
  },

  // Cari pakar berdasarkan ID
  findById: async (id) => {
    const [rows] = await db.query(
      "SELECT id, username, nama, created_at FROM pakar WHERE id = ?",
      [id]
    );
    return rows[0] || null;
  },

  // Buat pakar baru
  create: async ({ username, password, nama }) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.query(
      "INSERT INTO pakar (username, password, nama) VALUES (?, ?, ?)",
      [username, hashedPassword, nama]
    );
    return result;
  },

  // Verifikasi password
  verifyPassword: async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
  },

  // Update password
  updatePassword: async (id, newPassword) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const [result] = await db.query(
      "UPDATE pakar SET password = ? WHERE id = ?",
      [hashedPassword, id]
    );
    return result;
  },

  // Cek apakah username sudah ada
  isUsernameExist: async (username) => {
    const [rows] = await db.query(
      "SELECT id FROM pakar WHERE username = ?",
      [username]
    );
    return rows.length > 0;
  },
};

module.exports = PakarModel;
