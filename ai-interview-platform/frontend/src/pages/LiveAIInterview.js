import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { interviewAPI } from '../services/api';
import { Mic, MicOff, Volume2, VolumeX, MessageSquare, Play, Loader2, Sparkles, LogOut, SkipForward, ArrowRight, CheckCircle } from 'lucide-react';
import interviewerAvatar from '../assets/ai_interviewer_avatar.png';

const LiveAIInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswerText, setUserAnswerText] = useState('');
  
  // Conversation Flow State
  const [aiState, setAiState] = useState('initializing'); // 'initializing', 'intro', 'speaking', 'listening', 'thinking', 'completed'
  const [isFollowUpPhase, setIsFollowUpPhase] = useState(false);
  const [currentPromptQuestion, setCurrentPromptQuestion] = useState('');
  const [answersBuffer, setAnswersBuffer] = useState({ main: '', followUp: '' });
  const [hasIntroPlayed, setHasIntroPlayed] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] = useState(false);
  const [interimSpeechText, setInterimSpeechText] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [greetingText, setGreetingText] = useState('');
  
  // Settings
  const [isTtsMuted, setIsTtsMuted] = useState(false);
  const [speechVolume] = useState(0.9);
  
  // Timers and Refs
  const [timeSpent, setTimeSpent] = useState(0);
  const timerIntervalRef = useRef(null);
  const currentUtteranceRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const restartTimeoutRef = useRef(null);
  const lastProcessedFinalIndexRef = useRef(-1);

  useEffect(() => {
    fetchInterview();
    // Preload voices for TTS — some browsers need this event to populate the voice list
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      stopSpeaking();
      stopVoiceRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // User-triggered start interview session (guarantees user gesture for TTS and precise timer)
  const startInterviewSession = () => {
    setHasStarted(true);
    setIsWaitingForConfirmation(true);

    // Start timer only when user explicitly connects
    timerIntervalRef.current = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    const introText = greetingText || `Hello, I'm AIRA, and I'll be conducting your interview today for the ${interview.role || 'this position'} role. We'll begin with a few technical and problem-solving questions. Try to answer naturally, just as you would in a real interview. Are you ready to begin?`;
    setCurrentPromptQuestion("Are you ready to begin?");
    setAiState('intro');
    speakText(introText, () => {
      setAiState('listening');
      startVoiceRecognition();
    });
  };

  // Speak new question when active question changes (skip index 0 if intro hasn't played yet)
  useEffect(() => {
    if (interview && interview.questions.length > 0 && hasIntroPlayed && currentQuestionIndex > 0) {
      const q = interview.questions[currentQuestionIndex];
      setCurrentPromptQuestion(q.question);
      setIsFollowUpPhase(false);
      setAnswersBuffer({ main: '', followUp: '' });
      setUserAnswerText('');
      setInterimSpeechText('');
      setConversationHistory(prev => [...prev, { role: 'AIRA', content: `Question ${currentQuestionIndex + 1}. ${q.question}` }]);
      lastProcessedFinalIndexRef.current = -1;
      
      // Start speaking the main question
      speakText(`Question ${currentQuestionIndex + 1}. ${q.question}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  const fetchInterview = async () => {
    try {
      const response = await interviewAPI.getInterview(id);
      const fetchedInterview = response.data.interview;
      setInterview(fetchedInterview);
      
      // Fetch dynamic greeting
      try {
        const greetingRes = await interviewAPI.getLiveGreeting({
          role: fetchedInterview.role,
          interviewType: fetchedInterview.type
        });
        if (greetingRes.data && greetingRes.data.greeting) {
          setGreetingText(greetingRes.data.greeting);
        }
      } catch (e) {
        console.error('Failed to fetch dynamic greeting:', e);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching interview:', error);
      toast.error('Failed to load live interview');
      navigate('/dashboard');
    }
  };

  // Text-To-Speech (AIRA Speaking) — with female voice preference
  const speakText = (text, onFinishCallback) => {
    stopSpeaking();
    stopVoiceRecognition();

    if (isTtsMuted) {
      setAiState('listening');
      startVoiceRecognition();
      if (onFinishCallback) onFinishCallback();
      return;
    }

    setAiState('speaking');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = speechVolume;
    utterance.rate = 0.95;
    utterance.pitch = 1.1; // Slightly higher pitch for feminine voice
    
    // Choose a female voice — prioritize Google UK English Female or similar
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.includes('Google UK English Female')
    ) || voices.find(voice => 
      voice.lang.includes('en') && (voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') || voice.name.includes('Zira') || voice.name.includes('Samantha') || voice.name.includes('Karen') || voice.name.includes('Moira') || voice.name.includes('Fiona'))
    ) || voices.find(voice =>
      voice.lang.includes('en') && (voice.name.includes('Google') || voice.name.includes('Natural'))
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      if (onFinishCallback) {
        onFinishCallback();
      } else {
        setAiState('listening');
        // Automatically start capturing answer
        startVoiceRecognition();
      }
    };

    utterance.onerror = (e) => {
      console.error('TTS error:', e);
      if (onFinishCallback) {
        onFinishCallback();
      } else {
        setAiState('listening');
        startVoiceRecognition();
      }
    };

    currentUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    currentUtteranceRef.current = null;
  };

  // Speech Recognition (AI Listening) — Robust continuous capture
  // Uses a precise final-index tracker to allow fluid continuous voice capture 
  // while fully supporting manual typing modifications.
  const startVoiceRecognition = () => {
    stopSpeaking(); // Interrupt speaking if active

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser.');
      toast.error('Your browser does not support speech recognition. Please use Chrome.');
      return;
    }

    if (isRecordingRef.current) return;

    lastProcessedFinalIndexRef.current = -1;
    setInterimSpeechText('');

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;        // Keep listening without stopping
      recognition.interimResults = true;     // Show live preview as user speaks
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isRecordingRef.current = true;
        console.log('[SpeechRecognition] Started');
      };

      recognition.onresult = (event) => {
        let newFinals = [];
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            if (i > lastProcessedFinalIndexRef.current) {
              newFinals.push(result[0].transcript);
              lastProcessedFinalIndexRef.current = i;
            }
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (newFinals.length > 0) {
          const joinedFinals = newFinals.join(' ');
          setUserAnswerText(prev => {
            const trimmed = prev.trim();
            return trimmed ? trimmed + ' ' + joinedFinals : joinedFinals;
          });
          setInterimSpeechText('');
          
          // Show a subtle toast when a final chunk is confirmed
          const snippet = newFinals[0].trim().substring(0, 40);
          toast.success('✓ ' + snippet + (newFinals[0].length >= 40 ? '...' : ''), { duration: 1200, id: 'speech-capture' });
        } else {
          setInterimSpeechText(currentInterim);
        }
      };

      recognition.onerror = (e) => {
        console.error('[SpeechRecognition] Error:', e.error);

        // Only fatal errors that we should NOT auto-restart on
        const fatalErrors = ['not-allowed', 'aborted', 'service-not-allowed'];
        if (fatalErrors.includes(e.error)) {
          if (e.error === 'not-allowed') {
            toast.error('Microphone permission denied. Please allow microphone access.', { duration: 4000 });
          }
          return;
        }

        // For non-fatal errors (no-speech, network, audio-capture), we let onend handle auto-restart
        console.warn(`[SpeechRecognition] Non-fatal error "${e.error}", will auto-restart...`);
      };

      recognition.onend = () => {
        console.log('[SpeechRecognition] Ended, isRecording:', isRecordingRef.current);
        
        // Flush any remaining interim text into the final answer buffer before clearing it
        setInterimSpeechText(prevInterim => {
          if (prevInterim && prevInterim.trim() !== '') {
            setUserAnswerText(prevUser => {
              const trimmed = prevUser.trim();
              return trimmed ? trimmed + ' ' + prevInterim.trim() : prevInterim.trim();
            });
          }
          return '';
        });

        // Auto-restart if we are still supposed to be listening
        if (isRecordingRef.current) {
          restartTimeoutRef.current = setTimeout(() => {
            if (isRecordingRef.current && recognitionRef.current) {
              try {
                // Reset index tracker for the new session
                lastProcessedFinalIndexRef.current = -1;
                recognitionRef.current.start();
                console.log('[SpeechRecognition] Auto-restarted');
              } catch (err) {
                if (!err.message?.includes('already started')) {
                  console.error('[SpeechRecognition] Failed to restart:', err);
                  // Create a fresh instance if old one is broken
                  recognitionRef.current = null;
                  isRecordingRef.current = false;
                  setTimeout(() => startVoiceRecognition(), 500);
                }
              }
            }
          }, 200);
        }
      };

      recognitionRef.current = recognition;
      isRecordingRef.current = true;
      recognition.start();
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      toast.error('Failed to start microphone. Check browser permissions.');
    }
  };

  const stopVoiceRecognition = () => {
    isRecordingRef.current = false;
    setInterimSpeechText('');
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Form Submission & Live Flow Handlers
  const handleSendResponse = async () => {
    // Capture final text by combining committed and interim speech
    const answer = (userAnswerText + (interimSpeechText ? (userAnswerText.trim() ? ' ' : '') + interimSpeechText : '')).trim();

    if (!answer) {
      toast.error("Please say or type something as your answer.");
      return;
    }

    stopSpeaking();
    stopVoiceRecognition();

    if (isWaitingForConfirmation) {
      const lowerAnswer = answer.toLowerCase();
      const isPositive = lowerAnswer.includes('yes') || lowerAnswer.includes('ready') || lowerAnswer.includes('sure') || lowerAnswer.includes('start') || lowerAnswer.includes('yeah') || lowerAnswer.includes('ok') || lowerAnswer.includes('begin') || lowerAnswer.includes('fine') || lowerAnswer.includes('go') || lowerAnswer.includes('ready');

      if (isPositive) {
        setIsWaitingForConfirmation(false);
        setHasIntroPlayed(true);
        setUserAnswerText('');
        setInterimSpeechText('');
        
        // Start first question
        const q = interview.questions[0];
        setCurrentPromptQuestion(q.question);
        setIsFollowUpPhase(false);
        setAnswersBuffer({ main: '', followUp: '' });
        setConversationHistory([{ role: 'AIRA', content: `Question 1. ${q.question}` }]);
        lastProcessedFinalIndexRef.current = -1;
        speakText(`Excellent! Let's begin. Question 1. ${q.question}`);
      } else {
        // If not ready, she says something friendly and continues listening
        setUserAnswerText('');
        setInterimSpeechText('');
        setAiState('speaking');
        speakText("No problem. Take your time. Tell me when you are ready to begin by saying yes or ready.", () => {
          setAiState('listening');
          startVoiceRecognition();
        });
      }
      return;
    }

    setAiState('thinking');

    if (!isFollowUpPhase) {
      // 1. Process Main Answer and Fetch AI Follow-up
      try {
        const currentHistory = [...conversationHistory, { role: 'Candidate', content: answer }];
        setConversationHistory(currentHistory);

        // Determine interview round based on progress
        const progress = currentQuestionIndex / interview.questions.length;
        let round = 'Technical Round';
        if (progress < 0.2) round = 'Warm-up';
        else if (progress > 0.6 && progress < 0.8) round = 'Pressure Round';
        else if (progress >= 0.8) round = 'Closing Round';

        const response = await interviewAPI.getLiveChatReply({
          role: interview.role,
          difficulty: interview.difficulty || 'intermediate',
          currentQuestion: currentPromptQuestion,
          userAnswer: answer,
          conversationHistory: currentHistory,
          interviewRound: round
        });

        const replyData = response.data;
        setAnswersBuffer(prev => ({ ...prev, main: answer }));
        setIsFollowUpPhase(true);
        setCurrentPromptQuestion(replyData.followUpQuestionOnly);
        setUserAnswerText('');
        setInterimSpeechText('');
        // Track score and classification in conversation history for adaptive difficulty
        setConversationHistory(prev => [...prev, { 
          role: 'AIRA', 
          content: replyData.response,
          score: replyData.score,
          classification: replyData.classification 
        }]);

        // Add an artificial "thinking" pause if it's the pressure or technical round to simulate realism
        const pauseMs = (round === 'Pressure Round' || round === 'Technical Round') ? 2500 : 500;
        setTimeout(() => {
          speakText(replyData.response);
        }, pauseMs);
        
      } catch (err) {
        console.error('Follow-up generation error:', err);
        // Fallback: Skip follow-up phase and submit main answer directly
        toast.error("Failed to generate follow-up. Proceeding to evaluation.");
        submitFinalAnswerToBackend(answer);
      }
    } else {
      // 2. Process Follow-up Answer and Submit combined response for grading
      setConversationHistory(prev => [...prev, { role: 'Candidate', content: answer }]);
      const combinedResponse = `Main Answer: ${answersBuffer.main} | Follow-up Answer: ${answer}`;
      submitFinalAnswerToBackend(combinedResponse);
    }
  };

  const submitFinalAnswerToBackend = async (finalAnswerContent) => {
    try {
      await interviewAPI.submitAnswer({
        interviewId: id,
        questionIndex: currentQuestionIndex,
        answer: finalAnswerContent,
        timeSpent: Math.floor(timeSpent / interview.questions.length)
      });

      toast.success('Response successfully evaluated!');
      
      // Move to next question or complete interview
      if (currentQuestionIndex < interview.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleCompleteInterview();
      }
    } catch (err) {
      console.error('Evaluation submission error:', err);
      toast.error('Failed to submit answer for evaluation.');
      setAiState('listening');
    }
  };

  const handleCompleteInterview = async () => {
    setAiState('completed');
    stopSpeaking();
    stopVoiceRecognition();
    try {
      await interviewAPI.complete(id);
      toast.success('AIRA Live Interview completed successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing live interview:', error);
      toast.error('Failed to complete live interview');
      navigate('/dashboard');
    }
  };

  const handleSkipQuestion = () => {
    stopSpeaking();
    stopVoiceRecognition();
    if (currentQuestionIndex < interview.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteInterview();
    }
  };

  const toggleTtsMute = () => {
    if (isTtsMuted) {
      setIsTtsMuted(false);
      // Speak the prompt again to resume voice output
      speakText(currentPromptQuestion);
    } else {
      setIsTtsMuted(true);
      stopSpeaking();
      setAiState('listening');
      startVoiceRecognition();
    }
  };

  const toggleMicrophone = () => {
    if (isRecordingRef.current) {
      stopVoiceRecognition();
      setAiState('speaking'); // stop waves
    } else {
      setAiState('listening');
      startVoiceRecognition();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-page flex flex-col items-center justify-center text-text">
        <Loader2 className="w-12 h-12 animate-spin text-brand mb-4" />
        <p className="opacity-75 font-medium animate-pulse">Initializing AIRA Live Interview Room...</p>
      </div>
    );
  }

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStatusMessage = () => {
    switch (aiState) {
      case 'initializing': return 'AIRA is getting ready...';
      case 'intro': return 'AIRA is introducing herself...';
      case 'speaking': return 'AIRA is speaking...';
      case 'listening': return 'AIRA is listening. Speak clearly...';
      case 'thinking': return 'AIRA is analyzing your response...';
      case 'completed': return 'Interview complete! Great job!';
      default: return 'AIRA Live Interview Room';
    }
  };

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center text-text p-4 relative overflow-hidden">
        {/* Dynamic Glowing Neons */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-surface border border-accent/20 dark:border-gray-800 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl"
        >
          {/* Glowing Avatar Placeholder */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-brand/35 rounded-full blur-xl animate-pulse"></div>
              <div className="w-24 h-24 rounded-full flex items-center justify-center relative border border-brand/50 overflow-hidden">
                <img src={interviewerAvatar} alt="AIRA" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/35 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3 animate-pulse" /> Virtual Lobby
            </span>
            <h1 className="text-3xl font-black tracking-tight mb-2">Connect with AIRA</h1>
            <p className="opacity-75 text-sm">
              Your AI Interview Assistant is ready to conduct your live session.
            </p>
          </div>

          {/* Session details */}
          <div className="bg-page/50 border border-accent/25 dark:border-gray-800 rounded-2xl p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="opacity-60 font-medium">Role:</span>
              <span className="font-bold text-text">{interview.role}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60 font-medium">Style / Difficulty:</span>
              <span className="font-bold text-brand capitalize">{interview.difficulty || 'Intermediate'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60 font-medium">Interview Type:</span>
              <span className="font-bold text-accent capitalize">{interview.type}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-60 font-medium">Total Questions:</span>
              <span className="font-bold text-text">{interview.questions.length} Questions</span>
            </div>
          </div>

          {/* Audio Setup Instructions */}
          <div className="border-t border-accent/15 dark:border-gray-800/80 pt-5 mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider opacity-70 mb-3 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-brand animate-pulse" /> Microphone Check:
            </h3>
            <ul className="text-xs opacity-75 space-y-1.5 list-disc pl-4">
              <li>Please use a quiet environment for best voice capture.</li>
              <li>Ensure your microphone is enabled and permission is granted.</li>
              <li>Wear headphones to prevent audio feedback or echo.</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={startInterviewSession}
            className="w-full py-4 bg-gradient-to-r from-brand to-accent hover:opacity-95 text-white dark:text-gray-900 rounded-2xl font-black shadow-lg shadow-brand/20 transition duration-300 flex items-center justify-center gap-2.5 active:scale-[0.98] text-base"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Connect & Start Interview</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page py-8 px-4 flex flex-col justify-between text-text relative overflow-hidden">
      {/* Dynamic Glowing Neons */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand/10 rounded-full blur-3xl pointer-events-none hidden md:block"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none hidden sm:block"></div>

      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col gap-6 relative z-10">
        
        {/* Top bar info */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-accent/25 dark:border-gray-800 pb-4">
          <div>
            <span className="inline-flex items-center gap-1 bg-brand/15 text-brand border border-brand/30 text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Adaptive AI Interview Experience
            </span>
            <h1 className="text-2xl font-black mt-2 tracking-tight">
              Live Human-like AI Interviewer: {interview.role}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-surface border border-accent/20 dark:border-gray-800 rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-cta animate-ping"></span>
              <span className="font-bold text-sm text-text">Live Time: {formatTime(timeSpent)}</span>
            </div>
            <button
              onClick={() => {
                stopSpeaking();
                stopVoiceRecognition();
                navigate('/dashboard');
              }}
              className="px-4 py-2 bg-surface border border-accent/20 dark:border-gray-800 rounded-xl font-bold text-sm hover:opacity-90 transition flex items-center gap-2 shadow-lg"
            >
              <LogOut className="w-4 h-4 text-cta" /> Quit Room
            </button>
          </div>
        </div>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow items-stretch">
          
          {/* Left panel: Pulsing AI Avatar (Take 2 columns for premium view) */}
          <div className="lg:col-span-2 bg-surface/70 border border-accent/20 dark:border-gray-800/80 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-md">
            
            {/* Visual AI Avatar Wave */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              
              {/* Outer Waves */}
              {(aiState === 'speaking' || aiState === 'intro') && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 2.2, 1], opacity: [0.15, 0, 0.15] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-brand/30"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.7, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    className="absolute inset-4 rounded-full border-2 border-brand/40"
                  />
                </>
              )}

              {aiState === 'listening' && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.9, 1], opacity: [0.2, 0, 0.2] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-2 border-accent/20"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute inset-8 rounded-full border-2 border-accent/30"
                  />
                </>
              )}

              {aiState === 'thinking' && (
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-4 border-dashed border-brand/35"
                />
              )}

              {/* Glowing Inner Core with Premium Styling */}
              <div className={`relative w-40 h-40 rounded-full transition-all duration-500 ${
                aiState === 'speaking' || aiState === 'intro' ? 'shadow-[0_0_60px_rgba(157,193,131,0.4)]' :
                aiState === 'listening' ? 'shadow-[0_0_80px_rgba(226,114,91,0.5)] scale-105' :
                aiState === 'thinking' ? 'shadow-[0_0_60px_rgba(157,193,131,0.4)]' :
                'shadow-2xl'
              }`}>
                {/* Animated Gradient Border Ring */}
                <div className={`absolute inset-0 rounded-full p-[3px] transition-all duration-500 ${
                  aiState === 'speaking' || aiState === 'intro' 
                    ? 'bg-gradient-to-tr from-[#9DC183] via-[#FFDAB9] to-[#9DC183] animate-spin-slow' 
                    : aiState === 'listening' 
                    ? 'bg-gradient-to-tr from-[#E2725B] via-[#FFB347] to-[#E2725B] animate-spin-slow' 
                    : aiState === 'thinking'
                    ? 'bg-gradient-to-tr from-[#9DC183] via-[#E2725B] to-[#9DC183] animate-spin-slow'
                    : 'bg-gradient-to-tr from-gray-400 to-gray-600'
                }`}>
                  <div className="w-full h-full rounded-full bg-page"></div>
                </div>

                {/* Avatar Container */}
                <div className="absolute inset-[6px] rounded-full overflow-hidden border-2 border-white/10 shadow-inner">
                  {/* Subtle pulsing background glow */}
                  <div className={`absolute inset-0 opacity-20 transition-all duration-500 ${
                    aiState === 'speaking' || aiState === 'intro' ? 'bg-gradient-to-br from-brand/50 to-transparent animate-pulse' :
                    aiState === 'listening' ? 'bg-gradient-to-br from-accent/60 to-transparent animate-pulse' :
                    aiState === 'thinking' ? 'bg-gradient-to-br from-cta/50 to-transparent animate-pulse' :
                    'bg-transparent'
                  }`}></div>

                  <img src={interviewerAvatar} alt="AIRA" className="w-full h-full object-cover" />
                  
                  {/* Premium Glass Status Badge */}
                  <div className={`absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full flex items-center gap-2 z-10 transition-all duration-300 ${
                    aiState === 'listening' 
                      ? 'bg-[#E2725B]/90 backdrop-blur-md border border-white/20 shadow-[0_4px_20px_rgba(226,114,91,0.4)]'
                      : 'bg-black/80 backdrop-blur-md border border-white/10 shadow-lg'
                  }`}>
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      aiState === 'speaking' || aiState === 'intro' ? 'bg-[#9DC183] animate-pulse shadow-[0_0_8px_rgba(157,193,131,0.8)]' :
                      aiState === 'listening' ? 'bg-white animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.9)]' :
                      aiState === 'thinking' ? 'bg-[#FFB347] animate-spin shadow-[0_0_8px_rgba(255,179,71,0.8)]' :
                      'bg-gray-400'
                    }`} />
                    <span className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
                      aiState === 'listening' ? 'text-white' : 'text-gray-200'
                    }`}>
                      {aiState === 'speaking' || aiState === 'intro' ? 'Speaking' :
                       aiState === 'listening' ? 'Listening' :
                       aiState === 'thinking' ? 'Analyzing' : 'Ready'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Prompts and Subtitles */}
            <div className="mt-8 text-center max-w-xl w-full">
              <h3 className="opacity-70 text-xs font-black uppercase tracking-wider mb-2">
                {isFollowUpPhase ? 'AIRA Follow-up Question' : `Topic ${currentQuestionIndex + 1} of ${interview.questions.length}`}
              </h3>
              <p className="text-xl sm:text-2xl font-bold leading-relaxed text-text px-4">
                "{currentPromptQuestion}"
              </p>
            </div>

            {/* Voice controls bar */}
            <div className="flex items-center justify-center gap-4 mt-8 bg-surface border border-accent/20 dark:border-gray-800 rounded-full px-6 py-2 shadow-md">
              <button
                onClick={toggleTtsMute}
                className={`p-2 rounded-full transition ${
                  isTtsMuted ? 'text-cta hover:opacity-90 bg-cta/15' : 'text-text/70 hover:text-text'
                }`}
                title={isTtsMuted ? 'Unmute voice output' : 'Mute voice output'}
              >
                {isTtsMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="w-px h-6 bg-accent/30"></span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-text/80">
                <span className={`w-2 h-2 rounded-full ${aiState === 'listening' ? 'bg-accent animate-pulse' : 'bg-gray-600'}`}></span>
                {getStatusMessage()}
              </div>
            </div>

          </div>

          {/* Right panel: Response details, visualizer & text-entry */}
          <div className="bg-surface/70 border border-accent/20 dark:border-gray-800/80 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md shadow-lg">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2 text-text">
                  <MessageSquare className="w-5 h-5 text-brand" />
                  Your Response
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMicrophone}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border transition duration-300 ${
                      isRecordingRef.current
                        ? 'bg-accent/10 border-accent text-brand animate-pulse'
                        : 'bg-surface border-accent/20 text-text/75 hover:opacity-90'
                    }`}
                    title={isRecordingRef.current ? 'Mute/Pause Microphone' : 'Activate Microphone'}
                  >
                    {isRecordingRef.current ? (
                      <>
                        <Mic className="w-3.5 h-3.5 text-brand" />
                        <span>Listening</span>
                      </>
                    ) : (
                      <>
                        <MicOff className="w-3.5 h-3.5 text-text/60" />
                        <span>Mic Off</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Real-time transcription or textbox */}
              <div className="relative">
                <textarea
                  value={userAnswerText + (interimSpeechText ? (userAnswerText.trim() ? ' ' : '') + interimSpeechText : '')}
                  onChange={(e) => {
                    setUserAnswerText(e.target.value);
                    setInterimSpeechText(''); // Clear interim speech text on manual typing edit
                  }}
                  placeholder="Your answer will automatically transcribe here as you speak. You can also type directly..."
                  className="w-full h-72 bg-page border-2 border-accent/20 dark:border-gray-800 focus:border-brand rounded-2xl p-4 text-sm leading-relaxed text-text resize-none outline-none transition duration-300"
                />
              </div>

              {isWaitingForConfirmation && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setUserAnswerText("Yes, I am ready! Let's begin the interview.");
                      // Automatically trigger send in next tick
                      setTimeout(() => {
                        handleSendResponse();
                      }, 150);
                    }}
                    className="px-4 py-2 bg-brand/10 border border-brand/35 rounded-xl text-xs font-bold text-brand hover:bg-brand/20 transition active:scale-95"
                  >
                    👍 Yes, I am ready!
                  </button>
                  <button
                    onClick={() => {
                      setUserAnswerText("Not ready yet, give me a few seconds.");
                    }}
                    className="px-4 py-2 bg-surface border border-accent/20 rounded-xl text-xs font-bold text-text/70 hover:bg-accent/25 transition active:scale-95"
                  >
                    ⏳ Not ready yet
                  </button>
                </div>
              )}

              {/* Audio visual waves when listening */}
              {isRecordingRef.current && (
                <div className="bg-accent/15 border border-accent/30 rounded-xl p-3 flex items-center justify-center gap-3">
                  <div className="flex items-end gap-1 h-6">
                    <motion.div animate={{ scaleY: [1, 2.5, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }} className="w-1 bg-brand rounded" style={{ height: '8px' }} />
                    <motion.div animate={{ scaleY: [1, 3.5, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} className="w-1 bg-accent rounded" style={{ height: '10px' }} />
                    <motion.div animate={{ scaleY: [1, 2.0, 1] }} transition={{ duration: 0.7, repeat: Infinity, delay: 0.3 }} className="w-1 bg-brand rounded" style={{ height: '6px' }} />
                    <motion.div animate={{ scaleY: [1, 3.0, 1] }} transition={{ duration: 0.4, repeat: Infinity, delay: 0.4 }} className="w-1 bg-accent rounded" style={{ height: '9px' }} />
                    <motion.div animate={{ scaleY: [1, 1.8, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.5 }} className="w-1 bg-brand rounded" style={{ height: '7px' }} />
                  </div>
                  <span className="text-xs font-bold text-brand">Microphone picking up...</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-accent/15 dark:border-gray-800">
              <button
                onClick={handleSendResponse}
                disabled={aiState === 'thinking' || !(userAnswerText.trim() || interimSpeechText.trim())}
                className="w-full py-4 bg-gradient-to-r from-brand to-accent disabled:opacity-50 disabled:cursor-not-allowed text-white dark:text-gray-900 rounded-2xl font-black shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2 text-base active:scale-[0.99]"
              >
                {aiState === 'thinking' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Answer...
                  </>
                ) : isWaitingForConfirmation ? (
                  <>
                    Confirm I'm Ready!
                    <CheckCircle className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    {isFollowUpPhase ? 'Submit Final Answer' : 'Submit & Await Follow-up'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={handleSkipQuestion}
                  className="flex-1 py-2.5 bg-surface border border-accent/20 dark:border-gray-800 hover:bg-page rounded-xl text-text/75 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <SkipForward className="w-3.5 h-3.5 text-cta" /> Skip
                </button>
                
                <button
                  onClick={() => speakText(currentPromptQuestion)}
                  className="flex-1 py-2.5 bg-surface border border-accent/20 dark:border-gray-800 hover:bg-page rounded-xl text-text/75 font-bold text-xs transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-brand" /> Repeat AIRA Voice
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default LiveAIInterview;
