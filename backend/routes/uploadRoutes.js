const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');

// Memory storage keeps the 443+ records in RAM for faster processing
const upload = multer({ storage: multer.memoryStorage() });

// Define specific fields for the three Wealth Elite files
const uploadFields = upload.fields([
    { name: 'aumFile', maxCount: 1 },
    { name: 'familyFile', maxCount: 1 },
    { name: 'nonFamFile', maxCount: 1 }
]);

// Route to perform the full sync and database update
router.post('/sync', uploadFields, uploadController.syncWealthElite);

// Route to fetch the latest timestamp for the dashboard
router.get('/sync-status', uploadController.getSyncStatus);

module.exports = router;