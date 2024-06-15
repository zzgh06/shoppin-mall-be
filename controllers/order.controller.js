const { populate } = require("dotenv");
const { model } = require("mongoose");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const PAGE_SIZE = 5;

const orderController = {};
orderController.createOrder = async (req, res) => {
  try {
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems
        .map((item) => item.message)
        .join(" ");

      throw new Error(errorMessage);
    }
    for (const item of orderList) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`상품을 찾을 수 없습니다: ${item.productId}`);
      }
      const newStock = { ...product.stock };
      newStock[item.size] -= item.qty;
      const newPurchases = product.purchases + item.qty;
      await Product.findByIdAndUpdate(item.productId, {
        stock: newStock,
        purchases: newPurchases,
      });
    }
    const user = await User.findById(userId);
    user.totalPurchases += totalPrice;
    const discountRate = user.calculateLevelAndDiscount();
    await user.save();
    const discountedTotalPrice = totalPrice * (1 - discountRate);
    const newOrder = new Order({
      userId,
      totalPrice: discountedTotalPrice,
      originalTotalPrice: totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.getOrder = async (req, res) => {
  try {
    const { userId, userLevel } = req;
    const { page, orderNum } = req.query;
    let cond = {};
    if (userLevel !== "admin") {
      cond.userId = userId;
    }
    if (orderNum) {
      cond = {
        orderNum: { $regex: orderNum, $options: "i" },
      };
    }
    const orderList = await Order.find(cond)
      .populate("userId")
      .populate({
        path: "items",
        populate: {
          path: "productId",
          model: "Product",
          select: "images name",
        },
      })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE);

    const totalItemNum = await Order.countDocuments(cond);
    const totalPageNum = Math.ceil(totalItemNum / PAGE_SIZE);
    res.status(200).json({ status: "success", data: orderList, totalPageNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

orderController.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    if (!order) throw new Error("주문서를 찾을 수 없습니다.");
    res.status(200).json({ status: "success", data: order });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
