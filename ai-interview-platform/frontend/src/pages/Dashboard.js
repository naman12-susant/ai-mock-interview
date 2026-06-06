import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { interviewAPI } from '../services/api';
import { TrendingUp, Award, Clock, Play, FileText, ArrowRight, Sparkles, Target, Shield, Zap, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

/* ── Physics tilt card ── */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 400, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 400, damping: 30 });
  const scale = useSpring(1, { stiffness: 400, damping: 30 });
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.04);
  };
  const reset = () => { x.set(0); y.set(0); scale.set(1); };
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, interviewsResponse] = await Promise.all([
        interviewAPI.getStatistics(),
        interviewAPI.getAll({ limit: 5 })
      ]);

      setStatistics(statsResponse.data);
      setRecentInterviews(interviewsResponse.data.interviews);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      icon: <Award className="w-8 h-8" />,
      label: 'Total Interviews',
      value: statistics?.totalInterviews || 0,
      color: 'bg-blue-500'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      label: 'Average Score',
      value: statistics?.averageScores?.overall || '0.00',
      color: 'bg-green-500'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      label: 'Technical Score',
      value: statistics?.averageScores?.technical || '0.00',
      color: 'bg-purple-500'
    },
    {
      icon: <FileText className="w-8 h-8" />,
      label: 'Communication',
      value: statistics?.averageScores?.communication || '0.00',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text py-8 transition-colors duration-300 relative overflow-hidden">

      {/* ── 3D floating orbs ── */}
      <motion.div animate={{ y:[0,-30,0], rotate:[0,180,360], scale:[1,1.15,1] }}
        transition={{ duration:18, repeat:Infinity, ease:'easeInOut' }}
        className="absolute top-10 right-10 w-72 h-72 orb float-3d bg-gradient-to-br from-brand/20 to-brand/5 dark:from-accent/20 dark:to-accent/5 rounded-full blur-3xl pointer-events-none hidden sm:block" />
      <motion.div animate={{ y:[0,30,0], rotate:[360,180,0], scale:[1,1.2,1] }}
        transition={{ duration:22, repeat:Infinity, ease:'easeInOut' }}
        className="absolute bottom-10 left-10 w-80 h-80 orb float-3d bg-gradient-to-br from-accent/20 to-accent/5 dark:from-brand/20 dark:to-brand/5 rounded-full blur-3xl pointer-events-none hidden sm:block" />
      <motion.div animate={{ x:[0,40,0], y:[0,-20,0], scale:[1,1.1,1] }}
        transition={{ duration:15, repeat:Infinity, ease:'easeInOut', delay:3 }}
        className="absolute top-1/2 left-1/2 w-64 h-64 orb float-3d bg-gradient-to-br from-cta/15 to-cta/5 dark:from-cta/15 dark:to-cta/5 rounded-full blur-3xl pointer-events-none hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Welcome Section */}
        <motion.div className="mb-8"
          initial={{ opacity:0, y:-30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
          <div className="flex items-center gap-3 mb-1">
            <motion.div animate={{ rotate:[0,15,-15,0], scale:[1,1.2,1] }}
              transition={{ duration:3, repeat:Infinity, delay:1 }}>
              <Sparkles className="w-7 h-7 text-brand" />
            </motion.div>
            <motion.h1 className="text-3xl font-bold text-text"
              whileHover={{ scale:1.02, x:4 }}>
              Welcome back, {user?.name}! 👋
            </motion.h1>
          </div>
          <p className="text-text/75 mt-1 ml-10">Ready to practice your interview skills?</p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="grid md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.1 }}>

          <TiltCard>
          <motion.button
            onClick={() => navigate('/resume')}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 bg-surface rounded-2xl shadow-lg hover:shadow-2xl transition-all text-left border border-accent/20 dark:border-gray-800 overflow-hidden w-full"
          >
            {/* Animated Background Gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand/10 dark:from-brand/10 dark:to-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            ></motion.div>

            <motion.div
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.2 }}
              transition={{ duration: 0.6 }}
              className="w-16 h-16 bg-gradient-to-br from-brand to-accent rounded-2xl flex items-center justify-center mb-5 shadow-lg relative"
            >
              <FileText className="w-8 h-8 text-white dark:text-gray-900" />
            </motion.div>
            <h3 className="relative text-2xl font-bold text-text mb-3 group-hover:text-brand transition-colors">
              Upload Resume
            </h3>
            <p className="relative text-text/75 leading-relaxed">
              Upload your resume to get personalized interview questions
            </p>
            
            {/* Floating Arrow */}
            <motion.div
              className="absolute bottom-6 right-6"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-brand" />
              </div>
            </motion.div>
          </motion.button>
          </TiltCard>

          <TiltCard>
            <motion.button
              onClick={() => navigate('/interview/new')}
              whileTap={{ scale: 0.98 }}
              className="group relative p-8 bg-surface rounded-2xl shadow-lg hover:shadow-2xl transition-all text-left border border-accent/20 dark:border-gray-800 overflow-hidden w-full"
            >
              {/* Animated Background Gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-accent/5 to-cta/5 dark:from-accent/10 dark:to-cta/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse' }}
              />

              {/* Animated Shine Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: 'loop' }}
              />

              <motion.div
                whileHover={{ scale: 1.2, rotate: 360 }}
                transition={{ duration: 0.8 }}
                className="w-16 h-16 bg-gradient-to-br from-accent to-cta rounded-2xl flex items-center justify-center mb-5 shadow-lg relative"
              >
                <Play className="w-8 h-8 text-white dark:text-gray-900" />
              </motion.div>

              <h3 className="relative text-2xl font-bold text-text mb-3 group-hover:text-cta transition-colors">
                Start New Interview
              </h3>
              <p className="relative text-text/75 leading-relaxed">
                Begin a new AI-powered mock interview session
              </p>

              {/* Pulsing Indicator */}
              <motion.div
                className="absolute top-6 right-6"
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </motion.div>
            </motion.button>
          </TiltCard>
        </motion.div>

        {/* Statistics */}
        <motion.div className="grid md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.2 }}>
          {stats.map((stat, index) => (
            <TiltCard key={index}>
            <motion.div
              initial={{ opacity:0, y:20, rotateX:-15 }}
              animate={{ opacity:1, y:0, rotateX:0 }}
              transition={{ duration:0.5, delay:index*0.1+0.3 }}
              className="group relative bg-surface rounded-2xl shadow-lg p-6 border border-accent/20 dark:border-gray-800 overflow-hidden h-full"
            >
              {/* Animated Background */}
              <motion.div
                className={`absolute inset-0 ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                animate={{ 
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              ></motion.div>

              {/* Icon Container */}
              <motion.div 
                className={`relative w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg`}
                whileHover={{ 
                  rotate: [0, -10, 10, -10, 0],
                  scale: 1.2 
                }}
                transition={{ duration: 0.6 }}
                animate={{
                  y: [0, -5, 0],
                }}
                style={{ transition: { duration: 2, repeat: Infinity } }}
              >
                {stat.icon}
                
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                      '0 0 40px rgba(59, 130, 246, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                ></motion.div>
              </motion.div>

              <p className="relative text-text/75 text-sm mb-2 font-medium">{stat.label}</p>
              <motion.p 
                className="relative text-3xl font-black text-text"
                whileHover={{ scale: 1.1, x: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {stat.value}
              </motion.p>

              {/* Corner Decoration */}
              <motion.div
                className="absolute top-2 right-2 w-2 h-2 bg-green-500 dark:bg-blue-500 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              ></motion.div>
            </motion.div>
            </TiltCard>
          ))}
        </motion.div>

        {/* Adaptive Difficulty Analytics */}
        <motion.div className="mb-8"
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, delay:0.25 }}>
          
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-xl flex items-center justify-center shadow-lg"
            >
              <Zap className="w-5 h-5 text-white dark:text-gray-900" />
            </motion.div>
            <h2 className="text-2xl font-black text-text">Adaptive Progression</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Interview Tier */}
            <TiltCard>
              <div className="relative bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800 overflow-hidden h-full">
                <motion.div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand/10 dark:from-brand/10 dark:to-brand/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-brand" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Difficulty Reached</span>
                  </div>
                  <motion.p className="text-2xl font-black text-brand"
                    whileHover={{ scale: 1.05 }}>
                    {statistics?.difficultyReached || 'Beginner'}
                  </motion.p>
                </div>
              </div>
            </TiltCard>

            {/* Confidence Growth */}
            <TiltCard>
              <div className="relative bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800 overflow-hidden h-full">
                <motion.div className="absolute inset-0 bg-gradient-to-br from-cta/5 to-cta/10 dark:from-cta/10 dark:to-cta/20"
                  animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-cta" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Confidence Growth</span>
                  </div>
                  <motion.p className="text-2xl font-black text-cta"
                    whileHover={{ scale: 1.05 }}>
                    {statistics?.confidenceGrowth || '+0%'}
                  </motion.p>
                </div>
              </div>
            </TiltCard>

            {/* Best Role */}
            <TiltCard>
              <div className="relative bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800 overflow-hidden h-full">
                <motion.div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-accent/5 dark:from-brand/10 dark:to-accent/10"
                  animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-brand" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Best Role</span>
                  </div>
                  <motion.p className="text-2xl font-black text-brand truncate"
                    whileHover={{ scale: 1.05 }}>
                    {statistics?.bestRole || 'None yet'}
                  </motion.p>
                </div>
              </div>
            </TiltCard>

            {/* Weakest Topic */}
            <TiltCard>
              <div className="relative bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800 overflow-hidden h-full">
                <motion.div className="absolute inset-0 bg-gradient-to-br from-cta/5 to-accent/5 dark:from-cta/10 dark:to-accent/10"
                  animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5 text-cta" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Weakest Topic</span>
                  </div>
                  <motion.p className="text-2xl font-black text-cta truncate"
                    whileHover={{ scale: 1.05 }}>
                    {statistics?.weakestTopic || 'None yet'}
                  </motion.p>
                </div>
              </div>
            </TiltCard>
          </div>

          {/* Weak & Strong Areas Tags */}
          {((statistics?.weakTopics && statistics.weakTopics.length > 0) || (statistics?.strongTopics && statistics.strongTopics.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {statistics?.strongTopics && statistics.strongTopics.length > 0 && (
                <div className="bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-brand" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Strong Areas</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statistics.strongTopics.map((topic, i) => (
                      <motion.span key={i} whileHover={{ scale: 1.08, y: -2 }}
                        className="px-3 py-1 bg-brand/10 text-brand rounded-lg text-xs font-bold">
                        ✓ {topic}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
              {statistics?.weakTopics && statistics.weakTopics.length > 0 && (
                <div className="bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4 text-cta" />
                    <span className="text-xs font-bold text-text/60 uppercase tracking-wider">Areas to Improve</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statistics.weakTopics.map((topic, i) => (
                      <motion.span key={i} whileHover={{ scale: 1.08, y: -2 }}
                        className="px-3 py-1 bg-cta/10 text-cta rounded-lg text-xs font-bold">
                        ✗ {topic}
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Trend */}
          {statistics?.trend && statistics.trend.length > 0 && (
            <div className="bg-surface rounded-2xl shadow-lg p-5 border border-accent/20 dark:border-gray-800 mt-4">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Performance Evolution</span>
              </div>
              <div className="flex items-end gap-2 h-32">
                {statistics.trend.map((t, i) => {
                  const height = Math.max(10, (t.overallScore / 10) * 100);
                  const color = t.overallScore >= 7 ? 'bg-emerald-500' : t.overallScore >= 4 ? 'bg-blue-500' : 'bg-red-500';
                  return (
                    <motion.div key={i} className="flex flex-col items-center flex-1 gap-1"
                      initial={{ height: 0 }} animate={{ height: 'auto' }} transition={{ delay: i * 0.1 }}>
                      <span className="text-[10px] font-bold text-gray-400">{t.overallScore}</span>
                      <motion.div
                        className={`w-full max-w-[40px] ${color} rounded-t-lg`}
                        style={{ height: `${height}%` }}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                      />
                      <span className="text-[9px] font-bold text-gray-400 truncate w-full text-center">#{t.attemptNumber}</span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
        <motion.div 
          className="bg-surface rounded-2xl shadow-lg p-8 border border-accent/20 dark:border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.h2 
              className="text-3xl font-black text-text"
              whileHover={{ scale: 1.02, x: 5 }}
            >
              Recent Interviews
            </motion.h2>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 bg-gradient-to-br from-brand to-accent rounded-full flex items-center justify-center shadow-lg"
            >
              <TrendingUp className="w-5 h-5 text-white dark:text-gray-900" />
            </motion.div>
          </div>

          {recentInterviews.length === 0 ? (
            <motion.div 
              className="text-center py-16"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <FileText className="w-10 h-10 text-gray-400" />
              </motion.div>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">No interviews yet</p>
              <motion.button
                onClick={() => navigate('/interview/new')}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(16, 185, 129, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 dark:bg-primary-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 dark:hover:bg-primary-700 transition font-bold shadow-lg"
              >
                Start Your First Interview
              </motion.button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {recentInterviews.map((interview, index) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, x: -30, rotateY: -10 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.02, 
                    x: 10,
                    boxShadow: "0 15px 40px rgba(0, 0, 0, 0.1)",
                    rotateY: 2
                  }}
                  className="group relative border-2 border-accent/20 dark:border-gray-800 rounded-xl p-6 hover:border-brand transition-all cursor-pointer bg-surface overflow-hidden card-3d"
                  onClick={() => navigate(`/interview/${interview._id}`)}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Animated Background Gradient */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-brand/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  ></motion.div>

                  <div className="relative flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.6 }}
                          className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center"
                        >
                          <FileText className="w-5 h-5 text-brand" />
                        </motion.div>
                        <h3 className="font-bold text-lg text-text group-hover:text-brand transition-colors">
                          {interview.role} Interview
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 ml-13">
                        {new Date(interview.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <motion.div 
                      className="text-right"
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="text-4xl font-black bg-gradient-to-r from-brand to-cta bg-clip-text text-transparent">
                        {interview.scores?.overall || 'N/A'}
                      </div>
                      <p className="text-xs text-text/60 font-semibold">Overall Score</p>
                    </motion.div>
                  </div>
                  
                  <div className="relative mt-4 flex flex-wrap gap-3 text-sm">
                    <motion.span 
                      className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-medium"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      Technical: {interview.scores?.technical || 'N/A'}
                    </motion.span>
                    <motion.span 
                      className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-medium"
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      Communication: {interview.scores?.communication || 'N/A'}
                    </motion.span>
                    <motion.span 
                      className={`px-3 py-1 rounded-lg font-medium ${
                        interview.status === 'completed' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        interview.status === 'in-progress' ? 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                        'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                      whileHover={{ scale: 1.05, y: -2 }}
                    >
                      {interview.status}
                    </motion.span>
                  </div>

                  {/* Arrow Indicator */}
                  <motion.div
                    className="absolute right-6 top-1/2 transform -translate-y-1/2"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
