const User = require("../models/User");
const bcrypt = require('bcryptjs');
const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    // 데이터베이스에 동일한 이메일이 존재하는지 확인
    const user = await User.findOne({ email })
    if (user){
      // 있으면 error 전달
      throw new Error('User already exist')
    }
    // password 암호화
    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);
    // 암호화 후에 user collection 에 저장
    const newUser = new User({email, password, name, level:level ? level : 'customer'});
    await newUser.save();
    return res.status(200).json({status : 'success'})
  } catch(error) {
    res.status(400).json({ status : 'fail', error : error.message });
  }
}

userController.getUser = async (req, res) => {
  try {
    // authController.authenticate 미들웨어를 통해 넘어온 req.userId로 user를 찾는다
    const userId = req.userId;
    const user = await User.findById(userId);
    const likedProducts = user.likedProducts;
    if (user) {
      return res.status(200).json({ status: 'success', user, likedProducts });
    }
    // user가 없을 때 에러 던지기
    throw new Error('Can not find user');
  } catch (error) {
    res.status(400).json({status : "fail", message : error.message})
  }
};

userController.checkAlreadyLiked = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found" });
    }

    const alreadyLiked = user.likedProducts.includes(productId);
    req.alreadyLiked = alreadyLiked; // 미들웨어에서 확인한 정보를 req 객체에 추가

    next(); // 다음 미들웨어로 넘어가기
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = userController