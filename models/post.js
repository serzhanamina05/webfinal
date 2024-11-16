const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String], 
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
  deletedAt: Date
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;