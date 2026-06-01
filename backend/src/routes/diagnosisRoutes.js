const express = require("express");
const router = express.Router();
const DiagnosisController = require("../controllers/diagnosisController");
const ChatController = require("../controllers/chatController");
const authMiddleware = require("../middleware/authMiddleware");

// Public - proses diagnosis utama
router.post("/", DiagnosisController.diagnose);

// Public - chat NLP
router.post("/chat", ChatController.chat);
router.post("/chat/diagnose", ChatController.chatDiagnose);

// Admin only
router.get("/dashboard", authMiddleware, DiagnosisController.getDashboard);
router.get("/laporan", authMiddleware, DiagnosisController.getLaporan);
router.get("/laporan/:id", authMiddleware, DiagnosisController.getDetailLaporan);

module.exports = router;
