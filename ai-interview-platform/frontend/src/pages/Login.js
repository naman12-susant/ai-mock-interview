import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-text py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-y-auto overflow-x-hidden">
      {/* Floating depth orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360], scale: [1, 1.15, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-10 right-10 w-72 h-72 rounded-full blur-3xl hidden sm:block orb pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, var(--color-primary-400) 0%, transparent 60%)', opacity: 0.18 }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [360, 180, 0], scale: [1, 1.25, 1] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl hidden sm:block orb pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, var(--color-accent) 0%, transparent 60%)', opacity: 0.14 }}
      />

      <motion.div 
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="card-surface rounded-2xl shadow-xl p-8 border border-accent/20"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Brand badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: 'var(--color-primary-100)', color: 'var(--color-primary-600)' }}>
              <span className="text-xs font-black uppercase tracking-widest">AI Mock Interview</span>
            </div>
            <h2 className="text-3xl font-bold text-text">Welcome Back</h2>
            <p className="mt-2 text-text/60">Sign in to continue your interview prep</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-text/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(157, 193, 131, 0.25)" }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-page text-text"
                  style={{ borderColor: 'var(--color-primary-300)', outlineColor: 'var(--color-primary-500)' }}
                  placeholder="you@example.com"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium text-text/80 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(157, 193, 131, 0.25)" }}
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-page text-text"
                  style={{ borderColor: 'var(--color-primary-300)', outlineColor: 'var(--color-primary-500)' }}
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <button
              type="submit"
              disabled={loading}
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
              className="w-full py-3 btn-brand rounded-lg disabled:opacity-50 flex items-center justify-center space-x-2 font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-text/60">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-primary-600)' }}>
                Sign up
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
