const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { getStreakStats, getStats } = require('../controllers/streakController');

const router = express.Router();

router.get('/', verifyToken, getStreakStats);
router.get('/getgraph', verifyToken, getStats);

module.exports = router;