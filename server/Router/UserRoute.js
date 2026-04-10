const express = require("express");
const router = express.Router();
const userController = require("../Controllers/UserController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// Get current logged in user (must be before /:id route)
router.get(
  "/me",
  [authMiddleware.isAuthentication],
  userController.getCurrentUser,
);

router.get(
  "/user",
  [authMiddleware.isAuthentication],
  userController.getListUser,
);

router.post(
  "/user/create",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  userController.postUser,
);

router.put(
  "/profile",
  [authMiddleware.isAuthentication],
  userController.updateUserProfile,
);

router.delete(
  "/user/delete/:userId",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  userController.deleteUser,
);

// Get user by ID (must be after /me route)
router.get(
  "/user/:id",
  [authMiddleware.isAuthentication],
  userController.getUserDetail,
);

router.put(
  "/user/update_password/:id",
  [authMiddleware.isAuthentication],
  userController.updateUserPassword,
);

module.exports = router;
