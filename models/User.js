const mongoose = require("mongoose");
const schema = mongoose.Schema;
const jwt = require("jsonwebtoken");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const userSchema = schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    level: {
      type: String,
      default: "customer",
    },
    totalPurchases: {
      type: Number,
      default: 0,
    },
    likedProducts: [{ type: schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this._doc;
  delete obj.password;
  delete obj.__v;
  delete obj.updateAt;
  delete obj.createAt;
  return obj;
};

// jwt.sign(payload, secretOrPrivateKey, [옵션, 콜백])
// payload 와 secretOrPrivateKey 를 조합해서 토큰 값 생성
userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};

// 등급 및 할인률 계산 함수
userSchema.methods.calculateLevelAndDiscount = function () {
  let level = "customer";
  let discountRate = 0.03;

  if (this.isAdmin) {
    level = "admin";
    // 할인율을 적용하지 않음
    discountRate = 0;
  } else if (this.totalPurchases > 1000000) {
    level = "gold";
    discountRate = 0.10;
  } else if (this.totalPurchases > 500000) {
    level = "silver";
    discountRate = 0.07;
  } else if (this.totalPurchases > 300000) {
    level = "bronze";
    discountRate = 0.05;
  } else if (this.totalPurchases > 100000) {
    level = "customer";
    discountRate = 0.03;
  }

  this.level = level;
  return discountRate;
};


const User = mongoose.model("User", userSchema);
module.exports = User;
