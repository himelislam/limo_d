const Trip = require('../models/Trip');
const Business = require('../models/Business');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const emailService = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

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

    // Create trip from booking
    const trip = await Trip.create({
      business: business._id,
      passenger: passenger._id,
      origin,
      destination,
      scheduledTime: parsedScheduledTime,
      passengerCount: parseInt(passengerCount) || 1,
      notes: notes || `Widget booking - Vehicle type: ${vehicleType || 'Not specified'}`,
      status: 'pending', // Keep as pending for business review
      bookingSource: 'widget',
      customerInfo: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        vehicleType: vehicleType || 'Not specified'
      }
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name email')
      .populate('passenger', 'name email phone');

    // Send email notification to business
    try {
      await emailService.sendBookingNotificationToBusiness(business, populatedTrip);
    } catch (emailError) {
      console.error('Failed to send business notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! The business will review your request and send you a quote via email.',
      bookingId: trip._id,
      data: {
        trip: populatedTrip,
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

// New endpoint for business to send quote
exports.sendQuoteToPassenger = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { vehicleId, proposedFare, notes } = req.body;

    const trip = await Trip.findById(tripId)
      .populate('business', 'name email')
      .populate('passenger', 'name email phone');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    if (trip.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Booking is not in pending status'
      });
    }

    // Validate vehicle
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      business: trip.business._id,
      status: 'active'
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Generate confirmation token
    const confirmationToken = uuidv4();

    // Update trip
    trip.vehicle = vehicleId;
    trip.proposedFare = proposedFare;
    trip.fare = proposedFare;
    trip.status = 'quoted';
    trip.confirmationToken = confirmationToken;
    trip.quotedAt = new Date();
    if (notes) trip.notes = notes;

    await trip.save();

    const updatedTrip = await Trip.findById(trip._id)
      .populate('business', 'name email')
      .populate('vehicle')
      .populate('passenger', 'name email phone');

    // Send email to passenger
    try {
      await emailService.sendPriceConfirmationToPassenger(
        updatedTrip, 
        vehicle, 
        proposedFare, 
        confirmationToken
      );
    } catch (emailError) {
      console.error('Failed to send passenger quote:', emailError);
    }

    res.json({
      success: true,
      message: 'Quote sent to passenger successfully',
      data: updatedTrip
    });

  } catch (error) {
    console.error('Send quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send quote'
    });
  }
};

// New endpoint for passenger confirmation
exports.confirmBooking = async (req, res) => {
  try {
    const { token } = req.params;

    const trip = await Trip.findOne({ confirmationToken: token })
      .populate('business', 'name email')
      .populate('vehicle')
      .populate('passenger', 'name email phone');

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Invalid confirmation token'
      });
    }

    if (trip.status !== 'quoted') {
      return res.status(400).json({
        success: false,
        error: 'Booking is not in quoted status'
      });
    }

    // Update trip status
    trip.status = 'confirmed';
    trip.confirmedAt = new Date();
    await trip.save();

    // Send confirmation email to passenger
    try {
      await emailService.sendBookingConfirmationToPassenger(trip);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking confirmed successfully! A driver will be assigned shortly.',
      data: trip
    });

  } catch (error) {
    console.error('Confirm booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm booking'
    });
  }
};

// New endpoint for passenger decline
exports.declineBooking = async (req, res) => {
  try {
    const { token } = req.params;

    const trip = await Trip.findOne({ confirmationToken: token });

    if (!trip) {
      return res.status(404).json({
        success: false,
        error: 'Invalid confirmation token'
      });
    }

    if (trip.status !== 'quoted') {
      return res.status(400).json({
        success: false,
        error: 'Booking is not in quoted status'
      });
    }

    // Update trip status
    trip.status = 'declined';
    trip.declinedAt = new Date();
    await trip.save();

    res.json({
      success: true,
      message: 'Booking declined successfully',
      data: trip
    });

  } catch (error) {
    console.error('Decline booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to decline booking'
    });
  }
};
