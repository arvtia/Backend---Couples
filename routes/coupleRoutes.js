
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Couple = require('../models/Couple');
const { createCouple, getCouple, getCoupleInfo } = require('../controllers/coupleController');
// const { protect } = require('../middlewares/authMiddleware');
const { verifyToken } = require('../middlewares/verifyToken');

// Create a couple
router.post('/link' , verifyToken, createCouple );
// Get couple details
router.get('/:coupleId', verifyToken,  getCouple)

// get couple id andinfo
router.get('/me', verifyToken, getCoupleInfo)



module.exports = router;