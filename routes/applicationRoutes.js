const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  verifyDocument,
  getStudentApplications
} = require('../controllers/applicationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getApplications);
router.get('/:id', authMiddleware, getApplicationById);
router.post('/', authMiddleware, createApplication);
router.put('/:id/status', authMiddleware, updateApplicationStatus);
router.put('/:id/verify-document/:docId', authMiddleware, verifyDocument);

module.exports = router;

