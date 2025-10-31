const Student = require('../models/Student');
const User = require('../models/User');
const Application = require('../models/Application');
const ProgressReport = require('../models/ProgressReport');

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      region,
      class: className,
      financialNeed,
      gender,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const query = {};
    if (region) query.region = new RegExp(region, 'i');
    if (className) query.class = className;
    if (financialNeed) query.financialNeed = financialNeed;
    if (gender) query.gender = gender;

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sort]: sortOrder };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const students = await Student.find(query)
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students,
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

// @desc    Get student by ID
// @route   GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create student
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: {
        id: student._id,
        name: student.name,
        applicationStatus: student.applicationStatus,
        applicationDate: student.applicationDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search students
// @route   GET /api/students/search
const searchStudents = async (req, res) => {
  try {
    const { query, region, class: className, financialNeed, gender, limit = 10 } = req.query;

    const searchQuery = {};
    if (query) {
      searchQuery.$or = [
        { name: new RegExp(query, 'i') },
        { school: new RegExp(query, 'i') }
      ];
    }
    if (region) searchQuery.region = new RegExp(region, 'i');
    if (className) searchQuery.class = className;
    if (financialNeed) searchQuery.financialNeed = financialNeed;
    if (gender) searchQuery.gender = gender;

    const students = await Student.find(searchQuery)
      .limit(parseInt(limit))
      .select('id name region class academicRecord profileImage');

    res.json({
      success: true,
      results: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student dashboard
// @route   GET /api/students/:id/dashboard
const getStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const application = await Application.findOne({ studentId: req.params.id });
    const progressReports = await ProgressReport.find({ studentId: req.params.id })
      .sort({ reportDate: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        student: {
          id: student._id.toString(),
          name: student.name,
          email: student.userId?.email,
          profileImage: student.profileImage,
          applicationStatus: student.applicationStatus,
          sponsorId: student.sponsorId
        },
        application: application ? {
          id: application._id.toString(),
          status: application.status,
          approvedDate: application.approvedDate,
          adminNotes: application.adminNotes
        } : null,
        progressReports: progressReports.map(report => ({
          id: report._id.toString(),
          reportDate: report.reportDate,
          semester: report.semester,
          overallPercentage: report.overallPercentage
        })),
        sponsorInfo: student.sponsorId ? { id: student.sponsorId } : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Upload document
// @route   POST /api/students/:id/upload-document
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;
    const documentId = `doc_${Date.now()}`;
    const filename = req.file.filename;

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        documentId,
        filename,
        documentType,
        uploadDate: new Date().toISOString(),
        url: `https://cdn.sponsorship-portal.com/documents/${documentId}`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student progress
// @route   GET /api/students/:id/progress
const getStudentProgress = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await ProgressReport.find({ studentId: req.params.id })
      .sort({ reportDate: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await ProgressReport.countDocuments({ studentId: req.params.id });

    res.json({
      success: true,
      data: reports,
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

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  searchStudents,
  getStudentDashboard,
  uploadDocument,
  getStudentProgress
};

