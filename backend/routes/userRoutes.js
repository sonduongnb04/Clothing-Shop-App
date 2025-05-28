const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Route đăng ký và đăng nhập
router.post('/register', registerUser);
router.post('/login', loginUser);

// Route profile người dùng (yêu cầu xác thực)
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

module.exports = router;
