const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authmiddleware'); // Make sure this path is correct

// Standard Auth
router.post('/login', authController.login);
router.get('/firebase-token', protect, authController.getFirebaseToken); // Added protect here just in case

// --- WEBAUTHN / BIOMETRIC ROUTES ---

// 1. Device Registration (Requires User to be logged in via Password first)
router.post('/webauthn/register-options', protect, authController.generateRegistrationOptions);
router.post('/webauthn/register-verify', protect, authController.verifyRegistration);

// 2. Passwordless Login (Public endpoints accessed from the Login Page)
router.post('/webauthn/login-options', authController.generateAuthOptions);
router.post('/webauthn/login-verify', authController.verifyAuth);

module.exports = router;