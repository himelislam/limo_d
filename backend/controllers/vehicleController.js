const Vehicle = require('../models/Vehicle');
const User = require('../models/User');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private
exports.getVehicles = async (req, res) => {
  try {
    let filter = {};
    
    // Business owners only see their vehicles
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }
    // Drivers see their business vehicles
    else if (req.user.role === 'driver') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }
    // Passengers see all active vehicles for booking
    else if (req.user.role === 'passenger') {
      filter.status = 'active';
    }
    // Super admin sees all vehicles

    const vehicles = await Vehicle.find(filter)
      .populate('business', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      data: vehicles
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Business Owner/Admin)
exports.createVehicle = async (req, res) => {
  try {
    const { make, model, year, licensePlate, type, seatingCapacity, fuelType } = req.body;
    
    // Get business from user
    let businessId;
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      businessId = user.business;
    } else if (req.user.role === 'super_admin' && req.body.business) {
      businessId = req.body.business;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Business not specified'
      });
    }

    // Check if license plate exists for this business
    const existingVehicle = await Vehicle.findOne({ 
      business: businessId,
      licensePlate: licensePlate.toUpperCase() 
    });
    
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle with this license plate already exists in your business'
      });
    }

    const vehicle = await Vehicle.create({
      business: businessId,
      make,
      model,
      year,
      licensePlate: licensePlate.toUpperCase(),
      type,
      seatingCapacity,
      fuelType
    });

    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('business', 'name');

    res.status(201).json({
      success: true,
      data: populatedVehicle
    });
  } catch (err) {
    console.error('Error creating vehicle:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Private
exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('business', 'name');

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (vehicle.business._id.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this vehicle'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: vehicle
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Business Owner/Admin)
exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (vehicle.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this vehicle'
        });
      }
    }

    // Check license plate uniqueness within business if being updated
    if (req.body.licensePlate && req.body.licensePlate !== vehicle.licensePlate) {
      const existingVehicle = await Vehicle.findOne({
        business: vehicle.business,
        licensePlate: req.body.licensePlate.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      
      if (existingVehicle) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle with this license plate already exists in your business'
        });
      }
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, licensePlate: req.body.licensePlate?.toUpperCase() },
      { new: true, runValidators: true }
    ).populate('business', 'name');

    res.status(200).json({
      success: true,
      data: updatedVehicle
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Business Owner/Admin)
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (vehicle.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this vehicle'
        });
      }
    }

    await Vehicle.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
