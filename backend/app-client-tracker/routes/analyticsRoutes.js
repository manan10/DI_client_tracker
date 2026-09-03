const express = require('express');
const router = express.Router();
const { getGlobalAnalytics } = require('../controllers/analyticsController');

// All global enterprise-level analytics
router.get('/global-summary', getGlobalAnalytics);

module.exports = router;