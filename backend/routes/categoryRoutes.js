const express = require('express');
const router = express.Router();
const { 
    getCategoryTree, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    reorderCategories,
    reorderSubCategories,
    createSubCategory,
    mergeCategories
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authmiddleware');

router.get('/tree', protect, getCategoryTree);

// Parent Category Routes
router.post('/', protect, createCategory);
router.patch('/reorder', protect, reorderCategories); // Reorder parents
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

// Sub-Category Routes
router.post('/:parentId/sub', protect, createSubCategory);
router.patch('/:parentId/sub/reorder', protect, reorderSubCategories); // Reorder within parent
router.put('/sub/:id', protect, updateCategory); // Reuse update for sub labels
router.delete('/sub/:id', protect, deleteCategory); // Reuse delete for subs
router.post('/merge', protect, mergeCategories)

module.exports = router;