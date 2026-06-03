const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    required: true
  },
  analysis: {
    skills: [{
      name: String,
      category: {
        type: String,
        enum: ['technical', 'soft', 'language', 'tool', 'framework']
      }
    }],
    experience: {
      years: Number,
      level: {
        type: String,
        enum: ['fresher', 'junior', 'mid-level', 'senior', 'expert']
      }
    },
    education: [{
      degree: String,
      institution: String,
      year: String
    }],
    projects: [{
      title: String,
      description: String,
      technologies: [String]
    }],
    certifications: [String],
    summary: String
  },
  // AI Resume Gap Analysis & ATS Optimization
  gapAnalysis: {
    targetRole: String,
    jobDescription: String,
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    categoryScores: {
      technicalSkills: { type: Number, min: 0, max: 10, default: 0 },
      projects: { type: Number, min: 0, max: 10, default: 0 },
      experience: { type: Number, min: 0, max: 10, default: 0 },
      atsOptimization: { type: Number, min: 0, max: 10, default: 0 },
      education: { type: Number, min: 0, max: 10, default: 0 }
    },
    skillMatchPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    missingSkills: [{
      skill: String,
      importance: {
        type: String,
        enum: ['critical', 'important', 'nice-to-have']
      },
      reason: String
    }],
    presentSkills: [{
      skill: String,
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      }
    }],
    strengths: [String],
    weaknesses: [String],
    aiSuggestions: [{
      category: {
        type: String,
        enum: ['skills', 'projects', 'experience', 'education', 'ats', 'wording', 'formatting']
      },
      priority: {
        type: String,
        enum: ['high', 'medium', 'low']
      },
      suggestion: String,
      impact: String
    }],
    atsAnalysis: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      keywords: {
        present: [String],
        missing: [String]
      },
      formatting: {
        score: { type: Number, min: 0, max: 10, default: 0 },
        issues: [String]
      },
      actionVerbs: {
        count: Number,
        examples: [String],
        suggestions: [String]
      },
      readability: {
        score: { type: Number, min: 0, max: 10, default: 0 },
        issues: [String]
      }
    },
    improvedSections: [{
      section: String,
      original: String,
      improved: String,
      reason: String
    }],
    // Structured optimized resume output for preview & export
    optimizedResume: {
      summary: String,
      skills: [String],
      experience: [{
        title: String,
        company: String,
        duration: String,
        bullets: [String]
      }],
      projects: [{
        title: String,
        description: String,
        technologies: [String]
      }],
      education: [{
        degree: String,
        institution: String,
        year: String
      }],
      certifications: [String],
      atsScore: {
        before: { type: Number, min: 0, max: 100, default: 0 },
        after: { type: Number, min: 0, max: 100, default: 0 }
      },
      keyChanges: [String],
      generatedAt: Date
    },
    analyzedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
