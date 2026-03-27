const express = require('express');
const router = express.Router();
const { refineInteractionNotes } = require('../controllers/aiController');
// Import your auth middleware if you have one
// const { protect } = require('../middleware/authMiddleware'); 

// POST /api/ai/refine-notes
// Add 'protect' middleware here to ensure only logged-in users use your API quota
router.post('/refine-notes', refineInteractionNotes);

module.exports = router;