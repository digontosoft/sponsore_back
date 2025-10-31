const ProgressReport = require('../models/ProgressReport');
const Student = require('../models/Student');

// @desc    Get all progress reports
// @route   GET /api/progress-reports
const getProgressReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, studentId, semester } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (studentId) query.studentId = studentId;
    if (semester) query.semester = semester;

    const reports = await ProgressReport.find(query)
      .populate('studentId', 'name')
      .sort({ reportDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProgressReport.countDocuments(query);

    res.json({
      success: true,
      data: reports.map(r => ({
        id: r._id.toString(),
        studentId: r.studentId._id.toString(),
        studentName: r.studentId.name,
        reportDate: r.reportDate,
        semester: r.semester,
        overallGrade: r.overallGrade,
        overallPercentage: r.overallPercentage,
        attendance: r.attendance,
        achievements: r.achievements
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get progress report by ID
// @route   GET /api/progress-reports/:id
const getProgressReportById = async (req, res) => {
  try {
    const report = await ProgressReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create progress report
// @route   POST /api/progress-reports
const createProgressReport = async (req, res) => {
  try {
    const report = await ProgressReport.create(req.body);

    // Update student lastProgressUpdate
    await Student.findByIdAndUpdate(req.body.studentId, {
      lastProgressUpdate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Progress report submitted successfully',
      data: {
        id: report._id.toString(),
        studentId: report.studentId.toString(),
        reportDate: report.reportDate,
        semester: report.semester,
        overallPercentage: report.overallPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update progress report
// @route   PUT /api/progress-reports/:id
const updateProgressReport = async (req, res) => {
  try {
    const report = await ProgressReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Progress report not found'
      });
    }

    res.json({
      success: true,
      message: 'Progress report updated successfully',
      data: {
        id: report._id.toString(),
        studentId: report.studentId.toString(),
        overallPercentage: report.overallPercentage
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student progress history
// @route   GET /api/students/:studentId/progress-history
const getStudentProgressHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await ProgressReport.find({ studentId: req.params.studentId })
      .sort({ reportDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProgressReport.countDocuments({ studentId: req.params.studentId });

    res.json({
      success: true,
      data: reports.map(r => ({
        id: r._id.toString(),
        reportDate: r.reportDate,
        semester: r.semester,
        overallPercentage: r.overallPercentage,
        overallGrade: r.overallGrade,
        attendance: r.attendance
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sponsored students progress
// @route   GET /api/sponsors/:sponsorId/students-progress
const getSponsoredStudentsProgress = async (req, res) => {
  try {
    const students = await Student.find({ sponsorId: req.params.sponsorId });

    const progressData = await Promise.all(
      students.map(async (student) => {
        const latestReport = await ProgressReport.findOne({ studentId: student._id })
          .sort({ reportDate: -1 });

        return {
          studentId: student._id.toString(),
          studentName: student.name,
          latestReport: latestReport ? {
            id: latestReport._id.toString(),
            reportDate: latestReport.reportDate,
            overallPercentage: latestReport.overallPercentage,
            overallGrade: latestReport.overallGrade,
            semester: latestReport.semester
          } : null
        };
      })
    );

    res.json({
      success: true,
      data: progressData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getProgressReports,
  getProgressReportById,
  createProgressReport,
  updateProgressReport,
  getStudentProgressHistory,
  getSponsoredStudentsProgress
};

