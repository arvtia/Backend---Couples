
//  Activityroutes 
const express = require('express');
const router = express.Router();
const { createActivity, getActivities, getActivityGraph } = require('../controllers/activityController');
const verifyToken = require('../middlewares/verifyToken');
const { getStats } = require('../controllers/streakController');



// Create an activity
router.post('/' , verifyToken, createActivity );
// Get activities for a couple

router.get('/:coupleId', verifyToken, getActivities)

// router.get('/activity-graph', verifyToken, getActivityGraph);

router.get('/getgraph', verifyToken, getStats);

module.exports = router;
