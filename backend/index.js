const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Route files
const vehicles = require('./routes/vehicles');
const drivers = require('./routes/drivers');
const passengers = require('./routes/passengers');
const trips = require('./routes/trips');
const auth = require('./routes/auth');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(bodyParser.json());

// Enable CORS
app.use(cors({
  origin: "*"
}));


// Mount routers
app.use('/api/auth', auth);
app.use('/api/vehicles', vehicles);
app.use('/api/drivers', drivers);
app.use('/api/passengers', passengers);
app.use('/api/trips', trips);

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the Limo_d server" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

