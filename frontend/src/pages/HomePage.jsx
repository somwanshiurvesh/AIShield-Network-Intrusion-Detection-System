import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, CloudArrowUpIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

// Base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function HomePage() {
  const [liveAnalysis, setLiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds by default

  // Function to fetch live network analysis
  const fetchLiveAnalysis = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/live-traffic`);
      setLiveAnalysis(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching live network analysis:', err);
      setError(err.response?.data?.detail || 'Failed to analyze network traffic');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and setup interval
  useEffect(() => {
    // Fetch immediately on component mount
    fetchLiveAnalysis();

    // Setup interval for periodic refresh
    const intervalId = setInterval(() => {
      fetchLiveAnalysis();
    }, refreshInterval);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  // Format bytes to human readable format
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Get appropriate colors based on prediction
  const getStatusColors = (isIntrusion) => {
    return isIntrusion 
      ? 'bg-red-50 border-red-400 text-red-800'
      : 'bg-green-50 border-green-400 text-green-800';
  };

  // Get progress bar color based on intrusion probability
  const getProgressBarColor = (probability) => {
    if (probability < 0.3) return 'bg-green-500';
    if (probability < 0.7) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-16">
      {/* Hero section */}
      <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          Network Intrusion Detection System
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500">
          Detect and prevent network intrusions using advanced machine learning techniques
        </p>
        <div className="mt-10 flex justify-center space-x-6">
          <Link
            to="/detect"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Start Detection
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Live Network Analysis Section */}
      <div className="py-12 bg-white rounded-lg shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-8">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Real-Time</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Live Network Traffic <span className="text-primary-600">Analysis</span>
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Current status of your network traffic with intrusion detection analysis
            </p>
          </div>

          {/* Analysis Results */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {loading && !liveAnalysis ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                  <span className="ml-3 text-lg font-medium text-gray-700">Analyzing network traffic...</span>
                </div>
              ) : error ? (
                <div className="border rounded-md p-4 bg-red-50 border-red-400 text-red-800">
                  <div className="flex">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span>Error: {error}</span>
                  </div>
                </div>
              ) : liveAnalysis ? (
                <div className="space-y-6">
                  {/* Status Card */}
                  <div className={`border rounded-md p-6 flex items-center justify-between ${getStatusColors(liveAnalysis.prediction === 1)}`}>
                    <div className="flex items-center">
                      {liveAnalysis.prediction === 0 ? (
                        <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3 animate-pulse" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold">
                          Network Status: {liveAnalysis.prediction_label}
                        </h3>
                        <p>
                          Confidence: {Math.round(liveAnalysis.confidence * 100)}%
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={fetchLiveAnalysis}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Refresh
                    </button>
                  </div>

                  {/* Probability Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Normal</span>
                      <span className="text-sm font-medium text-gray-700">Intrusion</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getProgressBarColor(liveAnalysis.probabilities.intrusion)}`}
                        style={{ width: `${liveAnalysis.probabilities.intrusion * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{Math.round(liveAnalysis.probabilities.normal * 100)}%</span>
                      <span>{Math.round(liveAnalysis.probabilities.intrusion * 100)}%</span>
                    </div>
                  </div>

                  {/* Network Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border rounded-md p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Data Sent</h4>
                      <p className="text-2xl font-semibold text-gray-900">{formatBytes(liveAnalysis.network_stats.bytes_sent)}</p>
                      <p className="text-sm text-gray-500">{liveAnalysis.network_stats.packets_sent} packets</p>
                    </div>
                    <div className="border rounded-md p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Data Received</h4>
                      <p className="text-2xl font-semibold text-gray-900">{formatBytes(liveAnalysis.network_stats.bytes_recv)}</p>
                      <p className="text-sm text-gray-500">{liveAnalysis.network_stats.packets_recv} packets</p>
                    </div>
                  </div>

                  {/* Auto-refresh control */}
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-700">Auto-refresh interval: </label>
                    <select 
                      value={refreshInterval}
                      onChange={(e) => setRefreshInterval(Number(e.target.value))}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                    >
                      <option value={2000}>2 seconds</option>
                      <option value={5000}>5 seconds</option>
                      <option value={10000}>10 seconds</option>
                      <option value={30000}>30 seconds</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button 
                    onClick={fetchLiveAnalysis}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Analyze Network
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white rounded-lg shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Comprehensive Network Protection
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our NIDS combines machine learning algorithms with expert domain knowledge to provide accurate intrusion detection.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Real-time Detection</h3>
                <p className="mt-2 text-base text-gray-500">
                  Analyze network traffic in real-time to identify potential intrusions and security threats.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <CloudArrowUpIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Batch Processing</h3>
                <p className="mt-2 text-base text-gray-500">
                  Upload network log files for comprehensive analysis and intrusion detection.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mx-auto">
                  <ChartBarIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-xl font-medium text-gray-900">Detailed Analytics</h3>
                <p className="mt-2 text-base text-gray-500">
                  View detailed statistics and visualizations of detected intrusions and network traffic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 