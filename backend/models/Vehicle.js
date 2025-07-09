const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  licensePlate: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  type: {
    type: String,
    required: true,
    enum: ['sedan', 'suv', 'van']
  },
  seatingCapacity: {
    type: Number,
    required: true,
    min: 1
  },
  status: {
    type: String,
    enum: ['active', 'maintenance', 'retired'],
    default: 'active'
  },
  mileage: {
    type: Number,
    default: 0
  },
  lastServiceDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);