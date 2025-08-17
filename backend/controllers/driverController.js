const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
  try {
    let filter = { role: 'driver' };
    
    // Business owners only see their drivers
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }

    const drivers = await User.find(filter)
      .select('-password')
      .populate('business', 'name');
      
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' })
      .select('-password')
      .populate('business', 'name');

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
// @access  Private (Business Owner, Admin)
exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber, experience } = req.body;

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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create driver
    const driver = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'driver',
      business: businessId,
      licenseNumber,
      experience: experience || 0,
      status: 'active'
    });

    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.status(201).json({
      success: true,
      data: driverResponse
    });
  } catch (err) {
    console.error('Driver creation error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private (Business Owner, Admin)
exports.updateDriver = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (driver.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this driver'
        });
      }
    }
    
    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedDriver = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('business', 'name');

    res.status(200).json({
      success: true,
      data: updatedDriver
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update driver status
// @route   PATCH /api/drivers/:id/status
// @access  Private (Business Owner, Admin)
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (driver.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this driver'
        });
      }
    }

    const updatedDriver = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('business', 'name');

    res.status(200).json({
      success: true,
      data: updatedDriver
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private (Business Owner, Admin)
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await User.findOne({ _id: req.params.id, role: 'driver' });
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (driver.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this driver'
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
