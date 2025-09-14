
const express = require('express');
const router = express.Router();
const { getTokensByCouple } = require('../controllers/tokenController');
// const { protect } = require('../middlewares/authMiddleware');
const { verifyToken } = require('../middlewares/verifyToken');

// Get tokens for a couple
router.get('/:coupleId', verifyToken,  getTokensByCouple); // Ensure the user is authenticated

module.exports = router;