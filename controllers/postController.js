const Post = require('../models/Post');
const multer = require('multer');
const cloudinary = require('../configs/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const verifyCoupleMembership = require('../utils/verifyCoupleMembership');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'couples-app',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4'],
  },
});

// Accept up to 10 files under the field name "media"
const upload = multer({ storage }).array('media', 10);

const createPost = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    const { coupleId, author, content, visibility } = req.body;

    const isMember = await verifyCoupleMembership(req.userId, coupleId);
    if (!isMember) {
      console.warn(`Unauthorized access attempt by user ${req.userId} to couple ${coupleId}`);
      return res.status(403).json({ error: 'Access denied' });
    }

    // Handle multiple or single
    const mediaURL = Array.isArray(req.files) ? req.files.map(f => f.path) : [];
    

    try {
      const post = new Post({ coupleId, author, content, mediaURL, visibility });
      await post.save();
      res.json({ post });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create post', details: err.message });
    }
  });
};

const getTimeline = async (req, res) => {
  const { coupleId, visibility } = req.params;

  // Only allow access if public OR user is a member
  if (visibility === 'private') {
    const isMember = await verifyCoupleMembership(req.userId, coupleId);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });
  }

  const posts = await Post.find({ coupleId, visibility })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

  res.json({ posts });
};

module.exports = { createPost, getTimeline };