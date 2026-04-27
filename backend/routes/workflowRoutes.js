const express = require('express');
const router = express.Router();
const workflowController = require('../controllers/workflowController');
const { protect } = require('../middleware/authmiddleware'); 


router.get('/', protect, workflowController.getAllWorkflows);
router.get('/:type', protect, workflowController.getWorkflowByType);
router.patch('/:type', protect, workflowController.updateWorkflowSteps);
router.post('/:type/steps', protect, workflowController.addStepToWorkflow);
router.delete('/:type/steps', protect, workflowController.removeStepFromWorkflow);

module.exports = router;