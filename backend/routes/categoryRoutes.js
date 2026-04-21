const express = require('express');
const router = express.Router();
const { 
    getCategoryTree, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authmiddleware');

// Base Route: /api/categories

// Public/Shared Routes (Protected by Auth)
router.get('/tree', protect, getCategoryTree);

// Management Routes
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;