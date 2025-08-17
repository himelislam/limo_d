const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' }
  },
  businessType: {
    type: String,
    enum: ['taxi', 'logistics', 'tour', 'corporate'],
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  },
  
  // Pricing
  baseFare: {
    type: Number,
    default: 50,
    min: 0
  },
  perKmRate: {
    type: Number,
    default: 12,
    min: 0
  },
  perMinuteRate: {
    type: Number,
    default: 2,
    min: 0
  },
  
  // Operating Hours
  operatingHours: {
    start: String, 
    end: String, 
  },
  
  subscription: {
    plan: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true }
  },
  
  settings: {
    maxDrivers: { type: Number, default: 50 },
    maxVehicles: { type: Number, default: 50 },
    allowPublicBooking: { type: Boolean, default: true },
    autoAssignDrivers: { type: Boolean, default: false },
    bookingWidget: {
      enabled: { type: Boolean, default: true },
      customization: {
        primaryColor: { type: String, default: '#3B82F6' },
        companyLogo: String,
        welcomeMessage: { 
          type: String, 
          default: 'Book your ride with us! Safe, reliable, and affordable transportation.' 
        },
        buttonText: { type: String, default: 'Book Now' },
        showCompanyInfo: { type: Boolean, default: true },
        requirePhone: { type: Boolean, default: true },
        allowNotes: { type: Boolean, default: true }
      }
    }
  },
  
  // Widget and portal settings
  widgetId: {
    type: String,
    unique: true,
    default: function() {
      return 'widget_' + this._id;
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
