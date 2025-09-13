
const express = require('express');
const router = express.Router();
const { createPost, getTimeline } = require('../controllers/postController');
const { protect } = require('../middlewares/authMiddleware');

// Protect all routes
router.use(protect);

// Create a post
router.post('/',protect, createPost);
// Get timeline for a couple, optionally filtered by visibility
router.get('/:coupleId/:visibility',  getTimeline);

module.exports = router;