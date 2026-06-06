import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Home, FileText, Moon, Sun, Brain, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`w-full max-w-5xl rounded-full border transition-all duration-300 ${
          isDarkMode
            ? 'bg-black/20 border-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
            : 'bg-white/20 border-white/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(31,38,135,0.2)]'
        } ${scrolled ? 'shadow-2xl' : ''}`}
        style={{
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: isDarkMode 
            ? '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
            : '0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.3)'
        }}
      >
        <div className="flex items-center justify-between px-5 py-2.5">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Circular icon - blue ring with transparent center */}
            <div className="relative w-11 h-11 flex-shrink-0">
              {/* Outer thick blue ring */}
              <div className="absolute inset-0 rounded-full border-[5px] border-[#5B8FF9] group-hover:shadow-[0_0_20px_rgba(91,143,249,0.6)] transition-all duration-300"></div>
              
              {/* Inner smaller blue ring */}
              <div className="absolute inset-[10px] rounded-full border-[3px] border-[#5B8FF9]/60"></div>
            </div>
            
            {/* Text content */}
            <div className="flex flex-col -space-y-0.5">
              <span className={`text-[22px] font-bold tracking-tight leading-none ${
                isDarkMode ? 'text-[#8BA9D9]' : 'text-[#5B8FF9]'
              }`}>
                TalentForge
              </span>
              <span className="text-[8.5px] font-semibold tracking-[0.2em] uppercase leading-none text-gray-500">
                WHERE TALENT MEETS INTELLIGENCE
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-7">
              <NavLink to="/dashboard" dark={isDarkMode}><Home className="w-3.5 h-3.5" /> Dashboard</NavLink>
              <NavLink to="/resume" dark={isDarkMode}><FileText className="w-3.5 h-3.5" /> Resume</NavLink>
              <NavLink to="/resume-analysis" dark={isDarkMode}><Brain className="w-3.5 h-3.5" /> Gap Analysis</NavLink>
            </div>
          )}

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-300 ${
                isDarkMode
                  ? 'bg-white/5 hover:bg-white/10 text-[#00FFFF]'
                  : 'bg-black/5 hover:bg-black/10 text-[#2B1E16]'
              }`}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                  isDarkMode ? 'bg-white/5 text-white/80' : 'bg-black/5 text-[#2B1E16]/80'
                }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isDarkMode ? 'bg-[#00FFFF]/20 text-[#00FFFF]' : 'bg-[#9DC183]/30 text-[#5a8a47]'
                  }`}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {user?.name?.split(' ')[0]}
                </div>
                <button
                  onClick={handleLogout}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isDarkMode
                      ? 'bg-white/8 hover:bg-white/15 text-white/70 border border-white/10'
                      : 'bg-black/6 hover:bg-black/12 text-[#2B1E16]/70'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    isDarkMode ? 'text-white/70 hover:text-white' : 'text-[#2B1E16]/70 hover:text-[#2B1E16]'
                  }`}
                >
                  Log in
                </Link>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                      isDarkMode
                        ? 'bg-[#00FFFF] text-[#121212] hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                        : 'bg-[#9DC183] text-white hover:bg-[#85a96f] hover:shadow-[0_4px_20px_rgba(157,193,131,0.4)]'
                    }`}
                  >
                    Get Started
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${isDarkMode ? 'text-[#00FFFF]' : 'text-[#2B1E16]'}`}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10 text-white' : 'bg-black/8 text-[#2B1E16]'}`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`absolute top-0 right-0 w-72 h-full p-6 shadow-2xl ${
                isDarkMode ? 'bg-[#1a1a1a] border-l border-white/10' : 'bg-white border-l border-black/8'
              }`}
            >
              <div className="flex items-center justify-between mb-8">
                <span className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-[#2B1E16]'}`}>
                  Menu
                </span>
                <button onClick={() => setMobileOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-white/10' : 'bg-black/8'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {isAuthenticated ? (
                  <>
                    <MobileNavLink to="/dashboard" dark={isDarkMode} onClick={() => setMobileOpen(false)}><Home className="w-4 h-4" /> Dashboard</MobileNavLink>
                    <MobileNavLink to="/resume" dark={isDarkMode} onClick={() => setMobileOpen(false)}><FileText className="w-4 h-4" /> Resume</MobileNavLink>
                    <MobileNavLink to="/resume-analysis" dark={isDarkMode} onClick={() => setMobileOpen(false)}><Brain className="w-4 h-4" /> Gap Analysis</MobileNavLink>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="mt-4 px-4 py-2.5 rounded-full text-sm font-semibold bg-red-500/80 text-white"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink to="/login" dark={isDarkMode} onClick={() => setMobileOpen(false)}>Log in</MobileNavLink>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className={`px-4 py-2.5 rounded-full text-sm font-bold text-center ${
                        isDarkMode ? 'bg-[#00FFFF] text-[#121212]' : 'bg-[#9DC183] text-white'
                      }`}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const NavLink = ({ to, children, dark }) => (
  <Link
    to={to}
    className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
      dark ? 'text-white/60 hover:text-white' : 'text-[#2B1E16]/60 hover:text-[#2B1E16]'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, dark, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
      dark ? 'text-white/70 hover:text-white hover:bg-white/8' : 'text-[#2B1E16]/70 hover:text-[#2B1E16] hover:bg-black/5'
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
