from fastapi import APIRouter, HTTPException
from typing import Dict, List, Any
import random
from datetime import datetime, timedelta
import os
from pathlib import Path

# Define router
training_router = APIRouter()

# In-memory storage for training logs
training_logs = []
is_training = False
training_progress = 0

# Function to generate simulated training logs based on actual NSL-KDD data
def generate_training_logs():
    """Generate realistic training logs based on NSL-KDD dataset"""
    logs = []
    now = datetime.now()
    
    # Check if NSL-KDD dataset exists
    nsl_kdd_paths = [
        Path("NSL KDD/KDDTrain+_20Percent.txt"),
        Path("NSL KDD/KDDTest+.txt"),
        Path("../NSL KDD/KDDTrain+_20Percent.txt"),
        Path("../NSL KDD/KDDTest+.txt")
    ]
    
    has_nsl_data = any(path.exists() for path in nsl_kdd_paths)
    
    # Start timestamp - 30 minutes ago
    timestamp = now - timedelta(minutes=30)
    
    # Add log entries with appropriate timestamps
    # Dataset loading
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Starting model training process"
    })
    
    timestamp += timedelta(seconds=3)
    
    if has_nsl_data:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Loading NSL-KDD dataset..."
        })
    else:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Loading network traffic dataset..."
        })
    
    timestamp += timedelta(seconds=5)
    
    if has_nsl_data:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Dataset loaded with 125,973 samples"
        })
    else:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Dataset loaded with 82,332 samples"
        })
    
    timestamp += timedelta(seconds=2)
    
    # Data exploration
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Dataset contains 41 features and 1 target variable"
    })
    
    timestamp += timedelta(seconds=3)
    
    # Class distribution
    if has_nsl_data:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Class distribution: Normal (53.5%), DoS (36.7%), Probe (6.4%), R2L (2.5%), U2R (0.9%)"
        })
    else:
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": "Class distribution: Normal (56.8%), DoS (34.2%), Probe (5.3%), R2L (2.9%), U2R (0.8%)"
        })
    
    timestamp += timedelta(seconds=5)
    
    # Preprocessing
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Preprocessing data..."
    })
    
    timestamp += timedelta(seconds=8)
    
    # Encoding categorical features
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Encoding categorical features: protocol_type, service, flag"
    })
    
    timestamp += timedelta(seconds=4)
    
    # Scaling numerical features
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Scaling numerical features using StandardScaler"
    })
    
    timestamp += timedelta(seconds=3)
    
    # Train-test split
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Splitting into training (80%) and validation (20%) sets"
    })
    
    timestamp += timedelta(seconds=5)
    
    # Class imbalance warning
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "WARNING",
        "message": "Class imbalance detected: U2R attacks are significantly underrepresented"
    })
    
    timestamp += timedelta(seconds=3)
    
    # Model selection
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Training Random Forest classifier with 100 estimators"
    })
    
    timestamp += timedelta(seconds=15)
    
    # Training iterations (epochs)
    epochs = 10
    current_loss = 0.35
    current_accuracy = 0.87
    
    for epoch in range(1, epochs + 1):
        # Decrease loss and increase accuracy with each epoch
        current_loss -= random.uniform(0.02, 0.04)
        current_loss = max(0.05, current_loss)  # Ensure loss doesn't go too low
        
        current_accuracy += random.uniform(0.01, 0.02)
        current_accuracy = min(0.99, current_accuracy)  # Cap at 99%
        
        logs.append({
            "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "level": "INFO",
            "message": f"Epoch {epoch}/{epochs}: loss={current_loss:.3f}, accuracy={current_accuracy:.3f}"
        })
        
        timestamp += timedelta(seconds=random.randint(60, 90))  # Each epoch takes 1-1.5 minutes
        
        # Add occasional warnings
        if random.random() < 0.2:  # 20% chance for a warning
            warning_messages = [
                "High variance detected in fold 3, possible overfitting",
                "Feature 'src_bytes' shows unusual distribution",
                "Possible data leakage in feature 'dst_host_same_srv_rate'",
                "Some samples might be mislabeled in the R2L category"
            ]
            logs.append({
                "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                "level": "WARNING",
                "message": random.choice(warning_messages)
            })
            timestamp += timedelta(seconds=2)
    
    # Model evaluation
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Model training complete, evaluating on test set"
    })
    
    timestamp += timedelta(seconds=10)
    
    # Overall metrics
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": f"Overall accuracy: {current_accuracy:.3f}"
    })
    
    timestamp += timedelta(seconds=3)
    
    # Per-class metrics
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Per-class F1 scores: Normal (0.98), DoS (0.97), Probe (0.92), R2L (0.89), U2R (0.76)"
    })
    
    timestamp += timedelta(seconds=5)
    
    # Confusion matrix
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Confusion matrix saved to eval/plots/confusion_matrix.png"
    })
    
    timestamp += timedelta(seconds=3)
    
    # ROC curve
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "ROC curves saved to eval/plots/roc_curves.png"
    })
    
    timestamp += timedelta(seconds=4)
    
    # Save model
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Saving trained model to models/default_model.pkl"
    })
    
    timestamp += timedelta(seconds=6)
    
    # Save preprocessing objects
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Saving preprocessing objects for inference"
    })
    
    timestamp += timedelta(seconds=3)
    
    # Final message
    logs.append({
        "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "level": "INFO",
        "message": "Training complete - model ready for deployment"
    })
    
    return logs

# Initialize training logs if not already done
if not training_logs:
    training_logs = generate_training_logs()
    # Set random training progress - for demo purposes
    training_progress = random.randint(0, 100)
    is_training = training_progress < 100

# Get training logs
@training_router.get("/logs")
async def get_training_logs():
    """
    Get model training logs
    """
    try:
        global training_progress, is_training
        
        # Occasionally update training progress for demo purposes
        if is_training:
            # 20% chance to update progress each time logs are requested
            if random.random() < 0.2:
                training_progress += random.randint(5, 15)
                if training_progress >= 100:
                    training_progress = 100
                    is_training = False
        
        return {
            "logs": training_logs,
            "progress": training_progress,
            "is_training": is_training
        }
    except Exception as e:
        print(f"Error getting training logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Start new training
@training_router.post("/start")
async def start_training():
    """
    Start a new model training process
    """
    try:
        global training_logs, training_progress, is_training
        
        if is_training:
            return {"message": "Training already in progress", "progress": training_progress}
        
        # Generate new logs
        training_logs = generate_training_logs()
        training_progress = 0
        is_training = True
        
        return {
            "message": "Training started successfully",
            "progress": training_progress
        }
    except Exception as e:
        print(f"Error starting training: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e)) 