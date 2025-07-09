const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Passenger = require('../models/Passenger');

// @desc    Get all trips
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicle')
      .populate('driver')
      .populate('passengers');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    // Check if vehicle exists
    const vehicle = await Vehicle.findById(req.body.vehicle);

    console.log(req.body.vehicle, "vehicle")
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check if driver exists
    const driver = await Driver.findById(req.body.driver);
    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    // Check if passengers exist
    if (req.body.passengers && req.body.passengers.length > 0) {
      const passengers = await Passenger.find({ _id: { $in: req.body.passengers } });
      if (passengers.length !== req.body.passengers.length) {
        return res.status(404).json({
          success: false,
          error: 'One or more passengers not found'
        });
      }
    }

    const trip = await Trip.create(req.body);

    // Update driver status if trip is in-progress
    if (trip.status === 'in-progress') {
      await Driver.findByIdAndUpdate(trip.driver, { status: 'on-trip' });
    }

    res.status(201).json({
      success: true,
      data: trip
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

// @desc    Update trip status
// @route   PUT /api/trips/:id/status
// @access  Private
exports.updateTripStatus = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Update trip status
    trip.status = req.body.status;
    
    // Update end time if trip is completed
    if (req.body.status === 'completed') {
      trip.endTime = Date.now();
    }

    // Update driver status
    if (req.body.status === 'completed' || req.body.status === 'cancelled') {
      await Driver.findByIdAndUpdate(trip.driver, { status: 'available' });
    } else if (req.body.status === 'in-progress') {
      await Driver.findByIdAndUpdate(trip.driver, { status: 'on-trip' });
    }

    await trip.save();

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get trips by driver
// @route   GET /api/trips/driver/:driverId
// @access  Public
exports.getTripsByDriver = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.params.driverId })
      .populate('vehicle')
      .populate('passengers');

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};