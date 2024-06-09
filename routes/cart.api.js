const express = require("express");
const authController = require("../controllers/auth.controller");
const cartController = require("../controllers/cartController");
const router = express.Router();

// 카트에 아이템 담기
router.post("/", authController.authenticate, cartController.addItemToCart);

// 카트에 담긴 아이템 보여주기
router.get("/", authController.authenticate, cartController.getCart);

// 카트 아이템 삭제
router.delete(
  "/:id",
  authController.authenticate,
  cartController.deleteCartItem
);

// 카트 아이템 수정
router.put("/:id", authController.authenticate, cartController.editCartItem);

// 카트 아이템 수 표시하기
router.get("/qty", authController.authenticate, cartController.getCartQty);

module.exports = router;
