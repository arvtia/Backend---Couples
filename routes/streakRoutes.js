const express = require('express');
const verifyToken = require('../middlewares/verifyToken');
const { getStreakStats } = require('../controllers/streakController');

const router = express.Router();

router.get('/', verifyToken, getStreakStats);

module.exports = router;