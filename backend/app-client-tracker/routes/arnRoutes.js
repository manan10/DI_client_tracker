const router = require('express').Router();
const { 
    getAllArns, 
    createArn, 
    updateArn, 
    deleteArn,
    updateArnAmcMapping,
    linkTallyFirm // Import the new controller method
} = require('../controllers/arnController');

// Base routes
router.route('/')
    .get(getAllArns)
    .post(createArn);

// Specific ID routes
router.route('/:id')
    .put(updateArn)
    .delete(deleteArn);

// Hierarchy Link: Connect a Tally Company name to this ARN
router.patch('/:id/tally-link', linkTallyFirm);

// Batch update for AMC mappings
router.put('/:id/amcs/batch', updateArnAmcMapping);

module.exports = router;