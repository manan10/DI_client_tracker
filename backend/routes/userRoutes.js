const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authmiddleware');

router.get('/', userController.getAllUsers);

// --- ADD THIS LINE ---
router.put('/:id', protect, userController.updateUser); 

router.post('/register', protect, userController.registerUser);
router.patch('/:id/reset-password', protect, userController.resetPassword);
router.delete('/:id', protect, userController.deleteUser);
router.patch('/preferences', protect, userController.updatePreferences);

module.exports = router;