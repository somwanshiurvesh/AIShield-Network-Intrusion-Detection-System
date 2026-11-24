import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import ThemeToggle from './components/ThemeToggle';
import Dashboard from './pages/Dashboard';
import LivePredict from './pages/LivePredict';
import BatchAnalysis from './pages/BatchPredict';
import ModelInsights from './pages/ModelInsights';
import Login from './pages/Login';
import About from './pages/About';
import NotFound from './pages/NotFound';
import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 10
  },
  in: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -10
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Configure axios to use token for requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token with backend
      const verifyToken = async () => {
        try {
          const response = await axios.get('/api/auth/verify');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        } finally {
          setIsLoading(false);
        }
      };
      
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Handle login
  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white transition-colors duration-200">
      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      
      {/* Theme toggle positioned in the corner when not authenticated */}
      {!isAuthenticated && (
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
      )}
      
      <AnimatePresence mode="wait">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : (
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Login onLogin={handleLogin} />
              </motion.div>
            )
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Dashboard />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/live-predict" element={
            <ProtectedRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <LivePredict />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/batch-analysis" element={
            <ProtectedRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <BatchAnalysis />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/model-insights" element={
            <ProtectedRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <ModelInsights />
              </motion.div>
            </ProtectedRoute>
          } />
          
          <Route path="/about" element={
            <ProtectedRoute>
              <motion.div
                initial="initial"
                animate="in"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
              >
                <About />
              </motion.div>
            </ProtectedRoute>
          } />
          
          {/* 404 Not Found */}
          <Route path="*" element={
            <motion.div
              initial="initial"
              animate="in"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <NotFound />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default App; 