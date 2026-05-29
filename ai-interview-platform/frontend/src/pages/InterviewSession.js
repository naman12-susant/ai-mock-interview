import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import toast from 'react-hot-toast';
import { interviewAPI } from '../services/api';
import { Mic, MicOff, ChevronRight, CheckCircle, Clock, Volume2 } from 'lucide-react';

/* ── Physics tilt ── */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 400, damping: 30 });
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
};

const InterviewSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [evaluation, setEvaluation] = useState(null);
  const [voiceStatus, setVoiceStatus] = useState(''); // 'listening', 'processing', 'ready'
  
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);
  const transcriptRef = useRef('');
  const isRecordingRef = useRef(false);

  useEffect(() => {
    fetchInterview();
    return () => {
      cleanupRecognition();
    };
  }, [id]);

  useEffect(() => {
    setStartTime(Date.now());
    cleanupRecognition();
  }, [currentQuestionIndex]);

  const cleanupRecognition = () => {
    isRecordingRef.current = false;
    
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        // Ignore errors
      }
      recognitionRef.current = null;
    }
    
    setIsRecording(false);
    setVoiceStatus('');
    transcriptRef.current = '';
  };

  const fetchInterview = async () => {
    try {
      const response = await interviewAPI.getInterview(id);
      setInterview(response.data.interview);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview:', error);
      toast.error('Failed to load interview');
      navigate('/dashboard');
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    cleanupRecognition();
    setSubmitting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await interviewAPI.submitAnswer({
        interviewId: id,
        questionIndex: currentQuestionIndex,
        answer: answer.trim(),
        timeSpent
      });

      setEvaluation(response.data.evaluation);
      toast.success('Answer submitted successfully!');
      
      setTimeout(() => {
        if (currentQuestionIndex < interview.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setAnswer('');
          setEvaluation(null);
        } else {
          handleCompleteInterview();
        }
      }, 3000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      await interviewAPI.complete(id);
      toast.success('Interview completed!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing interview:', error);
      toast.error('Failed to complete interview');
    }
  };

  const startVoiceRecognition = async () => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast.error('Voice input not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      const recognition = new SpeechRecognition();
      
      // Optimized settings
      recognition.continuous = false; // Process in chunks for reliability
      recognition.interimResults = false; // Only final results
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('✅ Recognition started successfully');
        setVoiceStatus('listening');
        console.log('Status set to: listening');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        
        console.log('✅ Got transcript:', transcript);
        console.log('Confidence:', confidence);
        
        if (transcript && transcript.trim()) {
          // Add to transcript buffer
          transcriptRef.current += ' ' + transcript;
          
          // Update answer field
          setAnswer(prev => {
            const newAnswer = prev + ' ' + transcript;
            console.log('Updated answer:', newAnswer.trim());
            return newAnswer.trim();
          });
          
          setVoiceStatus('processing');
          console.log('Status set to: processing');
          
          // Show brief success message
          toast.success('✓ Captured: ' + transcript.substring(0, 30) + '...', { duration: 1500 });
        }
      };
      
      recognition.onerror = (event) => {
        console.error('❌ Recognition error:', event.error);
        
        // Handle critical errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.');
          cleanupRecognition();
          return;
        }
        
        if (event.error === 'audio-capture') {
          toast.error('No microphone detected. Please connect a microphone.');
          cleanupRecognition();
          return;
        }
        
        if (event.error === 'network') {
          console.log('⚠️ Network error - this is common, will retry');
          // Don't stop, let it retry
          return;
        }
        
        if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected - waiting for speech');
          // Don't stop, let it retry
          return;
        }
        
        // For other errors, log but continue
        console.log('⚠️ Non-critical error, continuing:', event.error);
      };
      
      recognition.onend = () => {
        console.log('🔄 Recognition ended');
        setVoiceStatus('ready');
        
        // Auto-restart if still recording
        if (recognitionRef.current && isRecordingRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (recognitionRef.current && isRecordingRef.current) {
              try {
                recognitionRef.current.start();
                console.log('🔄 Restarted recognition');
              } catch (error) {
                console.log('Restart error:', error.message);
                // If already started, ignore
                if (!error.message.includes('already started')) {
                  console.error('Failed to restart:', error);
                }
              }
            }
          }, 300);
        }
      };
      
      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      recognition.start();
      setIsRecording(true);
      setVoiceStatus('ready');
      
      toast.success('🎤 Voice recording started - speak clearly', { duration: 2000 });
      
    } catch (error) {
      console.error('Microphone error:', error);
      
      if (error.name === 'NotAllowedError') {
        toast.error('Microphone permission denied. Please allow access in browser settings.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No microphone found. Please connect a microphone.');
      } else {
        toast.error('Could not start voice recording. Please try again.');
      }
    }
  };

  const stopVoiceRecognition = () => {
    cleanupRecognition();
    
    if (transcriptRef.current.trim()) {
      toast.success('✓ Voice recording stopped', { duration: 1500 });
    } else {
      toast('Recording stopped', { duration: 1500 });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopVoiceRecognition();
    } else {
      startVoiceRecognition();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Interview not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = interview.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-8 transition-colors duration-300 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div
        animate={{ 
          y: [0, -30, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-green-100/30 to-emerald-100/30 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full blur-3xl"
      ></motion.div>
      <motion.div
        animate={{ 
          y: [0, 30, 0],
          rotate: [360, 180, 0],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-yellow-100/30 to-amber-100/30 dark:from-pink-500/20 dark:to-orange-500/20 rounded-full blur-3xl"
      ></motion.div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <motion.h1 
              className="text-3xl font-black text-gray-900 dark:text-white"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              {interview.role} Interview
            </motion.h1>
            <motion.div 
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-800"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-5 h-5 text-green-600 dark:text-blue-400" />
              </motion.div>
              <span className="font-bold text-gray-900 dark:text-white">
                Question {currentQuestionIndex + 1} of {interview.questions.length}
              </span>
            </motion.div>
          </div>
          
          {/* Progress Bar */}
          <motion.div 
            className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 shadow-inner overflow-hidden"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-blue-500 dark:to-purple-600 h-3 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
              ></motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!evaluation ? (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, rotateY: -90, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, rotateY: 90, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-6"
              style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}
            >
              {/* Question Card */}
              <TiltCard>
              <motion.div 
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-gray-100 dark:border-gray-800 relative overflow-hidden"
                whileHover={{ y: -4 }}
              >
                {/* Animated Background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 dark:from-blue-500/10 dark:to-purple-500/10"
                  animate={{ 
                    backgroundPosition: ['0% 0%', '100% 100%'],
                  }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
                ></motion.div>

                <div className="relative flex items-start gap-4 mb-6">
                  <motion.div 
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-blue-500 dark:to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                    whileHover={{ rotate: 360, scale: 1.2 }}
                    transition={{ duration: 0.6 }}
                    animate={{ 
                      boxShadow: [
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                        '0 0 40px rgba(16, 185, 129, 0.5)',
                        '0 0 20px rgba(16, 185, 129, 0.3)',
                      ],
                    }}
                  >
                    <span className="text-white font-black text-lg">{currentQuestionIndex + 1}</span>
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <motion.span 
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          currentQuestion.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          currentQuestion.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        }`}
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        {currentQuestion.difficulty}
                      </motion.span>
                      <motion.span 
                        className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        whileHover={{ scale: 1.1, y: -2 }}
                      >
                        {currentQuestion.category}
                      </motion.span>
                    </div>
                    <motion.h2 
                      className="text-2xl font-black text-gray-900 dark:text-white leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {currentQuestion.question}
                    </motion.h2>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                      Your Answer
                    </label>
                    {isRecording && (
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/30 rounded-full border-2 border-red-200 dark:border-red-800"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <div className="flex gap-1">
                          <motion.div 
                            className="w-1 h-3 bg-red-500 rounded"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                          ></motion.div>
                          <motion.div 
                            className="w-1 h-4 bg-red-500 rounded"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                          ></motion.div>
                          <motion.div 
                            className="w-1 h-3 bg-red-500 rounded"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                          ></motion.div>
                        </div>
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          {voiceStatus === 'listening' && '🎤 Listening...'}
                          {voiceStatus === 'processing' && '⚡ Processing...'}
                          {voiceStatus === 'ready' && '✓ Ready'}
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your answer here or use voice input..."
                    className="w-full h-48 px-4 py-3 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-green-500 dark:focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                    disabled={submitting}
                    whileFocus={{ scale: 1.01 }}
                  />

                  {/* Voice Input Instructions */}
                  <AnimatePresence>
                    {isRecording && (
                      <motion.div 
                        className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className="flex items-start gap-3">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          </motion.div>
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-bold mb-2">Voice Recording Active:</p>
                            <ul className="space-y-1 ml-2">
                              <li>• Speak clearly and naturally</li>
                              <li>• Pause briefly between sentences</li>
                              <li>• Your words will appear above</li>
                              <li>• Click "Stop Recording" when done</li>
                            </ul>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Controls */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <motion.button
                      onClick={toggleRecording}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                        isRecording
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                      disabled={submitting}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-5 h-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-5 h-5" />
                          Start Voice Input
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      onClick={handleSubmitAnswer}
                      disabled={submitting || !answer.trim()}
                      className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 dark:from-blue-500 dark:to-purple-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 dark:hover:from-blue-600 dark:hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {submitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Answer
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
              </TiltCard>
            </motion.div>
          ) : (
            <TiltCard>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotateX: -30 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border-2 border-gray-100 dark:border-gray-800 relative overflow-hidden"
            >
              {/* Animated Background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>

              <div className="relative text-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle className="w-20 h-20 text-green-500 dark:text-green-400 mx-auto mb-4" />
                </motion.div>
                <motion.h2 
                  className="text-3xl font-black text-gray-900 dark:text-white mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Answer Submitted!
                </motion.h2>
                <motion.div
                  className="inline-block"
                  whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-5xl font-black bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                    {evaluation.score}/10
                  </p>
                </motion.div>
              </div>

              <div className="relative space-y-6">
                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-4"
                  >
                    <h3 className="font-black text-green-700 dark:text-green-400 mb-3 text-lg">✓ Strengths:</h3>
                    <ul className="space-y-2">
                      {evaluation.strengths.map((strength, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                          <span>{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}

                {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4"
                  >
                    <h3 className="font-black text-blue-700 dark:text-blue-400 mb-3 text-lg">💡 Suggestions:</h3>
                    <ul className="space-y-2">
                      {evaluation.suggestions.map((suggestion, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + idx * 0.1 }}
                        >
                          <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                          <span>{suggestion}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>

              <motion.p 
                className="relative text-center text-gray-500 dark:text-gray-400 mt-8 font-medium"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Moving to next question...
              </motion.p>
            </motion.div>
            </TiltCard>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewSession;
