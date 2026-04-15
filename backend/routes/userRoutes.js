const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route to get all users for the Auth dropdown
router.get('/', userController.getAllUsers);

module.exports = router;