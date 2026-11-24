import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [modelName, setModelName] = useState('default_model');
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', modelName);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload-predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResults(response.data);
    } catch (err) {
      console.error('Error uploading file:', err);
      setError(err.response?.data?.detail || 'An error occurred while uploading the file');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Prepare chart data if we have results
  const chartData = results ? {
    labels: ['Normal Traffic', 'Intrusions'],
    datasets: [
      {
        data: [results.normal_traffic, results.intrusions_detected],
        backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['rgba(22, 163, 74, 1)', 'rgba(220, 38, 38, 1)'],
        borderWidth: 1,
      },
    ],
  } : null;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Upload Network Traffic Data</h1>
        <p className="mt-4 text-lg text-gray-600">
          Upload network traffic logs for batch analysis and intrusion detection
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Dropzone for file upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Traffic Data File
            </label>
            <div 
              {...getRootProps()} 
              className={`p-6 border-2 border-dashed rounded-md text-center cursor-pointer hover:bg-gray-50 ${
                isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div>
                  <p className="text-sm text-gray-700">Selected file: <span className="font-medium">{file.name}</span></p>
                  <p className="text-xs text-gray-500 mt-1">Size: {formatFileSize(file.size)}</p>
                </div>
              ) : isDragActive ? (
                <p className="text-gray-600">Drop the file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600">Drag and drop a network traffic file here, or click to select</p>
                  <p className="text-xs text-gray-500 mt-1">Supported file types: CSV, TXT</p>
                </div>
              )}
            </div>
            {file && (
              <button
                type="button"
                onClick={() => setFile(null)}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Remove file
              </button>
            )}
          </div>
          
          {/* Model selection */}
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              Select Model
            </label>
            <select
              id="model"
              name="model"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
            >
              <option value="default_model">Default Model</option>
              <option value="specialized_model">Specialized Model</option>
              {/* Add more model options as they become available */}
            </select>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isUploading || !file}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isUploading || !file 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
              }`}
            >
              {isUploading ? 'Analyzing...' : 'Analyze File'}
            </button>
          </div>
        </form>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mb-6">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Results section */}
        {results && (
          <div className="border-t border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Analysis Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Chart */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Traffic Distribution</h3>
                <div className="h-64">
                  <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              
              {/* Summary statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-4">Summary Statistics</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Total Records</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{results.total}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Normal Traffic</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{results.normal_traffic}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Intrusions Detected</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="font-medium text-red-600">{results.intrusions_detected}</span>
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-md">
                    <dt className="text-sm font-medium text-gray-500">Intrusion Percentage</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {results.intrusion_percentage.toFixed(2)}%
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Recommendations</h3>
              {results.intrusions_detected > 0 ? (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Alert:</strong> {results.intrusions_detected} potential intrusions detected in your network traffic.
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                    <li>Investigate the flagged traffic patterns</li>
                    <li>Consider implementing additional security measures</li>
                    <li>Monitor the affected systems for unusual behavior</li>
                  </ul>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-sm text-green-700">
                    <strong>Good news!</strong> No intrusions were detected in your network traffic.
                  </p>
                  <p className="mt-2 text-sm text-green-700">
                    Continue monitoring your network for any changes in traffic patterns.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default UploadPage; 