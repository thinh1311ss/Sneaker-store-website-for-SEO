// =====================
// BlogController.js
// =====================
const blogModel = require("../Models/BlogModel");

// Tạo slug từ tiêu đề
function createSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// GET /api/blog — lấy tất cả bài đã published
const getListBlog = async (req, res) => {
  try {
    const { tag, limit } = req.query;
    const filter = { published: true };
    if (tag) filter.tags = tag;

    const query = blogModel
      .find(filter)
      .select("-content") // không trả content để nhẹ response
      .sort({ createdAt: -1 });

    if (limit) query.limit(parseInt(limit));

    const blogs = await query;
    return res.status(200).json(blogs);
  } catch (error) {
    console.log("getListBlog error", error);
    return res.status(500).json({ error: "Cannot fetch blogs" });
  }
};

// GET /api/blog/admin — lấy tất cả bài (cả draft), dành cho admin
const getListBlogAdmin = async (req, res) => {
  try {
    const blogs = await blogModel
      .find()
      .select("-content")
      .sort({ createdAt: -1 });
    return res.status(200).json(blogs);
  } catch (error) {
    console.log("getListBlogAdmin error", error);
    return res.status(500).json({ error: "Cannot fetch blogs" });
  }
};

// GET /api/blog/:slug — lấy chi tiết bài viết theo slug
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await blogModel.findOne({ slug, published: true });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }
    return res.status(200).json(blog);
  } catch (error) {
    console.log("getBlogBySlug error", error);
    return res.status(500).json({ error: "Cannot fetch blog" });
  }
};

// GET /api/blog/admin/:id — lấy chi tiết bài viết theo id (cho admin edit)
const getBlogById = async (req, res) => {
  try {
    const blog = await blogModel.findById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    return res.status(200).json(blog);
  } catch (error) {
    return res.status(500).json({ error: "Cannot fetch blog" });
  }
};

// POST /api/blog/create
const postBlog = async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, tags, author, published } =
      req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    // Tạo slug unique
    let slug = createSlug(title);
    const existing = await blogModel.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = await blogModel.create({
      title,
      slug,
      excerpt: excerpt || title.substring(0, 160),
      content,
      coverImage: coverImage || "",
      tags: tags || [],
      author: author || "Admin",
      published: published ?? false,
    });

    return res.status(201).json({ message: "Blog created successfully", blog });
  } catch (error) {
    console.log("postBlog error", error);
    return res.status(500).json({ error: "Cannot create blog" });
  }
};

// PUT /api/blog/update/:id
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, excerpt, content, coverImage, tags, author, published } =
      req.body;

    const updateData = {
      updatedAt: Date.now(),
    };

    if (title) {
      updateData.title = title;
      // Cập nhật slug nếu đổi title
      let newSlug = createSlug(title);
      const existing = await blogModel.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      if (existing) newSlug = `${newSlug}-${Date.now()}`;
      updateData.slug = newSlug;
    }
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (tags !== undefined) updateData.tags = tags;
    if (author !== undefined) updateData.author = author;
    if (published !== undefined) updateData.published = published;

    const blog = await blogModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!blog) return res.status(404).json({ error: "Blog not found" });

    return res.status(200).json({ message: "Blog updated successfully", blog });
  } catch (error) {
    console.log("updateBlog error", error);
    return res.status(500).json({ error: "Cannot update blog" });
  }
};

// DELETE /api/blog/delete/:id
const deleteBlog = async (req, res) => {
  try {
    const deleted = await blogModel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Blog not found" });
    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Cannot delete blog" });
  }
};

module.exports = {
  getListBlog,
  getListBlogAdmin,
  getBlogBySlug,
  getBlogById,
  postBlog,
  updateBlog,
  deleteBlog,
};