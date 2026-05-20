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

// --- Bulk Upload & Parsing ---
router.post('/upload-bulk', upload.array('files', 10), auditController.processBulkStatements);

// --- Transaction Management ---
router.get('/:auditId/transactions', auditController.getAuditTransactions);
router.patch('/transactions/:id', auditController.updateTransaction);

// --- Cleanup ---
router.delete('/:auditId', auditController.deleteAuditSession);

module.exports = router;    