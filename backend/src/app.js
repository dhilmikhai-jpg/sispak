const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes     = require("./routes/authRoutes");
const gejalaRoutes   = require("./routes/gejalaRoutes");
const kerusakanRoutes= require("./routes/kerusakanRoutes");
const kasusRoutes    = require("./routes/kasusRoutes");
const diagnosisRoutes= require("./routes/diagnosisRoutes");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? "https://domain-anda.com"
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger sederhana
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString("id-ID")}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/gejala",    gejalaRoutes);
app.use("/api/kerusakan", kerusakanRoutes);
app.use("/api/kasus",     kasusRoutes);
app.use("/api/diagnosis", diagnosisRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Server Sistem Pakar Diagnosa Komputer berjalan! ✅",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal server.",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Server berjalan di http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}\n`);
});

module.exports = app;
