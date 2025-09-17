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

// comments -> 
async function addComment( req, res) {
  const {postId} = req.params;
  const {content} = req.body;
  if(!content) return res.status(400).json({ error: "Comment cannot be empty"});

  try{
    const post = await Post.findById(postId);
    if(!post) return res.status(404).json({error: 'Post not found', })
      
    if(post.visibility === 'private'){
      const isMember = await verifyCoupleMembership(req.userId, post.coupleId);
      if(!isMember) return res.status(403).json({ error: "Access denied"});
    }

    const comment = { commenter : req.userId, content};
    post.comments.push(comment);
    await post.save();

    // return the newly added comment ( last in awway )
  } catch {
    console.error(err);
    res.status(500).json({ error:"Failed to add comment", details: err.message});
  }
}

//  toggle like and (like / unlike)
async function toggleLove ( req, res) {
  const { postId} = req.params;
  
  try{
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: " Post not found"});

    const idx = post.loves.findIndex(uid => uid.equals(req.userId));
    if(idx === -1){
      // not loved yet -> add
      post.loves.push(req.userId);
    } else {
      // arleady loved -> removed
      post.loves.splice(idx, 1);
    }

    await post.save();
    res.json({ loves: post.loves.length, hasLoved: idx === -1});
  } catch (err) {
    console.error(err) 
    res.status(500).json({error:"Failed to toggle love", details: err.message});
    
  }
}

// Increment share count
async function sharePost( req, res) {
  const { postId} = req.params;

  try{
    const post = await Post.findByIdAndUpdate(
      postId,
      { $inc: {shareCount}},
      {new: true}
    )
    if(!post) return res.status(400).json({error:"Post not found"});
    res.json({shareCount: post.shareCount});
  } catch (err){
    console.error(err);
    res.status(500).json({error: "Failed to share post", details: err.message})
  }
}

// nested comments

// Add a reply to a specific comment
async function addReply(req, res) {
  const { postId, commentId } = req.params;
  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: "Reply cannot be empty" });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Private-post check
    if (post.visibility === "private") {
      const isMember = await verifyCoupleMembership(req.userId, post.coupleId);
      if (!isMember) return res.status(403).json({ error: "Access denied" });
    }

    // Find the parent comment in the tree (recursive helper)
    function findAndPush(comments) {
      for (let c of comments) {
        if (c._id.equals(commentId)) {
          c.replies.push({ commenter: req.userId, content });
          return true;
        }
        if (c.replies.length && findAndPush(c.replies)) {
          return true;
        }
      }
      return false;
    }

    const found = findAndPush(post.comments);
    if (!found) {
      return res.status(404).json({ error: "Comment to reply not found" });
    }

    await post.save();
    // Return the newly added reply (last in that replies array)
    // We need to traverse again to grab it:
    let newReply;
    function findReply(comments) {
      for (let c of comments) {
        if (c._id.equals(commentId)) {
          newReply = c.replies[c.replies.length - 1];
          return true;
        }
        if (c.replies.length && findReply(c.replies)) {
          return true;
        }
      }
      return false;
    }
    findReply(post.comments);

    res.json({ reply: newReply });
  } catch (err) {
    console.error("addReply error:", err);
    res.status(500).json({ error: "Failed to add reply", details: err.message });
  }
}




module.exports = { createPost, getTimeline, addComment, sharePost, toggleLove, addReply };