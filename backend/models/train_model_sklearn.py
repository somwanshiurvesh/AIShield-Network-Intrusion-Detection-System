"""
NIDS Machine Learning Model Training Script (scikit-learn version)

This script trains a machine learning model for network intrusion detection:
- Loads preprocessed training and testing data
- Builds a machine learning model using scikit-learn
- Trains the model and evaluates performance
- Saves the trained model and performance metrics
"""

import os
import numpy as np
import pandas as pd
import json
import joblib
from pathlib import Path
from datetime import datetime

# Scikit-learn imports
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
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

def train_model(X_train, y_train, X_test, y_test, model_type="mlp", model_dir="models"):
    """
    Train a machine learning model for NIDS classification
    
    Args:
        X_train: Training features
        y_train: Training labels
        X_test: Testing features
        y_test: Testing labels
        model_type: Type of model to train (mlp, rf, or gb)
        model_dir: Directory to save model and metrics
        
    Returns:
        tuple: (model, metrics)
    """
    # Create model directory if it doesn't exist
    model_path = Path(model_dir)
    model_path.mkdir(parents=True, exist_ok=True)
    
    # Determine number of classes
    num_classes = len(np.unique(y_train))
    print(f"Number of classes: {num_classes}")
    
    # Build and train the model
    if model_type == "mlp":
        print("Training Multi-layer Perceptron (Neural Network)...")
        model = MLPClassifier(
            hidden_layer_sizes=(256, 128, 64),
            activation='relu',
            solver='adam',
            alpha=0.0001,
            batch_size=64,
            learning_rate='adaptive',
            max_iter=200,
            early_stopping=True,
            validation_fraction=0.1,
            n_iter_no_change=10,
            verbose=True,
            random_state=42
        )
    elif model_type == "rf":
        print("Training Random Forest Classifier...")
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=20,
            min_samples_split=2,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            n_jobs=-1,
            verbose=1,
            random_state=42
        )
    elif model_type == "gb":
        print("Training Gradient Boosting Classifier...")
        model = GradientBoostingClassifier(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5,
            min_samples_split=2,
            min_samples_leaf=1,
            subsample=0.8,
            max_features='sqrt',
            verbose=1,
            random_state=42
        )
    else:
        raise ValueError(f"Unknown model type: {model_type}")
    
    # Train the model
    print(f"Training {model_type.upper()} model...")
    model.fit(X_train, y_train)
    
    # Evaluate the model
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    
    # Get probabilities if the model supports it
    y_pred_prob = None
    if hasattr(model, "predict_proba"):
        y_pred_prob = model.predict_proba(X_test)
    
    # Calculate metrics
    metrics = calculate_metrics(y_test, y_pred, num_classes, y_pred_prob)
    
    # Save model and metrics
    save_results(model, metrics, model_path, model_type)
    
    return model, metrics

def calculate_metrics(y_true, y_pred, num_classes, y_pred_prob=None):
    """
    Calculate performance metrics for the model
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        num_classes: Number of classes
        y_pred_prob: Prediction probabilities (optional)
        
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

def save_results(model, metrics, model_path, model_type):
    """
    Save model and metrics
    
    Args:
        model: Trained model
        metrics: Performance metrics dictionary
        model_path: Path to save results
        model_type: Type of model
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Save model
    model_file = model_path / f"nids_model_{model_type}.pkl"
    print(f"Saving model to {model_file}...")
    joblib.dump(model, model_file)
    
    # Save metrics
    metrics_file = model_path / f"metrics_{model_type}_{timestamp}.json"
    print(f"Saving metrics to {metrics_file}...")
    with open(metrics_file, 'w') as f:
        json.dump(metrics, f, indent=4)
    
    print("Results saved successfully!")

def plot_confusion_matrix(metrics, save_path=None):
    """
    Plot confusion matrix
    
    Args:
        metrics: Metrics dictionary containing confusion matrix
        save_path: Path to save the plot (optional)
    """
    try:
        import matplotlib.pyplot as plt
        import seaborn as sns
        
        conf_matrix = np.array(metrics['confusion_matrix'])
        plt.figure(figsize=(10, 8))
        
        # Plot confusion matrix
        sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues')
        plt.title('Confusion Matrix')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        
        # Save or display the plot
        if save_path:
            plt.savefig(save_path)
            print(f"Confusion matrix plot saved to {save_path}")
        else:
            plt.show()
            
    except ImportError:
        print("Matplotlib or seaborn not available. Skipping plot generation.")

if __name__ == "__main__":
    import argparse
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Train a model for NIDS using scikit-learn")
    parser.add_argument("--data-dir", type=str, default="../data",
                        help="Directory containing preprocessed data files")
    parser.add_argument("--model-dir", type=str, default=".",
                        help="Directory to save model and metrics")
    parser.add_argument("--model-type", type=str, default="mlp", choices=["mlp", "rf", "gb"],
                        help="Type of model to train (mlp, rf, or gb)")
    parser.add_argument("--plot", action="store_true",
                        help="Plot confusion matrix")
    
    args = parser.parse_args()
    
    # Load data
    X_train, y_train, X_test, y_test = load_data(args.data_dir)
    
    # Train model
    model, metrics = train_model(
        X_train, y_train, X_test, y_test,
        model_type=args.model_type,
        model_dir=args.model_dir
    )
    
    # Plot confusion matrix if requested
    if args.plot:
        plot_path = Path(args.model_dir) / f"confusion_matrix_{args.model_type}.png"
        plot_confusion_matrix(metrics, save_path=plot_path) 