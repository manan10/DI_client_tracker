const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// We only need the login route since signup is handled via seed script
router.post('/login', authController.login);
router.get('/firebase-token', authController.getFirebaseToken);

module.exports = router;