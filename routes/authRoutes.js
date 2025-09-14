const express = require('express');
const router = express.Router();
const { signup, Login } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/getUserProfile');
const { verifyToken } = require('../middlewares/verifyToken');

router.post('/signup', signup );
router.post('/login', Login);
router.get('/me', verifyToken,  getUserProfile)

module.exports = router;
