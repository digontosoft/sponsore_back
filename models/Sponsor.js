const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String
  },
  organization: {
    type: String
  },
  location: {
    type: String
  },
  totalDonated: {
    type: Number,
    default: 0
  },
  sponsoredStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  joinDate: {
    type: Date,
    default: Date.now
  },
  preferences: {
    regions: [{
      type: String
    }],
    interests: [{
      type: String
    }],
    maxStudents: {
      type: Number,
      default: 3
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sponsor', sponsorSchema);

