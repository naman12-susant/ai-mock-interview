const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?background=random'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resumeUploaded: {
    type: Boolean,
    default: false
  },
  skills: [{
    type: String
  }],
  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid-level', 'senior', 'expert'],
    default: 'fresher'
  },
  preferredRole: {
    type: String,
    default: ''
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  visitCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginHistory: [{
    date: Date,
    ip: String,
    browser: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Update average score
userSchema.methods.updateAverageScore = async function(newScore) {
  const totalScore = (this.averageScore * this.totalInterviews) + newScore;
  this.totalInterviews += 1;
  this.averageScore = totalScore / this.totalInterviews;
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
