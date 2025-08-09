const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  // Support from/to for backward compatibility
  from: {
    type: String,
    get: function() { return this.origin; },
    set: function(value) { this.origin = value; }
  },
  to: {
    type: String,
    get: function() { return this.destination; },
    set: function(value) { this.destination = value; }
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  passengerCount: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'on-the-way', 'started', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  fare: {
    type: Number
  },
  notes: {
    type: String
  },
  bookingSource: {
    type: String,
    enum: ['dashboard', 'widget', 'mobile'],
    default: 'dashboard'
  },
  customerInfo: {
    name: String,
    email: String,
    phone: String,
    vehicleType: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual field for frontend compatibility
tripSchema.virtual('passengers').get(function() {
  return this.passengerCount;
});

// Index for efficient queries
tripSchema.index({ passenger: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ vehicle: 1, scheduledTime: 1 });
tripSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Trip', tripSchema);
