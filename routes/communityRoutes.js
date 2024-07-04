const express = require('express');
const communityController = require('../controllers/communityController');

const router = express.Router();

router.get('/:lat/:lng', communityController.findCommunityForPoint);
router.post('/', communityController.createCommunity);

module.exports = router;
