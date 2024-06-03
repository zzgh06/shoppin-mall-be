const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const userSchema = schema({
  email : {
    type : String,
    required : true,
    unique : true
  },
  password : {
    type : String,
    required : true,
  },
  name : {
    type : String,
    required : true,
  },
  level : {
    type : String,
    default : "customer"
  }
}, {timestamps:true})

userSchema.methods.toJSON = function () {
  const obj = this._doc
  delete obj.password
  delete obj.__v
  delete obj.updateAt
  delete obj.createAt
  return obj
}

// jwt.sign(payload, secretOrPrivateKey, [옵션, 콜백])
// payload 와 secretOrPrivateKey 를 조합해서 토큰 값 생성
userSchema.methods.generateToken = function (){
  const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY, {
    expiresIn:'1d'
  });
  return token;
}

const User = mongoose.model("User", userSchema)
module.exports = User;