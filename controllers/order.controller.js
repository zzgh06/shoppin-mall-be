const { populate } = require("dotenv");
const Order = require("../models/Order");
const { randomStringGenerator } = require("../utils/randomStringGenerator");
const productController = require("./product.controller");
const { model } = require("mongoose");
const PAGE_SIZE = 5;
const orderController = {};
orderController.createOrder = async (req, res) => {
  try {
    // 프론트엔드에서 보낸 데이터 받아옴
    const { userId } = req;
    const { shipTo, contact, totalPrice, orderList } = req.body;
    // 재고 검사
    const insufficientStockItems = await productController.checkItemListStock(
      orderList
    );
    // 재고가 충분하지 않는 아이템이 있었다 => 에러
    if (insufficientStockItems.length > 0) {
      const errorMessage = insufficientStockItems
        .map((item) => item.message)
        .join(" ");

      throw new Error(errorMessage);
    }

    // 재고가 충분할 경우, 재고 감소
    await productController.deductItemStock(orderList);

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

orderController.getOrder = async (req, res) => {
  try {
    const { page, orderNum } = req.query;

    let cond = {};
    if (orderNum) {
      cond = {
        orderNum: { $regex: orderNum, $options: "i" },
      };
    }
    // populate를 활용하여 Order 정보와
    // productId(외래키)에 있는 상품정보 가져오기
    // orderNum을 기준으로 유저정보 가져오기
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

    const totalItemNum = await Order.find(cond).count();
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
    // id 값과 일치하는 주문정보
    // 수정할 내용,
    // 업데이트한 후 새로운 값 리턴하는 옵션 => { new : true }
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
