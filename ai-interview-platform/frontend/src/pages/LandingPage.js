import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Mic, Brain, Award, TrendingUp, ArrowRight, Star, Users, Target } from 'lucide-react';

const Particle = ({ style }) => (
  <motion.div
    className="absolute rounded-full bg-blue-400/50"
    style={{ width: style.size, height: style.size, left: style.left, top: style.top }}
    animate={{ y: [0, -140, 0], x: [0, style.drift, 0], opacity: [0, 0.9, 0] }}
    transition={{ duration: style.duration, repeat: Infinity, delay: style.delay, ease: 'easeInOut' }}
  />
);

const TiltCard = ({ children, className = '', intensity = 10 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 400, damping: 35 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 400, damping: 35 });
  const scale = useSpring(1, { stiffness: 400, damping: 35 });
  const handleMouse = (e) => {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    scale.set(1.03);
  };
  const reset = () => { x.set(0); y.set(0); scale.set(1); };
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={reset}
      style={{ rotateX, rotateY, scale, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
};

const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 3.7) % 100}%`, top: `${(i * 6.1) % 100}%`,
  duration: 7 + (i % 6), delay: (i * 0.35) % 6,
  drift: (i % 2 === 0 ? 1 : -1) * (20 + (i % 30)),
  size: `${2 + (i % 3)}px`,
}));

const LandingPage = () => {
  const lightBlobRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (lightBlobRef.current)
        lightBlobRef.current.style.background =
          `radial-gradient(700px circle at ${e.clientX}px ${e.clientY}px, rgba(16,185,129,0.07), transparent 55%)`;
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  const features = [
    { icon: <Brain className="w-9 h-9 text-white" />, title: 'AI-Powered Analysis',
      description: 'Advanced AI analyzes your resume and generates personalized interview questions tailored to your experience',
      link: '/resume', action: 'Upload Resume', iconBg: 'from-blue-500 to-indigo-600' },
    { icon: <Mic className="w-9 h-9 text-white" />, title: 'Voice Interview',
      description: 'Practice with realistic voice-based interviews and receive real-time feedback on your responses',
      link: '/interview/new', action: 'Start Interview', iconBg: 'from-pink-400 via-rose-400 to-orange-400' },
    { icon: <Award className="w-9 h-9 text-white" />, title: 'Instant Feedback',
      description: 'Receive detailed scores, strengths analysis, and actionable suggestions to improve your performance',
      link: '/dashboard', action: 'View Dashboard', iconBg: 'from-green-400 to-emerald-300' },
    { icon: <TrendingUp className="w-9 h-9 text-white" />, title: 'Track Progress',
      description: 'Monitor your improvement journey with comprehensive analytics, insights, and performance metrics',
      link: '/dashboard', action: 'See Analytics', iconBg: 'from-green-500 to-lime-400' },
  ];

  const [realStats, setRealStats] = useState({
    activeUsers: 0,
    interviewsCompleted: 0,
    averageScore: 0
  });

  useEffect(() => {
    // Fetch live proof from actual platform usage
    const fetchStats = async () => {
      try {
        const res = await fetch('https://ai-mock-interview-hqci.onrender.com/api/public/stats');
        const data = await res.json();
        if (data.success) {
          setRealStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch public stats');
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { icon: <Users className="w-7 h-7" />, value: realStats.activeUsers.toLocaleString(), label: 'Registered Users', color: 'text-green-500 dark:text-green-400' },
    { icon: <Target className="w-7 h-7" />, value: realStats.interviewsCompleted.toLocaleString(), label: 'Interviews Completed', color: 'text-yellow-500 dark:text-yellow-400' },
    { icon: <Award className="w-7 h-7" />, value: realStats.averageScore, label: 'Average Global Score', color: 'text-teal-500 dark:text-teal-400' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

        {/* Light mode bg */}
        <div className="absolute inset-0 dark:hidden">
          <div className="absolute inset-0 bg-white" />
          <div ref={lightBlobRef} className="absolute inset-0 pointer-events-none transition-all duration-300" />
          <motion.div animate={{ opacity:[0.5,0.75,0.5] }} transition={{ duration:6, repeat:Infinity }}
            className="absolute top-0 bottom-0 -left-32 w-72 pointer-events-none"
            style={{ background:'linear-gradient(to right, rgba(134,239,172,0.35) 0%, transparent 100%)' }} />
          <motion.div animate={{ opacity:[0.4,0.65,0.4] }} transition={{ duration:7, repeat:Infinity, delay:1 }}
            className="absolute top-0 bottom-0 -right-32 w-72 pointer-events-none"
            style={{ background:'linear-gradient(to left, rgba(134,239,172,0.3) 0%, transparent 100%)' }} />
          <motion.div animate={{ opacity:[0.3,0.55,0.3] }} transition={{ duration:8, repeat:Infinity, delay:2 }}
            className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
            style={{ background:'radial-gradient(circle at bottom right, rgba(167,243,208,0.4) 0%, transparent 65%)' }} />
        </div>

        {/* Dark mode bg */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute inset-0 bg-[#0a0a14]" />
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage:'linear-gradient(rgba(99,102,241,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.5) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />
          <motion.div animate={{ scale:[1,1.3,1], opacity:[0.25,0.5,0.25] }} transition={{ duration:5, repeat:Infinity }}
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-3xl" />
          <motion.div animate={{ scale:[1,1.4,1], opacity:[0.2,0.45,0.2] }} transition={{ duration:6, repeat:Infinity, delay:1.5 }}
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl" />
          {PARTICLES.map((p, i) => <Particle key={i} style={p} />)}
        </div>

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center pt-16 pb-8">
          <motion.h1 initial={{ opacity:0, y:40 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.9, ease:'easeOut' }}
            className="text-7xl md:text-9xl font-black leading-[1.05] mb-6 tracking-tight">
            <span className="text-gray-900 dark:text-white block">Ace Your</span>
            <motion.span
              className="block text-[#10b981] dark:bg-gradient-to-r dark:from-[#6366f1] dark:to-[#a855f7] dark:bg-clip-text dark:text-transparent"
              animate={{ backgroundPosition:['0% 50%','100% 50%','0% 50%'] }}
              transition={{ duration:5, repeat:Infinity }} style={{ backgroundSize:'200% 200%' }}>
              Dream Interview
            </motion.span>
          </motion.h1>

          <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.3 }}
            className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Master your interview skills with AI-powered voice simulations, instant feedback, and personalized coaching
          </motion.p>

          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
            transition={{ duration:0.8, delay:0.45 }} className="mb-20">
            <Link to="/register">
                <motion.button
                whileHover={{ scale:1.06, boxShadow:'0 20px 50px rgba(16,185,129,0.45)' }}
                whileTap={{ scale:0.96 }}
                className="relative inline-flex items-center gap-3 px-10 py-5 bg-[#10b981] dark:bg-gradient-to-r dark:from-[#6366f1] dark:to-[#a855f7] text-white rounded-2xl font-bold text-lg shadow-xl overflow-hidden">
                <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  animate={{ x:['-100%','200%'] }} transition={{ duration:2.5, repeat:Infinity, repeatDelay:1 }} />
                <span className="relative">Start Free Trial</span>
                <motion.div animate={{ x:[0,4,0] }} transition={{ duration:1.2, repeat:Infinity }}>
                  <ArrowRight className="w-5 h-5 relative" />
                </motion.div>
              </motion.button>
            </Link>
          </motion.div>


        </div>

        {/* Scroll cue */}
        <motion.div animate={{ y:[0,8,0] }} transition={{ duration:2, repeat:Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-2">
            <motion.div animate={{ y:[0,10,0] }} transition={{ duration:2, repeat:Infinity }}
              className="w-1.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-28 bg-white dark:bg-[#0a0a14] transition-colors duration-500">
        <div className="dark:hidden">
          <motion.div animate={{ opacity:[0.4,0.65,0.4] }} transition={{ duration:8, repeat:Infinity }}
            className="absolute top-0 bottom-0 -left-20 w-64 pointer-events-none"
            style={{ background:'linear-gradient(to right, rgba(134,239,172,0.3) 0%, transparent 100%)' }} />
          <motion.div animate={{ opacity:[0.35,0.6,0.35] }} transition={{ duration:9, repeat:Infinity, delay:1.5 }}
            className="absolute top-0 bottom-0 -right-20 w-64 pointer-events-none"
            style={{ background:'linear-gradient(to left, rgba(134,239,172,0.25) 0%, transparent 100%)' }} />
        </div>
        <motion.div animate={{ scale:[1,1.2,1], opacity:[0.3,0.5,0.3] }} transition={{ duration:8, repeat:Infinity }}
          className="absolute top-0 right-0 w-96 h-96 hidden dark:block bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
        <motion.div animate={{ scale:[1,1.3,1], opacity:[0.2,0.4,0.2] }} transition={{ duration:10, repeat:Infinity, delay:2 }}
          className="absolute bottom-0 left-0 w-96 h-96 hidden dark:block bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }}
            viewport={{ once:true }} transition={{ duration:0.6 }} className="text-center mb-16">
            <motion.span whileHover={{ scale:1.05 }}
              className="inline-block px-5 py-2 bg-green-100 dark:bg-blue-900/40 text-green-700 dark:text-blue-300 rounded-full text-sm font-bold border border-green-200 dark:border-blue-700 mb-5">
              POWERFUL FEATURES
            </motion.span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
              Everything You Need<br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                To Succeed
              </span>
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              Comprehensive tools designed to transform you into an interview expert
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, y:40 }} whileInView={{ opacity:1, y:0 }}
                viewport={{ once:true }} transition={{ duration:0.55, delay:i*0.1 }}>
                <TiltCard className="h-full">
                  <Link to={f.link} className="block h-full">
                    <motion.div whileHover={{ y:-8, boxShadow:'0 30px 60px rgba(0,0,0,0.12)' }}
                      transition={{ type:'spring', stiffness:300, damping:25 }}
                      className="relative h-full bg-white dark:bg-[#111827] rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${f.iconBg} opacity-0 group-hover:opacity-[0.04] dark:group-hover:opacity-[0.08] transition-opacity duration-500 rounded-3xl`} />
                      <motion.div whileHover={{ rotate:[0,-8,8,-8,0], scale:1.1 }} transition={{ duration:0.5 }}
                        className={`w-16 h-16 bg-gradient-to-br ${f.iconBg} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                        {f.icon}
                      </motion.div>
                      <h3 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-blue-400 transition-colors">
                        {f.title}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6 leading-relaxed text-sm">{f.description}</p>
                      <motion.div className="flex items-center gap-2 text-green-600 dark:text-blue-400 font-bold text-sm" whileHover={{ x:4 }}>
                        <span>{f.action}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                      <motion.div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{ background:'radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 70%)' }} />
                    </motion.div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* ── CTA ── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 dark:from-blue-900 dark:via-purple-900 dark:to-indigo-900" />
        <motion.div animate={{ scale:[1,1.3,1], rotate:[0,90,0] }} transition={{ duration:20, repeat:Infinity }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <motion.div animate={{ scale:[1,1.4,1], rotate:[0,-90,0] }} transition={{ duration:25, repeat:Infinity }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center text-white">
          <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
            <motion.h2 className="text-5xl md:text-6xl font-black mb-5" whileHover={{ scale:1.03 }}>
              Ready to Transform Your Career?
            </motion.h2>
            <p className="text-lg mb-10 opacity-80">Join 10,000+ professionals who landed their dream jobs</p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale:1.08, boxShadow:'0 25px 60px rgba(0,0,0,0.3)' }}
                whileTap={{ scale:0.96 }}
                className="px-12 py-5 bg-white text-green-600 dark:text-purple-700 rounded-2xl font-black text-lg shadow-2xl">
                Start Your Journey Today
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER STATS ── */}
      <footer className="bg-[#05050a] border-t border-gray-800 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-around items-center gap-10">
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className={`${s.color} mb-3`}>{s.icon}</div>
                <div className="text-4xl font-black text-white mb-1">{s.value}</div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="text-center text-gray-600 mt-16 text-sm">
            © {new Date().getFullYear()} AI Interview Platform. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
