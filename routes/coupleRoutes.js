
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Couple = require('../models/Couple');
const { createCouple, getCouple } = require('../controllers/coupleController');
const { protect } = require('../middlewares/authMiddleware');

// Create a couple
router.post('/link' , protect, createCouple );
// Get couple details
router.get('/:coupleId', protect,  getCouple)



module.exports = router;