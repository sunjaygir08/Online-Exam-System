require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const passport = require('passport');
const connectDB = require('./config/db');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const resultRoutes = require('./routes/result');

// Initialize Express app
const app = express();

// Connect Database
connectDB();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          "https://kit.fontawesome.com",
          "https://cdn.jsdelivr.net",
          "https://cdnjs.cloudflare.com"
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://ka-f.fontawesome.com",
          "https://fonts.googleapis.com",
          "https://cdn.jsdelivr.net"
        ],
        connectSrc: [
          "'self'",
          "https://ka-f.fontawesome.com",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com"
        ],
        fontSrc: [
          "'self'",
          "https://ka-f.fontawesome.com",
          "https://fonts.gstatic.com",
          "https://cdnjs.cloudflare.com"
        ],
        imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com"],
        objectSrc: ["'none'"]
      }
    }
  })
);

// CORS configuration (allow requests with credentials)
app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:5000',
    credentials: true
  })
);

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Initialize Passport
app.use(passport.initialize());
require('./config/passport'); // Loads passport strategies

// Apply rate limiting to all requests
app.use('/api/', apiLimiter);

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);

// Serve Frontend Static Files
app.use(express.static(path.join(__dirname, '../client')));

// Redirect root to index page
app.get('/', (req, res) => {
  res.redirect('/pages/index.html');
});

// Catch-all route to redirect invalid routes to home page
app.get('*', (req, res) => {
  res.redirect('/pages/index.html');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
