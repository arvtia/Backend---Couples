
const express = require('express');
const router = express.Router();
const { createPost, getTimeline, toggleLove, addComment, sharePost, addReply } = require('../controllers/postController');
const verifyToken = require('../middlewares/verifyToken');



// Create a post
router.post('/create', verifyToken, createPost);
// Get timeline for a couple, optionally filtered by visibility
router.get('/:coupleId/:visibility',  getTimeline);

// New routes
router.post("/:postId/comment", verifyToken, addComment);
router.post("/:postId/love",    verifyToken, toggleLove);
router.post("/:postId/share",   verifyToken, sharePost);
// new nested-reply route
router.post("/:postId/comment/:commentId/reply", verifyToken, addReply);

// - Fetch comments by inspecting post.comments on a timeline fetch
// - POST new comments to /api/posts/:postId/comment
// - Toggle love by calling /api/posts/:postId/love (checks if you’ve already loved)
// - Share by calling /api/posts/:postId/share (increments shareCount)
// - reply / nested - :postId/comment/:commentId/reply to comment down to nested comments 

module.exports = router;