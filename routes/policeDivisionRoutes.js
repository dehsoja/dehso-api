const express = require('express');
const policeDivisionController = require('../controllers/policeDivisionController');
const {verifyToken} = require('../utilities/authUtilities');

const router = express.Router();


router.get('/:lat/:lng', policeDivisionController.findPoliceDivisionForPoint);
router.post('/', verifyToken, policeDivisionController.createPoliceDivision);

module.exports = router;
