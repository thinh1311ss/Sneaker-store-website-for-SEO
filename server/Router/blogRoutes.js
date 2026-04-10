const express = require("express");
const router = express.Router();
const blogController = require("../Controllers/blogController");
const authMiddleware = require("../Middleware/AuthMiddleware");

router.get("/blogs", blogController.getBlogs);
router.get("/blogs/:slug", blogController.getBlogBySlug);
router.post(
  "/blogs/admin/add",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  blogController.createBlog,
);
router.delete(
  "/blogs/admin/delete/:blogId",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  blogController.deleteBlog,
);

module.exports = router;
