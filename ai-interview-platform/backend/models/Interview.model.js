const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  role: {
    type: String
  },
  interviewType: {
    type: String
  },
  expectedAnswer: String,
  userAnswer: String,
  audioTranscript: String,
  classification: {
    type: String,
    enum: ['STRONG', 'GOOD', 'PARTIAL', 'WEAK', 'INCORRECT', 'NO_KNOWLEDGE', 'RANDOM', 'EMPTY'],
    default: 'PARTIAL'
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  confidenceLevel: {
    type: String,
    enum: ['HIGH', 'MEDIUM', 'LOW', 'NONE'],
    default: 'LOW'
  },
  score: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    improvedAnswer: String
  },
  timeSpent: Number, // in seconds
  answeredAt: Date
});

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  type: {
    type: String,
    enum: ['technical', 'behavioral', 'mixed'],
    default: 'mixed'
  },
  difficulty: {
    type: String,
    enum: ['startup', 'faang', 'beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  role: {
    type: String,
    required: true
  },
  questions: [questionSchema],
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'abandoned'],
    default: 'pending'
  },
  scores: {
    technical: {
      type: Number,
      default: 0
    },
    communication: {
      type: Number,
      default: 0
    },
    confidence: {
      type: Number,
      default: 0
    },
    overall: {
      type: Number,
      default: 0
    }
  },
  duration: Number, // in seconds
  startedAt: Date,
  completedAt: Date,
  feedback: {
    summary: String,
    strengths: [String],
    areasOfImprovement: [String],
    recommendations: [String]
  }
}, {
  timestamps: true
});

// Calculate overall score
interviewSchema.methods.calculateOverallScore = function() {
  const { technical, communication, confidence } = this.scores;
  this.scores.overall = ((technical + communication + confidence) / 3).toFixed(2);
};

module.exports = mongoose.model('Interview', interviewSchema);
