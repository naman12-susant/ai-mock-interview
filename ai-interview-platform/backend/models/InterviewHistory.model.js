const mongoose = require('mongoose');

const InterviewHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    required: true
  },
  interviewType: {
    type: String,
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
  },
  difficultyLevel: {
    type: String,
    required: true
  },
  overallScore: {
    type: Number,
    default: 0
  },
  confidenceScore: {
    type: Number,
    default: 0
  },
  technicalScore: {
    type: Number,
    default: 0
  },
  communicationScore: {
    type: Number,
    default: 0
  },
  weakAreas: [String],
  strongAreas: [String],
  questionsAsked: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InterviewHistory', InterviewHistorySchema);
