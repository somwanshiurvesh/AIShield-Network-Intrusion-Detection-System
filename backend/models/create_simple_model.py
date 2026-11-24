"""
Create a simple model without custom classes.
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
import os
import sys

# Add parent directory to path so we can import from utils
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.models import NetworkIntrusionDetector

def create_test_model():
    """
    Create a rule-based model for intrusion detection
    """
    # Create our custom model
    model = NetworkIntrusionDetector()
    
    # Save the model
    model_path = Path("models/default_model.pkl")
    joblib.dump(model, model_path)
    print(f"Rule-based model saved to {model_path}")
    
    # Print feature importance
    feature_importance = model.feature_importances_
    top_features = sorted(enumerate(feature_importance), key=lambda x: x[1], reverse=True)[:10]
    print("Top 10 important features:")
    for idx, importance in top_features:
        if importance > 0:
            print(f"Feature {idx}: {importance:.4f}")
    
    return model

if __name__ == "__main__":
    model = create_test_model()
    
    # Test the model with examples
    print("\nTesting model with examples:")
    
    # Test case 1: Normal traffic (low values for key indicators)
    normal_traffic = np.zeros(64)
    normal_traffic[0:7] = [0.1, 0.1, 0.1, 0, 0, 0, 0]  # Low duration, bytes, no anomalies
    
    # Test case 2: Suspicious traffic (high values for key indicators)
    suspicious_traffic = np.zeros(64)
    suspicious_traffic[0:7] = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2]  # High values in all attack indicators
    
    # Test case 3: Slightly suspicious traffic
    slightly_suspicious = np.zeros(64)
    slightly_suspicious[0:7] = [0.5, 0.4, 0.3, 0, 0, 0.2, 0]  # Some elevated values
    
    # Test case 4: Very suspicious traffic with critical indicators
    very_suspicious = np.zeros(64)
    very_suspicious[0:7] = [0.4, 0.3, 0.2, 1.0, 0, 0, 0]  # Wrong fragment present, critical indicator
    
    # Test case 5: Failed login attempt
    failed_login = np.zeros(64)
    failed_login[0:7] = [0.2, 0.2, 0.2, 0, 0, 0, 1.0]  # Failed login, critical indicator
    
    # Make predictions
    test_cases = {
        "Normal traffic": normal_traffic,
        "Suspicious traffic": suspicious_traffic, 
        "Slightly suspicious": slightly_suspicious,
        "Very suspicious (wrong fragment)": very_suspicious,
        "Failed login attempt": failed_login
    }
    
    print("\nDetailed test results:")
    print("-" * 50)
    print(f"{'Test Case':<30} {'Prediction':<10} {'Normal %':<10} {'Attack %':<10}")
    print("-" * 50)
    
    for name, traffic in test_cases.items():
        pred = model.predict(traffic.reshape(1, -1))[0]
        probs = model.predict_proba(traffic.reshape(1, -1))[0]
        result = "NORMAL" if pred == 0 else "ATTACK"
        print(f"{name:<30} {result:<10} {probs[0]*100:>7.2f}%   {probs[1]*100:>7.2f}%")
    
    print("-" * 50) 