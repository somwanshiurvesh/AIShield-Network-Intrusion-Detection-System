import React, { useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AttackDistributionChart = ({ data, title = "Attack Distribution" }) => {
  const [chartType, setChartType] = useState('pie');

  // Default colors for different attack types
  const defaultColors = {
    'Normal': 'rgba(34, 197, 94, 0.7)', // Green
    'DoS': 'rgba(239, 68, 68, 0.7)',    // Red
    'Probe': 'rgba(250, 204, 21, 0.7)', // Yellow
    'R2L': 'rgba(168, 85, 247, 0.7)',   // Purple
    'U2R': 'rgba(59, 130, 246, 0.7)',   // Blue
    'Other': 'rgba(107, 114, 128, 0.7)' // Gray
  };

  // Process data for the charts
  const processData = () => {
    if (!data) {
      // Sample data if none provided
      return {
        labels: ['Normal', 'DoS', 'Probe', 'R2L', 'U2R'],
        datasets: [{
          data: [65, 20, 10, 3, 2],
          backgroundColor: Object.values(defaultColors).slice(0, 5),
          borderColor: Object.values(defaultColors).map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        }]
      };
    }

    // Convert data object to labels and values
    const labels = Object.keys(data);
    const values = Object.values(data);
    
    // Map colors to labels, using default colors where possible
    const backgroundColor = labels.map(label => 
      defaultColors[label] || `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.7)`
    );
    
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor,
        borderColor: backgroundColor.map(color => color.replace('0.7', '1')),
        borderWidth: 1,
      }]
    };
  };

  const chartData = processData();

  // Chart options
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'pie' 
                ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            } transition-colors duration-200`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              chartType === 'bar' 
                ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
            } transition-colors duration-200`}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className="h-64 mt-2">
        {chartType === 'pie' ? (
          <Pie data={chartData} options={pieOptions} />
        ) : (
          <Bar data={chartData} options={barOptions} />
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        Distribution of detected intrusion types in your network
      </div>
    </motion.div>
  );
};

export default AttackDistributionChart; 