"""
NIDS Deep Learning Model Training Script

This script trains a deep learning model for network intrusion detection:
- Loads preprocessed training and testing data
- Builds a deep learning classification model using TensorFlow/Keras
- Trains the model with early stopping
- Evaluates performance using various metrics
- Saves the trained model and performance metrics
"""

import os
import numpy as np
import pandas as pd
import json
import joblib
from pathlib import Path
from datetime import datetime

# TensorFlow and Keras imports
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
from tensorflow.keras.utils import to_categorical

# Scikit-learn metrics
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.metrics import confusion_matrix, classification_report

def load_data(data_dir="data"):
    """
    Load preprocessed training and testing data
    
    Args:
        data_dir: Directory containing preprocessed data files
        
    Returns:
        tuple: (X_train, y_train, X_test, y_test)
    """
    data_path = Path(data_dir)
    
    # Check if data files exist
    train_data_path = data_path / "train_data.pkl"
    test_data_path = data_path / "test_data.pkl"
    
    if not train_data_path.exists() or not test_data_path.exists():
        raise FileNotFoundError(f"Data files not found in {data_path}. Make sure to run preprocessing first.")
    
    # Load data
    print(f"Loading training data from {train_data_path}...")
    train_data = joblib.load(train_data_path)
    X_train, y_train = train_data['X'], train_data['y']
    
    print(f"Loading testing data from {test_data_path}...")
    test_data = joblib.load(test_data_path)
    X_test, y_test = test_data['X'], test_data['y']
    
    print(f"Training data shape: {X_train.shape}, {y_train.shape}")
    print(f"Testing data shape: {X_test.shape}, {y_test.shape}")
    
    return X_train, y_train, X_test, y_test

def build_model(input_dim, num_classes):
    """
    Build a deep learning model for NIDS classification
    
    Args:
        input_dim: Number of input features
        num_classes: Number of output classes
        
    Returns:
        model: Compiled Keras model
    """
    model = Sequential([
        # Input layer
        Dense(256, activation='relu', input_shape=(input_dim,)),
        BatchNormalization(),
        Dropout(0.3),
        
        # Hidden layers
        Dense(128, activation='relu'),
        BatchNormalization(),
        Dropout(0.3),
        
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dropout(0.2),
        
        # Output layer
        Dense(num_classes, activation='softmax')
    ])
    
    # Compile the model
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    print("Model architecture:")
    model.summary()
    
    return model

def train_model(X_train, y_train, X_test, y_test, model_dir="models", epochs=50, batch_size=64):
    """
    Train a deep learning model for NIDS classification
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_test: Testing features
        y_test: Testing labels
        model_dir: Directory to save model and metrics
        epochs: Maximum number of training epochs
        batch_size: Training batch size
        
    Returns:
        tuple: (model, history, metrics)
    """
    # Create model directory if it doesn't exist
    model_path = Path(model_dir)
    model_path.mkdir(parents=True, exist_ok=True)
    
    # Determine number of classes
    num_classes = len(np.unique(y_train))
    print(f"Number of classes: {num_classes}")
    
    # Convert labels to categorical (one-hot encoding)
    y_train_cat = to_categorical(y_train, num_classes)
    y_test_cat = to_categorical(y_test, num_classes)
    
    # Build the model
    input_dim = X_train.shape[1]
    model = build_model(input_dim, num_classes)
    
    # Define callbacks
    early_stopping = EarlyStopping(
        monitor='val_loss',
        patience=10,
        restore_best_weights=True,
        verbose=1
    )
    
    checkpoint_path = model_path / "best_model_weights.h5"
    model_checkpoint = ModelCheckpoint(
        filepath=str(checkpoint_path),
        monitor='val_loss',
        save_best_only=True,
        verbose=1
    )
    
    # Train the model
    print(f"Training model for up to {epochs} epochs with batch size {batch_size}...")
    history = model.fit(
        X_train, y_train_cat,
        validation_data=(X_test, y_test_cat),
        epochs=epochs,
        batch_size=batch_size,
        callbacks=[early_stopping, model_checkpoint],
        verbose=1
    )
    
    # Evaluate the model
    print("Evaluating model...")
    y_pred_prob = model.predict(X_test)
    y_pred = np.argmax(y_pred_prob, axis=1)
    
    # Calculate metrics
    metrics = calculate_metrics(y_test, y_pred, num_classes)
    
    # Save model and metrics
    save_results(model, metrics, history.history, model_path)
    
    return model, history, metrics

def calculate_metrics(y_true, y_pred, num_classes):
    """
    Calculate performance metrics for the model
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        num_classes: Number of classes
        
    Returns:
        dict: Dictionary of performance metrics
    """
    # Basic metrics
    accuracy = accuracy_score(y_true, y_pred)
    
    # Handle binary vs multi-class metrics
    if num_classes == 2:
        precision = precision_score(y_true, y_pred)
        recall = recall_score(y_true, y_pred)
        f1 = f1_score(y_true, y_pred)
    else:
        precision = precision_score(y_true, y_pred, average='weighted')
        recall = recall_score(y_true, y_pred, average='weighted')
        f1 = f1_score(y_true, y_pred, average='weighted')
    
    # Confusion matrix
    conf_matrix = confusion_matrix(y_true, y_pred).tolist()
    
    # Classification report
    class_report = classification_report(y_true, y_pred, output_dict=True)
    
    # Compile metrics
    metrics = {
        'accuracy': float(accuracy),
        'precision': float(precision),
        'recall': float(recall),
        'f1_score': float(f1),
        'confusion_matrix': conf_matrix,
        'classification_report': class_report,
        'timestamp': datetime.now().isoformat()
    }
    
    # Print summary metrics
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    return metrics

def save_results(model, metrics, history, model_path):
    """
    Save model, metrics, and training history
    
    Args:
        model: Trained Keras model
        metrics: Performance metrics dictionary
        history: Training history
        model_path: Path to save results
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save model
    model_file = model_path / "nids_model.h5"
    print(f"Saving model to {model_file}...")
    model.save(model_file)
    
    # Save metrics
    metrics_file = model_path / f"metrics_{timestamp}.json"
    print(f"Saving metrics to {metrics_file}...")
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=4)
    
    # Save history
    history_file = model_path / f"history_{timestamp}.json"
    print(f"Saving training history to {history_file}...")
    with open(history_file, 'w') as f:
        # Convert numpy values to Python types
        history_dict = {}
        for key, value in history.items():
            history_dict[key] = [float(v) for v in value]
        json.dump(history_dict, f, indent=4)
    
    print("Results saved successfully!")

def plot_training_history(history, save_path=None):
    """
    Plot training history (accuracy and loss)
    
    Args:
        history: Training history dictionary
        save_path: Path to save the plot (optional)
    """
    try:
        import matplotlib.pyplot as plt
        
        # Create figure with two subplots
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        ax1.plot(history['accuracy'], label='Training Accuracy')
        ax1.plot(history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(history['loss'], label='Training Loss')
        ax2.plot(history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.legend()
        ax2.grid(True)
        
        plt.tight_layout()
        
        # Save or display the plot
        if save_path:
            plt.savefig(save_path)
            print(f"Training history plot saved to {save_path}")
        else:
            plt.show()
            
    except ImportError:
        print("Matplotlib not available. Skipping plot generation.")

if __name__ == "__main__":
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Train a deep learning model for NIDS")
    parser.add_argument("--data-dir", type=str, default="../data",
                        help="Directory containing preprocessed data files")
    parser.add_argument("--model-dir", type=str, default=".",
                        help="Directory to save model and metrics")
    parser.add_argument("--epochs", type=int, default=50,
                        help="Maximum number of training epochs")
    parser.add_argument("--batch-size", type=int, default=64,
                        help="Training batch size")
    parser.add_argument("--plot", action="store_true",
                        help="Plot training history")
    
    args = parser.parse_args()
    
    # Load data
    X_train, y_train, X_test, y_test = load_data(args.data_dir)
    
    # Train model
    model, history, metrics = train_model(
        X_train, y_train, X_test, y_test,
        model_dir=args.model_dir,
        epochs=args.epochs,
        batch_size=args.batch_size
    )
    
    # Plot training history if requested
    if args.plot:
        plot_path = Path(args.model_dir) / "training_history.png"
        plot_training_history(history.history, save_path=plot_path) 