const express = require('express');
const multer = require('multer');
const { importTallyLedgers, getLedgersByArn } = require('../controllers/ledgerController');
const { protect } = require('../middleware/authmiddleware');

const router = express.Router();

// Temporary storage configuration
const upload = multer({ dest: 'uploads/temp/' });

// @desc    Import Tally Ledgers for a specific ARN
// @route   POST /api/ledgers/import
router.post('/import', protect, upload.single('file'), importTallyLedgers);

// @desc    Get Ledgers belonging to a specific ARN
// @route   GET /api/ledgers/arn/:arnId
router.get('/arn/:arnId', protect, getLedgersByArn);

module.exports = router; 