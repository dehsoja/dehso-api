const express = require('express');
const poiController = require('../controllers/poiController');
const {verifyToken} = require('../utilities/authUtilities');

const router = express.Router();

router.get('/', verifyToken, poiController.getAllPOIs);
router.get('/:lat/:lng', poiController.getAllPointsOfInterest);
router.get('/distance/:lat/:lng', poiController.getAllPointsOfInterestWithinDistance);
router.post('/', verifyToken, poiController.createPointOfInterest);
// ... other routes for getPOIById, createPOI, etc.

module.exports = router;
