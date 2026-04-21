const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');
const { protect } = require('../middleware/authmiddleware');

/**
 * All routes are protected. 
 * Only authenticated family members can access spending data.
 */
router.use(protect);

// --- CORE SPENDING LOGIC ---

// @desc    Log a new expense (Debit from a wallet)
// @route   POST /api/spending
router.post('/', spendingController.addSpending);

// @desc    Get dashboard summary (Total spent + current member balances)
// @route   GET /api/spending/summary
router.get('/summary', spendingController.getFinanceSummary);

// @desc    Get full transaction history for a specific wallet
// @route   GET /api/spending/history/:walletId
router.get('/history/:walletId', spendingController.getWalletHistory);
// @desc    Process monthly allowances (Carry Forward Logic)
//          This adds the 'targetAllowance' to each member's existing balance 
//          and deducts the total from the General Pool (Drawer).
// @route   POST /api/spending/process-allowance
router.post('/process-allowance', spendingController.processMonthlyAllowance);

router.delete('/:id', protect, spendingController.deleteSpending);
router.put('/:id', protect, spendingController.editSpending);

module.exports = router;