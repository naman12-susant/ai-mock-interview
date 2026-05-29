import React from 'react';
import { BookOpen, Cpu, X, Zap } from 'lucide-react';

const InterviewModeModal = ({ isOpen, onClose, onSelectPractice, onSelectLive }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-8 w-full max-w-3xl shadow-2xl relative overflow-hidden transition-all duration-300 transform scale-100">
        
        {/* Decorative Glow */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-emerald-400/10 to-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-black rounded-full uppercase tracking-wider mb-3">
            <Zap className="w-3.5 h-3.5 fill-current" /> Custom Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight">
            Choose Your Interview Experience
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-lg mx-auto">
            Select how you would like to interact with AIRA, your personal interview assistant. You can practice sequentially or simulate a live session.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          
          {/* Practice Mode Card */}
          <div 
            onClick={onSelectPractice}
            className="group cursor-pointer border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-6 bg-white dark:bg-gray-800 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                  Recommended for Beginners
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Question-wise Training
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Practice interview questions one-by-one. Take your time, submit voice/text answers, and receive detailed AI feedback instantly after each reply.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelectPractice(); }}
              className="mt-6 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition shadow-md shadow-blue-500/10 active:scale-[0.98]"
            >
              Start Practice
            </button>
          </div>

          {/* Conversational Live AI Mode Card */}
          <div 
            onClick={onSelectLive}
            className="group cursor-pointer border-2 border-purple-100 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500 rounded-2xl p-6 bg-white dark:bg-gray-800 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 flex flex-col justify-between transform hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  <Cpu className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300">
                  Real Interview Simulation
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Conversational AIRA Interviewer
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Experience a real-time, interactive virtual voice interview with AIRA. She speaks, listens hands-free, and asks intelligent conversational follow-up questions.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onSelectLive(); }}
              className="mt-6 w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-md shadow-purple-500/10 active:scale-[0.98]"
            >
              Start Live Interview
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InterviewModeModal;
