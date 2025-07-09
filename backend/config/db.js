const mongoose = require('mongoose');
// require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(`mongodb+srv://himel7100:fNwyaH2VNqxjp94m@limodcluster.zs6tdfo.mongodb.net/?retryWrites=true&w=majority&appName=limodCluster`, {
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