
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Couple = require('../models/Couple');
const { createCouple, getCouple } = require('../controllers/coupleController');

// Create a couple
router.post('/link' , createCouple );
// Get couple details
router.get('/:coupleId', getCouple)


module.exports = router;