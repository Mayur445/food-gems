const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Import routes
const spotRoutes = require('./routes/spotRoutes');
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const photoRoutes = require('./routes/photoRoutes');

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/spots/:id/reviews', reviewRoutes);
app.use('/api/spots/:id/photos', photoRoutes);
app.use('/api/spots', spotRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Food Gems API is running!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});