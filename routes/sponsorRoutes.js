const express = require('express');
const router = express.Router();
const {
  getSponsors,
  getSponsorById,
  createSponsor,
  updateSponsor,
  getSponsorDashboard,
  getSponsorStudents,
  getSponsorDonations,
  searchSponsors,
  getDonationsSummary
} = require('../controllers/sponsorController');
const {
  getSponsoredStudentsProgress
} = require('../controllers/progressReportController');
const { authMiddleware } = require('../middleware/auth');

router.get('/search', searchSponsors);
router.get('/', getSponsors);
router.post('/', createSponsor);
router.get('/:id/dashboard', authMiddleware, getSponsorDashboard);
router.get('/:id/students', authMiddleware, getSponsorStudents);
router.get('/:id/donations', authMiddleware, getSponsorDonations);
router.get('/:sponsorId/donations-summary', getDonationsSummary);
router.get('/:sponsorId/students-progress', authMiddleware, getSponsoredStudentsProgress);
router.get('/:id', getSponsorById);
router.put('/:id', authMiddleware, updateSponsor);

module.exports = router;
