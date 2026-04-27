const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { protect } = require('../middleware/authmiddleware');

/**
 * @route   POST /api/submissions
 * @desc    Create a new submission (automatically stamps workflow checklist)
 */
router.post('/', protect, submissionController.createSubmission);

/**
 * @route   GET /api/submissions
 * @desc    Get all active or finalized submissions (supports ?finalized=true)
 */
router.get('/', protect, submissionController.getSubmissions);

/**
 * @route   GET /api/submissions/:id
 * @desc    Get full details for a single submission
 */
router.get('/:id', protect, submissionController.getSubmissionById);

/**
 * @route   PATCH /api/submissions/:id
 * @desc    Update status, checklist items, or rejection details
 */
router.patch('/:id', protect, submissionController.updateSubmission);

/**
 * @route   POST /api/submissions/:id/custom-step
 * @desc    Add a one-time free-form step to a specific submission
 */
router.post('/:id/custom-step', protect, submissionController.addCustomStep);

/**
 * @route   DELETE /api/submissions/:id
 * @desc    Remove a submission record
 */
router.delete('/:id', protect, submissionController.deleteSubmission);

module.exports = router;