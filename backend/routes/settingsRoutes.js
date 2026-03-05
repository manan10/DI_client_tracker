const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const settingsController = require('../controllers/settingsController');

router.get('/', protect, settingsController.getGlobalSettings);
router.put('/', protect, settingsController.updateGlobalSettings);
router.patch('/preferences', protect, settingsController.updateUserPreferences);
router.get('/market-status', protect, settingsController.getMarketStatus);

module.exports = router;