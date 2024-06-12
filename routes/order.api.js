const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");

// 주문생성
router.post("/", authController.authenticate, orderController.createOrder);

// 내 주문 정보 가져오기
router.get("/me", authController.authenticate, orderController.getOrder);

// 주문서 상태 변경
router.put(
  "/:id",
  authController.authenticate,
  authController.checkAdminPermission,
  orderController.updateOrder
);

module.exports = router;
