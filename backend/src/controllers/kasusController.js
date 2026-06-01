const KasusModel = require("../models/Kasus");
const GejalaModel = require("../models/Gejala");
const { buatVektor } = require("../services/cbrEngine");

const KasusController = {
  // GET /api/kasus
  getAll: async (req, res) => {
    try {
      const kasus = await KasusModel.findAll();
      return res.status(200).json({
        success: true,
        data: kasus,
        total: kasus.length,
      });
    } catch (error) {
      console.error("getAll kasus error:", error);
      return res.status(500).json({ success: false, message: "Gagal mengambil data kasus." });
    }
  },

  // GET /api/kasus/:id
  getById: async (req, res) => {
    try {
      const kasus = await KasusModel.findById(req.params.id);
      if (!kasus) {
        return res.status(404).json({ success: false, message: "Kasus tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: kasus });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data kasus." });
    }
  },

  // POST /api/kasus  (Admin only)
  create: async (req, res) => {
    try {
      const { nama_kasus, kode_kerusakan, gejala_list, cf_nilai, status } = req.body;

      if (!kode_kerusakan || !gejala_list || !Array.isArray(gejala_list)) {
        return res.status(400).json({
          success: false,
          message: "kode_kerusakan dan gejala_list (array) wajib diisi.",
        });
      }

      // Buat vektor dari gejala_list
      const semuaGejala = await GejalaModel.findAll();
      const semuaKodeGejala = semuaGejala.map((g) => g.kode_gejala);
      const vektorGejala = buatVektor(gejala_list, semuaKodeGejala);

      const result = await KasusModel.create({
        nama_kasus: nama_kasus || `Kasus manual - ${kode_kerusakan}`,
        kode_kerusakan,
        gejala_vektor: JSON.stringify(vektorGejala),
        cf_nilai: cf_nilai || 0,
        status: status || "unverified",
      });

      return res.status(201).json({
        success: true,
        message: "Kasus berhasil ditambahkan.",
        data: { id: result.insertId },
      });
    } catch (error) {
      console.error("create kasus error:", error);
      return res.status(500).json({ success: false, message: "Gagal menambahkan kasus." });
    }
  },

  // PUT /api/kasus/:id  (Admin only)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { nama_kasus, kode_kerusakan, gejala_list, cf_nilai, status } = req.body;

      const exists = await KasusModel.findById(id);
      if (!exists) {
        return res.status(404).json({ success: false, message: "Kasus tidak ditemukan." });
      }

      let vektorGejala = exists.gejala_vektor;
      if (gejala_list && Array.isArray(gejala_list)) {
        const semuaGejala = await GejalaModel.findAll();
        const semuaKodeGejala = semuaGejala.map((g) => g.kode_gejala);
        vektorGejala = buatVektor(gejala_list, semuaKodeGejala);
      }

      await KasusModel.update(id, {
        nama_kasus: nama_kasus || exists.nama_kasus,
        kode_kerusakan: kode_kerusakan || exists.kode_kerusakan,
        gejala_vektor: JSON.stringify(vektorGejala),
        cf_nilai: cf_nilai !== undefined ? cf_nilai : exists.cf_nilai,
        status: status || exists.status,
      });

      return res.status(200).json({ success: true, message: "Kasus berhasil diperbarui." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui kasus." });
    }
  },

  // PATCH /api/kasus/:id/verify  (Admin only)
  verify: async (req, res) => {
    try {
      const kasus = await KasusModel.findById(req.params.id);
      if (!kasus) {
        return res.status(404).json({ success: false, message: "Kasus tidak ditemukan." });
      }
      await KasusModel.verify(req.params.id);
      return res.status(200).json({ success: true, message: "Kasus berhasil diverifikasi." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal memverifikasi kasus." });
    }
  },

  // DELETE /api/kasus/:id  (Admin only)
  delete: async (req, res) => {
    try {
      const kasus = await KasusModel.findById(req.params.id);
      if (!kasus) {
        return res.status(404).json({ success: false, message: "Kasus tidak ditemukan." });
      }
      await KasusModel.delete(req.params.id);
      return res.status(200).json({ success: true, message: "Kasus berhasil dihapus." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal menghapus kasus." });
    }
  },

  // GET /api/kasus/stats  (Admin only)
  getStats: async (req, res) => {
    try {
      const total = await KasusModel.count();
      const byStatus = await KasusModel.countByStatus();
      return res.status(200).json({ success: true, data: { total, by_status: byStatus } });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil statistik kasus." });
    }
  },
};

module.exports = KasusController;
