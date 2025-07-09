const express = require('express');
const {
  register,
  login,
  logout,
  getMe
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', getMe);

module.exports = router;