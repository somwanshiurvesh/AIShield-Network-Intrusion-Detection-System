#!/usr/bin/env python3
"""
Test script for evaluate_model.py

This script creates a small synthetic dataset and model
to test if the evaluation script works correctly.
"""

import os
import subprocess
import numpy as np
import pandas as pd
from pathlib import Path
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

def create_synthetic_data():
    """Create a small synthetic binary classification dataset"""
    np.random.seed(42)  # For reproducibility
    
    # Create features and target
    X = np.random.randn(100, 10)  # 100 samples, 10 features
    y = np.random.randint(0, 2, 100)  # Binary classification
    
    # Save as a pickle file
    data = {"X": X, "y": y}
    test_data_path = Path("test_data.pkl")
    joblib.dump(data, test_data_path)
    
    print(f"Created synthetic test data: {test_data_path}")
    return test_data_path, X, y

def train_test_model(X, y):
    """Train a simple model on the synthetic data"""
    # Create a simple random forest model
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X, y)
    
    # Make a simple prediction to verify
    y_pred = model.predict(X)
    accuracy = accuracy_score(y, y_pred)
    print(f"Model trained with accuracy: {accuracy:.4f}")
    
    # Save the model
    model_path = Path("test_model.pkl")
    joblib.dump(model, model_path)
    
    print(f"Saved test model: {model_path}")
    return model_path

def run_evaluation(model_path, test_data_path):
    """Run the evaluation script with the synthetic model and data"""
    output_dir = Path("eval_test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Create the command
    cmd = [
        "python", 
        "evaluate_model.py",
        "--model_path", str(model_path),
        "--test_data", str(test_data_path),
        "--output_dir", str(output_dir)
    ]
    
    print(f"\nRunning evaluation command: {' '.join(cmd)}")
    
    # Run the evaluation script
    try:
        result = subprocess.run(cmd, check=True, cwd=Path(__file__).parent)
        print("\nEvaluation completed successfully!")
    except subprocess.CalledProcessError as e:
        print(f"\nError running evaluation: {e}")
    
    # Check if output files exist
    metrics_files = list(output_dir.glob("metrics_*.json"))
    plot_files = list(output_dir.glob("*.png"))
    
    print("\nEvaluation output files:")
    print(f"- JSON metrics files: {len(metrics_files)}")
    for f in metrics_files:
        print(f"  - {f.name} ({f.stat().st_size} bytes)")
    
    print(f"- Plot files: {len(plot_files)}")
    for f in plot_files:
        print(f"  - {f.name} ({f.stat().st_size} bytes)")
    
    return len(metrics_files) > 0 and len(plot_files) > 0

def cleanup(files_to_remove):
    """Clean up temporary files"""
    print("\nCleaning up temporary files...")
    for file_path in files_to_remove:
        if file_path.exists():
            file_path.unlink()
            print(f"- Removed {file_path}")

def main():
    """Main test function"""
    print("Testing evaluation script...")
    
    # Create synthetic data and model
    test_data_path, X, y = create_synthetic_data()
    model_path = train_test_model(X, y)
    
    # Run evaluation
    success = run_evaluation(model_path, test_data_path)
    
    # Cleanup
    cleanup([test_data_path, model_path])
    
    if success:
        print("\n✅ Test completed successfully!")
    else:
        print("\n❌ Test failed: No output files were generated.")

if __name__ == "__main__":
    main() 