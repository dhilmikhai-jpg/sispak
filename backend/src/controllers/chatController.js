const { prosesNLP } = require('../nlp/nlpEngine');
const GejalaModel = require('../models/Gejala');
const KerusakanModel = require('../models/Kerusakan');
const KasusModel = require('../models/Kasus');
const HasilKonsultasiModel = require('../models/HasilKonsultasi');
const RelasiModel = require('../models/Relasi');
const { prosesCFSemua } = require('../services/cfEngine');
const { retrieve, reuse, revise, retain } = require('../services/cbrEngine');

const ChatController = {
  /**
   * POST /api/diagnosis/chat
   * Proses teks bebas user → ekstrak gejala via NLP
   * Body: { teks: "laptop saya sering mati sendiri dan panas" }
   */
  chat: async (req, res) => {
    try {
      const { teks } = req.body;

      if (!teks || teks.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Teks tidak boleh kosong.',
        });
      }

      // Proses NLP
      const hasilNLP = prosesNLP(teks);

      if (hasilNLP.gejala.length === 0) {
        return res.status(200).json({
          success: true,
          gejala_terdeteksi: [],
          debug: hasilNLP.debug,
          message: 'Tidak ada gejala yang terdeteksi. Coba deskripsikan lebih detail.',
        });
      }

      // Ambil detail gejala yang terdeteksi
      const gejalaDetail = await GejalaModel.findByKodeBatch(hasilNLP.gejala);

      return res.status(200).json({
        success: true,
        gejala_terdeteksi: gejalaDetail,
        kode_gejala: hasilNLP.gejala,
        debug: hasilNLP.debug,
        message: `${hasilNLP.gejala.length} gejala terdeteksi dari teks kamu.`,
      });
    } catch (error) {
      console.error('Chat NLP error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
  },

  /**
   * POST /api/diagnosis/chat/diagnose
   * Proses teks bebas → NLP → CBR+CF → hasil diagnosis
   * Body: { teks: "...", nama_user: "..." }
   */
  chatDiagnose: async (req, res) => {
    try {
      const { teks, nama_user } = req.body;

      if (!teks || teks.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Teks tidak boleh kosong.',
        });
      }

      // ── STEP 1: NLP → ekstrak gejala ──────────────────────────
      const hasilNLP = prosesNLP(teks);

      if (hasilNLP.gejala.length === 0) {
        return res.status(200).json({
          success: false,
          gejala_terdeteksi: [],
          debug: hasilNLP.debug,
          message: 'Tidak ada gejala yang terdeteksi. Coba ceritakan lebih detail.',
        });
      }

      const gejalaDipilih = hasilNLP.gejala;

      // ── STEP 2: Ambil data dari DB ─────────────────────────────
      const [semuaGejala, semuaKerusakan, semuaRelasi, kasusVerified] = await Promise.all([
        GejalaModel.findAll(),
        KerusakanModel.findAll(),
        RelasiModel.findAllRaw(),
        KasusModel.findVerified(),
      ]);

      const semuaKodeGejala = semuaGejala.map(g => g.kode_gejala);

      // ── STEP 3: CF Engine ──────────────────────────────────────
      const hasilCF = prosesCFSemua(gejalaDipilih, semuaGejala, semuaRelasi, semuaKerusakan);
      const cfTerbaik = hasilCF[0] || null;
      const cfNilaiTerbaik = cfTerbaik ? cfTerbaik.cf_final : 0;
      const kodeKerusakanCF = cfTerbaik ? cfTerbaik.kode_kerusakan : null;

      // ── STEP 4: CBR ────────────────────────────────────────────
      const kasusRetrieved = retrieve(gejalaDipilih, kasusVerified, semuaGejala, 0.4, 3);
      const kasusReuse = reuse(kasusRetrieved);
      const hasilRevise = revise(kasusReuse, cfNilaiTerbaik, kodeKerusakanCF);
      const kodeKerusakanFinal = hasilRevise.kode_kerusakan_final;

      const kerusakanFinal = semuaKerusakan.find(k => k.kode_kerusakan === kodeKerusakanFinal);
      const gejalaDetail = await GejalaModel.findByKodeBatch(gejalaDipilih);

      // ── STEP 5: Simpan hasil ───────────────────────────────────
      const hasilInsert = await HasilKonsultasiModel.create({
        nama_user: nama_user || 'Anonim',
        gejala_dipilih: gejalaDipilih,
        kode_kerusakan_hasil: kodeKerusakanFinal,
        cf_hasil: cfNilaiTerbaik,
        similarity_score: kasusReuse ? kasusReuse.similarity_score : null,
        kasus_referensi_id: kasusReuse ? kasusReuse.id : null,
        metode_diagnosis: 'NLP_' + hasilRevise.metode,
      });

      // ── STEP 6: Retain ─────────────────────────────────────────
      if (kodeKerusakanFinal) {
        const dataKasusBaru = retain(gejalaDipilih, semuaKodeGejala, kodeKerusakanFinal, cfNilaiTerbaik, nama_user);
        await KasusModel.create(dataKasusBaru);
      }

      return res.status(200).json({
        success: true,
        message: 'Diagnosis berhasil.',
        data: {
          konsultasi_id: hasilInsert.insertId,
          nama_user: nama_user || 'Anonim',

          // Hasil NLP
          nlp: {
            input: teks,
            tokens: hasilNLP.debug.setelah_preprocessing,
            tokens_stem: hasilNLP.debug.setelah_stemming,
            gejala_terdeteksi: gejalaDetail,
          },

          // Hasil diagnosis
          diagnosis: {
            kode_kerusakan: kodeKerusakanFinal,
            nama_kerusakan: kerusakanFinal ? kerusakanFinal.nama_kerusakan : '-',
            keterangan: kerusakanFinal ? kerusakanFinal.keterangan : '-',
            solusi: kerusakanFinal ? kerusakanFinal.solusi : '-',
          },

          certainty_factor: {
            nilai: cfNilaiTerbaik,
            persen: parseFloat((cfNilaiTerbaik * 100).toFixed(2)),
            interpretasi: cfTerbaik ? cfTerbaik.interpretasi : '-',
          },

          cbr: {
            kasus_mirip: kasusRetrieved.map(k => ({
              id: k.id,
              nama_kasus: k.nama_kasus,
              nama_kerusakan: k.nama_kerusakan,
              similarity_persen: k.similarity_persen,
            })),
            metode: hasilRevise.metode,
            keterangan_metode: hasilRevise.keterangan,
          },

          semua_kandidat: hasilCF.map(h => ({
            kode_kerusakan: h.kode_kerusakan,
            nama_kerusakan: h.nama_kerusakan,
            cf_persen: h.cf_persen,
            interpretasi: h.interpretasi,
          })),
        },
      });
    } catch (error) {
      console.error('Chat diagnose error:', error);
      return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
  },
};

module.exports = ChatController;
