import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Loader } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page text-text py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-y-auto overflow-x-hidden">
      {/* Floating depth orbs */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 180, 360], scale: [1, 1.2, 1] }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-10 right-10 w-72 h-72 rounded-full blur-3xl hidden sm:block pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, var(--color-accent) 0%, transparent 60%)', opacity: 0.16 }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [360, 180, 0], scale: [1, 1.3, 1] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute bottom-10 left-10 w-80 h-80 rounded-full blur-3xl hidden sm:block pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, var(--color-primary-400) 0%, transparent 60%)', opacity: 0.16 }}
      />
      {/* Extra orb for visual depth */}
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
        transition={{ duration: 30, repeat: Infinity }}
        className="absolute top-1/2 left-1/4 w-56 h-56 rounded-full blur-3xl hidden lg:block pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, var(--color-cta) 0%, transparent 70%)', opacity: 0.08 }}
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
              <span className="text-xs font-black uppercase tracking-widest">Join for Free</span>
            </div>
            <h2 className="text-3xl font-bold text-text">Create Account</h2>
            <p className="mt-2 text-text/60">Start your interview preparation journey</p>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-sm font-medium text-text/80 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(157, 193, 131, 0.25)" }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-page text-text"
                  style={{ borderColor: 'var(--color-primary-300)', outlineColor: 'var(--color-primary-500)' }}
                  placeholder="John Doe"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
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

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
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

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label className="block text-sm font-medium text-text/80 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-primary-500)' }} />
                <motion.input
                  whileFocus={{ scale: 1.02, boxShadow: "0 0 20px rgba(157, 193, 131, 0.25)" }}
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-colors bg-page text-text"
                  style={{ borderColor: 'var(--color-primary-300)', outlineColor: 'var(--color-primary-500)' }}
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(157, 193, 131, 0.35)" }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="w-full py-3 btn-brand btn-hover rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-semibold cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </motion.button>
          </form>

          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-text/60">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:opacity-80 transition-opacity"
                style={{ color: 'var(--color-primary-600)' }}>
                Sign in
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;
