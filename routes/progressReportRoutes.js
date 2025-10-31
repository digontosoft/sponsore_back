const express = require('express');
const router = express.Router();
const {
  getProgressReports,
  getProgressReportById,
  createProgressReport,
  updateProgressReport,
  getStudentProgressHistory,
  getSponsoredStudentsProgress
} = require('../controllers/progressReportController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', getProgressReports);
router.get('/:id', getProgressReportById);
router.post('/', authMiddleware, createProgressReport);
router.put('/:id', authMiddleware, updateProgressReport);

module.exports = router;

