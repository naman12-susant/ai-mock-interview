import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { interviewAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Briefcase, Loader, AlertCircle, Sliders } from 'lucide-react';
import InterviewModeModal from '../components/InterviewModeModal';

const NewInterview = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    type: 'mixed',
    difficulty: ''
  });
  const [isOtherRole, setIsOtherRole] = useState(false);
  const [customRole, setCustomRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [checkingResume, setCheckingResume] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [createdInterviewId, setCreatedInterviewId] = useState(null);

  // Check if user has an active resume
  useEffect(() => {
    const checkResume = async () => {
      try {
        const response = await interviewAPI.checkResume();
        setHasResume(response.data.hasResume);
      } catch (error) {
        console.error('Error checking resume:', error);
        setHasResume(false);
      } finally {
        setCheckingResume(false);
      }
    };
    checkResume();
  }, []);

  const roles = [
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'Software Engineer',
    'Other'
  ];

  const interviewTypes = [
    { value: 'technical', label: 'Technical Only', description: 'Focus on technical skills and coding' },
    { value: 'behavioral', label: 'Behavioral Only', description: 'Focus on soft skills and experience' },
    { value: 'mixed', label: 'Mixed Interview', description: 'Combination of technical and behavioral' }
  ];

  const difficulties = [
    { value: '', label: 'Adaptive Progression ✨', description: 'Dynamically scales difficulty based on your past performance' },
    { value: 'startup', label: 'Startup Style', description: 'Fast-paced, MVP focus, wear-many-hats' },
    { value: 'faang', label: 'FAANG Style', description: 'Scalability, deep algorithms & system design' },
    { value: 'beginner', label: 'Beginner', description: 'Foundational concepts and basic syntax' },
    { value: 'intermediate', label: 'Intermediate', description: 'Design patterns, debugging, and architectures' },
    { value: 'advanced', label: 'Advanced', description: 'Low-level optimization, concurrency, and resilience' }
  ];

  const setField = (name, value) => {
    if (name === 'role') {
      if (value === 'Other') {
        setIsOtherRole(true);
        setCustomRole('');
        setFormData(prev => ({ ...prev, role: '' }));
        return;
      } else {
        setIsOtherRole(false);
        setCustomRole('');
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Derive the effective role for submission
  const effectiveRole = isOtherRole ? customRole.trim() : formData.role;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!effectiveRole) {
      toast.error(isOtherRole ? 'Please enter your custom role' : 'Please select a role');
      return;
    }

    if (!hasResume) {
      toast.error('Please upload a resume first');
      navigate('/dashboard');
      return;
    }

    setLoading(true);

    try {
      const response = await interviewAPI.create({
        role: effectiveRole,
        type: formData.type,
        difficulty: formData.difficulty
      });

      toast.success('Interview created successfully!');
      setCreatedInterviewId(response.data.interview.id);
      setShowModal(true);
    } catch (error) {
      console.error('Create interview error:', error);
      // The API interceptor returns error.response.data directly
      const msg = error?.message || error?.error || 'Failed to create interview. Please try again.';
      if (msg.toLowerCase().includes('resume')) {
        toast.error('Please upload a resume first');
        navigate('/resume');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page text-text py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Start New Interview
          </h1>
          <p className="text-lg opacity-75">
            Choose your role, difficulty, and type to get fully personalized, AIRA-generated questions
          </p>
        </div>

        {/* Resume Warning */}
        {!checkingResume && !hasResume && (
          <div className="mb-6 bg-cta/10 border border-cta/35 rounded-xl p-4 flex items-start space-x-3 text-text">
            <AlertCircle className="w-5 h-5 text-cta flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-cta">Resume Required</h3>
              <p className="text-sm opacity-80 mt-1">
                You need to upload a resume first to generate personalized interview questions.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-3 inline-block px-4 py-2 bg-cta text-white rounded hover:opacity-90 transition text-sm font-medium"
              >
                Go to Dashboard & Upload Resume
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-surface rounded-2xl border border-accent/25 dark:border-gray-800 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Role Selection */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                Select Your Role
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => {
                  const isSelected = role === 'Other' ? isOtherRole : (!isOtherRole && formData.role === role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setField('role', role)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-brand bg-brand/10 shadow-sm'
                          : 'border-accent/15 dark:border-gray-800 hover:border-brand/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Briefcase className={`w-5 h-5 ${
                          isSelected ? 'text-brand' : 'text-text/50'
                        }`} />
                        <span className={`font-medium ${
                          isSelected ? 'text-brand' : 'text-text/85'
                        }`}>
                          {role}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Role Input */}
            {isOtherRole && (
              <div>
                <label className="block text-sm opacity-75 mb-2">
                  Enter Your Role
                </label>
                <input
                  type="text"
                  value={customRole}
                  autoFocus
                  placeholder="e.g., Machine Learning Engineer"
                  className="w-full px-4 py-3 border border-accent/35 dark:border-gray-700 bg-page text-text rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all"
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Interview Type Selection */}
            <div>
              <label className="block text-lg font-semibold mb-4">
                Interview Type
              </label>
              <div className="space-y-3">
                {interviewTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-brand bg-brand/10 shadow-sm'
                        : 'border-accent/15 dark:border-gray-800 hover:border-brand/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setField('type', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <div className={`font-semibold ${
                        formData.type === type.value ? 'text-brand' : 'text-text'
                      }`}>
                        {type.label}
                      </div>
                      <div className="text-sm opacity-75 mt-1">
                        {type.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty/Style Selection */}
            <div>
              <label className="block text-lg font-semibold mb-4 flex items-center">
                <Sliders className="w-5 h-5 mr-2 text-brand" />
                Interview Difficulty / Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {difficulties.map((diff) => (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => setField('difficulty', diff.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.difficulty === diff.value
                        ? 'border-brand bg-brand/10 shadow-sm'
                        : 'border-accent/15 dark:border-gray-800 hover:border-brand/40'
                    }`}
                  >
                    <div>
                      <span className={`font-semibold block ${
                        formData.difficulty === diff.value ? 'text-brand' : 'text-text'
                      }`}>
                        {diff.label}
                      </span>
                      <span className="text-xs opacity-60 mt-1 block">
                        {diff.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 border-t border-accent/15 dark:border-gray-800 pt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3 px-6 border-2 border-accent/30 text-text rounded-lg hover:bg-surface transition font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !effectiveRole || !hasResume}
                className="flex-1 py-3 px-6 btn-brand text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating Interview...</span>
                  </>
                ) : !hasResume ? (
                  <span>Upload Resume First</span>
                ) : (
                  <span>Start Interview</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-accent/10 border border-accent/25 rounded-lg p-6">
          <h3 className="font-semibold text-brand mb-2 flex items-center gap-1.5">📝 What to Expect:</h3>
          <ul className="space-y-2 opacity-80 text-sm">
            <li>• AIRA will generate 10 personalized questions based on your role, resume, and difficulty style</li>
            <li>• You can answer using voice or text</li>
            <li>• Get instant feedback and scores for each answer</li>
            <li>• Review your performance at the end</li>
          </ul>
        </div>
      </div>

      <InterviewModeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectPractice={() => navigate(`/practice-interview/${createdInterviewId}`)}
        onSelectLive={() => navigate(`/live-ai-interview/${createdInterviewId}`)}
      />
    </div>
  );
};

export default NewInterview;
