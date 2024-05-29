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

module.exports = userController