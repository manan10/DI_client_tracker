const express = require('express');
const router = express.Router();
const {
    saveMonthlyCommission,
    getMonthlyRecord,
    getArnHistory,
    getArnStats,
    getDashboardSummary,
    getWorkspaceAnalytics,
    deleteCommissionRecord,
    extractCommissionsFromStatement
} = require('../controllers/commissionController');

const multer = require('multer');


const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Standard Operations
router.post('/save', saveMonthlyCommission);
router.get('/dashboard-summary', getDashboardSummary);

// Workspace Analytics (Charts)
router.get('/workspace-analytics/:arnId', getWorkspaceAnalytics);

// History (Table)
router.get('/history/:arnId', getArnHistory);

// Deep Dives
router.get('/stats/:arnId', getArnStats);
router.get('/:arnId/:month', getMonthlyRecord);

router.delete('/:id', deleteCommissionRecord);

router.post(
    '/extract-statements', 
    upload.array('files', 10), 
    extractCommissionsFromStatement
);

module.exports = router;