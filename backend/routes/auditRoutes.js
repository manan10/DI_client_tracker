const express = require('express');
const router = express.Router();
const multer = require('multer');
const auditController = require('../controllers/auditController');

const upload = multer({ storage: multer.memoryStorage() });

// --- Session & State ---
router.get('/active', auditController.getActiveAudit);
router.get('/summary-list', auditController.getAuditSummaryList);
router.post('/initialize', auditController.initializeAudit);
router.post('/:auditId/finalize', auditController.finalizeAudit);
router.put('/:auditId/sales-checkpoint', auditController.saveSalesCheckpoint);

// NEW: Save Global Settings (like Global Sales Ledger) to the Audit
router.put('/:auditId', auditController.updateAuditSettings);

// --- Bulk Upload & Parsing ---
router.post('/test-matcher', upload.single('file'), auditController.testLedgerMatching);
router.post('/upload-bulk', upload.array('files', 10), auditController.processBulkStatements);

// --- Transaction Management ---
router.get('/:auditId/transactions', auditController.getAuditTransactions);

// NEW: Bulk update MUST go before /:id routes
router.put('/transactions/bulk-update', auditController.bulkUpdateTransactions);

// Single transaction updates (Supporting both PATCH and PUT just in case)
router.patch('/transactions/:id', auditController.updateTransaction);
router.put('/transactions/:id', auditController.updateTransaction);

// --- Cleanup ---
router.delete('/:auditId', auditController.deleteAuditSession);

module.exports = router;