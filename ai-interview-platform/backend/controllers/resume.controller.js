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
        message: 'Please upload a resume file',
        error: 'NO_FILE_UPLOADED'
      });
    }

    const { originalname, size, buffer, mimetype } = req.file;
    console.log(`\n[UPLOAD] Starting resume upload: ${originalname}`);

    // ========================================
    // STEP 1: EXTRACT TEXT (Multiple Methods)
    // ========================================
    let extractedText;
    try {
      extractedText = await resumeService.extractText(buffer, originalname, mimetype);
    } catch (extractionError) {
      console.error('[UPLOAD] Extraction failed:', extractionError.message);
      return res.status(400).json({
        success: false,
        message: '❌ Unable to Read Resume\n\nYour resume may be scanned or image-based.\n\nTry uploading:\n• A text-based PDF\n• DOCX file\n• Higher quality scan',
        error: 'TEXT_EXTRACTION_FAILED',
        details: extractionError.message
      });
    }

    // ========================================
    // STEP 2: VALIDATE EXTRACTION QUALITY
    // ========================================
    try {
      resumeService.validateExtractionQuality(extractedText);
    } catch (validationError) {
      console.error('[UPLOAD] Extraction quality validation failed:', validationError.message);
      return res.status(400).json({
        success: false,
        message: '❌ Unable to Read Resume\n\n' + validationError.message,
        error: 'EXTRACTION_QUALITY_FAILED'
      });
    }

    // Clean the text
    const cleanedText = resumeService.cleanText(extractedText);
    console.log(`[UPLOAD] Text extracted and cleaned (${cleanedText.length} characters)`);

    // ========================================
    // STEP 3: VALIDATE IT'S ACTUALLY A RESUME
    // ========================================
    const resumeValidation = await resumeService.validateIsResume(cleanedText, true);
    console.log('[UPLOAD] Resume validation result:', resumeValidation);

    if (!resumeValidation.isResume || resumeValidation.confidence < 40) {
      console.warn('[UPLOAD] Document is not a resume');
      return res.status(400).json({
        success: false,
        message: '❌ Invalid Resume\n\nThe uploaded file does not appear to be a professional resume or CV.\n\nPlease upload:\n• PDF Resume\n• DOCX Resume\n• Resume Image (JPG/PNG)\n\nSupported formats: PDF, DOC, DOCX, JPG, PNG',
        error: 'NOT_A_RESUME',
        details: resumeValidation.reason
      });
    }

    // ========================================
    // STEP 4: VALIDATE RESUME STRUCTURE
    // ========================================
    const structureValidation = resumeService.validateResumeStructure(cleanedText);
    console.log('[UPLOAD] Resume structure validation:', structureValidation);

    // Warn if missing contact info (but don't fail)
    if (!structureValidation.hasContactInfo) {
      console.warn('[UPLOAD] Warning: Resume missing contact information');
    }

    // ========================================
    // STEP 5: EXTRACT PREVIEW DATA
    // ========================================
    const previewData = resumeService.extractPreviewData(cleanedText);
    console.log('[UPLOAD] Preview data extracted:', previewData.name);

    // ========================================
    // STEP 6: VALIDATE RESUME CONTENT
    // ========================================
    resumeService.validateResumeContent(cleanedText);

    // ========================================
    // STEP 7: ANALYZE RESUME WITH AI
    // ========================================
    console.log('[UPLOAD] Starting AI analysis...');
    const analysis = await openaiService.analyzeResume(cleanedText);
    console.log('[UPLOAD] AI analysis complete');

    // ========================================
    // STEP 8: DEACTIVATE PREVIOUS RESUMES
    // ========================================
    await Resume.updateMany(
      { user: req.user.id, isActive: true },
      { isActive: false }
    );

    // ========================================
    // STEP 9: SAVE TO DATABASE
    // ========================================
    const resume = await Resume.create({
      user: req.user.id,
      fileName: originalname,
      filePath: '',
      fileSize: size,
      extractedText: cleanedText,
      analysis,
      isActive: true
    });

    // ========================================
    // STEP 10: UPDATE USER PROFILE
    // ========================================
    await User.findByIdAndUpdate(req.user.id, {
      resumeUploaded: true,
      skills: (analysis?.skills?.map(s => s?.name).filter(name => name && typeof name === 'string')) || [],
      experienceLevel: analysis?.experience?.level || 'fresher'
    });

    // ========================================
    // STEP 11: RETURN SUCCESS WITH PREVIEW
    // ========================================
    console.log('[UPLOAD] Resume upload successful');
    res.status(201).json({
      success: true,
      message: 'Resume uploaded and analyzed successfully',
      data: {
        resume: {
          id: resume._id,
          fileName: resume.fileName,
          analysis: resume.analysis,
          createdAt: resume.createdAt
        },
        preview: {
          detected: true,
          confidence: resumeValidation.confidence,
          name: previewData.name,
          email: previewData.email,
          skills: previewData.skills,
          previewText: previewData.preview
        }
      }
    });
  } catch (error) {
    console.error('[UPLOAD] Unhandled error:', error);

    res.status(500).json({
      success: false,
      message: 'Error uploading resume: ' + error.message,
      error: 'UPLOAD_ERROR'
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
    const { targetRole, jobDescription } = req.body;

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
      targetRole,
      jobDescription || ''
    );

    // Save job description alongside analysis
    if (jobDescription) {
      gapAnalysis.jobDescription = jobDescription;
    }

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
    const { targetRole, jobDescription } = req.body;

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
    const jd = jobDescription || resume.gapAnalysis?.jobDescription || '';

    // Optimize resume
    const optimization = await openaiService.optimizeResumeOneClick(
      resume.extractedText,
      resume.analysis,
      role,
      jd
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

    // Save structured optimized resume for preview & export
    if (optimization.optimizedResume) {
      resume.gapAnalysis.optimizedResume = {
        ...optimization.optimizedResume,
        atsScore: optimization.atsScore || { before: 0, after: 0 },
        keyChanges: optimization.keyChanges || [],
        generatedAt: new Date()
      };
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
