import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';

const Login = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // For demo purposes, automatically log in after 1 second
  useEffect(() => {
    const autoLogin = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Mock user data
        const mockUserData = {
          id: 1,
          username: 'demo_user',
          email: 'demo@example.com',
          role: 'admin',
        };
        
        // Mock token
        const mockToken = 'demo_token_123456789';
        
        // Call the onLogin handler from App.js
        onLogin(mockToken, mockUserData);
        
        // Navigate to dashboard
        navigate('/');
        
        setIsLoading(false);
      }, 1000);
    };
    
    // Auto login for demo purposes
    autoLogin();
  }, [onLogin, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            NIDS Demo Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Automatic login for demonstration purposes
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Logging in automatically...</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value="demo_user"
                    readOnly
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value="••••••••"
                    readOnly
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login; 