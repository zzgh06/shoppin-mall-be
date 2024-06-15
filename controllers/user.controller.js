const User = require("../models/User");
const bcrypt = require('bcryptjs');
const userController = {};

userController.createUser = async (req, res) => {
  try {
    let { email, password, name, level } = req.body;
    const user = await User.findOne({ email })
    if (user){
      throw new Error('User already exist')
    }
    const salt = await bcrypt.genSaltSync(10);
    password = await bcrypt.hash(password, salt);
    const newUser = new User({email, password, name, level:level ? level : 'customer'});
    await newUser.save();
    return res.status(200).json({status : 'success'})
  } catch(error) {
    res.status(400).json({ status : 'fail', error : error.message });
  }
}

userController.getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    const likedProducts = user.likedProducts;
    if (user) {
      return res.status(200).json({ status: 'success', user, likedProducts });
    }
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
    req.alreadyLiked = alreadyLiked;

    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = userController