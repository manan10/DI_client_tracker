const express = require('express');
const router = express.Router();
const spendingController = require('../controllers/spendingController');
const { protect } = require('../middleware/authmiddleware');

router.use(protect);

router.post('/', spendingController.addSpending);
router.get('/summary', spendingController.getFinanceSummary);
router.get('/history/:walletId', spendingController.getWalletHistory);
router.post('/process-allowance', spendingController.processMonthlyAllowance);
router.get('/history', spendingController.getSpendingHistory);
router.get('/analytics', spendingController.getDetailedAnalytics);
router.delete('/:id', spendingController.deleteSpending);
router.put('/:id', spendingController.editSpending);

module.exports = router;