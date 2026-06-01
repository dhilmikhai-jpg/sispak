const express = require("express");
const router = express.Router();
const KerusakanController = require("../controllers/kerusakanController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.get("/", KerusakanController.getAll);
router.get("/:kode", KerusakanController.getByKode);

// Admin only routes
router.post("/", authMiddleware, KerusakanController.create);
router.put("/:kode", authMiddleware, KerusakanController.update);
router.delete("/:kode", authMiddleware, KerusakanController.delete);
router.get("/:kode/relasi", authMiddleware, KerusakanController.getRelasi);
router.post("/:kode/relasi", authMiddleware, KerusakanController.addRelasi);
router.delete("/:kode/relasi/:kodeGejala", authMiddleware, KerusakanController.deleteRelasi);

module.exports = router;
