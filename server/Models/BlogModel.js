const mongoose = require("mongoose");

const BlogSchema = new mongoose.Schema({
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
  },
  excerpt: {
    type: String,
    trim: true,
  },
  content: {
    type: String, // Markdown content
    required: true,
  },
  coverImage: {
    type: String,
    default: "",
  },
  tags: {
    type: [String],
    default: [],
  },
  author: {
    type: String,
    default: "Admin",
  },
  published: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update updatedAt on save
BlogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const BlogModel = mongoose.model("Blogs", BlogSchema);
module.exports = BlogModel;