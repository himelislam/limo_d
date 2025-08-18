const express = require('express');
const router = express.Router();
const {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  updateTripStatus,
  deleteTrip,
  assignTrip,
  getMyTrips,
  getDriverTrips,
  getPendingTrips
} = require('../controllers/tripController');
const { protect, authorize } = require('../middlewares/auth');

// All routes require authentication
router.use(protect);

router.get('/', getTrips);
router.post('/', createTrip);
router.get('/:id', getTripById);
router.patch('/:id/status', updateTripStatus);

router.get('/my', authorize('passenger'), getMyTrips);
router.get('/driver', authorize('driver'), getDriverTrips);
router.get('/pending', authorize('business_owner', 'admin'), getPendingTrips);
router.put('/:id', authorize('business_owner', 'admin'), updateTrip);
router.patch('/:id/assign', authorize('business_owner', 'admin'), assignTrip);
router.delete('/:id', authorize('business_owner', 'admin'), deleteTrip);
router.get('/my-trips', authorize('driver'), getMyTrips);
router.put('/:id/status', authorize('driver'), updateTripStatus);

module.exports = router;
