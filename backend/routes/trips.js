const express = require('express');
const {
  getTrips,
  createTrip,
  updateTripStatus,
  getTripsByDriver,
  assignTrip,
  addFeedback,
  getPendingTrips,
  getAvailableResources
} = require('../controllers/tripController');

const router = express.Router();

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/pending')
  .get(getPendingTrips);

router.route('/:id/assign')
  .put(assignTrip);

router.route('/:id/available-resources')
  .get(getAvailableResources);

router.route('/:id/status')
  .put(updateTripStatus);

router.route('/:id/feedback')
  .put(addFeedback);

router.route('/driver/:driverId')
  .get(getTripsByDriver);

module.exports = router;
