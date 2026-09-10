const express = require('express');
const router = express.Router();
const multer = require('multer');
const showRaterController = require('../controllers/showRaterController');
const { protect } = require('../../authentication/authmiddleware');

// Memory storage for notes file upload (.txt)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Enforce authentication across all endpoints
router.use(protect);

// --- Bulk Note Parser & Ingestion ---
// Supports either { text: "..." } JSON payload OR multipart form-data with file field 'file'
router.post('/import-notes', upload.single('file'), showRaterController.importFromNotes);

// --- User Personal Ratings ---
router.get('/ratings/my', showRaterController.getMyRatings);
router.patch('/ratings/:ratingId/favorite', showRaterController.toggleFavorite);
router.delete('/ratings/:ratingId', showRaterController.deleteRating);

// --- Show-Specific Ratings ---
router.get('/:showId/rating', showRaterController.getRatingForShow);
router.post('/:showId/rating', showRaterController.saveShowRating);

// --- Canonical Show Catalog ---
router.get('/', showRaterController.getShows);
router.post('/', showRaterController.createShow);
router.get('/:id', showRaterController.getShowById);
router.put('/:id', showRaterController.updateShow);

module.exports = router;