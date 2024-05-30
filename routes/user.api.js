const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');
const router = express.Router();

// 회원가입
router.post('/', userController.createUser);

// 로그인 유지
// 토큰이 valid 한 토큰인지, 이 토큰을 가지고 유저를 찾아서 리턴
router.get('/me', authController.authenticate, userController.getUser)

module.exports = router;