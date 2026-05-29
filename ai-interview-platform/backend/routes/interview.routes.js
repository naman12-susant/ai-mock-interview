const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validation.middleware');
const { protect } = require('../middleware/auth.middleware');
const interviewController = require('../controllers/interview.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const createInterviewValidation = [
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required'),
  body('type')
    .optional()
    .isIn(['technical', 'behavioral', 'mixed']).withMessage('Invalid interview type')
];

const submitAnswerValidation = [
  body('interviewId')
    .notEmpty().withMessage('Interview ID is required'),
  body('questionIndex')
    .isInt({ min: 0 }).withMessage('Valid question index is required'),
  body('answer')
    .trim()
    .notEmpty().withMessage('Answer is required')
];

// Routes
router.get('/check-resume', interviewController.checkResume);

router.post(
  '/generate',
  [
    body('role')
      .trim()
      .notEmpty().withMessage('Role is required'),
    body('type')
      .optional()
      .isIn(['technical', 'behavioral', 'mixed']).withMessage('Invalid interview type')
  ],
  validate,
  interviewController.generateQuestionsEndpoint
);

router.post(
  '/create',
  createInterviewValidation,
  validate,
  interviewController.createInterview
);

router.post('/answer', submitAnswerValidation, validate, interviewController.submitAnswer);
router.post('/live/greeting', interviewController.getGreeting);
router.post('/live/chat', interviewController.getConversationalReply);
router.post('/:id/complete', interviewController.completeInterview);
router.get('/statistics', interviewController.getStatistics);
router.get('/all', interviewController.getAllInterviews);
router.get('/:id', interviewController.getInterview);

module.exports = router;
