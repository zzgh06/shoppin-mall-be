const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const { OAuth2Client } = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const authController = {};

// 로그인
authController.loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email }, "-createdAt -updatedAt -__v");
    if (user) {
      const isMatch = await bcrypt.compareSync(password, user.password);
      if (isMatch) {

        const token = user.generateToken();
        return res.status(200).json({ status: "success", user, token });
      }
    }
    throw new Error("invalid email or password");
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 구글 로그인
authController.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const { email, name } = ticket.getPayload();
    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = "" + Math.floor(Math.random() * 10000000000);
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(randomPassword, salt);
      user = new User({
        name,
        email,
        password: newPassword,
      });
      await user.save();
    }
    const sessionToken = await user.generateToken();
    res.status(200).json({ status: "success", user, token: sessionToken });
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 계정 확인
authController.authenticate = async (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) throw new Error("Token not found");
    const token = tokenString.replace("Bearer ", "");
    jwt.verify(token, JWT_SECRET_KEY, (error, payload) => {
      if (error) throw new Error("Invalid token");
      req.userId = payload._id;
    });
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// user level 확인
authController.attachUserLevel = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    req.userLevel = user.level;
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

// 관리자 권한 확인
authController.checkAdminPermission = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (user.level !== "admin") throw new Error("no permission");
    next();
  } catch (error) {
    res.status(400).json({ status: "fail", error: error.message });
  }
};

module.exports = authController;
