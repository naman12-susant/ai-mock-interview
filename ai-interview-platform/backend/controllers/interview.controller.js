const Interview = require('../models/Interview.model');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const InterviewHistory = require('../models/InterviewHistory.model');
const groqService = require('../services/groq.service');

// Create new interview session
exports.checkResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        hasResume: !!resume
      }
    });
  } catch (error) {
    console.error('Check resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking resume',
      error: error.message
    });
  }
};

// Create new interview session
exports.createInterview = async (req, res) => {
  try {
    const { role, type = 'mixed', difficulty, questions: preGeneratedQuestions } = req.body;

    // Validate input
    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Get user's active resume
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume first'
      });
    }

    // Check if resume has analysis
    if (!resume.analysis) {
      return res.status(400).json({
        success: false,
        message: 'Resume analysis not available. Please try uploading again.'
      });
    }

    // Count user attempts for this role
    const previousAttempts = await InterviewHistory.countDocuments({
      user: req.user.id,
      role
    });

    // Find weakAreas from previous attempts
    const histories = await InterviewHistory.find({
      user: req.user.id,
      role
    }).select('weakAreas').sort({ createdAt: -1 }).limit(3);

    const weakAreas = [...new Set(histories.flatMap(h => h.weakAreas))];

    // Progressive dynamic difficulty progression
    let calculatedDifficulty = difficulty;
    if (!calculatedDifficulty) {
      if (previousAttempts === 0) {
        calculatedDifficulty = 'beginner';
      } else if (previousAttempts <= 3) {
        calculatedDifficulty = 'intermediate';
      } else if (previousAttempts <= 7) {
        calculatedDifficulty = 'advanced';
      } else {
        calculatedDifficulty = 'faang';
      }
    }

    // Generate interview questions or use pre-generated ones
    let questions = preGeneratedQuestions;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      try {
        questions = await groqService.generateInterviewQuestions(
          resume.analysis,
          role,
          10,
          type,
          calculatedDifficulty,
          previousAttempts,
          weakAreas
        );
      } catch (error) {
        console.error('Groq error:', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to generate interview questions. Please try again.'
        });
      }
    }

    // Create interview
    const interview = await Interview.create({
      user: req.user.id,
      resume: resume._id,
      type,
      difficulty: calculatedDifficulty,
      role,
      questions: questions.map(q => ({
        question: q.question,
        difficulty: q.difficulty,
        category: q.category,
        expectedAnswer: q.expectedAnswer,
        role: role,
        interviewType: type
      })),
      status: 'pending',
      startedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Interview created successfully',
      data: {
        interview: {
          id: interview._id,
          role: interview.role,
          type: interview.type,
          difficulty: interview.difficulty,
          questions: interview.questions.map(q => ({
            question: q.question,
            difficulty: q.difficulty,
            category: q.category
          })),
          status: interview.status
        }
      }
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating interview',
      error: error.message
    });
  }
};

// Generate questions without saving the interview (for preview/regeneration)
exports.generateQuestionsEndpoint = async (req, res) => {
  try {
    const { role, type = 'mixed', difficulty } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Get user's active resume
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a resume first'
      });
    }

    if (!resume.analysis) {
      return res.status(400).json({
        success: false,
        message: 'Resume analysis not available. Please try uploading again.'
      });
    }

    // Count user attempts for this role
    const previousAttempts = await InterviewHistory.countDocuments({
      user: req.user.id,
      role
    });

    // Find weakAreas from previous attempts
    const histories = await InterviewHistory.find({
      user: req.user.id,
      role
    }).select('weakAreas').sort({ createdAt: -1 }).limit(3);

    const weakAreas = [...new Set(histories.flatMap(h => h.weakAreas))];

    // Progressive dynamic difficulty progression
    let calculatedDifficulty = difficulty;
    if (!calculatedDifficulty) {
      if (previousAttempts === 0) {
        calculatedDifficulty = 'beginner';
      } else if (previousAttempts <= 3) {
        calculatedDifficulty = 'intermediate';
      } else if (previousAttempts <= 7) {
        calculatedDifficulty = 'advanced';
      } else {
        calculatedDifficulty = 'faang';
      }
    }

    // Generate interview questions
    const questions = await groqService.generateInterviewQuestions(
      resume.analysis,
      role,
      10,
      type,
      calculatedDifficulty,
      previousAttempts,
      weakAreas
    );

    res.status(200).json({
      success: true,
      data: {
        questions: questions.map(q => ({
          question: q.question,
          difficulty: q.difficulty,
          category: q.category,
          expectedAnswer: q.expectedAnswer
        }))
      }
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating questions',
      error: error.message
    });
  }
};

// Submit answer to a question
exports.submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, audioTranscript, timeSpent } = req.body;

    const interview = await Interview.findOne({
      _id: interviewId,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (questionIndex >= interview.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid question index'
      });
    }

    const question = interview.questions[questionIndex];

    // Evaluate answer using AI
    const evaluation = await groqService.evaluateAnswer(
      question.question,
      answer,
      question.expectedAnswer
    );

    // Update question with answer and evaluation (includes classification)
    interview.questions[questionIndex] = {
      ...question.toObject(),
      userAnswer: answer,
      audioTranscript,
      timeSpent,
      answeredAt: new Date(),
      score: evaluation.score,
      classification: evaluation.classification || 'PARTIAL',
      isCorrect: evaluation.isCorrect || false,
      feedback: {
        strengths: evaluation.strengths || [],
        weaknesses: evaluation.weaknesses || [],
        suggestions: evaluation.suggestions || [],
        improvedAnswer: evaluation.improvedAnswer || ''
      }
    };

    // Update interview scores
    const answeredQuestions = interview.questions.filter(q => q.userAnswer);
    const technicalQuestions = answeredQuestions.filter(q => q.category === 'technical');
    
    if (technicalQuestions.length > 0) {
      interview.scores.technical = (
        technicalQuestions.reduce((sum, q) => sum + q.score, 0) / technicalQuestions.length
      ).toFixed(2);
    }

    interview.scores.communication = evaluation.communicationScore || 0;
    interview.scores.confidence = evaluation.confidenceScore || 0;

    // Update status
    if (interview.status === 'pending') {
      interview.status = 'in-progress';
    }

    await interview.save();

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      data: {
        evaluation: {
          classification: evaluation.classification || 'PARTIAL',
          score: evaluation.score,
          isCorrect: evaluation.isCorrect || false,
          confidenceLevel: evaluation.confidenceLevel || 'LOW',
          strengths: evaluation.strengths || [],
          weaknesses: evaluation.weaknesses || [],
          suggestions: evaluation.suggestions || []
        },
        currentScores: interview.scores
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
};

// Complete interview and generate final feedback
exports.completeInterview = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await Interview.findOne({
      _id: id,
      user: req.user.id
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Calculate overall score
    interview.calculateOverallScore();

    // Generate comprehensive feedback
    const feedback = await groqService.generateInterviewFeedback(
      interview.questions,
      interview.scores
    );

    // Update interview
    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.duration = Math.floor(
      (interview.completedAt - interview.startedAt) / 1000
    );
    interview.feedback = feedback;

    await interview.save();

    // Save Interview Attempt Analytics
    try {
      const attempts = await InterviewHistory.countDocuments({
        user: req.user.id,
        role: interview.role
      });

      await InterviewHistory.create({
        user: req.user.id,
        role: interview.role,
        interviewType: interview.type,
        attemptNumber: attempts + 1,
        difficultyLevel: interview.difficulty,
        overallScore: parseFloat(interview.scores.overall) || 0,
        technicalScore: parseFloat(interview.scores.technical) || 0,
        communicationScore: parseFloat(interview.scores.communication) || 0,
        confidenceScore: parseFloat(interview.scores.confidence) || 0,
        weakAreas: feedback.areasOfImprovement || [],
        strongAreas: feedback.strengths || [],
        questionsAsked: interview.questions.map(q => q.question)
      });
    } catch (e) {
      console.error('Failed to create InterviewHistory:', e);
    }

    // Update user statistics
    const user = await User.findById(req.user.id);
    await user.updateAverageScore(parseFloat(interview.scores.overall));

    res.status(200).json({
      success: true,
      message: 'Interview completed successfully',
      data: {
        interview: {
          id: interview._id,
          scores: interview.scores,
          feedback: interview.feedback,
          duration: interview.duration,
          completedAt: interview.completedAt
        }
      }
    });
  } catch (error) {
    console.error('Complete interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing interview',
      error: error.message
    });
  }
};

// Get interview details
exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('resume', 'fileName analysis');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { interview }
    });
  } catch (error) {
    console.error('Get interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview',
      error: error.message
    });
  }
};

// Get all user interviews
exports.getAllInterviews = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;

    const query = { user: req.user.id };
    if (status) {
      query.status = status;
    }

    const interviews = await Interview.find(query)
      .select('-questions.expectedAnswer -questions.feedback')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Interview.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        interviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get all interviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interviews',
      error: error.message
    });
  }
};

// Get interview statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalInterviews = await InterviewHistory.countDocuments({
      user: req.user.id
    });

    const histories = await InterviewHistory.find({
      user: req.user.id
    }).sort({ createdAt: 1 });

    const averageScores = {
      technical: 0,
      communication: 0,
      confidence: 0,
      overall: 0
    };

    let bestRole = 'None';
    let weakestTopic = 'None';
    let difficultyReached = 'Beginner';
    let confidenceGrowth = '+0%';
    const roleScores = {};
    const weakTopicCounts = {};
    const strongTopicCounts = {};

    if (histories.length > 0) {
      histories.forEach(h => {
        averageScores.technical += h.technicalScore;
        averageScores.communication += h.communicationScore;
        averageScores.confidence += h.confidenceScore;
        averageScores.overall += h.overallScore;

        // Best Role calculation
        if (!roleScores[h.role]) roleScores[h.role] = { sum: 0, count: 0 };
        roleScores[h.role].sum += h.overallScore;
        roleScores[h.role].count += 1;

        // Weak/Strong areas count
        if (h.weakAreas) {
          h.weakAreas.forEach(area => {
            weakTopicCounts[area] = (weakTopicCounts[area] || 0) + 1;
          });
        }
        if (h.strongAreas) {
          h.strongAreas.forEach(area => {
            strongTopicCounts[area] = (strongTopicCounts[area] || 0) + 1;
          });
        }
      });

      // Average scores
      Object.keys(averageScores).forEach(key => {
        averageScores[key] = (averageScores[key] / histories.length).toFixed(2);
      });

      // Best Role
      let highestAvg = 0;
      Object.keys(roleScores).forEach(role => {
        const avg = roleScores[role].sum / roleScores[role].count;
        if (avg > highestAvg) {
          highestAvg = avg;
          bestRole = role;
        }
      });

      // Weakest Topic
      let highestWeakCount = 0;
      Object.keys(weakTopicCounts).forEach(topic => {
        if (weakTopicCounts[topic] > highestWeakCount) {
          highestWeakCount = weakTopicCounts[topic];
          weakestTopic = topic;
        }
      });

      // Max difficulty reached
      const difficulties = histories.map(h => h.difficultyLevel);
      if (difficulties.includes('faang')) difficultyReached = 'Expert (FAANG Ready)';
      else if (difficulties.includes('advanced')) difficultyReached = 'Advanced';
      else if (difficulties.includes('intermediate')) difficultyReached = 'Intermediate';
      else difficultyReached = 'Beginner';

      // Confidence Growth
      if (histories.length > 1) {
        const firstConf = histories[0].confidenceScore;
        const lastConf = histories[histories.length - 1].confidenceScore;
        const growth = lastConf - firstConf;
        confidenceGrowth = (growth >= 0 ? '+' : '') + growth.toFixed(0) + '%';
      }
    }

    // Get trend data for graph
    const trend = histories.map(h => ({
      attemptNumber: h.attemptNumber,
      date: h.createdAt,
      overallScore: h.overallScore,
      technicalScore: h.technicalScore,
      communicationScore: h.communicationScore,
      confidenceScore: h.confidenceScore,
      role: h.role,
      difficulty: h.difficultyLevel
    }));

    // Weakest and strongest topic list
    const weakTopics = Object.keys(weakTopicCounts).sort((a,b) => weakTopicCounts[b] - weakTopicCounts[a]).slice(0, 5);
    const strongTopics = Object.keys(strongTopicCounts).sort((a,b) => strongTopicCounts[b] - strongTopicCounts[a]).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        totalInterviews,
        averageScores,
        bestRole,
        weakestTopic,
        confidenceGrowth,
        difficultyReached,
        trend,
        weakTopics,
        strongTopics
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
};

// Generate personalized interviewer greeting
exports.getGreeting = async (req, res) => {
  try {
    const { role, interviewType } = req.body;
    const userName = req.user.name || 'Candidate';

    const reply = await groqService.generateInterviewGreeting(userName, role, interviewType || 'mixed');
    
    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Greeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating greeting',
      error: error.message
    });
  }
};

// Conversational AI follow-up generator
exports.getConversationalReply = async (req, res) => {
  try {
    const { role, difficulty, currentQuestion, userAnswer, conversationHistory } = req.body;

    if (!role || !currentQuestion || !userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'role, currentQuestion, and userAnswer are required'
      });
    }

    const reply = await groqService.generateConversationalReply(
      role,
      difficulty || 'intermediate',
      currentQuestion,
      userAnswer,
      conversationHistory || []
    );

    res.status(200).json({
      success: true,
      data: reply
    });
  } catch (error) {
    console.error('Conversational reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating conversational follow-up',
      error: error.message
    });
  }
};
