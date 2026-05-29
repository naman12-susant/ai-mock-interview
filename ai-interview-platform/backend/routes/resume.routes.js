const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { upload, handleMulterError } = require('../middleware/upload.middleware');
const resumeController = require('../controllers/resume.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Resume Upload & Management Routes
router.post(
  '/upload',
  upload.single('resume'),
  handleMulterError,
  resumeController.uploadResume
);

router.get('/active', resumeController.getActiveResume);
router.get('/all', resumeController.getAllResumes);
router.delete('/:id', resumeController.deleteResume);

// AI Resume Gap Analysis & ATS Optimization Routes
router.post('/gap-analysis', resumeController.performGapAnalysis);
router.get('/gap-analysis', resumeController.getGapAnalysis);
router.post('/rewrite-section', resumeController.rewriteSection);
router.get('/industry-skills', resumeController.getIndustrySkills);
router.post('/optimize', resumeController.optimizeResume);
router.get('/score', resumeController.getResumeScore);

module.exports = router;
