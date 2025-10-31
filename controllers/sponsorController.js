const Sponsor = require('../models/Sponsor');
const User = require('../models/User');
const Student = require('../models/Student');
const Donation = require('../models/Donation');

// @desc    Get all sponsors
// @route   GET /api/sponsors
const getSponsors = async (req, res) => {
  try {
    const { page = 1, limit = 10, location, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (location) query.location = new RegExp(location, 'i');
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { organization: new RegExp(search, 'i') }
      ];
    }

    const sponsors = await Sponsor.find(query)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Sponsor.countDocuments(query);

    res.json({
      success: true,
      data: sponsors,
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

// @desc    Get sponsor by ID
// @route   GET /api/sponsors/:id
const getSponsorById = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    res.json({
      success: true,
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create sponsor
// @route   POST /api/sponsors
const createSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Sponsor registered successfully',
      data: {
        id: sponsor._id.toString(),
        name: sponsor.name,
        email: sponsor.email,
        joinDate: sponsor.joinDate
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update sponsor
// @route   PUT /api/sponsors/:id
const updateSponsor = async (req, res) => {
  try {
    const sponsor = await Sponsor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    res.json({
      success: true,
      message: 'Sponsor updated successfully',
      data: sponsor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get sponsor dashboard
// @route   GET /api/sponsors/:id/dashboard
const getSponsorDashboard = async (req, res) => {
  try {
    const sponsor = await Sponsor.findById(req.params.id);
    if (!sponsor) {
      return res.status(404).json({
        success: false,
        message: 'Sponsor not found'
      });
    }

    const donations = await Donation.find({ sponsorId: req.params.id });
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);

    const sponsoredStudents = await Student.find({ sponsorId: req.params.id });

    res.json({
      success: true,
      data: {
        sponsor: {
          id: sponsor._id.toString(),
          name: sponsor.name,
          organization: sponsor.organization,
          totalDonated: totalDonations,
          joinDate: sponsor.joinDate
        },
        sponsorshipStats: {
          totalStudents: sponsoredStudents.length,
          activeSponsors: sponsoredStudents.length,
          donationCount: donations.length,
          totalDonated: totalDonations
        },
        donationHistory: donations.slice(-5),
        sponsoredStudents: sponsoredStudents.map(s => ({
          id: s._id.toString(),
          name: s.name,
          class: s.class,
          region: s.region
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

// @desc    Get sponsored students
// @route   GET /api/sponsors/:id/students
const getSponsorStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { sponsorId: req.params.id };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { school: new RegExp(search, 'i') }
      ];
    }
    if (status) query.applicationStatus = status;

    const students = await Student.find(query)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Student.countDocuments(query);

    res.json({
      success: true,
      data: students.map(s => ({
        id: s._id.toString(),
        name: s.name,
        age: s.age,
        class: s.class,
        region: s.region,
        school: s.school,
        academicRecord: s.academicRecord,
        profileImage: s.profileImage,
        lastProgressUpdate: s.lastProgressUpdate,
        currency: s.currency
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

// @desc    Get sponsor donations
// @route   GET /api/sponsors/:id/donations
const getSponsorDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = { sponsorId: req.params.id };
    if (type) query.type = type;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('studentId', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations,
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

// @desc    Search sponsors
// @route   GET /api/sponsors/search
const searchSponsors = async (req, res) => {
  try {
    const { query, location, limit = 10 } = req.query;

    const searchQuery = {};
    if (query) {
      searchQuery.$or = [
        { name: new RegExp(query, 'i') },
        { organization: new RegExp(query, 'i') }
      ];
    }
    if (location) searchQuery.location = new RegExp(location, 'i');

    const sponsors = await Sponsor.find(searchQuery)
      .limit(parseInt(limit))
      .select('id name organization location totalDonated');

    res.json({
      success: true,
      results: sponsors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get donations summary
// @route   GET /api/sponsors/:sponsorId/donations-summary
const getDonationsSummary = async (req, res) => {
  try {
    const donations = await Donation.find({ sponsorId: req.params.sponsorId });
    
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donations.length;
    const averageDonation = donationCount > 0 ? totalDonations / donationCount : 0;

    // Group by month
    const monthlyDonations = {};
    donations.forEach(donation => {
      const month = new Date(donation.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!monthlyDonations[month]) {
        monthlyDonations[month] = { amount: 0, count: 0 };
      }
      monthlyDonations[month].amount += donation.amount;
      monthlyDonations[month].count += 1;
    });

    const monthlyData = Object.keys(monthlyDonations).map(month => ({
      month,
      amount: monthlyDonations[month].amount,
      count: monthlyDonations[month].count
    }));

    res.json({
      success: true,
      data: {
        totalDonations,
        donationCount,
        averageDonation,
        monthlyDonations: monthlyData
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
  getSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  getSponsorDashboard,
  getSponsorStudents,
  getSponsorDonations,
  searchSponsors,
  getDonationsSummary
};

