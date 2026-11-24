import React from 'react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Network Intrusion Detection System
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">
              Built with FastAPI, React, and Tailwind CSS
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 