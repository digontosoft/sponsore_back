const Donation = require('../models/Donation');
const Sponsor = require('../models/Sponsor');
const Student = require('../models/Student');

// @desc    Get all donations
// @route   GET /api/donations
const getDonations = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('sponsorId', 'name')
      .populate('studentId', 'name')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Donation.countDocuments(query);

    res.json({
      success: true,
      data: donations.map(d => ({
        id: d._id.toString(),
        sponsorId: d.sponsorId._id.toString(),
        sponsorName: d.sponsorId.name,
        studentId: d.studentId?._id.toString(),
        studentName: d.studentId?.name,
        amount: d.amount,
        date: d.date,
        type: d.type,
        status: d.status,
        paymentMethod: d.paymentMethod,
        transactionId: d.transactionId,
        currency: d.currency,
        purpose: d.purpose,
        receiptGenerated: d.receiptGenerated,
        receiptUrl: d.receiptUrl
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

// @desc    Get donation by ID
// @route   GET /api/donations/:id
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: donation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create donation
// @route   POST /api/donations
const createDonation = async (req, res) => {
  try {
    const donation = await Donation.create({
      ...req.body,
      transactionId: `TXN_${Date.now()}`
    });

    // Update sponsor total donated
    if (donation.status === 'completed') {
      await Sponsor.findByIdAndUpdate(donation.sponsorId, {
        $inc: { totalDonated: donation.amount }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Donation created successfully',
      data: {
        id: donation._id.toString(),
        sponsorId: donation.sponsorId.toString(),
        studentId: donation.studentId?.toString(),
        amount: donation.amount,
        status: donation.status,
        transactionId: donation.transactionId,
        date: donation.date
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id/status
const updateDonationStatus = async (req, res) => {
  try {
    const { status, transactionId } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const oldStatus = donation.status;
    donation.status = status;
    if (transactionId) donation.transactionId = transactionId;

    // Update sponsor total if status changed to completed
    if (oldStatus !== 'completed' && status === 'completed') {
      await Sponsor.findByIdAndUpdate(donation.sponsorId, {
        $inc: { totalDonated: donation.amount }
      });
    }

    await donation.save();

    res.json({
      success: true,
      message: 'Donation status updated',
      data: {
        id: donation._id.toString(),
        status: donation.status,
        transactionId: donation.transactionId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Generate receipt
// @route   POST /api/donations/:id/generate-receipt
const generateReceipt = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    const receiptId = `receipt_${Date.now()}`;
    donation.receiptGenerated = true;
    donation.receiptUrl = `https://cdn.sponsorship-portal.com/receipts/${receiptId}.pdf`;
    donation.receiptId = receiptId;
    await donation.save();

    res.json({
      success: true,
      message: 'Receipt generated successfully',
      data: {
        receiptId,
        donationId: donation._id.toString(),
        url: donation.receiptUrl,
        generatedDate: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Export donations
// @route   GET /api/donations/export
const exportDonations = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('sponsorId', 'name')
      .populate('studentId', 'name')
      .sort({ date: -1 });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=donations_${Date.now()}.csv`);
      
      let csv = 'ID,Sponsor,Student,Amount,Date,Type,Status,Currency\n';
      donations.forEach(d => {
        csv += `${d._id},${d.sponsorId.name},${d.studentId?.name || ''},${d.amount},${d.date},${d.type},${d.status},${d.currency}\n`;
      });
      
      res.send(csv);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format. Use csv or xlsx'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  generateReceipt,
  exportDonations
};

