const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  deleteTrip,
  assignTrip,
  getMyTrips,
  getDriverTrips,
  getPendingTrips
} = require('../controllers/tripController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/trips
// @desc    Get all trips
// @access  Private
router.get('/', getTrips);

// @route   GET /api/trips/my
// @desc    Get my trips (passenger)
// @access  Private (Passenger)
router.get('/my', authorize('passenger'), getMyTrips);

// @route   GET /api/trips/driver
// @desc    Get driver trips
// @access  Private (Driver)
router.get('/driver', authorize('driver'), getDriverTrips);

// @route   GET /api/trips/pending
// @desc    Get pending trips
// @access  Private (Business Owner, Admin)
router.get('/pending', authorize('business_owner', 'admin'), getPendingTrips);

// @route   POST /api/trips
// @desc    Create new trip
// @access  Private
router.post('/', createTrip);

// @route   GET /api/trips/:id
// @desc    Get single trip
// @access  Private
router.get('/:id', getTripById);

// @route   PUT /api/trips/:id
// @desc    Update trip
// @access  Private (Business Owner, Admin)
router.put('/:id', authorize('business_owner', 'admin'), updateTrip);

// @route   PATCH /api/trips/:id/status
// @desc    Update trip status
// @access  Private
router.patch('/:id/status', updateTripStatus);

// @route   PATCH /api/trips/:id/assign
// @desc    Assign driver and vehicle to trip
// @access  Private (Business Owner, Admin)
router.patch('/:id/assign', authorize('business_owner', 'admin'), assignTrip);

// @route   DELETE /api/trips/:id
// @desc    Delete trip
// @access  Private (Business Owner, Admin)
router.delete('/:id', authorize('business_owner', 'admin'), deleteTrip);

module.exports = router;
