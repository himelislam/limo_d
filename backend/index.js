const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { app: { port },} = require("./config/env")


const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/business');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const userRoutes = require('./routes/users');

connectDB();

const app = express();

const corsOptions = {
  // origin: function (origin, callback) {
  //   const allowedOrigins = cors_origin ? cors_origin.split(',') : ['http://localhost:3000'];
  //   if (!origin || allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: '*',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', require('./routes/bookings'));

app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Welcome to the Fleet API"
  });
});


const PORT = port || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
