const KerusakanModel = require("../models/Kerusakan");
const RelasiModel = require("../models/Relasi");

const KerusakanController = {
  // GET /api/kerusakan
  getAll: async (req, res) => {
    try {
      const kerusakan = await KerusakanModel.findAllWithGejalaCount();
      return res.status(200).json({
        success: true,
        data: kerusakan,
        total: kerusakan.length,
      });
    } catch (error) {
      console.error("getAll kerusakan error:", error);
      return res.status(500).json({ success: false, message: "Gagal mengambil data kerusakan." });
    }
  },

  // GET /api/kerusakan/:kode
  getByKode: async (req, res) => {
    try {
      const kerusakan = await KerusakanModel.findByKodeWithGejala(req.params.kode);
      if (!kerusakan) {
        return res.status(404).json({ success: false, message: "Kerusakan tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: kerusakan });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data kerusakan." });
    }
  },

  // POST /api/kerusakan  (Admin only)
  create: async (req, res) => {
    try {
      const { kode_kerusakan, nama_kerusakan, keterangan, solusi, gejala_list } = req.body;

      if (!kode_kerusakan || !nama_kerusakan) {
        return res.status(400).json({ success: false, message: "Kode dan nama kerusakan wajib diisi." });
      }

      const exists = await KerusakanModel.isKodeExist(kode_kerusakan);
      if (exists) {
        return res.status(409).json({ success: false, message: `Kode kerusakan ${kode_kerusakan} sudah ada.` });
      }

      await KerusakanModel.create({ kode_kerusakan, nama_kerusakan, keterangan, solusi });

      // Simpan relasi gejala jika ada
      if (gejala_list && Array.isArray(gejala_list) && gejala_list.length > 0) {
        await RelasiModel.replaceForKerusakan(kode_kerusakan, gejala_list);
      }

      return res.status(201).json({
        success: true,
        message: "Kerusakan berhasil ditambahkan.",
        data: { kode_kerusakan, nama_kerusakan },
      });
    } catch (error) {
      console.error("create kerusakan error:", error);
      return res.status(500).json({ success: false, message: "Gagal menambahkan kerusakan." });
    }
  },

  // PUT /api/kerusakan/:kode  (Admin only)
  update: async (req, res) => {
    try {
      const { kode } = req.params;
      const { nama_kerusakan, keterangan, solusi, gejala_list } = req.body;

      if (!nama_kerusakan) {
        return res.status(400).json({ success: false, message: "Nama kerusakan wajib diisi." });
      }

      const exists = await KerusakanModel.isKodeExist(kode);
      if (!exists) {
        return res.status(404).json({ success: false, message: "Kerusakan tidak ditemukan." });
      }

      await KerusakanModel.update(kode, { nama_kerusakan, keterangan, solusi });

      // Update relasi gejala jika dikirim
      if (gejala_list && Array.isArray(gejala_list)) {
        await RelasiModel.replaceForKerusakan(kode, gejala_list);
      }

      return res.status(200).json({ success: true, message: "Kerusakan berhasil diperbarui." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui kerusakan." });
    }
  },

  // DELETE /api/kerusakan/:kode  (Admin only)
  delete: async (req, res) => {
    try {
      const { kode } = req.params;

      const exists = await KerusakanModel.isKodeExist(kode);
      if (!exists) {
        return res.status(404).json({ success: false, message: "Kerusakan tidak ditemukan." });
      }

      await KerusakanModel.delete(kode);

      return res.status(200).json({ success: true, message: "Kerusakan berhasil dihapus." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal menghapus kerusakan." });
    }
  },

  // GET /api/kerusakan/:kode/relasi  (Admin only)
  getRelasi: async (req, res) => {
    try {
      const relasi = await RelasiModel.findAll();
      const filtered = relasi.filter((r) => r.kode_kerusakan === req.params.kode);
      return res.status(200).json({ success: true, data: filtered });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data relasi." });
    }
  },

  // POST /api/kerusakan/:kode/relasi  (Admin only)
  addRelasi: async (req, res) => {
    try {
      const { kode_gejala } = req.body;
      await RelasiModel.create(req.params.kode, kode_gejala);
      return res.status(201).json({ success: true, message: "Relasi berhasil ditambahkan." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal menambahkan relasi." });
    }
  },

  // DELETE /api/kerusakan/:kode/relasi/:kodeGejala  (Admin only)
  deleteRelasi: async (req, res) => {
    try {
      await RelasiModel.delete(req.params.kode, req.params.kodeGejala);
      return res.status(200).json({ success: true, message: "Relasi berhasil dihapus." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal menghapus relasi." });
    }
  },
};

module.exports = KerusakanController;
