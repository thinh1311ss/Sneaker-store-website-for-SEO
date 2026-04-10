const express = require("express");
const router = express.Router();
const productController = require("../Controllers/ProductController");
const authMiddleware = require("../Middleware/AuthMiddleware");

// Search route PHẢI đặt TRƯỚC route có :id
router.get("/product/search", productController.searchProduct);

router.get("/product", productController.getListProduct);

router.post(
  "/product/create",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  productController.postProduct,
);

router.delete(
  "/product/delete/:productId",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  productController.deleteProduct,
);

router.put(
  "/product/update/:productId",
  [authMiddleware.isAuthentication, authMiddleware.isAdmin],
  productController.updateProduct,
);

// Route có :id đặt CUỐI CÙNG
router.get("/product/:id", productController.getProductDetail);

module.exports = router;