const express = require("express");
const productController = require("../controllers/product.controller");
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/user.controller");
const router = express.Router();

// 상품생성
router.post(
  "/",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.createProduct
);

// 상품 보여주기
router.get("/", productController.getProducts);

// 상품 디테일
router.get("/:id", productController.getProductById);

// 상품 수정하기
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.updateProduct
);

// 상품 삭제하기
router.delete(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  productController.deleteProduct
);

// 좋아요 및 취소
router.post("/:id/likes", authController.authenticate, userController.checkAlreadyLiked, productController.toggleLikeProduct);

module.exports = router;
