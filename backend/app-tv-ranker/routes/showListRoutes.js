const express = require('express');
const router = express.Router();

// Adjust the path to your existing auth middleware
const { protect } = require('../../authentication/authmiddleware');

const {
  getMyLists,
  getListById,
  createList,
  updateList,
  deleteList,
  addShowToList,
  removeShowFromList,
  reorderListItems
} = require('../controllers/showListController');

// All list endpoints require authenticated user session
router.use(protect);

// Base list routes: collection operations
router.route('/')
  .get(getMyLists)
  .post(createList);

// Specific list document routes
router.route('/:id')
  .get(getListById)
  .put(updateList)
  .delete(deleteList);

// Item management inside a list
router.post('/:id/items', addShowToList);
router.delete('/:id/items/:showId', removeShowFromList);
router.put('/:id/reorder', reorderListItems);

module.exports = router;