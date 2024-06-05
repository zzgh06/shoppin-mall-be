const express = require('express');
const productController = require('../controllers/product.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// 상품생성
router.post(
  '/', 
  authController.authenticate, 
  authController.checkAdminPermission, 
  productController.createProduct
);

// 상품 보여주기
router.get('/', productController.getProducts)

// 상품 수정하기
router.put(
  '/:id', 
  authController.authenticate, 
  authController.checkAdminPermission, 
  productController.updateProduct
)

module.exports = router;
