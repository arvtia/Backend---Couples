
//  Activityroutes 
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Couple = require('../models/Couple');
const { createActivity, getActivities } = require('../controllers/activityController');

// Create an activity
router.post('/' , createActivity );
// Get activities for a couple

router.get('/:coupleId', getActivities)

module.exports = router;
