const express = require('express');
const router = express.Router();
const {
  getDonations,
  getDonationById,
  createDonation,
  updateDonationStatus,
  generateReceipt,
  exportDonations
} = require('../controllers/donationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', getDonations);
router.get('/export', exportDonations);
router.get('/:id', getDonationById);
router.post('/', authMiddleware, createDonation);
router.put('/:id/status', authMiddleware, updateDonationStatus);
router.post('/:id/generate-receipt', authMiddleware, generateReceipt);

module.exports = router;

