const { populate } = require("dotenv");
const Order = require("../models/Order");
const {randomStringGenerator} = require('../utils/randomStringGenerator');
const productController = require("./product.controller");
const orderController = {};
orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터 받아옴
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고 검사와 재고 업데이트
    const insufficientStockItems = await productController.checkItemListStock(orderList);
    // 재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems.reduce(
        (total, item) => (total += item.message),
        ""
      );
      throw new Error(errorMessage);
    }
    // order 생성
    const newOrder = new Order({
      userId,
      totalPrice,
      shipTo,
      contact,
      items: orderList,
      orderNum: randomStringGenerator(),
    });
    await newOrder.save();
    // save 후에 카트 비워주기
    res.status(200).json({ status: "success", orderNum: newOrder.orderNum });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = orderController;
