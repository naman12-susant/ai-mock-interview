const express = require('express');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Placeholder routes
router.get('/dashboard', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dashboard endpoint',
    data: {}
  });
});

module.exports = router;
