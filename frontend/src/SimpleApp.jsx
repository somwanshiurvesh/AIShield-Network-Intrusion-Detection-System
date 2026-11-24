import React, { useState } from 'react';

const SimpleApp = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div 
      style={{ 
        minHeight: '100vh', 
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        color: isDarkMode ? '#ffffff' : '#333333',
        transition: 'all 0.3s ease',
        padding: '20px'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '40px 0' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '10px' }}>
            Network Intrusion Detection System
          </h1>
          <p style={{ fontSize: '18px', opacity: 0.8 }}>
            Detect and analyze network security threats
          </p>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              padding: '8px 16px',
              backgroundColor: isDarkMode ? '#ffffff' : '#333333',
              color: isDarkMode ? '#333333' : '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
        </header>

        <main>
          <div style={{ 
            backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', 
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '20px'
          }}>
            <h2 style={{ marginBottom: '15px' }}>System Status</h2>
            <p>Backend API: {process.env.REACT_APP_API_URL || 'http://localhost:8001'}</p>
            <p>Environment: {process.env.NODE_ENV || 'development'}</p>
            <div style={{ 
              backgroundColor: '#4caf50', 
              color: 'white',
              padding: '10px 15px',
              borderRadius: '4px',
              display: 'inline-block',
              marginTop: '10px'
            }}>
              Frontend Running Successfully
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '20px'
          }}>
            {['Dashboard', 'Live Predict', 'Batch Analysis', 'Model Insights'].map((item) => (
              <div key={item} style={{ 
                backgroundColor: isDarkMode ? '#2d2d2d' : '#ffffff', 
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: '10px' }}>{item}</h3>
                <p style={{ opacity: 0.7 }}>This is a placeholder for the {item} feature.</p>
                <button style={{
                  marginTop: '15px',
                  padding: '8px 16px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Open {item}
                </button>
              </div>
            ))}
          </div>
        </main>

        <footer style={{ 
          marginTop: '40px', 
          textAlign: 'center',
          padding: '20px',
          borderTop: `1px solid ${isDarkMode ? '#333333' : '#e0e0e0'}`
        }}>
          <p>© 2025 Network Intrusion Detection System</p>
        </footer>
      </div>
    </div>
  );
};

export default SimpleApp; 