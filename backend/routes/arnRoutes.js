const router = require('express').Router();
const { 
    getAllArns, 
    createArn, 
    updateArn, 
    deleteArn,
    updateArnAmcMapping // New controller function
} = require('../controllers/arnController');

// Base routes
router.route('/')
    .get(getAllArns)
    .post(createArn);

// Specific ID routes
router.route('/:id')
    .put(updateArn)
    .delete(deleteArn);

// New: Batch update for AMC mappings
// This matches your frontend call: request(`/arns/${selectedArn._id}/amcs/batch`, 'PUT', ...)
router.put('/:id/amcs/batch', updateArnAmcMapping);

module.exports = router;