// models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String },
  mediaURL: { type: String }, // optional image/video link
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);