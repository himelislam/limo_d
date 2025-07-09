const express = require('express');
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'owner'), getDrivers)
  .post(createDriver);

router.route('/:id')
  .get(getDriver)
  .put(updateDriver)
  .delete(deleteDriver);

module.exports = router;