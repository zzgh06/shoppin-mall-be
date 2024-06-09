const { populate } = require("dotenv");
const Cart = require("../models/Cart");
const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    // 유저를 가지고 카트 찾기
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      // 유저가 만든 카트가 없다, 만들어주기
      cart = new Cart({ userId });
      await cart.save();
    }
    // 이미 카트에 들어가 있는 아이템이냐? productId, size
    const existItem = cart.items.find(
      (item) =>
        // equals 오브젝트 안의 요소를 비교할 때 사용
        // equals 메서드는 productId와 size를 모두 비교할 수 없음
        // productId 비교를 먼저 한 후, size를 비교하는 두 개의 조건으로 분리
        item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      // 그렇다면 에러 ('이미 아이템이 카트에 있습니다')
      return res.status(400).json({
        status: "fail",
        error: "동일한 상품이 이미 카트에 담겨져 있습니다.",
      });
    }
    // 카트에 아이템을 추가
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    // cartItemQty : cart.items.length => 쇼핑백에 담길 아이템 갯수를 표현하기 위한 값
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    // 유저 아이디와 일치하는 Cart 정보 가져오기
    const { userId } = req;
    // 카트에는 현재 userId, items : productId, size, qty 정보밖에 없기 때문에
    // populate를 활용하여 productId(외래키)에 있는 데이터 가져오기
    // path : 기준 / model : 가져고올 정보를 가지고 있는 모델
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    // console.log(cart)
    res.status(200).json({ status: "success", data: cart.items });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.deleteCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const cart = await Cart.findOne({ userId });
    cart.items = cart.items.filter((item) => !item._id.equals(id));
    await cart.save();
    res.status(200).json({ status: "success", cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

// 카트에 담긴 아이템의 수량 변경
cartController.editCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { qty } = req.body;

    // productId 외래키로 Product에 접근
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    // 카트가 없으면 에러처리
    if (!cart)
      return res
        .status(400)
        .json({ status: "fail", error: "고객님을 위한 카트가 없습니다" });
    // 카트의 담긴 아이템과 선택한 아이템이 동일한지 확인
    const index = cart.items.findIndex((item) => item._id.equals(id));
    // 카트의 동일한 없으면 에러처리
    if (index === -1)
      return res
        .status(400)
        .json({ status: "fail", error: "해당 상품을 찾을 수 없습니다." });
    // 있으면 qty 변경
    cart.items[index].qty = qty;
    await cart.save();
    res.status(200).json({ status: "success", data: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCartQty = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) throw new Error("고객님을 위한 카트가 없습니다");
    res.status(200).json({ status: 200, qty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = cartController;
