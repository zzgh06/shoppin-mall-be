const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const orderController = require("../controllers/order.controller");


// 주문생성
router.post("/", authController.authenticate, orderController.createOrder);

module.exports = router;
