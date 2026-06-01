const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "diagnosa_komputer",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

// Test koneksi saat startup
const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Database MySQL berhasil terhubung!");
    conn.release();
  } catch (error) {
    console.error("❌ Gagal koneksi ke database:", error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = pool;
