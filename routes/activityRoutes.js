
//  Activityroutes 
const express = require('express');
const router = express.Router();
const { createActivity, getActivities } = require('../controllers/activityController');
const verifyToken = require('../middlewares/verifyToken');



// Create an activity
router.post('/' , verifyToken, createActivity );
// Get activities for a couple

router.get('/:coupleId', verifyToken, getActivities)

module.exports = router;
