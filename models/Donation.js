const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  sponsorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sponsor',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['monthly_sponsorship', 'general_donation', 'bulk_donation'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'paypal', 'other']
  },
  transactionId: {
    type: String
  },
  currency: {
    type: String,
    default: 'USD'
  },
  purpose: {
    type: String
  },
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String
  },
  receiptId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Donation', donationSchema);

