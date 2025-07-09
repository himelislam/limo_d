const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'on-trip', 'on-leave'],
    default: 'available'
  },
  experience: {
    type: Number, // in years
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Driver', driverSchema);