const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const { protect } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

const uploadFields = upload.fields([
  { name: "aumFile", maxCount: 1 },
  { name: "familyFile", maxCount: 1 },
  { name: "nonFamFile", maxCount: 1 },
]);

router.post("/sync", protect, uploadFields, uploadController.syncWealthElite);
router.get("/sync-status", protect, uploadController.getSyncStatus);

module.exports = router;
