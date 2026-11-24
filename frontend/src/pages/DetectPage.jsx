import React, { useState } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Sample feature fields for NSL-KDD dataset
const featureFields = [
  { name: 'duration', label: 'Duration', type: 'number', defaultValue: 0 },
  { name: 'protocol_type', label: 'Protocol Type', type: 'select', options: ['tcp', 'udp', 'icmp'], defaultValue: 'tcp' },
  { name: 'service', label: 'Service', type: 'select', options: ['http', 'ftp_data', 'smtp', 'other'], defaultValue: 'http' },
  { name: 'flag', label: 'Flag', type: 'select', options: ['SF', 'S0', 'REJ', 'RSTO', 'other'], defaultValue: 'SF' },
  { name: 'src_bytes', label: 'Source Bytes', type: 'number', defaultValue: 0 },
  { name: 'dst_bytes', label: 'Destination Bytes', type: 'number', defaultValue: 0 },
  // Add more features as needed
];

function DetectPage() {
  const [features, setFeatures] = useState(() => {
    const initialState = {};
    featureFields.forEach(field => {
      initialState[field.name] = field.defaultValue;
    });
    return initialState;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeatures(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/predict`, {
        features,
        model_name: 'default_model'
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Error making prediction:', err);
      setError(err.response?.data?.detail || 'An error occurred while making the prediction');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Network Intrusion Detection</h1>
        <p className="mt-4 text-lg text-gray-600">
          Enter network traffic features to detect potential intrusions
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureFields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                {field.type === 'select' ? (
                  <select
                    id={field.name}
                    name={field.name}
                    value={features[field.name]}
                    onChange={handleInputChange}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    id={field.name}
                    name={field.name}
                    value={features[field.name]}
                    onChange={handleInputChange}
                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isLoading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {isLoading ? 'Detecting...' : 'Detect Intrusion'}
            </button>
          </div>
        </form>
        
        {/* Results section */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {result && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detection Result</h2>
            
            <div className={`p-4 rounded-lg ${
              result.prediction === 1 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  result.prediction === 1 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {result.prediction === 1 ? '!' : '✓'}
                </div>
                <div className="ml-4">
                  <h3 className={`text-lg font-medium ${
                    result.prediction === 1 ? 'text-red-800' : 'text-green-800'
                  }`}>
                    {result.prediction_label}
                  </h3>
                  <p className={`text-sm ${
                    result.prediction === 1 ? 'text-red-700' : 'text-green-700'
                  }`}>
                    Confidence: {(result.confidence * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Probabilities</h4>
                <div className="mt-2 space-y-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">Normal</div>
                      <div className="text-sm font-medium text-gray-500">
                        {(result.probabilities.normal * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${result.probabilities.normal * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">Intrusion</div>
                      <div className="text-sm font-medium text-gray-500">
                        {(result.probabilities.intrusion * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${result.probabilities.intrusion * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetectPage; 