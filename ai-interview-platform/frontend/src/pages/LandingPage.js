import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Brain, Award, TrendingUp, Sparkles, Play, Users, Target, Star } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/* ── Floating organic blob (Kintsugi AI style) ── */
const Blob = ({ className, color, delay = 0, size = 'w-72 h-72' }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl pointer-events-none ${size} ${className}`}
    style={{ background: color }}
    animate={{
      borderRadius: [
        '60% 40% 30% 70% / 60% 30% 70% 40%',
        '30% 60% 70% 40% / 50% 60% 30% 60%',
        '50% 60% 30% 60% / 30% 60% 70% 40%',
        '60% 40% 30% 70% / 60% 30% 70% 40%',
      ],
      x: [0, 15, -10, 0],
      y: [0, -20, 12, 0],
      scale: [1, 1.08, 0.96, 1],
    }}
    transition={{ duration: 10 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
  />
);

/* ── Neon orb for dark mode (Portal.AI style) ── */
const NeonOrb = ({ className, color, delay = 0 }) => (
  <motion.div
    className={`absolute rounded-full pointer-events-none ${className}`}
    style={{ background: color, filter: 'blur(80px)' }}
    animate={{ scale: [1, 1.3, 1], opacity: [0.25, 0.45, 0.25] }}
    transition={{ duration: 6 + delay, repeat: Infinity, delay }}
  />
);

const LandingPage = () => {
  const { isDarkMode } = useTheme();
  const [realStats, setRealStats] = useState({ activeUsers: 0, interviewsCompleted: 0, averageScore: 0 });

  useEffect(() => {
    fetch('https://ai-mock-interview-hqci.onrender.com/api/public/stats')
      .then(r => r.json())
      .then(d => { if (d.success) setRealStats(d.data); })
      .catch(() => {});
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />, title: 'AI-Powered Analysis',
      description: 'Advanced AI analyzes your resume and generates hyper-personalized interview questions tailored to your exact experience.',
      link: '/resume', action: 'Upload Resume',
      lightColor: '#9DC183', darkColor: '#00FFFF',
    },
    {
      icon: <Mic className="w-6 h-6" />, title: 'Voice Interviews',
      description: 'Practice with AIRA — a real-time conversational AI interviewer who speaks, listens, and adapts just like a human recruiter.',
      link: '/interview/new', action: 'Start Interview',
      lightColor: '#E2725B', darkColor: '#00FFFF',
    },
    {
      icon: <Award className="w-6 h-6" />, title: 'Instant Feedback',
      description: 'Receive detailed scores, strengths analysis, and actionable coaching suggestions immediately after each practice session.',
      link: '/dashboard', action: 'View Dashboard',
      lightColor: '#FFDAB9', darkColor: '#0047AB',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />, title: 'Progress Tracking',
      description: 'Monitor your improvement with comprehensive analytics, performance trends, and milestone achievements over time.',
      link: '/dashboard', action: 'See Analytics',
      lightColor: '#9DC183', darkColor: '#00FFFF',
    },
  ];

  if (isDarkMode) {
    return <DarkLanding features={features} stats={realStats} />;
  }
  return <LightLanding features={features} stats={realStats} />;
};

/* ══════════════════════════════════════════════════════════
   LIGHT MODE — Kintsugi AI Style
══════════════════════════════════════════════════════════ */
const LightLanding = ({ features, stats }) => (
  <div className="min-h-screen overflow-x-hidden" style={{ background: '#FFFDD0' }}>

    {/* ── HERO ── */}
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Warm cream radial gradient base */}
      <div className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, #e8f6e4 0%, #FFFDD0 60%, #fff8e0 100%)' }} />

      {/* Floating organic blobs */}
      <Blob className="top-20 right-[-5%] opacity-70" color="#FFDAB9" delay={0} size="w-80 h-80" />
      <Blob className="top-32 left-[-8%] opacity-60" color="#9DC183" delay={3} size="w-64 h-64" />
      <Blob className="bottom-[-5%] right-[15%] opacity-50" color="#FFDAB9" delay={6} size="w-72 h-72" />
      <Blob className="bottom-[10%] left-[5%] opacity-40" color="#d4edaa" delay={4} size="w-56 h-56" />
      <Blob className="top-[45%] right-[30%] opacity-30" color="#FFB347" delay={7} size="w-48 h-48" />

      {/* Hero content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border text-sm font-semibold tracking-wider"
          style={{ background: 'rgba(255,255,255,0.6)', borderColor: 'rgba(43,30,22,0.12)', color: '#2B1E16' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: '#9DC183' }} />
          THE AI INTERVIEW COACH
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display leading-tight mb-6"
          style={{ fontSize: 'clamp(3rem, 8vw, 5.5rem)', color: '#2B1E16' }}
        >
          Interviewing,
          <br />
          <em className="not-italic" style={{ color: '#9DC183' }}>Made Confident.</em>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="font-body text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed"
          style={{ color: 'rgba(43,30,22,0.65)' }}
        >
          Transform anxiety into confidence with AI that's as soft as clay
          and as sharp as a diamond. Master every conversation.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(226,114,91,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-4 rounded-full font-body font-bold text-white text-base"
              style={{ background: '#E2725B' }}
            >
              Start Practicing Free
            </motion.button>
          </Link>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.04, background: 'rgba(43,30,22,0.06)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 rounded-full font-body font-bold text-base border transition-colors duration-200"
              style={{ color: '#2B1E16', borderColor: 'rgba(43,30,22,0.2)', background: 'rgba(255,255,255,0.5)' }}
            >
              <div className="w-7 h-7 rounded-full bg-[#2B1E16] flex items-center justify-center flex-shrink-0">
                <Play className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              Watch Demo
            </motion.button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mt-10"
        >
          <div className="flex -space-x-2">
            {['#E2725B', '#9DC183', '#FFDAB9', '#d4a373'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                style={{ background: c }}>
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 ml-2">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" style={{ color: '#E2725B' }} />)}
          </div>
          <span className="text-sm font-medium" style={{ color: 'rgba(43,30,22,0.55)' }}>
            Loved by 10k+ job seekers
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        style={{ color: 'rgba(43,30,22,0.3)' }}
      >
        <div className="w-5 h-8 border-2 rounded-full flex justify-center pt-1.5" style={{ borderColor: 'rgba(43,30,22,0.2)' }}>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 rounded-full" style={{ background: 'rgba(43,30,22,0.3)' }} />
        </div>
      </motion.div>
    </section>

    {/* ── STATS ── */}
    <section className="py-16 relative" style={{ background: 'rgba(255,255,255,0.5)' }}>
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8">
        {[
          { value: stats.activeUsers ? `${stats.activeUsers.toLocaleString()}+` : '10k+', label: 'Job Seekers' },
          { value: stats.interviewsCompleted ? `${stats.interviewsCompleted.toLocaleString()}+` : '50k+', label: 'Interviews Done' },
          { value: stats.averageScore ? `${stats.averageScore}%` : '94%', label: 'Success Rate' },
        ].map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="font-display text-4xl md:text-5xl font-bold mb-1" style={{ color: '#2B1E16' }}>{s.value}</div>
            <div className="font-body text-sm font-medium uppercase tracking-widest" style={{ color: 'rgba(43,30,22,0.5)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>

    {/* ── FEATURES ── */}
    <section className="py-24 relative" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, #FFFDD0 100%)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold tracking-widest uppercase"
            style={{ background: 'rgba(157,193,131,0.15)', color: '#9DC183', border: '1px solid rgba(157,193,131,0.3)' }}>
            <Sparkles className="w-3.5 h-3.5" /> Powerful Features
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4" style={{ color: '#2B1E16' }}>
            Everything you need<br />
            <em className="not-italic" style={{ color: '#9DC183' }}>to get the job.</em>
          </h2>
          <p className="font-body text-lg max-w-lg mx-auto" style={{ color: 'rgba(43,30,22,0.55)' }}>
            Comprehensive tools designed to transform you into an interview expert.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={f.link}>
                <motion.div
                  whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(0,0,0,0.08)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="h-full rounded-2xl p-7 border transition-all duration-300 group"
                  style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(43,30,22,0.08)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 text-white"
                    style={{ background: f.lightColor }}>
                    {f.icon}
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3" style={{ color: '#2B1E16' }}>{f.title}</h3>
                  <p className="font-body text-sm leading-relaxed mb-5" style={{ color: 'rgba(43,30,22,0.6)' }}>{f.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#E2725B' }}>
                    {f.action} <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #9DC183 0%, #E2725B 100%)' }} />
      <Blob className="top-[-20%] left-[-10%] opacity-30" color="#FFDAB9" delay={0} size="w-96 h-96" />
      <Blob className="bottom-[-20%] right-[-10%] opacity-25" color="white" delay={3} size="w-80 h-80" />
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to land your<br /><em className="not-italic">dream role?</em>
          </h2>
          <p className="font-body text-lg mb-10 opacity-85">
            Join thousands of professionals who transformed their interview skills.
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-full font-body font-bold text-base"
              style={{ background: '#2B1E16', color: 'white' }}
            >
              Start for Free Today
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── FOOTER ── */}
    <footer className="py-10 text-center font-body text-sm" style={{ background: '#FFFDD0', color: 'rgba(43,30,22,0.45)' }}>
      © {new Date().getFullYear()} AIRA.AI · All rights reserved.
    </footer>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DARK MODE — Portal.AI Style
══════════════════════════════════════════════════════════ */
const DarkLanding = ({ features, stats }) => (
  <div className="min-h-screen overflow-x-hidden" style={{ background: '#0a0d0d' }}>

    {/* ── HERO ── */}
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 px-4">
      {/* Neon depth orbs */}
      <NeonOrb className="w-[600px] h-[600px] top-[-10%] left-[-15%]" color="rgba(0,71,171,0.35)" delay={0} />
      <NeonOrb className="w-[500px] h-[500px] bottom-[-10%] right-[-10%]" color="rgba(0,255,255,0.12)" delay={2} />
      <NeonOrb className="w-96 h-96 top-[30%] right-[15%]" color="rgba(0,71,171,0.2)" delay={4} />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      {/* Main card (Portal.AI style) */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl rounded-3xl border overflow-hidden"
        style={{ background: 'rgba(26,32,32,0.85)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        <div className="px-8 py-20 md:py-28 text-center relative">
          {/* Inner glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(0,255,255,0.04), transparent)' }} />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 border text-xs font-bold tracking-[0.2em] uppercase"
            style={{ background: 'rgba(0,255,255,0.06)', borderColor: 'rgba(0,255,255,0.2)', color: '#00FFFF' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            NEURAL SYNTHETIC ENVIRONMENTS
          </motion.div>

          {/* Hero headline — Portal.AI style bold split */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="leading-[0.95] mb-8"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <div className="flex flex-wrap items-baseline justify-center gap-x-5 mb-2">
              <span className="font-black text-white" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', letterSpacing: '-0.03em' }}>
                BEYOND
              </span>
              <span className="font-black" style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)', letterSpacing: '-0.03em', color: 'rgba(255,255,255,0.15)', WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>
                THE
              </span>
            </div>
            <div>
              <span
                className="font-black"
                style={{
                  fontSize: 'clamp(4rem, 12vw, 8rem)',
                  letterSpacing: '-0.03em',
                  color: '#00FFFF',
                  textShadow: '0 0 40px rgba(0,255,255,0.5), 0 0 80px rgba(0,255,255,0.25)',
                }}
              >
                GLASS
              </span>
            </div>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="font-body text-lg max-w-xl mx-auto mb-12 leading-relaxed"
            style={{ color: 'rgba(229,228,226,0.6)' }}
          >
            The high-fidelity portal for executive mastery. Simulate elite interviews
            with adaptive AI agents and forensic biometric feedback.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(0,255,255,0.4)' }}
                whileTap={{ scale: 0.97 }}
                className="px-8 py-4 rounded-full font-body font-bold text-base border"
                style={{ background: 'rgba(0,255,255,0.08)', borderColor: 'rgba(0,255,255,0.35)', color: '#00FFFF' }}
              >
                ACCESS NODE
              </motion.button>
            </Link>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.04, background: 'rgba(0,255,255,0.12)', boxShadow: '0 0 20px rgba(0,255,255,0.2)' }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-8 py-4 rounded-full font-body font-medium text-base border transition-all duration-200"
                style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'rgba(229,228,226,0.7)', background: 'transparent' }}
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Simulation
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats below card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl mt-6 grid grid-cols-3 gap-4"
      >
        {[
          { value: stats.activeUsers ? `${stats.activeUsers.toLocaleString()}+` : '10k+', label: 'Active Users' },
          { value: stats.interviewsCompleted ? `${stats.interviewsCompleted.toLocaleString()}+` : '50k+', label: 'Simulations Run' },
          { value: stats.averageScore ? `${stats.averageScore}%` : '94%', label: 'Success Rate' },
        ].map((s, i) => (
          <div key={i} className="text-center py-5 rounded-2xl border"
            style={{ background: 'rgba(26,32,32,0.6)', borderColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
            <div className="font-black text-3xl mb-1" style={{ color: '#00FFFF', fontFamily: "'DM Sans', sans-serif", textShadow: '0 0 20px rgba(0,255,255,0.3)' }}>{s.value}</div>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(229,228,226,0.4)' }}>{s.label}</div>
          </div>
        ))}
      </motion.div>
    </section>

    {/* ── FEATURES ── */}
    <section className="py-24 relative" style={{ background: '#0a0d0d' }}>
      <NeonOrb className="w-96 h-96 top-0 right-0" color="rgba(0,71,171,0.2)" delay={0} />
      <NeonOrb className="w-80 h-80 bottom-0 left-0" color="rgba(0,255,255,0.08)" delay={3} />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs font-bold tracking-[0.18em] uppercase border"
            style={{ background: 'rgba(0,255,255,0.05)', borderColor: 'rgba(0,255,255,0.2)', color: '#00FFFF' }}>
            <Sparkles className="w-3.5 h-3.5" /> Core Modules
          </div>
          <h2 className="font-black text-4xl md:text-5xl mb-4 text-white" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
            Elite capabilities.<br />
            <span style={{ color: '#00FFFF', textShadow: '0 0 30px rgba(0,255,255,0.35)' }}>Zero compromise.</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link to={f.link}>
                <motion.div
                  whileHover={{ y: -4, borderColor: 'rgba(0,255,255,0.3)', boxShadow: '0 0 30px rgba(0,255,255,0.08)' }}
                  transition={{ duration: 0.2 }}
                  className="h-full rounded-2xl p-6 border group cursor-pointer transition-all duration-200"
                  style={{ background: 'rgba(26,32,32,0.8)', borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                    style={{ background: 'rgba(0,255,255,0.08)', borderColor: 'rgba(0,255,255,0.2)', color: '#00FFFF' }}>
                    {f.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2.5 text-white">{f.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(229,228,226,0.5)' }}>{f.description}</p>
                  <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: '#00FFFF' }}>
                    {f.action} <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA ── */}
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0047AB 0%, #121212 60%)' }} />
      <NeonOrb className="w-96 h-96 top-[-20%] right-[-10%]" color="rgba(0,255,255,0.15)" delay={0} />
      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-black text-4xl md:text-5xl mb-5 text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Enter the node.<br />
            <span style={{ color: '#00FFFF', textShadow: '0 0 30px rgba(0,255,255,0.4)' }}>Dominate the interview.</span>
          </h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(229,228,226,0.6)' }}>
            Join the elite cohort of professionals who leverage AI-powered simulations.
          </p>
          <Link to="/register">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: '0 0 40px rgba(0,255,255,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="px-10 py-4 rounded-full font-bold text-base border"
              style={{ background: '#00FFFF', color: '#121212', borderColor: '#00FFFF' }}
            >
              Access Node — Free
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* ── FOOTER ── */}
    <footer className="py-10 text-center text-sm" style={{ background: '#0a0d0d', color: 'rgba(229,228,226,0.3)', fontFamily: "'DM Sans', sans-serif" }}>
      © {new Date().getFullYear()} AIRA.AI · All rights reserved.
    </footer>
  </div>
);

export default LandingPage;
