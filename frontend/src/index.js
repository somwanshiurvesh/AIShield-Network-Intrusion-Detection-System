import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';

// Create a simple test App if the main App fails
const TestApp = () => {
  return (
    <div style={{ 
      padding: '50px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>NIDS Frontend Test</h1>
      <p>If you can see this, the basic React setup is working correctly.</p>
      <p>API URL: {process.env.REACT_APP_API_URL || 'Not set'}</p>
      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h2>Troubleshooting</h2>
        <p>If you're seeing this instead of the main app, there might be an error in the App component.</p>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));

// Try to render the main App, but fall back to TestApp if it fails
try {
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering main App:', error);
  root.render(
    <React.StrictMode>
      <TestApp />
    </React.StrictMode>
  );
} 