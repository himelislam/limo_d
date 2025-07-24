const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: false
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: false
  },
  passenger: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  distance: {
    type: Number,
    min: 0
  },
  fare: {
    type: Number,
    min: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: 0
  },
  passengerCount: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'on-the-way', 'started', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  assignmentNotes: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  feedback: {
    type: String
  }
}, { timestamps: true });

// Index for efficient queries
tripSchema.index({ passenger: 1, status: 1 });
tripSchema.index({ driver: 1, status: 1 });
tripSchema.index({ vehicle: 1, scheduledTime: 1 });
tripSchema.index({ status: 1, scheduledTime: 1 });

module.exports = mongoose.model('Trip', tripSchema);
