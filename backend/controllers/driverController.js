const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Register new driver (creates User with driver role)
// @route   POST /api/drivers/register
// @access  Public/Admin
exports.registerDriver = async (req, res) => {
  try {
    const { name, email, password, phone, licenseNumber, experience } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with driver role
    const driver = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'driver',
      licenseNumber,
      experience: experience || 0,
      status: 'active'
    });

    // Remove password from response
    const driverResponse = driver.toObject();
    delete driverResponse.password;

    res.status(201).json({
      success: true,
      data: driverResponse
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private
exports.getDrivers = async (req, res) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
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
// @access  Public
exports.getDriver = async (req, res) => {
  try {
    const driver = await User.findOne({ 
      _id: req.params.id, 
      role: 'driver' 
    }).select('-password');

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

// @desc    Update driver
// @route   PUT /api/drivers/:id
// @access  Private
exports.updateDriver = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const driver = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'driver' },
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

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
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
// @access  Private
exports.deleteDriver = async (req, res) => {
  try {
    const driver = await User.findOneAndDelete({ 
      _id: req.params.id, 
      role: 'driver' 
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

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
