const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    // required removed to make field optional
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    // required removed to make field optional
  },
  class: {
    type: String,
    // required removed to make field optional
  },
  school: {
    type: String,
    // required removed to make field optional
  },
  region: {
    type: String,
    // required removed to make field optional
  },
  financialNeed: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    // required removed to make field optional
  },
  monthlyIncome: {
    type: Number,
    // required removed to make field optional
  },
  familySize: {
    type: Number,
    // required removed to make field optional
  },
  interests: [{
    type: String
  }],
  academicRecord: {
    type: String
  },
  story: {
    type: String
  },
  documentsSubmitted: [{
    type: String
  }],
  applicationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    default: null
  },
  profileImage: {
    type: String
  },
  applicationDate: {
    type: Date,
    default: Date.now
  },
  lastProgressUpdate: {
    type: Date
  },
  currency: {
    type: String,
    default: 'BDT'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);

