const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const { signup } = require('../controllers/authController');

router.post('/signup', signup );

module.exports = router;
