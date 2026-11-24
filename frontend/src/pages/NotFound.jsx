import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-5 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg p-8 space-y-8 text-center bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-6xl font-bold text-red-500">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-300">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="pt-6">
          <Link 
            to="/" 
            className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 