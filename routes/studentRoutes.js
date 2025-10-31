const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentDashboard,
  uploadDocument,
  getStudentProgress
} = require('../controllers/studentController');
const {
  getStudentApplications
} = require('../controllers/applicationController');
const {
  getStudentProgressHistory
} = require('../controllers/progressReportController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/search', searchStudents);
router.get('/', getStudents);
router.post('/', authMiddleware, createStudent);
router.get('/:id/dashboard', authMiddleware, getStudentDashboard);
router.post('/:id/upload-document', authMiddleware, upload.single('file'), uploadDocument);
router.get('/:id/progress', getStudentProgress);
router.get('/:studentId/applications', authMiddleware, getStudentApplications);
router.get('/:studentId/progress-history', getStudentProgressHistory);
router.get('/:id', getStudentById);
router.put('/:id', authMiddleware, updateStudent);
router.delete('/:id', authMiddleware, adminMiddleware, deleteStudent);

module.exports = router;
