const express = require('express');
const poiController = require('../controllers/poiController');

const router = express.Router();

router.get('/', poiController.getAllPOIs);
router.get('/:lat/:lng', poiController.getAllPointsOfInterest);
router.get('/distance/:lat/:lng', poiController.getAllPointsOfInterestWithinDistance);
router.get('/mock', poiController.getAllMockPOIs);
router.get('/mock/:lat/:lng', poiController.getQueryMockPOIs);
router.post('/', poiController.createPointOfInterest);
// ... other routes for getPOIById, createPOI, etc.

module.exports = router;
