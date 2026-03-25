const router = require('express').Router();
const { getAllArns, createArn, updateArn, deleteArn } = require('../controllers/arnController');

router.route('/').get(getAllArns).post(createArn);
router.route('/:id').put(updateArn).delete(deleteArn);

module.exports = router;