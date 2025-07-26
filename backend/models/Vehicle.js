const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
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
    enum: ['sedan', 'suv', 'van', 'truck', 'bus']
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
    default: 0,
    min: 0
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid'],
    default: 'gasoline'
  },
  lastServiceDate: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
