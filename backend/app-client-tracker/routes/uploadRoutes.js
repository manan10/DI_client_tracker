const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadController = require("../controllers/uploadController");
const { protect } = require("../../authentication/authmiddleware");

// Using memoryStorage to buffer the files for ExcelJS
const upload = multer({ storage: multer.memoryStorage() });

// Correctly maps to the exact FormData keys from the frontend
const uploadFields = upload.fields([
  { name: "aumFile", maxCount: 1 },
  { name: "familyFile", maxCount: 1 },
  { name: "nonFamFile", maxCount: 1 },
]);

router.post("/sync", protect, uploadFields, uploadController.syncWealthElite);

// Assuming you have this method built out
if (uploadController.getSyncStatus) {
  router.get("/sync-status", protect, uploadController.getSyncStatus);
}

module.exports = router;
