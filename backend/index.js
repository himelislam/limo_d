const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { app: { port },} = require("./config/env")


const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const driverRoutes = require('./routes/drivers');
const tripRoutes = require('./routes/trips');
const userRoutes = require('./routes/users');

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);


const PORT = port || 4000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Limo_d server" });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
