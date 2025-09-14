
const express = require('express');
const router = express.Router();
const { createPost, getTimeline } = require('../controllers/postController');
const { verifyToken } = require('../middlewares/verifyToken');
// const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
// router.use(protect);

// Create a post
router.post('/', verifyToken, createPost);
// Get timeline for a couple, optionally filtered by visibility
router.get('/:coupleId/:visibility',  getTimeline);

module.exports = router;