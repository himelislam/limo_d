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
    enum: ['super_admin', 'business_owner', 'driver', 'passenger'],
    default: 'passenger'
  },
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: function() {
      return ['business_owner', 'driver'].includes(this.role);
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isGuest: {
    type: Boolean,
    default: false
  },
  // Driver-specific fields
  licenseNumber: {
    type: String,
    required: function() {
      return this.role === 'driver';
    },
    sparse: true
  },
  experience: {
    type: Number,
    default: 0,
    required: function() {
      return this.role === 'driver';
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
