const Application = require('../models/Application');
const Student = require('../models/Student');

// @desc    Get all applications
// @route   GET /api/applications
const getApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort = 'applicationDate' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;

    const sortObj = { [sort]: -1 };

    const applications = await Application.find(query)
      .populate('studentId', 'name')
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications.map(app => ({
        id: app._id.toString(),
        studentId: app.studentId._id.toString(),
        studentName: app.studentId.name,
        applicationDate: app.applicationDate,
        status: app.status,
        documents: app.documents,
        adminNotes: app.adminNotes,
        approvedBy: app.approvedBy,
        approvedDate: app.approvedDate
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

// @desc    Get application by ID
// @route   GET /api/applications/:id
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create application
// @route   POST /api/applications
const createApplication = async (req, res) => {
  try {
    const { studentId, documents } = req.body;

    const application = await Application.create({
      studentId,
      documents: documents || []
    });

    // Update student application status
    await Student.findByIdAndUpdate(studentId, {
      applicationStatus: 'pending',
      applicationDate: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: application._id.toString(),
        studentId: application.studentId.toString(),
        status: application.status,
        applicationDate: application.applicationDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
const updateApplicationStatus = async (req, res) => {
  try {
    const { status, adminNotes, approvedBy } = req.body;

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (approvedBy) updateData.approvedBy = approvedBy;
    if (status === 'approved') {
      updateData.approvedDate = new Date();
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Update student status
    await Student.findByIdAndUpdate(application.studentId, {
      applicationStatus: status
    });

    res.json({
      success: true,
      message: 'Application status updated',
      data: {
        id: application._id.toString(),
        studentId: application.studentId.toString(),
        status: application.status,
        approvedDate: application.approvedDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify document
// @route   PUT /api/applications/:id/verify-document/:docId
const verifyDocument = async (req, res) => {
  try {
    const { verified, verifiedBy, verificationNotes } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    const document = application.documents.id(req.params.docId);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    document.verified = verified;
    if (verifiedBy) document.verifiedBy = verifiedBy;
    if (verificationNotes) document.verificationNotes = verificationNotes;
    if (verified) document.verificationDate = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Document verified successfully',
      data: {
        documentId: document._id.toString(),
        verified: document.verified,
        verificationDate: document.verificationDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get student applications
// @route   GET /api/students/:studentId/applications
const getStudentApplications = async (req, res) => {
  try {
    const applications = await Application.find({ studentId: req.params.studentId })
      .sort({ applicationDate: -1 });

    res.json({
      success: true,
      data: applications.map(app => ({
        id: app._id.toString(),
        studentId: app.studentId.toString(),
        applicationDate: app.applicationDate,
        status: app.status,
        approvedDate: app.approvedDate,
        documentCount: app.documents.length,
        adminNotes: app.adminNotes
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplicationStatus,
  verifyDocument,
  getStudentApplications
};

