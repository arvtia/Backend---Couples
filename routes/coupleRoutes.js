
const express = require('express');
const router = express.Router();
const { createCouple, getCouple, getCoupleInfo } = require('../controllers/coupleController');
const verifyToken = require('../middlewares/verifyToken');


// Create a couple
router.post('/link' , verifyToken, createCouple );
// Get couple details
router.get('/:coupleId', verifyToken,  getCouple)

// get couple id andinfo
router.get('/me', verifyToken, getCoupleInfo)



module.exports = router;