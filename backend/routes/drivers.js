const express = require('express');
const {
  getDrivers,
  getDriver,
  registerDriver,
  updateDriver,
  deleteDriver
} = require('../controllers/driverController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin', 'owner'), getDrivers)
  .post(protect, authorize('admin', 'owner'), registerDriver);

router.route('/register')
  .post(registerDriver); // Public registration

router.route('/:id')
  .get(getDriver)
  .put(protect, authorize('admin', 'owner'), updateDriver)
  .delete(protect, authorize('admin', 'owner'), deleteDriver);

module.exports = router;
