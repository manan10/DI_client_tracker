const express = require('express');
const router = express.Router();

const { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  addComment, 
  toggleChecklistItem 
} = require('../controllers/taskController');

const { protect } = require('../middleware/authmiddleware');

// Protect all task routes
router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);
router.patch('/:taskId/checklist/:itemId', toggleChecklistItem);

module.exports = router;