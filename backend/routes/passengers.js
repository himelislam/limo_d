const express = require('express');
const {
  getPassengers,
  getPassenger,
  createPassenger,
  updatePassenger,
  deletePassenger
} = require('../controllers/passengerController');

const router = express.Router();

router.route('/')
  .get(getPassengers)
  .post(createPassenger);

router.route('/:id')
  .get(getPassenger)
  .put(updatePassenger)
  .delete(deletePassenger);

module.exports = router;