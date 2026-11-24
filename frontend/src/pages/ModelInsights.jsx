import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function ModelInsights() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setLoading(true);
        // In a production environment, you would have an API endpoint for this
        // For now, we'll use sample data
        
        // Uncomment this when the API is ready:
        // const response = await axios.get(`${BACKEND_URL}/api/model/insights`);
        // setModelInfo(response.data);
        
        // Sample data for now
        setTimeout(() => {
          setModelInfo({
            model_name: "Random Forest Classifier",
            training_date: "2025-04-10",
            accuracy: 0.96,
            precision: 0.95,
            recall: 0.94,
            f1_score: 0.945,
            roc_auc: 0.98,
            confusion_matrix: {
              true_positives: 2500,
              false_positives: 125,
              true_negatives: 2300,
              false_negatives: 75
            },
            feature_importance: [
              { feature: "dst_host_srv_count", importance: 0.12 },
              { feature: "dst_host_same_srv_rate", importance: 0.11 },
              { feature: "dst_host_diff_srv_rate", importance: 0.09 },
              { feature: "dst_host_serror_rate", importance: 0.08 },
              { feature: "same_srv_rate", importance: 0.07 },
              { feature: "serror_rate", importance: 0.06 },
              { feature: "srv_serror_rate", importance: 0.06 },
              { feature: "dst_host_srv_serror_rate", importance: 0.05 },
              { feature: "count", importance: 0.05 },
              { feature: "logged_in", importance: 0.04 }
            ],
            attack_detection_rates: {
              dos: 0.97,
              probe: 0.95,
              r2l: 0.92,
              u2r: 0.88
            }
          });
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error("Error fetching model insights:", err);
        setError("Failed to load model insights. Please try again later.");
        setLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <div className="text-red-500 text-xl">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
        Model Performance Insights
      </h1>

      {modelInfo && (
        <>
          {/* Model Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Model Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Model Type:</span> {modelInfo.model_name}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mt-2">
                  <span className="font-medium">Trained On:</span> {modelInfo.training_date}
                </p>
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Description:</span> This model was trained on the NSL-KDD dataset to detect network intrusions.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricCard title="Accuracy" value={modelInfo.accuracy.toFixed(4)} />
              <MetricCard title="Precision" value={modelInfo.precision.toFixed(4)} />
              <MetricCard title="Recall" value={modelInfo.recall.toFixed(4)} />
              <MetricCard title="F1 Score" value={modelInfo.f1_score.toFixed(4)} />
              <MetricCard title="ROC AUC" value={modelInfo.roc_auc.toFixed(4)} />
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Confusion Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid grid-cols-2 gap-2 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md">
                  <p className="text-center font-bold">True Negatives</p>
                  <p className="text-center text-lg mt-2">{modelInfo.confusion_matrix.true_negatives}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
                  <p className="text-center font-bold">False Positives</p>
                  <p className="text-center text-lg mt-2">{modelInfo.confusion_matrix.false_positives}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-md">
                  <p className="text-center font-bold">False Negatives</p>
                  <p className="text-center text-lg mt-2">{modelInfo.confusion_matrix.false_negatives}</p>
                </div>
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-md">
                  <p className="text-center font-bold">True Positives</p>
                  <p className="text-center text-lg mt-2">{modelInfo.confusion_matrix.true_positives}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">True Positive (TP):</span> Correctly identified intrusions
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">False Positive (FP):</span> Normal traffic incorrectly flagged as intrusions
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">True Negative (TN):</span> Correctly identified normal traffic
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  <span className="font-medium">False Negative (FN):</span> Missed intrusions, incorrectly classified as normal
                </p>
              </div>
            </div>
          </div>

          {/* Attack Detection Rates */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Attack Detection Rates</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <AttackRateCard type="DoS" rate={modelInfo.attack_detection_rates.dos} />
              <AttackRateCard type="Probe" rate={modelInfo.attack_detection_rates.probe} />
              <AttackRateCard type="R2L" rate={modelInfo.attack_detection_rates.r2l} />
              <AttackRateCard type="U2R" rate={modelInfo.attack_detection_rates.u2r} />
            </div>
          </div>

          {/* Feature Importance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Feature Importance</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Feature
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Importance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Visualization
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {modelInfo.feature_importance.map((feature, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {feature.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {feature.importance.toFixed(4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div 
                            className="bg-primary-600 h-2.5 rounded-full" 
                            style={{ width: `${feature.importance * 100 * 8}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
      <h3 className="font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-2">{value}</p>
    </div>
  );
}

function AttackRateCard({ type, rate }) {
  const getColor = () => {
    if (rate >= 0.95) return 'bg-green-100 dark:bg-green-900';
    if (rate >= 0.90) return 'bg-yellow-100 dark:bg-yellow-900';
    return 'bg-red-100 dark:bg-red-900';
  };

  return (
    <div className={`p-4 rounded-lg text-center ${getColor()}`}>
      <h3 className="font-medium text-gray-700 dark:text-gray-300">{type} Attacks</h3>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-2">{(rate * 100).toFixed(1)}%</p>
    </div>
  );
}

export default ModelInsights; 