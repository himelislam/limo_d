const express = require('express');
const router = express.Router();
const {
  createWidgetBooking,
  getBookings,
  getBookingById,
  sendQuoteToPassenger,
  confirmBooking,
  declineBooking
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.post('/widget/:widgetId', createWidgetBooking);
router.post('/confirm/:token', confirmBooking);
router.post('/decline/:token', declineBooking);

// Protected routes
router.get('/', protect, authorize('business_owner', 'admin'), getBookings);
router.get('/:id', protect, getBookingById);
router.post('/:tripId/quote', protect, authorize('business_owner', 'admin'), sendQuoteToPassenger);

module.exports = router;
