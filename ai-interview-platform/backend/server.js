const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const interviewRoutes = require('./routes/interview.routes');
const codingRoutes = require('./routes/coding.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  dbName: 'ai-interview-platform'
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/user', userRoutes);

// Public Global Stats Endpoint (Real User Proof)
app.get('/api/public/stats', async (req, res) => {
  try {
    const User = require('./models/User.model');
    const InterviewHistory = require('./models/InterviewHistory.model');
    
    const userCount = await User.countDocuments();
    const interviewCount = await InterviewHistory.countDocuments();
    const histories = await InterviewHistory.find().select('overallScore');
    
    let avgScore = 0;
    if (histories.length > 0) {
      const sum = histories.reduce((acc, curr) => acc + (curr.overallScore || 0), 0);
      avgScore = (sum / histories.length).toFixed(1);
    }
    
    res.json({
      success: true,
      data: {
        activeUsers: userCount,
        interviewsCompleted: interviewCount,
        averageScore: avgScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch public stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AI Interview Platform API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
