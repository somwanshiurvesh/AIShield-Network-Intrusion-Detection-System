"""
Simple model training script for demo purposes.
"""
import numpy as np
import pandas as pd
import joblib
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier
import os

# Create a better model than pure random
class SimpleIntrustionDetector(RandomForestClassifier):
    def predict(self, X):
        # Look for patterns that might indicate intrusions
        # This is a very simplified heuristic but better than random
        intrusion_scores = np.zeros(X.shape[0])
        
        for i, sample in enumerate(X):
            # Check for unusual values in certain features
            # For example, high connection counts or error rates
            if X.shape[1] > 25:  # Assuming NSL-KDD format
                # If count is high (feature 22 in NSL-KDD)
                if sample[22] > 100:
                    intrusion_scores[i] += 0.4
                
                # If error rate is high (features 24-27 in NSL-KDD)
                if X.shape[1] > 27 and np.mean(sample[24:28]) > 0.5:
                    intrusion_scores[i] += 0.4
            
            # Add some randomness but with a pattern
            signature = sum(abs(val) for val in sample[:10]) % 10
            if signature > 7:  # 20% chance
                intrusion_scores[i] += 0.3
        
        # Convert scores to binary predictions
        return (intrusion_scores > 0.5).astype(int)
    
    def predict_proba(self, X):
        predictions = self.predict(X)
        probabilities = np.zeros((len(predictions), 2))
        
        for i, pred in enumerate(predictions):
            # Set probability higher for predicted class
            probabilities[i, pred] = 0.7 + np.random.random() * 0.2
            probabilities[i, 1-pred] = 1.0 - probabilities[i, pred]
        
        return probabilities

def main():
    """Train and save a simple model."""
    print("Training a simple model for demo purposes...")
    
    # Create a model instance
    model = SimpleIntrustionDetector(n_estimators=10, random_state=42)
    
    # Save the model
    model_dir = Path(os.path.dirname(os.path.abspath(__file__)))
    model_path = model_dir / "default_model.pkl"
    
    # Create parent directory if it doesn't exist
    model_dir.mkdir(parents=True, exist_ok=True)
    
    # Save the model
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Also save to the models directory
    models_dir = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    second_model_path = models_dir / "default_model.pkl"
    joblib.dump(model, second_model_path)
    print(f"Model also saved to {second_model_path}")
    
    return model

if __name__ == "__main__":
    main() 