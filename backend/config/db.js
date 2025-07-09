const mongoose = require('mongoose');
// require('dotenv').config();
const { mongo: { uri } } = require("./env");

const connectDB = async () => {
  try {
    await mongoose.connect(uri, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;