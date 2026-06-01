const GejalaModel = require("../models/Gejala");
const KerusakanModel = require("../models/Kerusakan");
const KasusModel = require("../models/Kasus");
const HasilKonsultasiModel = require("../models/HasilKonsultasi");
const RelasiModel = require("../models/Relasi");

const { prosesCFSemua } = require("../services/cfEngine");
const { retrieve, reuse, revise, retain } = require("../services/cbrEngine");

const DiagnosisController = {
  /**
   * POST /api/diagnosis
   * Body: { nama_user, gejala_dipilih: ["G01","G04",...] }
   * Alur: CBR (Retrieve → Reuse → Revise) + CF → Retain → Simpan
   */
  diagnose: async (req, res) => {
    try {
      const { nama_user, gejala_dipilih } = req.body;

      // ── Validasi input ──────────────────────────────────────────
      if (!gejala_dipilih || !Array.isArray(gejala_dipilih) || gejala_dipilih.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Pilih minimal 1 gejala untuk melakukan diagnosis.",
        });
      }

      // ── Ambil semua data dari DB ────────────────────────────────
      const [semuaGejala, semuaKerusakan, semuaRelasi, kasusVerified] = await Promise.all([
        GejalaModel.findAll(),
        KerusakanModel.findAll(),
        RelasiModel.findAllRaw(),
        KasusModel.findVerified(),
      ]);

      const semuaKodeGejala = semuaGejala.map((g) => g.kode_gejala);

      // ── LANGKAH 1: CF Engine ────────────────────────────────────
      const hasilCF = prosesCFSemua(
        gejala_dipilih,
        semuaGejala,
        semuaRelasi,
        semuaKerusakan
      );

      const cfTerbaik = hasilCF[0] || null;
      const cfNilaiTerbaik = cfTerbaik ? cfTerbaik.cf_final : 0;
      const kodeKerusakanCF = cfTerbaik ? cfTerbaik.kode_kerusakan : null;

      // ── LANGKAH 2: CBR - RETRIEVE ───────────────────────────────
      const kasusRetrieved = retrieve(
        gejala_dipilih,
        kasusVerified,
        semuaGejala,
        0.4, // threshold similarity minimum
        3    // ambil 3 kasus teratas
      );

      // ── LANGKAH 3: CBR - REUSE ──────────────────────────────────
      const kasusReuse = reuse(kasusRetrieved);

      // ── LANGKAH 4: CBR - REVISE (kombinasi CBR + CF) ────────────
      const hasilRevise = revise(kasusReuse, cfNilaiTerbaik, kodeKerusakanCF);

      const kodeKerusakanFinal = hasilRevise.kode_kerusakan_final;

      // Ambil detail kerusakan final
      const kerusakanFinal = semuaKerusakan.find(
        (k) => k.kode_kerusakan === kodeKerusakanFinal
      );

      // Ambil detail gejala yang dipilih
      const gejalaDetail = await GejalaModel.findByKodeBatch(gejala_dipilih);

      // ── LANGKAH 5: Simpan Hasil Konsultasi ─────────────────────
      const hasilInsert = await HasilKonsultasiModel.create({
        nama_user: nama_user || "Anonim",
        gejala_dipilih,
        kode_kerusakan_hasil: kodeKerusakanFinal,
        cf_hasil: cfNilaiTerbaik,
        similarity_score: kasusReuse ? kasusReuse.similarity_score : null,
        kasus_referensi_id: kasusReuse ? kasusReuse.id : null,
        metode_diagnosis: hasilRevise.metode,
      });

      // ── LANGKAH 6: CBR - RETAIN (simpan kasus baru) ─────────────
      let kasusBaruId = null;
      if (kodeKerusakanFinal) {
        const dataKasusBaru = retain(
          gejala_dipilih,
          semuaKodeGejala,
          kodeKerusakanFinal,
          cfNilaiTerbaik,
          nama_user
        );
        const kasusInsert = await KasusModel.create(dataKasusBaru);
        kasusBaruId = kasusInsert.insertId;
      }

      // ── Susun response ──────────────────────────────────────────
      return res.status(200).json({
        success: true,
        message: "Diagnosis berhasil dilakukan.",
        data: {
          // Hasil utama
          konsultasi_id: hasilInsert.insertId,
          nama_user: nama_user || "Anonim",

          // Hasil diagnosis
          diagnosis: {
            kode_kerusakan: kodeKerusakanFinal,
            nama_kerusakan: kerusakanFinal ? kerusakanFinal.nama_kerusakan : "-",
            keterangan: kerusakanFinal ? kerusakanFinal.keterangan : "-",
            solusi: kerusakanFinal ? kerusakanFinal.solusi : "-",
          },

          // Detail CF
          certainty_factor: {
            nilai: cfNilaiTerbaik,
            persen: parseFloat((cfNilaiTerbaik * 100).toFixed(2)),
            interpretasi: cfTerbaik ? cfTerbaik.interpretasi : "-",
          },

          // Detail CBR
          cbr: {
            kasus_mirip: kasusRetrieved.map((k) => ({
              id: k.id,
              nama_kasus: k.nama_kasus,
              nama_kerusakan: k.nama_kerusakan,
              similarity_score: k.similarity_score,
              similarity_persen: k.similarity_persen,
            })),
            kasus_referensi: kasusReuse
              ? {
                  id: kasusReuse.id,
                  nama_kasus: kasusReuse.nama_kasus,
                  similarity_persen: kasusReuse.similarity_persen,
                }
              : null,
            metode: hasilRevise.metode,
            keterangan_metode: hasilRevise.keterangan,
            kasus_baru_id: kasusBaruId,
          },

          // Semua kandidat kerusakan dengan CF-nya
          semua_kandidat: hasilCF.map((h) => ({
            kode_kerusakan: h.kode_kerusakan,
            nama_kerusakan: h.nama_kerusakan,
            cf_nilai: h.cf_final,
            cf_persen: h.cf_persen,
            interpretasi: h.interpretasi,
            jumlah_gejala_cocok: h.jumlah_gejala_cocok,
          })),

          // Gejala yang dipilih
          gejala_dipilih: gejalaDetail,
        },
      });
    } catch (error) {
      console.error("Diagnosis error:", error);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan saat proses diagnosis.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // GET /api/diagnosis/laporan
  getLaporan: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;

      const [hasil, total, statKerusakan, statBulan] = await Promise.all([
        HasilKonsultasiModel.findAll(limit, offset),
        HasilKonsultasiModel.count(),
        HasilKonsultasiModel.statKerusakanTerbanyak(5),
        HasilKonsultasiModel.statPerBulan(),
      ]);

      return res.status(200).json({
        success: true,
        data: hasil,
        pagination: { total, limit, offset },
        statistik: {
          kerusakan_terbanyak: statKerusakan,
          per_bulan: statBulan,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data laporan." });
    }
  },

  // GET /api/diagnosis/laporan/:id
  getDetailLaporan: async (req, res) => {
    try {
      const hasil = await HasilKonsultasiModel.findById(req.params.id);
      if (!hasil) {
        return res.status(404).json({ success: false, message: "Data tidak ditemukan." });
      }
      return res.status(200).json({ success: true, data: hasil });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil detail laporan." });
    }
  },

  // GET /api/diagnosis/dashboard  (Admin only)
  getDashboard: async (req, res) => {
    try {
      const GejalaModel = require("../models/Gejala");
      const KerusakanModel = require("../models/Kerusakan");

      const [
        totalKonsultasi,
        totalGejala,
        totalKerusakan,
        totalKasus,
        statKerusakan,
        statBulan,
        statusKasus,
      ] = await Promise.all([
        HasilKonsultasiModel.count(),
        GejalaModel.count(),
        KerusakanModel.count(),
        KasusModel.count(),
        HasilKonsultasiModel.statKerusakanTerbanyak(5),
        HasilKonsultasiModel.statPerBulan(),
        KasusModel.countByStatus(),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          ringkasan: {
            total_konsultasi: totalKonsultasi,
            total_gejala: totalGejala,
            total_kerusakan: totalKerusakan,
            total_kasus_cbr: totalKasus,
          },
          kerusakan_terbanyak: statKerusakan,
          konsultasi_per_bulan: statBulan,
          status_kasus_cbr: statusKasus,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: "Gagal mengambil data dashboard." });
    }
  },
};

module.exports = DiagnosisController;
