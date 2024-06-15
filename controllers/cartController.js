const { populate } = require("dotenv");
const Cart = require("../models/Cart");
const cartController = {};

cartController.addItemToCart = async (req, res) => {
  try {
    const { userId } = req;
    const { productId, size, qty } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId });
      await cart.save();
    }
    const existItem = cart.items.find(
      (item) => item.productId.equals(productId) && item.size === size
    );
    if (existItem) {
      return res.status(400).json({
        status: "fail",
        error: "동일한 상품이 이미 카트에 담겨져 있습니다.",
      });
    }
    cart.items = [...cart.items, { productId, size, qty }];
    await cart.save();
    res
      .status(200)
      .json({ status: "success", data: cart, cartItemQty: cart.items.length });
  } catch (error) {
    return res.status(400).json({ status: "fail", error: error.message });
  }
};

cartController.getCart = async (req, res) => {
  try {
    const { userId } = req;
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
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
    const cart = await Cart.findOne({ userId }).populate({
      path: "items",
      populate: {
        path: "productId",
        model: "Product",
      },
    });
    if (!cart)
      return res
        .status(400)
        .json({ status: "fail", error: "고객님을 위한 카트가 없습니다" });
    const index = cart.items.findIndex((item) => item._id.equals(id));
    if (index === -1)
      return res
        .status(400)
        .json({ status: "fail", error: "해당 상품을 찾을 수 없습니다." });
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
