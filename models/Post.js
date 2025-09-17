const mongoose = require("mongoose");

// comments - propertioes
const CommentSchema = new mongoose.Schema({
  commenter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// 2. Add self-referencing replies field
CommentSchema.add({
  replies: [CommentSchema]
});


// 3. Define Post schema that uses CommentSchema
const PostSchema = new Schema({
  coupleId:   { type: Schema.Types.ObjectId, ref: "Couple", required: true },
  author:     { type: Schema.Types.ObjectId, ref: "User",   required: true },
  content:    { type: String },
  mediaURL:   [{ type: String }],
  visibility: { type: String, enum: ["public", "private"], default: "private" },
  comments:   [CommentSchema], // comments field - for comments ofcourse 
  loves:      [{ type: Schema.Types.ObjectId, ref: "User" }],
  shareCount: { type: Number, default: 0 },
  createdAt:  { type: Date, default: Date.now }
});


module.exports = mongoose.model("Post", PostSchema);