"""
Custom model implementations for intrusion detection
"""
import numpy as np
import joblib

class NetworkIntrusionDetector:
    """
    A rule-based model for network intrusion detection
    """
    def __init__(self):
        self.n_features_ = 64
        self.feature_importances_ = np.zeros(64)
        # Set importance for key features
        self.feature_importances_[0] = 0.15  # duration
        self.feature_importances_[1] = 0.1   # src_bytes
        self.feature_importances_[2] = 0.1   # dst_bytes
        self.feature_importances_[3] = 0.2   # wrong_fragment
        self.feature_importances_[4] = 0.15  # urgent
        self.feature_importances_[5] = 0.15  # hot
        self.feature_importances_[6] = 0.25  # num_failed_logins
        
    def predict(self, X):
        """
        Predict using direct rules rather than learned patterns
        """
        if isinstance(X, list):
            X = np.array(X)
        
        # Ensure X is 2D
        if X.ndim == 1:
            X = X.reshape(1, -1)
            
        n_samples = X.shape[0]
        predictions = np.zeros(n_samples, dtype=int)
        
        for i in range(n_samples):
            # Extract key features
            duration = X[i, 0]
            src_bytes = X[i, 1]
            dst_bytes = X[i, 2]
            wrong_fragment = X[i, 3]
            urgent = X[i, 4]
            hot = X[i, 5]
            failed_logins = X[i, 6]
            
            # Apply rule-based logic
            is_attack = False
            
            # Critical indicators - any of these alone is suspicious
            if wrong_fragment > 0 or urgent > 0 or failed_logins > 0:
                is_attack = True
            
            # High hot indicators
            if hot > 0.1:
                is_attack = True
                
            # High duration with moderate traffic
            if duration > 0.3 and (src_bytes > 0.2 or dst_bytes > 0.2):
                is_attack = True
                
            # Very high data transfer
            if src_bytes > 0.6 or dst_bytes > 0.6:
                is_attack = True
                
            # Set prediction
            predictions[i] = 1 if is_attack else 0
            
        return predictions
    
    def predict_proba(self, X):
        """
        Return probability-like scores
        """
        if isinstance(X, list):
            X = np.array(X)
            
        # Ensure X is 2D
        if X.ndim == 1:
            X = X.reshape(1, -1)
            
        n_samples = X.shape[0]
        probs = np.zeros((n_samples, 2))
        
        for i in range(n_samples):
            # Extract key features
            duration = X[i, 0]
            src_bytes = X[i, 1]
            dst_bytes = X[i, 2]
            wrong_fragment = X[i, 3]
            urgent = X[i, 4]
            hot = X[i, 5]
            failed_logins = X[i, 6]
            
            # Calculate attack score (range 0-1)
            attack_score = 0.0
            
            # Critical indicators
            if wrong_fragment > 0:
                attack_score += 0.35
            
            if urgent > 0:
                attack_score += 0.35
                
            if failed_logins > 0:
                attack_score += 0.4
                
            if hot > 0:
                attack_score += 0.35 * hot
            
            # Duration impact
            attack_score += duration * 0.25
            
            # Data transfer impact
            attack_score += src_bytes * 0.15
            attack_score += dst_bytes * 0.15
            
            # Cap score at 1.0
            attack_score = min(attack_score, 1.0)
            
            # Ensure reasonable minimum
            attack_score = max(attack_score, 0.05)
            
            # Set probabilities
            normal_score = 1.0 - attack_score
            
            # Set probabilities
            probs[i, 0] = normal_score
            probs[i, 1] = attack_score
            
        return probs 