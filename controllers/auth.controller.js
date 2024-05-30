const jwt = require('jsonwebtoken')
const User = require("../models/User");
const bcrypt = require('bcryptjs');
require("dotenv").config();
const JWT_SECRET_KEY=process.env.JWT_SECRET_KEY

const authController = {};


authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    // 유저정보가 데이터베이스에 있는지 확인
    let user = await User.findOne({email}, "-createdAt -updatedAt -__v")
    if (user) {
      // 입력한 패스워드와 데이터베이스에 있는 패스워드가 일치하는지 확인
      const isMatch = await bcrypt.compareSync(password, user.password);
      if(isMatch) {
        // 일치한다면 토큰을 생성하고
        const token = user.generateToken();
        // 응답으로 유저와 토큰 값을 넘긴다.
        return res.status(200).json({status:"success", user, token})
      }
    }
    throw new Error('invalid email or password');
  } catch(error) {
    res.status(400).json({status : 'fail', error : error.message})
  }
}

authController.authenticate = async (req, res, next) => {
  try {
    // headers.authorization 에 있는 token 값을 불러온다
    const tokenString = req.headers.authorization
    if (!tokenString) throw new Error('Token not found')
    // token에서 불필요한 Bearer를 없애준다
    const token = tokenString.replace("Bearer ", "");
    // jwt.verify 함수를 통해 token 와 JWT_SECRET_KEY 이 유효한지 확인
    jwt.verify(token, JWT_SECRET_KEY, (error, payload)=>{
      if (error) throw new Error('Invalid token')
      req.userId = payload._id;
    });
    next()
  } catch(error) {
    res.status(400).json({status : 'fail', error : error.message})
  }
}

module.exports = authController