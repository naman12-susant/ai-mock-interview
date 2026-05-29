import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUploader from '../components/ResumeUploader';
import { resumeAPI } from '../services/api';
import toast from 'react-hot-toast';
import { FileText, Trash2, CheckCircle, Loader, Target, Zap, LayoutDashboard } from 'lucide-react';

// New AI Components
import ResumeScoreCard from '../components/resume/ResumeScoreCard';
import SkillGapAnalysis from '../components/resume/SkillGapAnalysis';
import ATSChecker from '../components/resume/ATSChecker';
import AISuggestionsPanel from '../components/resume/AISuggestionsPanel';

const ResumePage = () => {
  const navigate = useNavigate();
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Gap Analysis State
  const [targetRole, setTargetRole] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'dashboard'

  useEffect(() => {
    fetchActiveResume();
  }, []);

  const fetchActiveResume = async () => {
    try {
      const response = await resumeAPI.getActive();
      const resume = response.data.resume;
      setActiveResume(resume);
      if (resume.gapAnalysis?.targetRole) {
        setTargetRole(resume.gapAnalysis.targetRole);
        setActiveTab('dashboard');
      }
    } catch (error) {
      if (error.message !== 'No active resume found') {
        console.error('Fetch resume error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (resume) => {
    setActiveResume(resume);
    setActiveTab('overview');
    toast.success('Resume uploaded successfully!');
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await resumeAPI.delete(activeResume._id);
      setActiveResume(null);
      setTargetRole('');
      setActiveTab('overview');
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handlePerformAnalysis = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target job role first');
      return;
    }
    setIsAnalyzing(true);
    try {
      const response = await resumeAPI.performGapAnalysis({ targetRole });
      setActiveResume(prev => ({ ...prev, gapAnalysis: response.data.gapAnalysis }));
      setActiveTab('dashboard');
      toast.success('AI Gap analysis completed!');
    } catch (error) {
      toast.error(error.message || 'Failed to perform gap analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOptimizeResume = async () => {
    if (!activeResume?.gapAnalysis) {
      toast.error('Please run Gap Analysis first');
      return;
    }
    setIsOptimizing(true);
    try {
      await resumeAPI.optimizeResume({ targetRole });
      await fetchActiveResume();
      toast.success('One-Click Optimization complete!');
    } catch (error) {
      toast.error(error.message || 'Failed to optimize resume');
    } finally {
      setIsOptimizing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Resume & AI Analysis</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your resume, analyze skill gaps, and optimize for Applicant Tracking Systems (ATS).
          </p>
        </div>

        {!activeResume ? (
          /* No Resume - Upload Form */
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-primary-600 dark:text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Upload Your Resume
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Get started by uploading your PDF resume. Our AI will automatically parse your experience, skills, and projects.
              </p>
            </div>
            <ResumeUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Active Resume Mini-Header */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                    {activeResume.fileName}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Active • Uploaded {new Date(activeResume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/interview/new')}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Start Interview
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="Delete Resume"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AI Gap Analysis Control Panel */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full">
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Target Role Analysis
                </h3>
                <p className="text-blue-100 text-sm mb-4">
                  Enter the job title you are applying for to generate a personalized skill gap and ATS analysis.
                </p>
                <div className="flex gap-3 max-w-lg">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Frontend Developer, AI Engineer..."
                    className="flex-1 px-4 py-2 rounded-lg text-gray-900 dark:bg-white border-0 focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handlePerformAnalysis}
                    disabled={isAnalyzing || !targetRole.trim()}
                    className="px-6 py-2 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition disabled:opacity-70 flex items-center"
                  >
                    {isAnalyzing ? (
                      <><Loader className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
                    ) : 'Analyze Gap'}
                  </button>
                </div>
              </div>

              {activeResume.gapAnalysis && (
                <div className="w-full md:w-auto flex flex-col items-center md:border-l md:border-blue-500/50 md:pl-8">
                  <button
                    onClick={handleOptimizeResume}
                    disabled={isOptimizing}
                    className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-white font-bold rounded-xl shadow-md transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-70"
                  >
                    {isOptimizing ? (
                      <><Loader className="w-5 h-5 mr-2 animate-spin" /> Optimizing...</>
                    ) : (
                      <><Zap className="w-5 h-5 mr-2 fill-current" /> One-Click Optimize</>
                    )}
                  </button>
                  <p className="text-xs text-blue-200 mt-3 text-center max-w-[200px]">
                    Auto-improves phrasing, ATS keywords, and weak sections.
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            {activeResume.gapAnalysis && (
              <div className="flex space-x-1 bg-gray-200/50 dark:bg-gray-800 p-1 rounded-xl w-full max-w-md">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Analysis Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex-1 flex items-center justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'overview'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Raw Extraction
                </button>
              </div>
            )}

            {/* Content Area */}
            {activeTab === 'dashboard' && activeResume.gapAnalysis ? (
              <div className="space-y-6">
                <ResumeScoreCard gapAnalysis={activeResume.gapAnalysis} />
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <SkillGapAnalysis gapAnalysis={activeResume.gapAnalysis} />
                  <div className="space-y-6">
                    <ATSChecker atsAnalysis={activeResume.gapAnalysis.atsAnalysis} />
                    <AISuggestionsPanel suggestions={activeResume.gapAnalysis.aiSuggestions} />
                  </div>
                </div>

                {/* Optimized Sections Box (if available) */}
                {activeResume.gapAnalysis.improvedSections?.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30 p-6 sm:p-8">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Zap className="w-6 h-6 mr-2 text-green-500 fill-current" />
                      AI Optimized Sections
                    </h2>
                    <div className="space-y-6">
                      {activeResume.gapAnalysis.improvedSections.map((section, idx) => (
                        <div key={idx} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                          <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full mb-3 uppercase">
                            {section.section}
                          </span>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Original</p>
                              <div className="p-3 bg-white dark:bg-gray-900 rounded-lg text-sm text-gray-600 dark:text-gray-400 line-through opacity-70">
                                {section.original}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-green-600 dark:text-green-500 uppercase tracking-wider mb-2">Optimized</p>
                              <div className="p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg text-sm text-gray-900 dark:text-gray-100">
                                {section.improved}
                              </div>
                            </div>
                          </div>
                          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 italic">
                            <span className="font-semibold not-italic">Why this is better: </span>
                            {section.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Raw Extraction Overview (Original View) */
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-gray-400" />
                  Extracted Data Overview
                </h3>
                <div className="space-y-8">
                  {/* Skills */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Skills Identified</h4>
                    <div className="flex flex-wrap gap-2">
                      {activeResume.analysis?.skills?.map((skill, index) => (
                        <span key={index} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700">
                          {skill.name} <span className="text-xs text-gray-400 ml-1">({skill.category})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Experience */}
                    {activeResume.analysis?.experience && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Experience</h4>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                          <p className="text-gray-900 dark:text-white mb-2">
                            <span className="text-gray-500 dark:text-gray-400 w-20 inline-block">Level:</span>
                            <span className="font-medium capitalize">{activeResume.analysis.experience.level}</span>
                          </p>
                          {activeResume.analysis.experience.years && (
                            <p className="text-gray-900 dark:text-white">
                              <span className="text-gray-500 dark:text-gray-400 w-20 inline-block">Years:</span>
                              <span className="font-medium">{activeResume.analysis.experience.years}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Summary */}
                    {activeResume.analysis?.summary && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Professional Summary</h4>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {activeResume.analysis.summary}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePage;
