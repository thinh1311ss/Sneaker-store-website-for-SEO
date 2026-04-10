const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  content: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    default: "",
  },
  summary: {
    type: String,
    default: "",
  },
  author: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
