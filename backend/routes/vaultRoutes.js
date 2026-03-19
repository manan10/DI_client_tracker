const express = require('express');
const router = express.Router();
const vaultController = require('../controllers/vaultController');

// Standard CRUD
router.get('/items', vaultController.getItems);
router.post('/sync', vaultController.syncItem);
router.delete('/item', vaultController.deleteItem);

// Folder Management
router.patch('/rename', vaultController.renameItem); // NEW
router.post('/move', vaultController.moveItems);     // NEW
router.get('/folders/all', vaultController.getAllFolders);

// Logs & Activity
router.get('/activity', vaultController.getActivity);
router.post('/log-share', vaultController.logShare);

module.exports = router;