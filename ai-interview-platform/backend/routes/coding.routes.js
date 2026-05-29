const express = require('express');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes - to be implemented
router.get('/challenges', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Coding challenges endpoint - Coming soon',
    data: { challenges: [] }
  });
});

router.post('/submit', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Code submission endpoint - Coming soon'
  });
});

module.exports = router;
