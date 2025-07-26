const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: function() {
      return this.role === 'driver' || this.role === 'passenger';
    }
  },
  role: {
    type: String,
    enum: ['admin', 'owner', 'driver', 'passenger'],
    default: 'passenger'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'available', 'on-trip', 'on-leave'],
    default: function() {
      return this.role === 'driver' ? 'available' : 'active';
    }
  },
  // Driver-specific fields
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'driver';
    },
    unique: true,
    sparse: true
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
