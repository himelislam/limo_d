const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
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

// Compound index for business-specific license plates
vehicleSchema.index({ business: 1, licensePlate: 1 }, { unique: true });

// Add virtual field for frontend compatibility
vehicleSchema.virtual('capacity').get(function() {
  return this.seatingCapacity;
});

vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
