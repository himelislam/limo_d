const express = require('express');
const {
  getTrips,
  createTrip,
  updateTripStatus,
  getTripsByDriver
} = require('../controllers/tripController');

const router = express.Router();

router.route('/')
  .get(getTrips)
  .post(createTrip);

router.route('/:id/status')
  .put(updateTripStatus);

router.route('/driver/:driverId')
  .get(getTripsByDriver);

module.exports = router;