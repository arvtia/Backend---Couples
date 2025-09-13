
const express = require('express');
const router = express.Router();
const { getTokensByCouple } = require('../controllers/tokenController');
const { protect } = require('../middlewares/authMiddleware');

// Get tokens for a couple
router.get('/:coupleId', protect,  getTokensByCouple); // Ensure the user is authenticated

module.exports = router;