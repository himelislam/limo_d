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

router.get('/:id', getDriver);

router.get('/', authorize('business_owner', 'admin'), getDrivers);
router.post('/', authorize('business_owner', 'admin'), createDriver);
router.put('/:id', authorize('business_owner', 'admin'), updateDriver);
router.patch('/:id/status', authorize('business_owner', 'admin'), updateDriverStatus);
router.delete('/:id', authorize('business_owner', 'admin'), deleteDriver);

module.exports = router;
