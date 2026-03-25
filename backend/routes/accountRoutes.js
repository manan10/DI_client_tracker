const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

// --- Standard CRUD (Used by BankAccounts.jsx) ---

// GET /api/accounts - Fetch all accounts
router.get('/', protect, accountController.getAccounts);

// POST /api/accounts - Add a new bank account
router.post('/', protect, accountController.addAccount);

// PUT /api/accounts/:id - Edit an existing account (Name/Number)
router.put('/:id', protect, accountController.updateAccount);

// DELETE /api/accounts/:id - Remove a bank account
router.delete('/:id', protect, accountController.deleteAccount);


// --- Snapshot & History Logic (Existing) ---

// POST /api/accounts/snapshot - Create new balance snapshot
router.post('/snapshot', protect, accountController.saveSnapshot);

// PUT /api/accounts/snapshot/:id - Update existing snapshot
router.put('/snapshot/:id', protect, accountController.updateSnapshot);

// GET /api/accounts/history - Fetch historical data
router.get('/history', protect, accountController.getHistory);

module.exports = router;