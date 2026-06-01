const jwt = require("jsonwebtoken");
const PakarModel = require("../models/Pakar");
require("dotenv").config();

const AuthController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      console.log("🔍 Body received:", req.body);

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Username dan password wajib diisi.",
        });
      }

      // Cari pakar
      const pakar = await PakarModel.findByUsername(username);
      console.log("🔍 Pakar dari DB:", pakar);
      if (!pakar) {
        return res.status(401).json({
          success: false,
          message: "Username atau password salah.",
        });
      }

      // Verifikasi password
      const isValid = await PakarModel.verifyPassword(password, pakar.password);
      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: "Username atau password salah.",
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: pakar.id, username: pakar.username, nama: pakar.nama },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "24h" },
      );

      return res.status(200).json({
        success: true,
        message: "Login berhasil!",
        data: {
          token,
          pakar: {
            id: pakar.id,
            username: pakar.username,
            nama: pakar.nama,
          },
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan server.",
      });
    }
  },

  // GET /api/auth/me
  getMe: async (req, res) => {
    try {
      const pakar = await PakarModel.findById(req.pakar.id);
      if (!pakar) {
        return res
          .status(404)
          .json({ success: false, message: "Pakar tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: pakar });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Terjadi kesalahan server." });
    }
  },

  // PUT /api/auth/change-password
  changePassword: async (req, res) => {
    try {
      const { password_lama, password_baru } = req.body;
      if (!password_lama || !password_baru) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Password lama dan baru wajib diisi.",
          });
      }

      const pakar = await PakarModel.findByUsername(req.pakar.username);
      const isValid = await PakarModel.verifyPassword(
        password_lama,
        pakar.password,
      );
      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, message: "Password lama tidak sesuai." });
      }

      await PakarModel.updatePassword(req.pakar.id, password_baru);
      return res
        .status(200)
        .json({ success: true, message: "Password berhasil diubah." });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, message: "Terjadi kesalahan server." });
    }
  },
};

module.exports = AuthController;
