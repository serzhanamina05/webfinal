const Post = require('../models/post');

exports.createPost = async (req, res) => {
  const { title, description, images } = req.body;
  const newPost = new Post({ title, description, images });
  await newPost.save();
  res.redirect('/admin/dashboard');
};

exports.deletePost = async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/admin/dashboard');
};

exports.updatePost = async (req, res) => {
  const { title, description, images } = req.body;
  await Post.findByIdAndUpdate(req.params.id, { title, description, images, updatedAt: new Date() });
  res.redirect('/admin/dashboard');
};