import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Home, FileText, Moon, Sun, Brain, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 relative group-hover:scale-110 transition-transform duration-300">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  {/* Main Circle */}
                  <circle cx="50" cy="50" r="45" fill="#2563EB"/>
                  {/* Wavy Outer Seal */}
                  <path d="M 50 20 Q 58 18 61 25 Q 68 23 71 30 Q 78 32 76 40 Q 83 45 78 51 Q 83 58 76 61 Q 78 69 71 70 Q 68 77 61 75 Q 55 82 50 78 Q 45 82 39 75 Q 32 77 29 70 Q 22 69 24 61 Q 17 58 22 51 Q 17 45 24 40 Q 22 32 29 30 Q 32 23 39 25 Q 42 18 50 20 Z" fill="#111827" />
                  {/* Inner ring space (blue) */}
                  <circle cx="50" cy="50" r="24" fill="#2563EB" />
                  {/* Deep dark center */}
                  <circle cx="50" cy="50" r="20" fill="#111827" />
                  {/* Inner shine */}
                  <path d="M 34 38 A 18 18 0 0 1 66 38" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                TalentForge
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 tracking-wider">WHERE TALENT MEETS INTELLIGENCE</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <Home className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/resume"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Resume</span>
                </Link>
                <Link
                  to="/resume-analysis"
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition"
                >
                  <Brain className="w-4 h-4" />
                  <span>Gap Analysis</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition btn-hover"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile: hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-200" />
            </button>
          </div>

          {/* Mobile menu overlay */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
              <div className="absolute top-0 right-0 w-3/4 max-w-xs h-full bg-white dark:bg-gray-900 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <div className="font-bold">{user?.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">Account</div>
                    </div>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md bg-gray-100 dark:bg-gray-800">
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-200" />
                  </button>
                </div>
                <div className="flex flex-col space-y-4">
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <Home className="w-4 h-4" /> Dashboard
                  </Link>
                  <Link to="/resume" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Resume
                  </Link>
                  <Link to="/resume-analysis" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <Brain className="w-4 h-4" /> Gap Analysis
                  </Link>
                  {isAuthenticated ? (
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg">Logout</button>
                  ) : (
                    <div className="flex flex-col gap-2 mt-4">
                      <Link to="/login" onClick={() => setMobileOpen(false)} className="py-2">Login</Link>
                      <Link to="/register" onClick={() => setMobileOpen(false)} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Get Started</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
