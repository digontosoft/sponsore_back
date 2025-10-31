const express = require('express');
const router = express.Router();
const {
  login,
  register,
  logout,
  getMe,
  refreshToken
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getMe);
router.post('/refresh', refreshToken);

module.exports = router;

