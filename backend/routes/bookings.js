const express = require('express');
const router = express.Router();
const {
  createWidgetBooking,
  getBookings,
  getBookingById
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.post('/widget/:widgetId', createWidgetBooking);

// Protected routes
router.get('/', protect, authorize('business_owner', 'admin'), getBookings);
router.get('/:id', protect, getBookingById);

module.exports = router;
