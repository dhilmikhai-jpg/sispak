const express = require("express");
const router = express.Router();
const KasusController = require("../controllers/kasusController");
const authMiddleware = require("../middleware/authMiddleware");

// Semua route kasus hanya untuk admin
router.get("/stats", authMiddleware, KasusController.getStats);
router.get("/", authMiddleware, KasusController.getAll);
router.get("/:id", authMiddleware, KasusController.getById);
router.post("/", authMiddleware, KasusController.create);
router.put("/:id", authMiddleware, KasusController.update);
router.patch("/:id/verify", authMiddleware, KasusController.verify);
router.delete("/:id", authMiddleware, KasusController.delete);

module.exports = router;
