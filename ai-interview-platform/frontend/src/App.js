import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumePage from './pages/ResumePage';
import NewInterview from './pages/NewInterview';
import InterviewSession from './pages/InterviewSession';
import LiveAIInterview from './pages/LiveAIInterview';
import ResumeAnalysis from './pages/ResumeAnalysis';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};

function AppContent() {
  const location = useLocation();
  const isInterviewSession = 
    location.pathname.includes('/interview/') || 
    location.pathname.includes('/practice-interview/') || 
    location.pathname.includes('/live-ai-interview/');

  return (
    <div className="min-h-screen bg-page text-text transition-colors duration-300">
      {isInterviewSession ? (
        <header className="bg-transparent py-4 px-6 absolute top-0 left-0 w-full z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-start">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 relative">
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
              <div className="flex flex-col text-left">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 dark:from-blue-400 dark:via-blue-300 dark:to-blue-400 bg-clip-text text-transparent">
                  TalentForge
                </span>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 -mt-1 tracking-wider">WHERE TALENT MEETS INTELLIGENCE</span>
              </div>
            </div>
          </div>
        </header>
      ) : (
        <Navbar />
      )}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Resume and Interview routes */}
        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/new"
          element={
            <ProtectedRoute>
              <NewInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/:id"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice-interview/:id"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/live-ai-interview/:id"
          element={
            <ProtectedRoute>
              <LiveAIInterview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-analysis"
          element={
            <ProtectedRoute>
              <ResumeAnalysis />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-page text-text">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">404</h1>
                <p className="text-xl opacity-75 mb-8">Page not found</p>
                <a href="/" className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
