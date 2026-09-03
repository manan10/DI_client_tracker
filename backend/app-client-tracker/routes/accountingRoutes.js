const express = require('express');
const router = express.Router();
const multer = require('multer');
const accountingController = require('../controllers/accountingController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload-bulk', upload.array('files', 10), accountingController.processBulkStatements);
router.get('/staged', accountingController.getStagedTransactions);
router.delete('/clear-staged', accountingController.clearStagedTransactions);
router.delete('/staged/:accountId', accountingController.clearStagedByAccount);
router.patch('/staged/:id', accountingController.updateStagedTransaction);

module.exports = router;