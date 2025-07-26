const express = require('express');
const {
  getTrips,
  createTrip,
  updateTripStatus,
  getTripsByDriver,
  assignTrip,
  addFeedback,
  getPendingTrips,
  getAvailableResources,
  getMyTrips
} = require('../controllers/tripController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(getTrips)
  .post(protect, createTrip);

router.route('/pending')
  .get(protect, authorize('owner', 'admin'), getPendingTrips);

router.route('/my-trips')
  .get(protect, authorize('driver'), getMyTrips);

router.route('/:id/assign')
  .put(protect, authorize('owner', 'admin'), assignTrip);

router.route('/:id/available-resources')
  .get(protect, authorize('owner', 'admin'), getAvailableResources);

router.route('/:id/status')
  .put(protect, updateTripStatus);

router.route('/:id/feedback')
  .put(protect, addFeedback);

router.route('/driver/:driverId')
  .get(protect, getTripsByDriver);

module.exports = router;
