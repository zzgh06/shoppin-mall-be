const mongoose = require("mongoose");
const User = require("./User");
const Product = require("./Product");
const Cart = require("./Cart");
const schema = mongoose.Schema;
const orderSchema = schema(
  {
    userId: {
      type: mongoose.ObjectId,
      ref: User,
    },
    status: {
      type: String,
      default: "preparing",
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shipTo: {
      type: Object,
      required: true,
    },
    contact: {
      type: Object,
      required: true,
    },
    orderNum: {
      type: String,
    },
    items: [
      {
        productId: { type: mongoose.ObjectId, ref: Product },
        price: { type: Number, required: true },
        qty: { type: Number, required: true, default: 1 },
        size: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

// 오더가 save 되면 카트가 알아서 비워짐
// orderSchema.post("save", async function (){
//   // 카트를 비워주자
//   const cart = await Cart.findOne({userId:this.userId})
//   cart.items = [];
//   await cart.save();
// })

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
