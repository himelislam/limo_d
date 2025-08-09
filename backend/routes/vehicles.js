const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

// @route   GET /api/vehicles
// @desc    Get all vehicles for business
// @access  Private (Business Owner, Admin, Driver)
router.get('/', getVehicles);

// @route   POST /api/vehicles
// @desc    Create new vehicle
// @access  Private (Business Owner, Admin)
router.post('/', authorize('business_owner', 'admin'), createVehicle);

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle
// @access  Private (Business Owner, Admin, Driver)
router.get('/:id', getVehicle);

// @route   PUT /api/vehicles/:id
// @desc    Update vehicle
// @access  Private (Business Owner, Admin)
router.put('/:id', authorize('business_owner', 'admin'), updateVehicle);

// @route   PATCH /api/vehicles/:id/status
// @desc    Update vehicle status
// @access  Private (Business Owner, Admin)
// router.patch('/:id/status', authorize('business_owner', 'admin'), updateVehicleStatus);

// @route   DELETE /api/vehicles/:id
// @desc    Delete vehicle
// @access  Private (Business Owner, Admin)
router.delete('/:id', authorize('business_owner', 'admin'), deleteVehicle);

module.exports = router;
