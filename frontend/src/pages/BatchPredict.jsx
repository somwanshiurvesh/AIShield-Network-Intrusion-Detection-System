import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

// Base URL for the backend API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Color scheme for prediction types
const predictionColors = {
  'Normal': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Intrusion': 'bg-rose-100 text-rose-800 border-rose-200',
  'DoS': 'bg-red-100 text-red-800 border-red-200',
  'Probe': 'bg-amber-100 text-amber-800 border-amber-200',
  'R2L': 'bg-purple-100 text-purple-800 border-purple-200',
  'U2R': 'bg-blue-100 text-blue-800 border-blue-200'
};

function BatchPredict() {
  // State management
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const fileInputRef = useRef(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  
  // Effect to filter data when search query or results change
  useEffect(() => {
    if (!results || !results.preview) {
      setFilteredData([]);
      return;
    }
    
    if (!searchQuery) {
      setFilteredData(results.preview);
      setCurrentPage(1);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = results.preview.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(lowercaseQuery)
      )
    );
    
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, results]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    
    // Reset states
    setError(null);
    setResults(null);
    
    // Validate file type
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please upload a CSV file only.');
        setFile(null);
        setFileName('');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
    } else {
      setFile(null);
      setFileName('');
    }
  };

  // Handle file upload and prediction
  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model_name', 'nids_model_rf'); // Using the high-accuracy Random Forest model
      formData.append('include_probabilities', 'true');
      
      // Send request to the backend
      const response = await axios.post(`${API_URL}/api/predict-batch`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Set results
      setResults(response.data);
    } catch (err) {
      console.error('Error in batch prediction:', err);
      setError(
        err.response?.data?.detail || 
        'Failed to process the file. Please check the format and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle downloading results
  const handleDownload = async () => {
    if (!results || !results.file_id) {
      setError('No results available to download.');
      return;
    }
    
    try {
      // Request the file download
      const response = await axios.get(`${API_URL}/api/download/${results.file_id}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `predicted_${fileName}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading results:', err);
      setError('Failed to download results. Please try again.');
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setFileName('');
    setResults(null);
    setError(null);
    setSearchQuery('');
    setCurrentPage(1);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle table sorting
  const requestSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Get sorted preview data with pagination
  const getSortedPreview = () => {
    if (!filteredData.length) return [];
    
    const sortableData = [...filteredData];
    
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return sortableData;
  };
  
  // Get paginated data
  const getPaginatedData = () => {
    const sortedData = getSortedPreview();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page, last page, and pages around current page
      const leftBound = Math.max(1, currentPage - 1);
      const rightBound = Math.min(totalPages, currentPage + 1);
      
      if (leftBound > 1) {
        pages.push(1);
        if (leftBound > 2) {
          pages.push('...');
        }
      }
      
      for (let i = leftBound; i <= rightBound; i++) {
        pages.push(i);
      }
      
      if (rightBound < totalPages) {
        if (rightBound < totalPages - 1) {
          pages.push('...');
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Get color class for prediction badge
  const getPredictionColor = (predictionLabel) => {
    // Default to Intrusion if not found
    return predictionColors[predictionLabel] || predictionColors['Intrusion'];
  };

  // Get sort indicator for table headers
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) {
      return (
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
        </svg>
      );
    }
    
    return sortConfig.direction === 'ascending' ? (
      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="h-4 w-4 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 tracking-tight">
          Batch Network Traffic <span className="text-primary-600">Analysis</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Upload a CSV file containing multiple network traffic records for batch analysis.
        </p>
      </div>
      
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        {/* File Upload Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Network Traffic Data
          </h2>
          
          <form onSubmit={handleUpload} className="space-y-6">
            <div className="flex flex-col items-center justify-center w-full">
              <label 
                htmlFor="file-upload" 
                className={`w-full h-32 px-4 flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer 
                  ${file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50'}
                  transition-colors duration-200 ease-in-out`}
              >
                <div className="flex flex-col items-center justify-center">
                  {!file ? (
                    <>
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium text-primary-600">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">CSV files only</p>
                    </>
                  ) : (
                    <>
                      <svg className="w-10 h-10 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mt-2 text-sm font-medium text-primary-600">{fileName}</p>
                      <p className="text-xs text-gray-500">Ready for analysis</p>
                    </>
                  )}
                </div>
                <input 
                  id="file-upload" 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </label>
              
              {error && (
                <div className="mt-3 text-sm text-red-600 flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-4">
              <button
                type="button"
                onClick={handleReset}
                disabled={loading || !file}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  !file || loading
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                Reset
              </button>
              
              <button
                type="submit"
                disabled={loading || !file}
                className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-progress'
                    : !file 
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : "Analyze Data"}
              </button>
            </div>
          </form>
        </div>
        
        {/* Results Section */}
        {results && (
          <div className="p-6 bg-gray-50 border-t border-gray-200 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-semibold text-gray-700 flex items-center">
                <svg className="h-6 w-6 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analysis Results
              </h3>
              
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search results..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                  />
                </div>
                
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download CSV
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-gray-200">
                <div className="bg-primary-50 rounded-lg p-3 border border-primary-100">
                  <p className="text-xs text-primary-500 font-medium">Total Records</p>
                  <p className="text-2xl font-bold text-gray-800">{results.total_records}</p>
                </div>
                
                <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                  <p className="text-xs text-rose-500 font-medium">Intrusions Detected</p>
                  <p className="text-2xl font-bold text-gray-800">{results.intrusions_detected}</p>
                </div>
                
                <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                  <p className="text-xs text-emerald-500 font-medium">Normal Traffic</p>
                  <p className="text-2xl font-bold text-gray-800">{results.normal_traffic}</p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                  <p className="text-xs text-amber-500 font-medium">Intrusion Percentage</p>
                  <p className="text-2xl font-bold text-gray-800">{results.intrusion_percentage.toFixed(1)}%</p>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2 md:mb-0">Results Preview</h4>
                  
                  <div className="flex items-center space-x-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-500">Show:</label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={handleItemsPerPageChange}
                      className="border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm p-1"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-500">items per page</span>
                  </div>
                </div>
                
                <div className="overflow-x-auto bg-white shadow-sm border border-gray-200 rounded-lg">
                  <div className="max-h-[400px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          {filteredData.length > 0 && Object.keys(filteredData[0]).map((key, index) => {
                            // Skip some columns that are too technical or redundant
                            if (['prediction'].includes(key)) return null;
                            
                            return (
                              <th 
                                key={key} 
                                scope="col" 
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                                onClick={() => requestSort(key)}
                              >
                                <div className="flex items-center space-x-1">
                                  <span>{key.replace(/_/g, ' ')}</span>
                                  {getSortIndicator(key)}
                                </div>
                              </th>
                            );
                          })}
                          <th 
                            scope="col" 
                            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 bg-gray-50"
                            onClick={() => requestSort('prediction_label')}
                          >
                            <div className="flex items-center space-x-1">
                              <span>Prediction</span>
                              {getSortIndicator('prediction_label')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {getPaginatedData().map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'}>
                            {Object.entries(row).map(([key, value], cellIndex) => {
                              // Skip some columns that are too technical or redundant
                              if (['prediction'].includes(key)) return null;
                              
                              // Special formatting for prediction_label
                              if (key === 'prediction_label') {
                                return (
                                  <td key={cellIndex} className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPredictionColor(value)}`}>
                                      {value}
                                    </span>
                                  </td>
                                );
                              }
                              
                              // Default cell rendering
                              return (
                                <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Empty state */}
                    {filteredData.length === 0 && (
                      <div className="py-6 text-center bg-white">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">
                          {searchQuery ? "No results match your search." : "No data available."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Pagination */}
                {filteredData.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
                    <div className="text-sm text-gray-500 mb-3 sm:mb-0">
                      Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} results
                      {searchQuery && filteredData.length < results.preview.length && ` (filtered from ${results.preview.length})`}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                          currentPage === 1
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      
                      {getPageNumbers().map((page, index) => (
                        <button
                          key={index}
                          onClick={() => typeof page === 'number' && setCurrentPage(page)}
                          disabled={page === '...'}
                          className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                            page === currentPage
                              ? 'border-primary-500 bg-primary-50 text-primary-600 z-10'
                              : page === '...'
                                ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                          currentPage === totalPages
                            ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Help Text */}
      <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-700 mb-4 flex items-center">
          <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Use Batch Analysis
        </h2>
        
        <div className="prose prose-sm max-w-none text-gray-600">
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Prepare your CSV file</strong> with network traffic features. Each row should contain all required features for a single connection.</li>
            <li><strong>Upload the file</strong> using the form above. Only CSV files are supported.</li>
            <li><strong>View the results</strong> in the table below. The system will analyze each record and provide a prediction.</li>
            <li><strong>Download the results</strong> as a CSV file for further analysis or record-keeping.</li>
          </ol>
          
          <p className="mt-4">
            The analysis is performed using our high-accuracy Random Forest model, which has been trained on the NSL-KDD dataset.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BatchPredict; 