const express = require('express');
const {
  registerBusiness,
  getBusinesses,
  updateBusinessStatus,
  getMyBusiness,
  updateBusinessSettings,
  getBusinessByWidgetId
} = require('../controllers/businessController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router.post('/register', registerBusiness);
router.get('/widget/:widgetId/info', getBusinessByWidgetId);

// Super admin routes
router.get('/', protect, authorize('super_admin'), getBusinesses);
router.put('/:id/status', protect, authorize('super_admin'), updateBusinessStatus);

// Business owner routes
router.get('/my-business', protect, authorize('business_owner'), getMyBusiness);
router.put('/my-business', protect, authorize('business_owner'), updateBusinessSettings);

module.exports = router;
