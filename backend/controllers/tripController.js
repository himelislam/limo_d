const Trip = require('../models/Trip');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const emailService = require('../services/emailService');

// Helper functions for availability checks
const checkDriverAvailability = async (driverId, scheduledTime) => {
  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours buffer

  return await Trip.findOne({
    driver: driverId,
    status: { $in: ['scheduled', 'on-the-way', 'started'] },
    scheduledTime: {
      $gte: new Date(startTime.getTime() - 4 * 60 * 60 * 1000),
      $lt: endTime
    }
  });
};

const checkVehicleAvailability = async (vehicleId, scheduledTime) => {
  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours buffer

  return await Trip.findOne({
    vehicle: vehicleId,
    status: { $in: ['scheduled', 'on-the-way', 'started'] },
    scheduledTime: {
      $gte: new Date(startTime.getTime() - 4 * 60 * 60 * 1000),
      $lt: endTime
    }
  });
};

// @desc    Get all trips
// @route   GET /api/trips
// @access  Private
exports.getTrips = async (req, res) => {
  try {
    let filter = {};
    
    // Business owners only see their trips
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }
    
    // Passengers only see their trips
    if (req.user.role === 'passenger') {
      filter.passenger = req.user.id;
    }
    
    // Drivers only see their trips
    if (req.user.role === 'driver') {
      filter.driver = req.user.id;
    }

    const trips = await Trip.find(filter)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone')
      .populate('passenger', 'name email phone')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    console.error('Error getting trips:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Create new trip
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    const {
      origin,
      destination,
      scheduledTime,
      passengerCount,
      notes
    } = req.body;

    // Get business from user
    let businessId;
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      businessId = user.business;
    } else if (req.user.role === 'passenger') {
      // For passengers, we need to determine the business somehow
      // This might need to be passed in the request or determined by location
      return res.status(400).json({
        success: false,
        error: 'Business must be specified for passenger trips'
      });
    }

    const trip = await Trip.create({
      business: businessId,
      passenger: req.user.role === 'passenger' ? req.user.id : req.body.passenger,
      origin,
      destination,
      scheduledTime,
      passengerCount: passengerCount || 1,
      notes,
      status: 'pending'
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name')
      .populate('passenger', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedTrip
    });
  } catch (err) {
    console.error('Error creating trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update trip
// @route   PUT /api/trips/:id
// @access  Private (Business Owner, Admin)
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (trip.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this trip'
        });
      }
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('business', 'name')
    .populate('vehicle')
    .populate('driver', 'name email phone')
    .populate('passenger', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Delete trip
// @route   DELETE /api/trips/:id
// @access  Private (Business Owner, Admin)
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (trip.business.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this trip'
        });
      }
    }

    await Trip.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get my trips (passenger)
// @route   GET /api/trips/my
// @access  Private (Passenger)
exports.getMyTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ passenger: req.user.id })
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    console.error('Error getting my trips:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get driver trips
// @route   GET /api/trips/driver
// @access  Private (Driver)
exports.getDriverTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id })
      .populate('business', 'name')
      .populate('vehicle')
      .populate('passenger', 'name email phone')
      .sort({ scheduledTime: -1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    console.error('Error getting driver trips:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get pending trips
// @route   GET /api/trips/pending
// @access  Private (Business Owner, Admin)
exports.getPendingTrips = async (req, res) => {
  try {
    let filter = { status: { $in: ['pending', 'confirmed'] } };
    
    // Business owners only see their pending trips
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }

    const trips = await Trip.find(filter)
      .populate('business', 'name')
      .populate('passenger', 'name email phone')
      .populate('vehicle')
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    console.error('Error getting pending trips:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Assign driver and vehicle to trip
// @route   PUT /api/trips/:id/assign
// @access  Private (Owner/Admin)
exports.assignTrip = async (req, res) => {
  try {
    const { driver, vehicle, fare, estimatedDuration, notes } = req.body;
    
    const trip = await Trip.findById(req.params.id).populate('business');
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if trip is in confirmed status (for widget bookings) or pending (for regular bookings)
    if (!['pending', 'confirmed'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: 'Trip is not available for assignment'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (trip.business._id.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to assign this trip'
        });
      }
    }

    // Validate driver belongs to same business
    const driverDoc = await User.findOne({ 
      _id: driver, 
      role: 'driver',
      business: trip.business._id,
      status: { $in: ['available', 'active'] }
    });
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        error: 'Driver not available for this business'
      });
    }

    // Validate vehicle belongs to same business
    const vehicleDoc = await Vehicle.findOne({
      _id: vehicle,
      business: trip.business._id,
      status: 'active'
    });
    if (!vehicleDoc) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not available for this business'
      });
    }

    // Check vehicle capacity
    if (vehicleDoc.seatingCapacity < trip.passengerCount) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle capacity insufficient for passenger count'
      });
    }

    // Check for conflicts
    const driverConflict = await checkDriverAvailability(driver, trip.scheduledTime);
    const vehicleConflict = await checkVehicleAvailability(vehicle, trip.scheduledTime);

    if (driverConflict) {
      return res.status(400).json({
        success: false,
        error: 'Driver is already assigned to another trip at this time'
      });
    }

    if (vehicleConflict) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle is already booked for this time'
      });
    }

    // Update trip
    trip.driver = driver;
    trip.vehicle = vehicle;
    trip.fare = fare || trip.fare;
    trip.status = 'driver-assigned'; // New status
    
    if (estimatedDuration) {
      trip.estimatedDuration = estimatedDuration;
    }
    
    if (notes) {
      trip.assignmentNotes = notes;
    }
    
    await trip.save();

    // Update driver status
    await User.findByIdAndUpdate(driver, { status: 'on-trip' });

    // Return fully populated trip
    const updatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

    // Send email notification to driver
    try {
      await emailService.sendDriverAssignmentNotification(updatedTrip.driver, updatedTrip);
    } catch (emailError) {
      console.error('Failed to send driver notification:', emailError);
    }

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (err) {
    console.error('Error assigning trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get available drivers and vehicles for trip assignment
// @route   GET /api/trips/:id/available-resources
// @access  Private (Business Owner)
exports.getAvailableResources = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('business', 'name');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    const scheduledTime = new Date(trip.scheduledTime);
    const endTime = new Date(scheduledTime.getTime() + 4 * 60 * 60 * 1000);

    // Get busy drivers for this business
    const busyDrivers = await Trip.find({
      business: trip.business._id,
      status: { $in: ['scheduled', 'in-progress', 'on-the-way', 'started'] },
      scheduledTime: {
        $gte: new Date(scheduledTime.getTime() - 4 * 60 * 60 * 1000),
        $lt: endTime
      }
    }).distinct('driver');

    // Get available drivers for this business
    const availableDrivers = await User.find({
      _id: { $nin: busyDrivers },
      business: trip.business._id,
      role: 'driver',
      status: 'active' // Changed from 'available' to 'active'
    }).select('-password');

    // Get busy vehicles for this business
    const busyVehicles = await Trip.find({
      business: trip.business._id,
      status: { $in: ['scheduled', 'in-progress', 'on-the-way', 'started'] },
      scheduledTime: {
        $gte: new Date(scheduledTime.getTime() - 4 * 60 * 60 * 1000),
        $lt: endTime
      }
    }).distinct('vehicle');

    // Get available vehicles for this business
    const availableVehicles = await Vehicle.find({
      _id: { $nin: busyVehicles },
      business: trip.business._id,
      status: 'active',
      seatingCapacity: { $gte: trip.passengerCount || 1 }
    });

    res.status(200).json({
      success: true,
      data: {
        drivers: availableDrivers,
        vehicles: availableVehicles,
        trip: trip
      }
    });
  } catch (err) {
    console.error('Error getting available resources:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get trips for current driver
// @route   GET /api/trips/my-trips
// @access  Private (Driver)
exports.getMyTrips = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { status } = req.query;
    
    let filter = { driver: driverId };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('passenger', 'name email phone')
      .sort({ scheduledTime: 1 });

    res.status(200).json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (err) {
    console.error('Error getting driver trips:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update trip status
// @route   PUT /api/trips/:id/status
// @access  Private (Driver)
exports.updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const tripId = req.params.id;

    const trip = await Trip.findById(tripId)
      .populate('driver', 'name email phone')
      .populate('passenger', 'name email phone')
      .populate('vehicle', 'make model licensePlate')
      .populate('business', 'name');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Verify driver owns this trip
    if (trip.driver._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this trip'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'driver-assigned': ['on-the-way'],
      'scheduled': ['on-the-way'],
      'on-the-way': ['started'],
      'started': ['completed'],
      'in-progress': ['completed']
    };

    if (validTransitions[trip.status] && !validTransitions[trip.status].includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Cannot change status from ${trip.status} to ${status}`
      });
    }

    // Update trip status
    trip.status = status;
    
    // Set timestamps based on status
    if (status === 'started') {
      trip.startTime = new Date();
    } else if (status === 'completed') {
      trip.endTime = new Date();
      // Update driver status back to available
      await User.findByIdAndUpdate(req.user.id, { status: 'active' });
    }

    await trip.save();

    // Send email notification to passenger for important status updates
    if (['on-the-way', 'started', 'completed'].includes(status)) {
      try {
        await emailService.sendTripStatusUpdateToPassenger(trip, status);
      } catch (emailError) {
        console.error('Failed to send passenger notification:', emailError);
      }
    }

    res.status(200).json({
      success: true,
      data: trip
    });
  } catch (err) {
    console.error('Error updating trip status:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check authorization based on role and business
    if (req.user.role === 'passenger' && trip.passenger._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this trip'
      });
    }

    if (req.user.role === 'driver' && trip.driver?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this trip'
      });
    }

    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (trip.business._id.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this trip'
        });
      }
    }

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

// @desc    Update trip details
// @route   PUT /api/trips/:id
// @access  Private (Owner/Admin)
exports.updateTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledTime, passengerCount, notes, fare, estimatedDuration } = req.body;
    
    const trip = await Trip.findById(req.params.id).populate('business');
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check business ownership
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      if (trip.business._id.toString() !== user.business.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this trip'
        });
      }
    }

    // Only allow updates for pending or scheduled trips
    if (!['pending', 'scheduled'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update trip that is in progress or completed'
      });
    }

    // If vehicle is being updated, validate it belongs to the business
    if (vehicle && vehicle !== trip.vehicle?.toString()) {
      const vehicleDoc = await Vehicle.findOne({
        _id: vehicle,
        business: trip.business._id,
        status: 'active'
      });
      
      if (!vehicleDoc) {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not available for this business'
        });
      }

      // Check vehicle capacity
      const finalPassengerCount = passengerCount || trip.passengerCount;
      if (vehicleDoc.seatingCapacity < finalPassengerCount) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle capacity insufficient for passenger count'
        });
      }

      // Check for conflicts if scheduled time is changing
      const checkTime = scheduledTime ? new Date(scheduledTime) : trip.scheduledTime;
      const conflictingTrip = await checkVehicleAvailability(vehicle, checkTime);
      if (conflictingTrip && conflictingTrip._id.toString() !== trip._id.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle is already booked for this time'
        });
      }
    }

    // Update trip fields
    const updateData = {};
    if (vehicle !== undefined) updateData.vehicle = vehicle;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (scheduledTime !== undefined) updateData.scheduledTime = new Date(scheduledTime);
    if (passengerCount !== undefined) updateData.passengerCount = passengerCount;
    if (notes !== undefined) updateData.notes = notes;
    if (fare !== undefined) updateData.fare = fare;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Add feedback to trip
// @route   POST /api/trips/:id/feedback
// @access  Private (Passenger)
exports.addFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if user is the passenger
    if (trip.passenger.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to add feedback to this trip'
      });
    }

    // Check if trip is completed
    if (trip.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only add feedback to completed trips'
      });
    }

    trip.rating = rating;
    trip.feedback = feedback;
    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone')
      .populate('passenger', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedTrip
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
// @access  Private
exports.getTripsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;
    
    let filter = { driver: driverId };
    if (status) filter.status = status;

    // Business owners can only see trips for their drivers
    if (req.user.role === 'business_owner') {
      const user = await User.findById(req.user.id);
      filter.business = user.business;
    }

    const trips = await Trip.find(filter)
      .populate('business', 'name')
      .populate('vehicle')
      .populate('driver', 'name email phone')
      .populate('passenger', 'name email phone')
      .sort({ scheduledTime: -1 });

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


// Add new endpoint to get trips for specific driver
exports.getMyTrips = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { status } = req.query;
    
    let filter = { driver: driverId };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('vehicle')
      .populate('passenger', 'name email phone')
      .sort({ scheduledTime: 1 });

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

// @desc    Get single trip
// @route   GET /api/trips/:id
// @access  Private
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check authorization - users can only see their own trips unless admin/owner
    if (req.user.role === 'passenger' && trip.passenger._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this trip'
      });
    }

    if (req.user.role === 'driver' && trip.driver?._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this trip'
      });
    }

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

// @desc    Update trip details
// @route   PUT /api/trips/:id
// @access  Private (Owner/Admin)
exports.updateTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledTime, passengerCount, notes, fare, estimatedDuration } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Only allow updates for pending or scheduled trips
    if (!['pending', 'scheduled'].includes(trip.status)) {
      return res.status(400).json({
        success: false,
        error: 'Cannot update trip that is in progress or completed'
      });
    }

    // If vehicle is being updated, validate it
    if (vehicle && vehicle !== trip.vehicle?.toString()) {
      const vehicleDoc = await Vehicle.findById(vehicle);
      if (!vehicleDoc || vehicleDoc.status !== 'active') {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not available'
        });
      }

      // Check vehicle capacity if passengerCount is provided
      const finalPassengerCount = passengerCount || trip.passengerCount;
      if (vehicleDoc.seatingCapacity < finalPassengerCount) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle capacity insufficient for passenger count'
        });
      }

      // Check for vehicle conflicts if scheduledTime is being updated
      const finalScheduledTime = scheduledTime || trip.scheduledTime;
      const conflictingTrip = await checkVehicleAvailability(vehicle, finalScheduledTime);
      if (conflictingTrip && conflictingTrip._id.toString() !== trip._id.toString()) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle is already booked for this time'
        });
      }
    }

    // Update trip fields
    const updateData = {};
    if (vehicle !== undefined) updateData.vehicle = vehicle;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (scheduledTime !== undefined) updateData.scheduledTime = new Date(scheduledTime);
    if (passengerCount !== undefined) updateData.passengerCount = passengerCount;
    if (notes !== undefined) updateData.notes = notes;
    if (fare !== undefined) updateData.fare = fare;
    if (estimatedDuration !== undefined) updateData.estimatedDuration = estimatedDuration;

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

    res.status(200).json({
      success: true,
      data: updatedTrip
    });
  } catch (err) {
    console.error('Error updating trip:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Helper functions
// async function checkDriverAvailability(driverId, scheduledTime) {
//   const startTime = new Date(scheduledTime);
//   const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours buffer

//   return await Trip.findOne({
//     driver: driverId,
//     status: { $in: ['scheduled', 'on-the-way', 'started'] },
//     $or: [
//       {
//         scheduledTime: {
//           $gte: startTime,
//           $lt: endTime
//         }
//       },
//       {
//         $and: [
//           { scheduledTime: { $lt: startTime } },
//           { endTime: { $exists: false } }
//         ]
//       }
//     ]
//   });
// }

// async function checkVehicleAvailability(vehicleId, scheduledTime) {
//   const startTime = new Date(scheduledTime);
//   const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours buffer

//   return await Trip.findOne({
//     vehicle: vehicleId,
//     status: { $in: ['scheduled', 'on-the-way', 'started'] },
//     $or: [
//       {
//         scheduledTime: {
//           $gte: startTime,
//           $lt: endTime
//         }
//       },
//       {
//         $and: [
//           { scheduledTime: { $lt: startTime } },
//           { endTime: { $exists: false } }
//         ]
//       }
//     ]
//   });
// }



module.exports = {
  getTrips: exports.getTrips,
  createTrip: exports.createTrip,
  getTripById: exports.getTripById,
  updateTrip: exports.updateTrip,
  assignTrip: exports.assignTrip,
  updateTripStatus: exports.updateTripStatus,
  deleteTrip: exports.deleteTrip,
  getMyTrips: exports.getMyTrips,
  getDriverTrips: exports.getDriverTrips,
  getPendingTrips: exports.getPendingTrips
};
