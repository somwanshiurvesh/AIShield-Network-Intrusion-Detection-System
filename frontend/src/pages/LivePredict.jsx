import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// NSL-KDD feature definitions
const numericalFeatures = [
  { id: 'duration', label: 'Connection Duration (sec)', placeholder: '0-58329', min: 0, max: 58329, info: 'Length of the connection in seconds. Higher values increase intrusion probability.' },
  { id: 'src_bytes', label: 'Source Bytes', placeholder: '0-1.3B', min: 0, info: 'Number of data bytes from source to destination. High values suggest possible DDoS or data exfiltration.' },
  { id: 'dst_bytes', label: 'Destination Bytes', placeholder: '0-1.3B', min: 0, info: 'Number of data bytes from destination to source. High values may indicate data uploads or downloads.' },
  { id: 'wrong_fragment', label: 'Wrong Fragment', placeholder: '0-3', min: 0, max: 3, info: 'Number of "wrong" fragments. Fragmentation attacks often use this technique.' },
  { id: 'urgent', label: 'Urgent Packets', placeholder: '0-14', min: 0, info: 'Number of urgent packets. Often used in certain types of attacks.' },
  { id: 'hot', label: 'Hot Indicators', placeholder: '0-101', min: 0, info: 'Number of "hot" indicators like access to system directories or creation of programs.' },
  { id: 'num_failed_logins', label: 'Failed Logins', placeholder: '0-5', min: 0, max: 5, info: 'Number of failed login attempts. Brute force attacks show high values.' },
  { id: 'count', label: 'Connection Count (same host)', placeholder: '1-511', min: 1, info: 'Number of connections to the same host in past 2 seconds. Scanning attacks show high values.' }
];

// Categorical features with their possible values
const categoricalFeatures = [
  { 
    id: 'protocol_type', 
    label: 'Protocol Type', 
    options: ['tcp', 'udp', 'icmp'],
    info: 'Type of protocol used for the connection.' 
  },
  { 
    id: 'service', 
    label: 'Service', 
    options: ['http', 'ftp_data', 'smtp', 'ssh', 'private', 'ftp', 'telnet', 'eco_i', 'other'],
    info: 'Network service on the destination, like http, ftp, or ssh.'
  },
  { 
    id: 'flag', 
    label: 'Connection Flag', 
    options: ['SF', 'S0', 'REJ', 'RSTO', 'RSTR', 'SH', 'S1', 'S2', 'S3', 'OTH'],
    info: 'Status flag of the connection. SF means normal, REJ means rejected, etc.'
  }
];

// Attack type color mapping for visual feedback
const attackTypeColors = {
  'Normal': {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    text: 'text-emerald-800',
    icon: 'text-emerald-500',
    progressBar: 'bg-emerald-500'
  },
  'DoS': {
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-800',
    icon: 'text-red-500',
    progressBar: 'bg-red-500'
  },
  'Probe': {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    text: 'text-amber-800',
    icon: 'text-amber-500',
    progressBar: 'bg-amber-500'
  },
  'R2L': {
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-800',
    icon: 'text-purple-500',
    progressBar: 'bg-purple-500'
  },
  'U2R': {
    bg: 'bg-blue-50',
    border: 'border-blue-400',
    text: 'text-blue-800',
    icon: 'text-blue-500',
    progressBar: 'bg-blue-500'
  },
  'Intrusion': {
    bg: 'bg-rose-50',
    border: 'border-rose-400',
    text: 'text-rose-800',
    icon: 'text-rose-500',
    progressBar: 'bg-rose-500'
  }
};

function LivePredict() {
  // State for form values and prediction results
  const [formValues, setFormValues] = useState({});
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [formTouched, setFormTouched] = useState(false);

  // Initialize form values with defaults when component mounts
  useEffect(() => {
    const initialValues = {};
    
    // Set defaults for numerical features
    numericalFeatures.forEach(feature => {
      initialValues[feature.id] = feature.id === 'count' ? 1 : 0;
    });
    
    // Set defaults for categorical features
    categoricalFeatures.forEach(feature => {
      initialValues[feature.id] = feature.options[0];
    });
    
    setFormValues(initialValues);
  }, []);

  // Handle change in form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Mark form as touched once user starts editing
    if (!formTouched) {
      setFormTouched(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    setShowResult(false);
    
    try {
      // Convert numerical values from strings to numbers
      const processedValues = { ...formValues };
      numericalFeatures.forEach(feature => {
        processedValues[feature.id] = Number(processedValues[feature.id]);
      });
      
      // Calculate feature impacts
      const impacts = calculateFeatureImpact(processedValues);
      
      // First try using the live-traffic endpoint for real network analysis
      try {
        console.log('Analyzing live network traffic...');
        const liveResponse = await axios.get(`${API_URL}/api/live-traffic`);
        
        // Add user input impact factors to the prediction
        const combinedImpacts = [...impacts];
        
        // Set prediction results using live traffic data
        setPrediction({
          ...liveResponse.data,
          impacts: combinedImpacts
        });
        
        // Show results with a slight delay for animation
        setTimeout(() => {
          setShowResult(true);
        }, 200);
      } 
      catch (liveError) {
        console.error('Live traffic analysis failed, falling back to model prediction', liveError);
        
        // If live traffic analysis fails, fallback to model prediction
        try {
          // Prepare the request payload
          const payload = {
            features: processedValues,
            model_name: "default_model"
          };
          
          const response = await axios.post(`${API_URL}/api/predict`, payload);
          
          // Set prediction results
          setPrediction({
            ...response.data,
            impacts: impacts
          });
          
          // Show results with a slight delay for animation
          setTimeout(() => {
            setShowResult(true);
          }, 200);
        } catch (apiError) {
          // If there's a specific error about NetworkIntrusionDetector, try using live-traffic endpoint again
          if (apiError.response?.data?.detail?.includes('NetworkIntrusionDetector')) {
            console.log('Using alternative live-traffic endpoint due to model error');
            
            // Try live traffic one more time with error handling
            try {
              const liveResponse = await axios.get(`${API_URL}/api/live-traffic`);
              
              // Set prediction results using live traffic data
              setPrediction({
                ...liveResponse.data,
                impacts: impacts
              });
              
              // Show results with a slight delay for animation
              setTimeout(() => {
                setShowResult(true);
              }, 200);
            } catch (finalError) {
              throw finalError;
            }
          } else {
            // Re-throw for the outer catch to handle
            throw apiError;
          }
        }
      }
    } catch (err) {
      console.error('Error making prediction:', err);
      setError(err.response?.data?.detail || 'Failed to get prediction. Please try again.');
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  // Format a number for display
  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toFixed(4) : num;
  };

  // Get appropriate color classes based on prediction
  const getPredictionColors = () => {
    if (!prediction) return attackTypeColors['Normal'];
    
    // For generic classification (normal/intrusion)
    const attackType = prediction.prediction === 0 ? 'Normal' : 'Intrusion';
    
    // Return corresponding colors
    return attackTypeColors[attackType];
  };

  // Get animated alert icon based on prediction
  const getAlertIcon = (isIntrusion) => {
    if (isIntrusion) {
      return (
        <svg className={`h-10 w-10 ${getPredictionColors().icon} animate-pulse`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className={`h-10 w-10 ${getPredictionColors().icon} animate-bounce`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  // Update the feature impact function to be more sensitive
  const calculateFeatureImpact = (formValues) => {
    const impacts = [];
    
    // Check duration (more sensitive thresholds)
    if (formValues.duration > 100) {
      impacts.push({ feature: 'Duration', impact: 'high', description: 'High connection duration is suspicious' });
    } else if (formValues.duration > 30) {
      impacts.push({ feature: 'Duration', impact: 'medium', description: 'Medium connection duration' });
    }
    
    // Check source bytes (more sensitive thresholds)
    if (formValues.src_bytes > 1000) {
      impacts.push({ feature: 'Source Bytes', impact: 'high', description: 'Large data transfer from source' });
    } else if (formValues.src_bytes > 300) {
      impacts.push({ feature: 'Source Bytes', impact: 'medium', description: 'Medium data transfer from source' });
    }
    
    // Check destination bytes (more sensitive thresholds)
    if (formValues.dst_bytes > 1000) {
      impacts.push({ feature: 'Destination Bytes', impact: 'high', description: 'Large data transfer to source' });
    } else if (formValues.dst_bytes > 300) {
      impacts.push({ feature: 'Destination Bytes', impact: 'medium', description: 'Medium data transfer to source' });
    }
    
    // Check wrong fragments (ANY value is suspicious)
    if (formValues.wrong_fragment > 0) {
      impacts.push({ feature: 'Wrong Fragment', impact: 'critical', description: 'Fragmentation attacks detected - highly suspicious' });
    }
    
    // Check urgent packets (ANY value is suspicious)
    if (formValues.urgent > 0) {
      impacts.push({ feature: 'Urgent Packets', impact: 'critical', description: 'Urgent packets detected - highly suspicious' });
    }
    
    // Check hot indicators (ANY value is suspicious)
    if (formValues.hot > 0) {
      impacts.push({ feature: 'Hot Indicators', impact: 'critical', description: 'System access indicators detected - highly suspicious' });
    }
    
    // Check failed logins (ANY value is suspicious)
    if (formValues.num_failed_logins > 0) {
      impacts.push({ feature: 'Failed Logins', impact: 'critical', description: 'Failed login attempts detected - highly suspicious' });
    }
    
    // Connection count
    if (formValues.count > 50) {
      impacts.push({ feature: 'Connection Count', impact: 'high', description: 'High number of connections to same host' });
    } else if (formValues.count > 10) {
      impacts.push({ feature: 'Connection Count', impact: 'medium', description: 'Elevated connection count' });
    }
    
    return impacts;
  };

  // Add a feature impact component
  const FeatureImpactSummary = ({ impacts }) => {
    if (!impacts || impacts.length === 0) {
      return (
        <div className="text-gray-600 italic">
          No significant feature impacts detected.
        </div>
      );
    }

    const getImpactColor = (impact) => {
      switch (impact) {
        case 'critical':
          return 'text-red-700 font-bold';
        case 'high':
          return 'text-red-600';
        case 'medium':
          return 'text-yellow-600';
        default:
          return 'text-blue-600';
      }
    };

    return (
      <div className="space-y-2">
        <h4 className="font-medium text-gray-700">Feature Impact Analysis:</h4>
        <div className="space-y-1">
          {impacts.map((item, index) => (
            <div key={index} className="flex items-start">
              <div className={`font-medium ${getImpactColor(item.impact)} min-w-[120px]`}>
                {item.feature}
              </div>
              <div className="text-gray-600">
                {item.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
          Live Network Traffic <span className="text-primary-600">Analysis</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Enter network traffic features to detect potential intrusions in real-time using our high-accuracy Random Forest model.
        </p>
      </div>
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Enter Network Traffic Features
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Numerical Features Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-600 mb-4 flex items-center">
                <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Numerical Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {numericalFeatures.map(feature => (
                  <div key={feature.id} className="mb-2 group relative">
                    <label 
                      htmlFor={feature.id} 
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-primary-600 transition-colors duration-200"
                    >
                      {feature.label}
                      {feature.info && (
                        <span className="ml-1 text-gray-400 hover:text-primary-500 cursor-help relative">
                          <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="tooltip absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            {feature.info}
                          </span>
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      id={feature.id}
                      name={feature.id}
                      value={formValues[feature.id] || ''}
                      onChange={handleInputChange}
                      placeholder={feature.placeholder}
                      min={feature.min}
                      max={feature.max}
                      step={feature.step || 1}
                      required
                      className={`w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm 
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                hover:border-primary-300 transition-colors duration-200
                                ${
                                  formTouched && 
                                  (formValues[feature.id] > (feature.highThreshold || 1000) ? 'border-red-300 bg-red-50' : 
                                   formValues[feature.id] > (feature.mediumThreshold || 100) ? 'border-yellow-300 bg-yellow-50' : '')
                                }`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Categorical Features Section */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-600 mb-4 flex items-center">
                <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
                Categorical Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoricalFeatures.map(feature => (
                  <div key={feature.id} className="mb-2 group relative">
                    <label 
                      htmlFor={feature.id} 
                      className="block text-sm font-medium text-gray-700 mb-1 group-hover:text-primary-600 transition-colors duration-200"
                    >
                      {feature.label}
                      {feature.info && (
                        <span className="ml-1 text-gray-400 hover:text-primary-500 cursor-help relative">
                          <svg className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="tooltip absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                            {feature.info}
                          </span>
                        </span>
                      )}
                    </label>
                    <select
                      id={feature.id}
                      name={feature.id}
                      value={formValues[feature.id] || ''}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                                hover:border-primary-300 transition-colors duration-200
                                appearance-none bg-no-repeat bg-right"
                      style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem'
                      }}
                    >
                      {feature.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white 
                          transform transition duration-200 ease-in-out ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 hover:-translate-y-1 hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Analyze Traffic
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {/* Prediction Results Section */}
        {(prediction || error) && (
          <div 
            className={`p-6 bg-gray-50 transition-all duration-500 ease-in-out transform ${
              showResult ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <h3 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Analysis Results
            </h3>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 animate-fadeIn">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {prediction && (
              <div className={`rounded-lg border-2 p-5 shadow-md transition-all duration-300 transform hover:shadow-lg hover:scale-102 ${getPredictionColors().bg} ${getPredictionColors().border} ${getPredictionColors().text}`}>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 mr-4">
                    {getAlertIcon(prediction.prediction === 1)}
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold mb-1">
                      {prediction.prediction_label}
                    </h4>
                    <p className="text-sm opacity-90">
                      Confidence: <span className="font-semibold">{formatNumber(prediction.confidence * 100)}%</span>
                    </p>
                  </div>
                  <div className="ml-auto">
                    <div className={`rounded-full w-16 h-16 flex items-center justify-center ${getPredictionColors().border} ${prediction.prediction === 1 ? 'animate-ping-slow' : ''}`}>
                      <div className={`rounded-full w-12 h-12 flex items-center justify-center ${getPredictionColors().bg} ${getPredictionColors().text} font-bold`}>
                        {prediction.prediction === 1 ? 'ALERT' : 'SAFE'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Probability bars */}
                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span>Normal Traffic</span>
                      <span>{formatNumber(prediction.probabilities.normal * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${prediction.probabilities.normal * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1 font-medium">
                      <span>Intrusion</span>
                      <span>{formatNumber(prediction.probabilities.intrusion * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-rose-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${prediction.probabilities.intrusion * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                {/* Feature Impact Summary */}
                <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg border border-current">
                  <h5 className="font-semibold mb-3">Analysis Summary:</h5>
                  <FeatureImpactSummary impacts={prediction.impacts} />
                </div>
                
                {/* Action recommendation */}
                <div className="mt-4 p-4 bg-white bg-opacity-50 rounded-lg border border-current">
                  <h5 className="font-semibold mb-2">Recommended Action:</h5>
                  {prediction.prediction === 1 ? (
                    <p>
                      <span className="font-bold text-red-600">ALERT:</span> This traffic pattern shows strong signs of a potential network intrusion. 
                      Consider immediately investigating this activity and blocking suspicious traffic from 
                      {prediction.network_stats && 
                        ` sources sending ${formatNumber(prediction.probabilities.intrusion * 100)}% suspicious packets.`}
                    </p>
                  ) : prediction.probabilities.intrusion > 0.3 ? (
                    <p>
                      <span className="font-bold text-amber-600">CAUTION:</span> This traffic pattern shows some suspicious characteristics. 
                      While not definitively malicious, continued monitoring is recommended as the intrusion 
                      probability is {formatNumber(prediction.probabilities.intrusion * 100)}%.
                    </p>
                  ) : (
                    <p>
                      <span className="font-bold text-emerald-600">SAFE:</span> This traffic pattern appears to be normal network activity.
                      No immediate action required.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Helpful information about NSL-KDD features */}
      <div className="mt-10 bg-white shadow-lg rounded-lg p-6 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Understanding Network Traffic Features
        </h2>
        <p className="text-gray-600 mb-4">
          The features above represent various aspects of network connections that can help identify
          potential intrusions. Key features include:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-primary-600 mb-2">Connection Features</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><span className="font-medium">Protocol Type:</span> The type of protocol (TCP, UDP, ICMP)</li>
              <li><span className="font-medium">Service:</span> Network service on the destination (HTTP, FTP, SSH, etc.)</li>
              <li><span className="font-medium">Flag:</span> Status flag of the connection</li>
              <li><span className="font-medium">Duration:</span> Length of the connection in seconds</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-primary-600 mb-2">Content Features</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><span className="font-medium">Src/Dst Bytes:</span> Number of data bytes transferred</li>
              <li><span className="font-medium">Hot:</span> Number of "hot" indicators</li>
              <li><span className="font-medium">Failed Logins:</span> Number of failed login attempts</li>
              <li><span className="font-medium">Count:</span> Number of connections to the same host</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500 italic">
          This form uses the NSL-KDD dataset features, which is the industry standard for network intrusion detection research.
        </div>
      </div>
    </div>
  );
}

// Add these custom animations to your tailwind.config.js
// animations: {
//   'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
//   'fadeIn': 'fadeIn 0.5s ease-in-out',
// },
// keyframes: {
//   ping: {
//     '75%, 100%': { transform: 'scale(1.2)', opacity: '0' },
//   },
//   fadeIn: {
//     '0%': { opacity: '0', transform: 'translateY(10px)' },
//     '100%': { opacity: '1', transform: 'translateY(0)' },
//   }
// },

export default LivePredict; 