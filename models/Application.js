const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: String
  },
  verificationNotes: {
    type: String
  },
  verificationDate: {
    type: Date
  }
});

const applicationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [documentSchema],
  adminNotes: {
    type: String
  },
  approvedBy: {
    type: String
  },
  approvedDate: {
    type: Date
  },
  verifiedBy: {
    type: String
  },
  verifiedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);

