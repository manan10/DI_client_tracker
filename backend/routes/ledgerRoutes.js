const express = require('express');
const { 
    bulkSyncTallyLedgers, 
    getAllLedgers // Renamed for better registry support
} = require('../controllers/ledgerController');
const { protect } = require('../middleware/authmiddleware');

const router = express.Router();

/**
 * @desc    Sync Ledger master list from Tally Bridge
 * @route   POST /api/ledgers/bulk-sync
 */
router.post('/bulk-sync', protect, bulkSyncTallyLedgers);

/**
 * @desc    Get All Ledgers or filter by Company name via query params
 * @route   GET /api/ledgers
 */
router.get('/', protect, getAllLedgers);

module.exports = router;