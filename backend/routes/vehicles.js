const express = require('express');
const router = express.Router();
const {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  updateVehicleStatus
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

router.get('/', getVehicles);
router.get('/:id', getVehicle);

router.post('/', authorize('business_owner', 'admin'), createVehicle);
router.put('/:id', authorize('business_owner', 'admin'), updateVehicle);
router.patch('/:id/status', authorize('business_owner', 'admin'), updateVehicleStatus);
router.delete('/:id', authorize('business_owner', 'admin'), deleteVehicle);

module.exports = router;
