const Business = require('../models/Business');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Register new business (Public - No approval needed)
// @route   POST /api/business/register
// @access  Public
exports.registerBusiness = async (req, res) => {
  try {
    const {
      // Business details
      businessName,
      businessEmail,
      businessPhone,
      businessType,
      licenseNumber,
      address,
      // Owner details
      ownerName,
      ownerEmail,
      ownerPassword,
      ownerPhone
    } = req.body;

    // Check if business email exists
    const existingBusiness = await Business.findOne({ email: businessEmail });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        error: 'Business already exists with this email'
      });
    }

    // Check if owner email exists
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Create business (immediately active)
    const business = await Business.create({
      name: businessName,
      email: businessEmail,
      phone: businessPhone,
      businessType,
      licenseNumber,
      address,
      status: 'active' // Immediately active
    });

    // Hash owner password
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // Create business owner
    const owner = await User.create({
      name: ownerName,
      email: ownerEmail,
      password: hashedPassword,
      phone: ownerPhone,
      role: 'business_owner',
      business: business._id,
      status: 'active'
    });

    // Generate JWT token for immediate login
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: owner._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Business registered successfully',
      token,
      data: {
        user: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role,
          business: {
            id: business._id,
            name: business.name,
            status: business.status,
            widgetId: business.widgetId
          }
        }
      }
    });
  } catch (err) {
    console.error('Business registration error:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Business with this license number already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get business dashboard data
// @route   GET /api/business/my-business
// @access  Private (Business Owner)
exports.getMyBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.user.business);
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update business settings
// @route   PUT /api/business/my-business
// @access  Private (Business Owner)
exports.updateBusinessSettings = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessType,
      licenseNumber,
      address,
      baseFare,
      perKmRate,
      perMinuteRate,
      operatingHours,
      settings,
      subscription,
      status
    } = req.body;

    // Prepare update data
    const updateData = {};
    
    // Basic business info
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (businessType) updateData.businessType = businessType;
    if (licenseNumber) updateData.licenseNumber = licenseNumber;
    if (address) updateData.address = address;
    
    // Pricing
    if (baseFare !== undefined) updateData.baseFare = baseFare;
    if (perKmRate !== undefined) updateData.perKmRate = perKmRate;
    if (perMinuteRate !== undefined) updateData.perMinuteRate = perMinuteRate;
    
    // Operating hours
    if (operatingHours) updateData.operatingHours = operatingHours;
    
    // Settings
    if (settings) {
      updateData.settings = {
        maxDrivers: settings.maxDrivers || 50,
        maxVehicles: settings.maxVehicles || 50,
        allowPublicBooking: settings.allowPublicBooking ?? true,
        autoAssignDrivers: settings.autoAssignDrivers ?? false,
        bookingWidget: {
          enabled: settings.bookingWidget?.enabled ?? true,
          customization: {
            primaryColor: settings.bookingWidget?.customization?.primaryColor || '#3B82F6',
            companyLogo: settings.bookingWidget?.customization?.companyLogo || '',
            welcomeMessage: settings.bookingWidget?.customization?.welcomeMessage || 'Book your ride with us!',
            buttonText: settings.bookingWidget?.customization?.buttonText || 'Book Now',
            showCompanyInfo: settings.bookingWidget?.customization?.showCompanyInfo ?? true,
            requirePhone: settings.bookingWidget?.customization?.requirePhone ?? true,
            allowNotes: settings.bookingWidget?.customization?.allowNotes ?? true
          }
        }
      };
    }
    
    // Subscription (only allow certain updates)
    if (subscription && subscription.plan) {
      updateData['subscription.plan'] = subscription.plan;
    }
    
    // Status (only super admin can change this)
    if (status && req.user.role === 'super_admin') {
      updateData.status = status;
    }

    const business = await Business.findByIdAndUpdate(
      req.user.business,
      updateData,
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    res.json({
      success: true,
      message: 'Business settings updated successfully',
      data: business
    });
  } catch (err) {
    console.error('Update business settings error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: errors
      });
    }
    
    // Handle duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get all businesses (Admin only)
// @route   GET /api/business
// @access  Private (Super Admin)
exports.getBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: businesses
    });
  } catch (err) {
    console.error('Get businesses error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Update business status (Admin only)
// @route   PUT /api/business/:id/status
// @access  Private (Super Admin)
exports.updateBusinessStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const business = await Business.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    res.json({
      success: true,
      data: business
    });
  } catch (err) {
    console.error('Update business status error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get business by widget ID (public)
// @route   GET /api/business/widget/:widgetId/info
// @access  Public
exports.getBusinessByWidgetId = async (req, res) => {
  try {
    const { widgetId } = req.params;
    
    const business = await Business.findOne({ widgetId });
    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Business not found'
      });
    }

    // Return only public information needed for the widget
    const publicBusinessData = {
      _id: business._id,
      name: business.name,
      logo: business.logo,
      settings: {
        bookingWidget: business.settings?.bookingWidget
      },
      vehicleTypes: business.vehicleTypes || [
        { id: 'sedan', name: 'Sedan', capacity: 4, basePrice: 50 },
        { id: 'suv', name: 'SUV', capacity: 6, basePrice: 80 },
        { id: 'luxury', name: 'Luxury Car', capacity: 4, basePrice: 120 },
        { id: 'van', name: 'Van', capacity: 8, basePrice: 100 }
      ]
    };

    res.json({
      success: true,
      data: publicBusinessData
    });
  } catch (err) {
    console.error('Get business by widget ID error:', err);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
