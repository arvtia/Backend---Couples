
//  Activityroutes 
const express = require('express');
const router = express.Router();
const { createActivity, getActivities } = require('../controllers/activityController');
const { protect } = require('../middlewares/authMiddleware');

// Create an activity
router.post('/' , protect, createActivity );
// Get activities for a couple

router.get('/:coupleId', protect, getActivities)

module.exports = router;
