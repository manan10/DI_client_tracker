const express = require('express');
const router = express.Router();
const {
    saveMonthlyCommission,
    getMonthlyRecord,
    getArnHistory,
    getArnStats,
    getDashboardSummary,
    getWorkspaceAnalytics,
    deleteCommissionRecord
} = require('../controllers/commissionController');

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

module.exports = router;