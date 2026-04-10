const blogModel = require("../Models/blogModel");

const normalizeSlug = (text) => {
  return text
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const generateUniqueSlug = async (title) => {
  const baseSlug = normalizeSlug(title);
  let slug = baseSlug;
  let suffix = 1;
  while (await blogModel.exists({ slug })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
  return slug;
};

const getBlogs = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const total = await blogModel.countDocuments();
    const blogs = await blogModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title slug summary thumbnail author createdAt");

    return res.status(200).json({
      success: true,
      data: blogs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log("getBlogs error", error);
    return res.status(500).json({ error: "Cannot fetch blog list" });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || !slug.trim()) {
      return res.status(400).json({ error: "Blog slug is required" });
    }

    const blog = await blogModel.findOne({ slug });
    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.log("getBlogBySlug error", error);
    return res.status(500).json({ error: "Cannot fetch blog detail" });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, content, thumbnail, summary, author } = req.body;
    const errors = [];

    if (!title || !title.toString().trim()) {
      errors.push("Title is required");
    }
    if (!content || !content.toString().trim()) {
      errors.push("Content is required");
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const slug = await generateUniqueSlug(title);
    const createdBlog = await blogModel.create({
      title: title.toString().trim(),
      slug,
      content: content.toString(),
      thumbnail: thumbnail ? thumbnail.toString().trim() : "",
      summary: summary ? summary.toString().trim() : "",
      author: author ? author.toString().trim() : "",
    });

    return res.status(200).json({
      success: true,
      message: "Blog created successfully",
      data: createdBlog,
    });
  } catch (error) {
    console.log("createBlog error", error);
    return res.status(500).json({ error: "Cannot create blog" });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!blogId) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    const deleted = await blogModel.findByIdAndDelete(blogId);
    if (!deleted) {
      return res.status(404).json({ error: "Blog not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.log("deleteBlog error", error);
    return res.status(500).json({ error: "Cannot delete blog" });
  }
};

module.exports = {
  getBlogs,
  getBlogBySlug,
  createBlog,
  deleteBlog,
};
