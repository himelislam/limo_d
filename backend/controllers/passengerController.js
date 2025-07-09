const Passenger = require('../models/Passenger');

// @desc    Get all passengers
// @route   GET /api/passengers
// @access  Public
exports.getPassengers = async (req, res) => {
  try {
    const passengers = await Passenger.find();
    res.status(200).json({
      success: true,
      count: passengers.length,
      data: passengers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single passenger
// @route   GET /api/passengers/:id
// @access  Public
exports.getPassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findById(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        error: 'Passenger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: passenger
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create passenger
// @route   POST /api/passengers
// @access  Private
exports.createPassenger = async (req, res) => {
  try {
    const passenger = await Passenger.create(req.body);
    res.status(201).json({
      success: true,
      data: passenger
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Update passenger
// @route   PUT /api/passengers/:id
// @access  Private
exports.updatePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!passenger) {
      return res.status(404).json({
        success: false,
        error: 'Passenger not found'
      });
    }

    res.status(200).json({
      success: true,
      data: passenger
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// @desc    Delete passenger
// @route   DELETE /api/passengers/:id
// @access  Private
exports.deletePassenger = async (req, res) => {
  try {
    const passenger = await Passenger.findByIdAndDelete(req.params.id);

    if (!passenger) {
      return res.status(404).json({
        success: false,
        error: 'Passenger not found'
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