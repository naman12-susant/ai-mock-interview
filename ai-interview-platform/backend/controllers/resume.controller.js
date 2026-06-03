const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const resumeService = require('../services/resume.service');
const openaiService = require('../services/openai.service');
const fs = require('fs').promises;

// Upload and analyze resume
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file'
      });
    }

    const { originalname, size, buffer } = req.file;

    // Extract text from PDF
    let extractedText = await resumeService.extractTextFromPDF(buffer);
    console.log('Extracted text length:', extractedText?.length);
    
    const cleanedText = resumeService.cleanText(extractedText);
    console.log('Cleaned text length:', cleanedText?.length);

    // If PDF extraction failed, inform user and do NOT use placeholder data
    if (!cleanedText || cleanedText.trim().length < 50) {
      console.warn('PDF text extraction failed.');

      return res.status(400).json({
        success: false,
        message: 'Could not extract text from PDF. Please ensure your resume is a text-based PDF (not an image or scanned document). Try uploading again or try a different PDF.',
        error: 'PDF_EXTRACTION_FAILED'
      });
    }

    // Validate resume content
    resumeService.validateResumeContent(cleanedText);
    extractedText = cleanedText;
    
    // Analyze resume using AI
    const analysis = await openaiService.analyzeResume(cleanedText);

    // Deactivate previous resumes
    await Resume.updateMany(
      { user: req.user.id, isActive: true },
      { isActive: false }
    );

    // Save resume to database
    const resume = await Resume.create({
      user: req.user.id,
      fileName: originalname,
      filePath: '',
      fileSize: size,
      extractedText: extractedText,
      analysis,
      isActive: true
    });

    // Update user profile
    await User.findByIdAndUpdate(req.user.id, {
      resumeUploaded: true,
      skills: (analysis?.skills?.map(s => s?.name).filter(name => name && typeof name === 'string')) || [],
      experienceLevel: analysis?.experience?.level || 'fresher'
    });

    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        resume: {
          id: resume._id,
          fileName: resume.fileName,
          analysis: resume.analysis,
          createdAt: resume.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Upload resume error:', error);

    res.status(500).json({
      success: false,
      message: 'Error uploading resume',
      error: error.message
    });
  }
};

// Get user's active resume
exports.getActiveResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    }).select('-extractedText');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found'
      });
    }

    res.status(200).json({
      success: true,
      data: { resume }
    });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume',
      error: error.message
    });
  }
};

// Get all user resumes
exports.getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .select('-extractedText')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        count: resumes.length,
        resumes
      }
    });
  } catch (error) {
    console.error('Get all resumes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resumes',
      error: error.message
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete file from filesystem (if it exists)
    try {
      if (resume.filePath && resume.filePath !== '') {
        await fs.unlink(resume.filePath);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Delete from database
    await resume.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting resume',
      error: error.message
    });
  }
};


// ============================================
// AI RESUME GAP ANALYSIS & ATS OPTIMIZATION
// ============================================

// Perform gap analysis for a specific role
exports.performGapAnalysis = async (req, res) => {
  try {
    const { targetRole } = req.body;

    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }

    // Get active resume
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found. Please upload a resume first.'
      });
    }

    // Perform gap analysis
    const gapAnalysis = await openaiService.performGapAnalysis(
      resume.extractedText,
      resume.analysis,
      targetRole
    );

    // Update resume with gap analysis
    resume.gapAnalysis = gapAnalysis;
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Gap analysis completed successfully',
      data: { gapAnalysis }
    });
  } catch (error) {
    console.error('Gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing gap analysis',
      error: error.message
    });
  }
};

// Get gap analysis for active resume
exports.getGapAnalysis = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    }).select('gapAnalysis');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found'
      });
    }

    if (!resume.gapAnalysis || !resume.gapAnalysis.targetRole) {
      return res.status(404).json({
        success: false,
        message: 'No gap analysis found. Please perform analysis first.'
      });
    }

    res.status(200).json({
      success: true,
      data: { gapAnalysis: resume.gapAnalysis }
    });
  } catch (error) {
    console.error('Get gap analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching gap analysis',
      error: error.message
    });
  }
};

// Rewrite a specific resume section
exports.rewriteSection = async (req, res) => {
  try {
    const { sectionText, sectionType, targetRole } = req.body;

    if (!sectionText || !sectionType) {
      return res.status(400).json({
        success: false,
        message: 'Section text and type are required'
      });
    }

    // Get active resume for target role
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    const role = targetRole || resume?.gapAnalysis?.targetRole || 'Software Developer';

    // Rewrite section
    const rewriteResult = await openaiService.rewriteResumeSection(
      sectionText,
      sectionType,
      role
    );

    // Save improved section to resume
    if (resume) {
      if (!resume.gapAnalysis) {
        resume.gapAnalysis = {};
      }
      if (!resume.gapAnalysis.improvedSections) {
        resume.gapAnalysis.improvedSections = [];
      }
      
      resume.gapAnalysis.improvedSections.push({
        section: sectionType,
        original: sectionText,
        improved: rewriteResult.improved,
        reason: rewriteResult.reasoning
      });
      
      await resume.save();
    }

    res.status(200).json({
      success: true,
      message: 'Section rewritten successfully',
      data: rewriteResult
    });
  } catch (error) {
    console.error('Rewrite section error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rewriting section',
      error: error.message
    });
  }
};

// Get industry-standard skills for a role
exports.getIndustrySkills = async (req, res) => {
  try {
    const { role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role parameter is required'
      });
    }

    const industrySkills = await openaiService.getIndustrySkills(role);

    res.status(200).json({
      success: true,
      data: { industrySkills }
    });
  } catch (error) {
    console.error('Get industry skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching industry skills',
      error: error.message
    });
  }
};

// One-click resume optimization
exports.optimizeResume = async (req, res) => {
  try {
    const { targetRole } = req.body;

    // Get active resume
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found. Please upload a resume first.'
      });
    }

    const role = targetRole || resume.gapAnalysis?.targetRole || 'Software Developer';

    // Optimize resume
    const optimization = await openaiService.optimizeResumeOneClick(
      resume.extractedText,
      resume.analysis,
      role
    );

    // Update resume with optimizations
    if (!resume.gapAnalysis) {
      resume.gapAnalysis = {};
    }
    
    resume.gapAnalysis.improvedSections = optimization.improvedSections;
    
    if (optimization.atsScore) {
      if (!resume.gapAnalysis.atsAnalysis) {
        resume.gapAnalysis.atsAnalysis = {};
      }
      resume.gapAnalysis.atsAnalysis.score = optimization.atsScore.after;
    }
    
    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume optimized successfully',
      data: optimization
    });
  } catch (error) {
    console.error('Optimize resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Error optimizing resume',
      error: error.message
    });
  }
};

// Get resume score breakdown
exports.getResumeScore = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      user: req.user.id,
      isActive: true
    }).select('gapAnalysis.overallScore gapAnalysis.categoryScores gapAnalysis.skillMatchPercentage gapAnalysis.atsAnalysis.score');

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No active resume found'
      });
    }

    if (!resume.gapAnalysis) {
      return res.status(404).json({
        success: false,
        message: 'No analysis found. Please perform gap analysis first.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        overallScore: resume.gapAnalysis.overallScore || 0,
        categoryScores: resume.gapAnalysis.categoryScores || {},
        skillMatchPercentage: resume.gapAnalysis.skillMatchPercentage || 0,
        atsScore: resume.gapAnalysis.atsAnalysis?.score || 0
      }
    });
  } catch (error) {
    console.error('Get resume score error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching resume score',
      error: error.message
    });
  }
};
