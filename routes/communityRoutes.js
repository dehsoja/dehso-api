const express = require('express');
const communityController = require('../controllers/communityController');
const {verifyToken} = require('../utilities/authUtilities');

const router = express.Router();

router.get('/:lat/:lng', communityController.findCommunityForPoint);
router.post('/', verifyToken, communityController.createCommunity);

module.exports = router;
