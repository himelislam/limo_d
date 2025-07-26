const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const User = require('../models/User');

const checkDriverAvailability = async (driverId, scheduledTime) => {
  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
  
  const conflictingTrip = await Trip.findOne({
    driver: driverId,
    status: { $in: ['scheduled', 'on-the-way', 'started'] },
    scheduledTime: {
      $gte: new Date(startTime.getTime() - 4 * 60 * 60 * 1000),
      $lt: endTime
    }
  });
  
  return conflictingTrip;
};

const checkVehicleAvailability = async (vehicleId, scheduledTime) => {
  const startTime = new Date(scheduledTime);
  const endTime = new Date(startTime.getTime() + 4 * 60 * 60 * 1000); // 4 hours buffer
  
  const conflictingTrip = await Trip.findOne({
    vehicle: vehicleId,
    status: { $in: ['scheduled', 'on-the-way', 'started'] },
    scheduledTime: {
      $gte: new Date(startTime.getTime() - 4 * 60 * 60 * 1000),
      $lt: endTime
    }
  });
  
  return conflictingTrip;
};

// @desc    Get all trips with filters
// @route   GET /api/trips
// @access  Public
exports.getTrips = async (req, res) => {
  try {
    const { status, passenger, driver } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (passenger) filter.passenger = passenger;
    if (driver) filter.driver = driver;

    const trips = await Trip.find(filter)
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone')
      .sort({ createdAt: -1 });

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

// @desc    Create trip booking request
// @route   POST /api/trips
// @access  Private
exports.createTrip = async (req, res) => {
  try {
    const { vehicle, origin, destination, scheduledTime, passengerCount, notes, passenger } = req.body;
    
    // Validate passenger exists
    const passengerData = await User.findById(passenger);
    if (!passengerData) {
      return res.status(404).json({
        success: false,
        error: 'Passenger not found'
      });
    }

    // If vehicle is specified, check availability
    if (vehicle) {
      const vehicleDoc = await Vehicle.findById(vehicle);
      if (!vehicleDoc || vehicleDoc.status !== 'active') {
        return res.status(404).json({
          success: false,
          error: 'Vehicle not available'
        });
      }

      // Check for conflicting trips
      const conflictingTrip = await checkVehicleAvailability(vehicle, scheduledTime);
      if (conflictingTrip) {
        return res.status(400).json({
          success: false,
          error: 'Vehicle is already booked for this time'
        });
      }
    }

    const tripData = {
      passenger: passenger,
      origin,
      destination,
      scheduledTime,
      passengerCount,
      notes,
      status: 'pending'
    };

    if (vehicle) {
      tripData.vehicle = vehicle;
    }

    const trip = await Trip.create(tripData);
    
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle')
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

// @desc    Assign driver and vehicle to trip
// @route   PUT /api/trips/:id/assign
// @access  Private (Owner/Admin)
exports.assignTrip = async (req, res) => {
  try {
    const { driver, vehicle, fare, estimatedDuration, notes } = req.body;
    
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    if (trip.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Trip is not in pending status'
      });
    }

    // Validate driver (User with driver role)
    const driverDoc = await User.findOne({ 
      _id: driver, 
      role: 'driver',
      status: { $in: ['available', 'active'] }
    });
    if (!driverDoc) {
      return res.status(404).json({
        success: false,
        error: 'Driver not available'
      });
    }

    // Validate vehicle
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc || vehicleDoc.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not available'
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
    trip.fare = fare;
    trip.status = 'scheduled';
    
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
      .populate('vehicle')
      .populate('driver', 'name email phone licenseNumber experience status')
      .populate('passenger', 'name email phone');

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

// @desc    Update trip status
// @route   PUT /api/trips/:id/status
// @access  Private
exports.updateTripStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const trip = await Trip.findById(req.params.id);
    
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    // Check if user is authorized to update this trip
    if (req.user.role === 'driver' && trip.driver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this trip'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'scheduled': ['on-the-way', 'cancelled'],
      'on-the-way': ['started', 'cancelled'],
      'started': ['completed', 'cancelled']
    };

    if (!validTransitions[trip.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status transition'
      });
    }

    // Update trip
    trip.status = status;
    
    if (status === 'started') {
      trip.startTime = new Date();
    } else if (status === 'completed') {
      trip.endTime = new Date();
    }

    await trip.save();

    // Update driver status
    if (status === 'completed' || status === 'cancelled') {
      await User.findByIdAndUpdate(trip.driver, { status: 'available' });
    }

    const updatedTrip = await Trip.findById(trip._id)
      .populate('vehicle')
      .populate('driver', '-password')
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

// @desc    Add rating and feedback
// @route   PUT /api/trips/:id/feedback
// @access  Private
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

    if (trip.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Can only rate completed trips'
      });
    }

    trip.rating = rating;
    trip.feedback = feedback;
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
// @access  Private
exports.getTripsByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.query;
    
    let filter = { driver: driverId };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('vehicle')
      .populate('passenger', 'name email phone')
      .sort({ createdAt: -1 });

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

// @desc    Get available resources for trip assignment
// @route   GET /api/trips/:id/available-resources
// @access  Private (Owner/Admin)
exports.getAvailableResources = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }

    const scheduledTime = new Date(trip.scheduledTime);
    const endTime = new Date(scheduledTime.getTime() + 4 * 60 * 60 * 1000);

    // Get available drivers (Users with driver role)
    const busyDrivers = await Trip.find({
      status: { $in: ['scheduled', 'on-the-way', 'started'] },
      scheduledTime: {
        $gte: new Date(scheduledTime.getTime() - 4 * 60 * 60 * 1000),
        $lt: endTime
      }
    }).distinct('driver');

    const availableDrivers = await User.find({
      _id: { $nin: busyDrivers },
      role: 'driver',
      status: { $in: ['available', 'active'] }
    }).select('-password');

    // Get available vehicles
    const busyVehicles = await Trip.find({
      status: { $in: ['scheduled', 'on-the-way', 'started'] },
      scheduledTime: {
        $gte: new Date(scheduledTime.getTime() - 4 * 60 * 60 * 1000),
        $lt: endTime
      }
    }).distinct('vehicle');

    const availableVehicles = await Vehicle.find({
      _id: { $nin: busyVehicles },
      status: 'active',
      seatingCapacity: { $gte: trip.passengerCount }
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

// @desc    Get pending trips for owner
// @route   GET /api/trips/pending
// @access  Private (Owner/Admin)
exports.getPendingTrips = async (req, res) => {
  try {
    const pendingTrips = await Trip.find({ status: 'pending' })
      .populate('passenger', 'name email phone')
      .populate('vehicle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingTrips.length,
      data: pendingTrips
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
  assignTrip: exports.assignTrip,
  updateTripStatus: exports.updateTripStatus,
  addFeedback: exports.addFeedback,
  getTripsByDriver: exports.getTripsByDriver,
  getAvailableResources: exports.getAvailableResources,
  getPendingTrips: exports.getPendingTrips,
  getMyTrips: exports.getMyTrips
};
