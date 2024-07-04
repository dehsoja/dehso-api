const express = require('express');
const policeDivisionController = require('../controllers/policeDivisionController');

const router = express.Router();


router.get('/:lat/:lng', policeDivisionController.findPoliceDivisionForPoint);
router.post('/', policeDivisionController.createPoliceDivision);

module.exports = router;
