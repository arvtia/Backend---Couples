const express = require('express');
const router = express.Router();
const { signup, Login, sendResetLink, resetPassword } = require('../controllers/authController');
const { getUserProfile } = require('../controllers/getUserProfile');
const verifyToken = require('../middlewares/verifyToken');


router.post('/signup', signup );
router.post('/login', Login);
router.get('/me', verifyToken,  getUserProfile)

// Password reset routes
router.post('/send-reset-link', sendResetLink);
router.post('/reset-password', resetPassword);

module.exports = router;
