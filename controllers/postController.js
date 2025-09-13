
const Post = require('../models/Post');
const multer = require('multer');
const cloudinary = require('../configs/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'couples-app',
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4']
  }
});

const upload = multer({ storage }).single('media');

const createPost = async (req, res) => {
  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).json({ error: 'Upload failed', details: err.message });
    }

    const { coupleId, author, content, visibility } = req.body;
    const mediaURL = req.file?.path || null;

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
  try {
    const posts = await Post.find({
      coupleId,
      visibility: visibility.toLowerCase()
    })
    .populate('author', 'name email')
    .sort({ createdAt: -1 });

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timeline', details: err.message });
  }
};



module.exports = { createPost, getTimeline };