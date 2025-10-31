const Admin = require('../models/Admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Sponsor = require('../models/Sponsor');
const Application = require('../models/Application');
const Donation = require('../models/Donation');

// @desc    Get admin dashboard
// @route   GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalSponsors = await Sponsor.countDocuments();
    
    const applications = await Application.find();
    const approvedApplications = applications.filter(a => a.status === 'approved').length;
    const pendingApplications = applications.filter(a => a.status === 'pending').length;
    const rejectedApplications = applications.filter(a => a.status === 'rejected').length;

    const donations = await Donation.find({ status: 'completed' });
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

    const recentApplications = await Application.find()
      .populate('studentId', 'name')
      .sort({ applicationDate: -1 })
      .limit(5);

    const recentDonations = await Donation.find()
      .populate('sponsorId', 'name')
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalSponsors,
        approvedApplications,
        pendingApplications,
        rejectedApplications,
        totalDonations,
        recentApplications: recentApplications.map(app => ({
          id: app._id.toString(),
          studentName: app.studentId.name,
          status: app.status,
          applicationDate: app.applicationDate
        })),
        recentDonations: recentDonations.map(d => ({
          id: d._id.toString(),
          sponsorName: d.sponsorId.name,
          amount: d.amount,
          date: d.date
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all admin users
// @route   GET /api/admin/users
const getAdminUsers = async (req, res) => {
  try {
    const admins = await Admin.find().populate('userId');
    res.json({
      success: true,
      data: admins.map(admin => ({
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        lastLogin: admin.lastLogin
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create admin user
// @route   POST /api/admin/users
const createAdminUser = async (req, res) => {
  try {
    const { username, email, password, role, permissions } = req.body;

    // Create user first
    const user = await User.create({
      name: username,
      email,
      password,
      userType: 'admin'
    });

    // Create admin profile
    const admin = await Admin.create({
      userId: user._id,
      username,
      email,
      role: role || 'admin',
      permissions: permissions || []
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: admin._id.toString(),
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
const getReports = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    if (type === 'donation_summary') {
      const query = {};
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const donations = await Donation.find({ ...query, status: 'completed' })
        .populate('sponsorId', 'name');

      const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
      const totalTransactions = donations.length;
      const averageDonation = totalTransactions > 0 ? totalDonations / totalTransactions : 0;

      // Group by sponsor
      const sponsorTotals = {};
      donations.forEach(d => {
        const sponsorId = d.sponsorId._id.toString();
        if (!sponsorTotals[sponsorId]) {
          sponsorTotals[sponsorId] = {
            id: sponsorId,
            name: d.sponsorId.name,
            totalDonated: 0,
            transactionCount: 0
          };
        }
        sponsorTotals[sponsorId].totalDonated += d.amount;
        sponsorTotals[sponsorId].transactionCount += 1;
      });

      const topSponsors = Object.values(sponsorTotals)
        .sort((a, b) => b.totalDonated - a.totalDonated)
        .slice(0, 10);

      // Group by type
      const donationsByType = {};
      donations.forEach(d => {
        if (!donationsByType[d.type]) {
          donationsByType[d.type] = { count: 0, amount: 0 };
        }
        donationsByType[d.type].count += 1;
        donationsByType[d.type].amount += d.amount;
      });

      res.json({
        success: true,
        data: {
          reportType: 'donation_summary',
          period: {
            startDate: startDate || null,
            endDate: endDate || null
          },
          summary: {
            totalDonations,
            totalTransactions,
            averageDonation,
            topSponsors,
            donationsByType
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid report type'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Verify application
// @route   PUT /api/admin/applications/:id/verify
const verifyApplication = async (req, res) => {
  try {
    const { status, adminNotes, verifiedBy } = req.body;
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    application.status = status;
    if (adminNotes) application.adminNotes = adminNotes;
    if (verifiedBy) application.verifiedBy = verifiedBy;
    application.verifiedDate = new Date();
    if (status === 'approved') {
      application.approvedDate = new Date();
      application.approvedBy = verifiedBy;
    }

    await application.save();

    // Update student status
    await Student.findByIdAndUpdate(application.studentId, {
      applicationStatus: status
    });

    res.json({
      success: true,
      message: 'Application verified successfully',
      data: {
        id: application._id.toString(),
        studentId: application.studentId.toString(),
        status: application.status,
        verifiedDate: application.verifiedDate
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
  getAdminDashboard,
  getAdminUsers,
  createAdminUser,
  getReports,
  verifyApplication
};

