const router = require('express').Router();
const { getAllAmcs, createAmc, updateAmc, deleteAmc } = require('../controllers/amcController');

router.route('/').get(getAllAmcs).post(createAmc);
router.route('/:id').put(updateAmc).delete(deleteAmc);

module.exports = router;