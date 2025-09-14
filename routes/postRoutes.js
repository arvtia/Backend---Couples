
const express = require('express');
const router = express.Router();
const { createPost, getTimeline } = require('../controllers/postController');
const verifyToken = require('../middlewares/verifyToken');



// Create a post
router.post('/', verifyToken, createPost);
// Get timeline for a couple, optionally filtered by visibility
router.get('/:coupleId/:visibility',  getTimeline);

module.exports = router;