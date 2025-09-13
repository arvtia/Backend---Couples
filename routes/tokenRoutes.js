
const express = require('express');
const router = express.Router();
const { getTokensByCouple } = require('../controllers/tokenController');

// Get tokens for a couple
router.get('/:coupleId', getTokensByCouple);

module.exports = router;