const Trip = require('../models/Trip');
const Business = require('../models/Business');
const User = require('../models/User');

// @desc    Create booking from widget (public)
// @route   POST /api/bookings/widget/:widgetId
// @access  Public
exports.createWidgetBooking = async (req, res) => {
  try {
    const { widgetId } = req.params;
    const {
      customerName,
      customerEmail,
      customerPhone,
      origin,
      destination,
      scheduledTime,
      passengerCount,
      vehicleType,
      notes
    } = req.body;

    // Validate required fields
    if (!customerName || !customerEmail || !customerPhone || !origin || !destination || !scheduledTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate and parse scheduledTime
    const parsedScheduledTime = new Date(scheduledTime);
    if (isNaN(parsedScheduledTime.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid scheduled time format'
      });
    }

    // Find business by widget ID
    const business = await Business.findOne({ widgetId });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Check if customer exists, if not create a guest user
    let passenger = await User.findOne({ email: customerEmail });
    
    if (!passenger) {
      // Create guest passenger account
      passenger = await User.create({
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        role: 'passenger',
        status: 'active',
        isGuest: true,
        password: 'guest_password_' + Date.now()
      });
    }

    // Calculate estimated fare
    const baseFare = business.baseFare || 50;
    const estimatedDistance = 10;
    const estimatedFare = baseFare + (estimatedDistance * (business.perKmRate || 12));

    // Create trip from booking
    const trip = await Trip.create({
      business: business._id,
      passenger: passenger._id,
      origin,
      destination,
      scheduledTime: parsedScheduledTime,
      passengerCount: parseInt(passengerCount) || 1,
      notes: notes || `Widget booking - Vehicle type: ${vehicleType || 'Not specified'}`,
      status: 'pending',
      fare: estimatedFare,
      bookingSource: 'widget',
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        vehicleType: vehicleType || 'Not specified'
      }
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name')
      .populate('passenger', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully',
      bookingId: trip._id,
      data: {
        trip: populatedTrip,
        estimatedFare,
        businessName: business.name
      }
    });

  } catch (error) {
    console.error('Widget booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit booking'
    });
  }
};

// @desc    Get all bookings for business
// @route   GET /api/bookings
// @access  Private (Business Owner)
exports.getBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    const trips = await Trip.find({ 
      business: user.business,
      bookingSource: 'widget'
    })
    .populate('passenger', 'name email phone')
    .populate('driver', 'name email phone')
    .populate('vehicle', 'make model licensePlate')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: trips.length,
      data: trips
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('business', 'name')
      .populate('passenger', 'name email phone')
      .populate('driver', 'name email phone')
      .populate('vehicle', 'make model licensePlate');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: trip
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
