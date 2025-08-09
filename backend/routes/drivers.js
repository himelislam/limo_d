const express = require('express');
const router = express.Router();
const {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  updateDriverStatus,
  deleteDriver
} = require('../controllers/driverController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/drivers
// @desc    Get all drivers for business
// @access  Private (Business Owner, Admin)
router.get('/', authorize('business_owner', 'admin'), getDrivers);

// @route   POST /api/drivers
// @desc    Create new driver
// @access  Private (Business Owner, Admin)
router.post('/', authorize('business_owner', 'admin'), createDriver);

// @route   GET /api/drivers/:id
// @desc    Get single driver
// @access  Private (Business Owner, Admin, Driver)
router.get('/:id', getDriver);

// @route   PUT /api/drivers/:id
// @desc    Update driver
// @access  Private (Business Owner, Admin)
router.put('/:id', authorize('business_owner', 'admin'), updateDriver);

// @route   PATCH /api/drivers/:id/status
// @desc    Update driver status
// @access  Private (Business Owner, Admin)
router.patch('/:id/status', authorize('business_owner', 'admin'), updateDriverStatus);

// @route   DELETE /api/drivers/:id
// @desc    Delete driver
// @access  Private (Business Owner, Admin)
router.delete('/:id', authorize('business_owner', 'admin'), deleteDriver);

module.exports = router;
