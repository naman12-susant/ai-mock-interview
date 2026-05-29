const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: mongoose.Schema.Types.Mixed,
  expectedOutput: mongoose.Schema.Types.Mixed,
  isHidden: {
    type: Boolean,
    default: false
  }
});

const codingChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  tags: [String],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String
  },
  constraints: [String],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  timeLimit: {
    type: Number,
    default: 30 // minutes
  },
  points: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

const codingSubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  challenge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'cpp'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'passed', 'failed', 'error'],
    default: 'pending'
  },
  testResults: [{
    testCase: Number,
    passed: Boolean,
    actualOutput: mongoose.Schema.Types.Mixed,
    expectedOutput: mongoose.Schema.Types.Mixed,
    error: String
  }],
  score: {
    type: Number,
    default: 0
  },
  executionTime: Number, // in milliseconds
  memoryUsed: Number, // in KB
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);
const CodingSubmission = mongoose.model('CodingSubmission', codingSubmissionSchema);

module.exports = { CodingChallenge, CodingSubmission };
