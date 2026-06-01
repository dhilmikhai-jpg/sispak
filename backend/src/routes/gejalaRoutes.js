const express = require("express");
const router = express.Router();
const GejalaController = require("../controllers/gejalaController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", GejalaController.getAll);
router.get("/kerusakan/:kodeKerusakan", GejalaController.getByKerusakan);
router.get("/:kode", GejalaController.getByKode);

// Admin only routes
router.post("/", authMiddleware, GejalaController.create);
router.put("/:kode", authMiddleware, GejalaController.update);
router.delete("/:kode", authMiddleware, GejalaController.delete);

module.exports = router;
