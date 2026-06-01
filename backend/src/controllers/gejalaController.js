const GejalaModel = require("../models/Gejala");

const GejalaController = {
  // GET /api/gejala
  getAll: async (req, res) => {
    try {
      const gejala = await GejalaModel.findAll();
      return res.status(200).json({
        success: true,
        data: gejala,
        total: gejala.length,
      });
    } catch (error) {
      console.error("getAll gejala error:", error);
      return res.status(500).json({ success: false, message: "Gagal mengambil data gejala." });
    }
  },

  // GET /api/gejala/:kode
  getByKode: async (req, res) => {
    try {
      const gejala = await GejalaModel.findByKode(req.params.kode);
      if (!gejala) {
        return res.status(404).json({ success: false, message: "Gejala tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: gejala });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data gejala." });
    }
  },

  // GET /api/gejala/kerusakan/:kodeKerusakan
  getByKerusakan: async (req, res) => {
    try {
      const gejala = await GejalaModel.findByKerusakan(req.params.kodeKerusakan);
      return res.status(200).json({ success: true, data: gejala, total: gejala.length });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data gejala." });
    }
  },

  // POST /api/gejala  (Admin only)
  create: async (req, res) => {
    try {
      const { kode_gejala, nama_gejala, mb, md } = req.body;

      // Validasi
      if (!kode_gejala || !nama_gejala || mb === undefined || md === undefined) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
      }
      if (parseFloat(mb) < 0 || parseFloat(mb) > 1 || parseFloat(md) < 0 || parseFloat(md) > 1) {
        return res.status(400).json({ success: false, message: "Nilai MB dan MD harus antara 0 dan 1." });
      }

      // Cek duplikat kode
      const exists = await GejalaModel.isKodeExist(kode_gejala);
      if (exists) {
        return res.status(409).json({ success: false, message: `Kode gejala ${kode_gejala} sudah ada.` });
      }

      await GejalaModel.create({ kode_gejala, nama_gejala, mb: parseFloat(mb), md: parseFloat(md) });

      return res.status(201).json({
        success: true,
        message: "Gejala berhasil ditambahkan.",
        data: { kode_gejala, nama_gejala, mb, md },
      });
    } catch (error) {
      console.error("create gejala error:", error);
      return res.status(500).json({ success: false, message: "Gagal menambahkan gejala." });
    }
  },

  // PUT /api/gejala/:kode  (Admin only)
  update: async (req, res) => {
    try {
      const { kode } = req.params;
      const { nama_gejala, mb, md } = req.body;

      if (!nama_gejala || mb === undefined || md === undefined) {
        return res.status(400).json({ success: false, message: "Semua field wajib diisi." });
      }

      const exists = await GejalaModel.isKodeExist(kode);
      if (!exists) {
        return res.status(404).json({ success: false, message: "Gejala tidak ditemukan." });
      }

      await GejalaModel.update(kode, { nama_gejala, mb: parseFloat(mb), md: parseFloat(md) });

      return res.status(200).json({ success: true, message: "Gejala berhasil diperbarui." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal memperbarui gejala." });
    }
  },

  // DELETE /api/gejala/:kode  (Admin only)
  delete: async (req, res) => {
    try {
      const { kode } = req.params;

      const exists = await GejalaModel.isKodeExist(kode);
      if (!exists) {
        return res.status(404).json({ success: false, message: "Gejala tidak ditemukan." });
      }

      await GejalaModel.delete(kode);

      return res.status(200).json({ success: true, message: "Gejala berhasil dihapus." });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal menghapus gejala." });
    }
  },
};

module.exports = GejalaController;
