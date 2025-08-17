const express = require('express');
const {
  register,
  registerAdmin,
  login,
  logout,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
