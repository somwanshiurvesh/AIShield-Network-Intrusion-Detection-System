import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // In a real application, you would have an endpoint to fetch metrics
        // For now, we'll use mock data that would come from the backend
        
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for demonstration
        const mockData = {
          model_name: "default_model",
          timestamp: new Date().toISOString(),
          total_predictions: 1250,
          metrics: {
            accuracy: 0.9254,
            precision: 0.9187,
            recall: 0.9342,
            f1_score: 0.9263,
            roc_auc: 0.9512
          },
          class_distribution: {
            normal: 856,
            intrusion: 394
          },
          attack_types: {
            dos: 210,
            probe: 93,
            r2l: 67,
            u2r: 24
          },
          recent_detections: [
            { timestamp: "2023-08-25T14:23:15", type: "normal", confidence: 0.98 },
            { timestamp: "2023-08-25T14:22:45", type: "dos", confidence: 0.87 },
            { timestamp: "2023-08-25T14:21:30", type: "normal", confidence: 0.95 },
            { timestamp: "2023-08-25T14:20:10", type: "probe", confidence: 0.76 },
            { timestamp: "2023-08-25T14:19:05", type: "normal", confidence: 0.99 }
          ]
        };
        
        setMetrics(mockData);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Failed to load dashboard metrics. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Prepare chart data
  const distributionData = {
    labels: ['Normal Traffic', 'Intrusions'],
    datasets: [
      {
        data: [metrics.class_distribution.normal, metrics.class_distribution.intrusion],
        backgroundColor: ['rgba(34, 197, 94, 0.7)', 'rgba(239, 68, 68, 0.7)'],
        borderColor: ['rgba(22, 163, 74, 1)', 'rgba(220, 38, 38, 1)'],
        borderWidth: 1,
      },
    ],
  };
  
  const attackTypesData = {
    labels: Object.keys(metrics.attack_types).map(type => type.toUpperCase()),
    datasets: [
      {
        label: 'Number of Detections',
        data: Object.values(metrics.attack_types),
        backgroundColor: [
          'rgba(239, 68, 68, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(14, 165, 233, 0.7)',
          'rgba(168, 85, 247, 0.7)',
        ],
        borderColor: [
          'rgba(220, 38, 38, 1)',
          'rgba(217, 119, 6, 1)',
          'rgba(2, 132, 199, 1)',
          'rgba(126, 34, 206, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Network Intrusion Detection Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">
          Real-time analytics and visualization of network intrusion detection
        </p>
      </div>
      
      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Total Records" 
          value={metrics.total_predictions} 
          subtitle="Analyzed traffic records" 
          icon="📊"
        />
        <MetricCard 
          title="Accuracy" 
          value={`${(metrics.metrics.accuracy * 100).toFixed(2)}%`} 
          subtitle="Detection accuracy" 
          icon="🎯"
        />
        <MetricCard 
          title="Precision" 
          value={`${(metrics.metrics.precision * 100).toFixed(2)}%`} 
          subtitle="Intrusion precision" 
          icon="✓"
        />
        <MetricCard 
          title="Recall" 
          value={`${(metrics.metrics.recall * 100).toFixed(2)}%`} 
          subtitle="Intrusion recall" 
          icon="🔍"
        />
        <MetricCard 
          title="F1 Score" 
          value={`${(metrics.metrics.f1_score * 100).toFixed(2)}%`} 
          subtitle="Overall performance" 
          icon="⚖️"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Traffic Distribution</h2>
          <div className="h-64">
            <Pie data={distributionData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Attack Types</h2>
          <div className="h-64">
            <Bar 
              data={attackTypesData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { display: false },
                  title: { display: false }
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Recent detections */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Detections</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confidence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics.recent_detections.map((detection, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(detection.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {detection.type.charAt(0).toUpperCase() + detection.type.slice(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {(detection.confidence * 100).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      detection.type === 'normal' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {detection.type === 'normal' ? 'Normal' : 'Intrusion'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-lg font-medium text-gray-900 mt-1">{title}</div>
      <div className="text-sm text-gray-500 mt-1">{subtitle}</div>
    </div>
  );
}

export default DashboardPage; 