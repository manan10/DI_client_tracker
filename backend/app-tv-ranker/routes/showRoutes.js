const express = require('express');
const router = express.Router();
const multer = require('multer');

// Controllers
const importController = require('../controllers/importController');
const ratingController = require('../controllers/ratingController');
const showController = require('../controllers/showController');

// Authentication Middleware
const { protect } = require('../../authentication/authmiddleware');

// Memory storage for notes file upload (.txt)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Enforce authentication across all endpoints
router.use(protect);

// =========================================================================
// 1. BULK NOTE PARSER & INGESTION
// =========================================================================
// Supports either { text: "..." } JSON payload OR multipart form-data with file field 'file'
router.post('/import-notes', upload.single('file'), importController.importFromNotes);

// =========================================================================
// 2. USER PERSONAL RATINGS & WATCH LOGS
// =========================================================================
router.get('/ratings/my', ratingController.getMyRatings);
router.patch('/ratings/:ratingId/favorite', ratingController.toggleFavorite);
router.delete('/ratings/:ratingId', ratingController.deleteRating);

// Show-Specific Ratings
router.get('/:showId/rating', ratingController.getRatingForShow);
router.post('/:showId/rating', ratingController.saveShowRating);

// =========================================================================
// 3. CANONICAL SHOW CATALOG
// =========================================================================
router.get('/', showController.getShows);
router.post('/', showController.createShow);
router.get('/:id', showController.getShowById);
router.put('/:id', showController.updateShow);
router.delete('/:id', showController.deleteShow);

module.exports = router;