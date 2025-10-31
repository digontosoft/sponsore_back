const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  getReports,
  verifyApplication
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/dashboard', authMiddleware, adminMiddleware, getAdminDashboard);
router.get('/users', authMiddleware, adminMiddleware, getAdminUsers);
router.post('/users', authMiddleware, adminMiddleware, createAdminUser);
router.get('/reports', authMiddleware, adminMiddleware, getReports);
router.put('/applications/:id/verify', authMiddleware, adminMiddleware, verifyApplication);

module.exports = router;

