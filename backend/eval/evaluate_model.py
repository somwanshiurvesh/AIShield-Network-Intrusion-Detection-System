#!/usr/bin/env python3
"""
Model Evaluation Script for Network Intrusion Detection System

This script:
1. Loads the test data and trained model
2. Makes predictions on the test set
3. Calculates and displays classification metrics
4. Generates and saves visualization plots
5. Saves all metrics to a JSON file

Usage:
    python evaluate_model.py --model_path models/nids_model_rf.pkl --test_data models/test_data.pkl

Author: NIDS Team
"""

import os
import argparse
import json
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from datetime import datetime
from typing import Dict, Tuple, Any, Optional

# scikit-learn imports
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_curve, auc,
    precision_recall_curve, average_precision_score
)
from sklearn.preprocessing import label_binarize
from sklearn.multiclass import OneVsRestClassifier

# Set the style for plots
plt.style.use('seaborn-darkgrid')
sns.set(font_scale=1.2)

def load_test_data(data_path: str) -> Tuple[np.ndarray, np.ndarray]:
    """
    Load test data from the specified path
    
    Args:
        data_path: Path to the test data pickle file
        
    Returns:
        Tuple containing test features (X) and labels (y)
    """
    print(f"Loading test data from {data_path}")
    
    try:
        # Load the test data
        data = joblib.load(data_path)
        
        # Extract features and labels
        if isinstance(data, dict):
            X_test = data.get('X')
            y_test = data.get('y')
        else:
            # Assuming it's a tuple of (X, y)
            X_test, y_test = data
            
        print(f"Test data shape: {X_test.shape}, {y_test.shape}")
        return X_test, y_test
        
    except Exception as e:
        print(f"Error loading test data: {e}")
        raise

def load_model(model_path: str) -> Any:
    """
    Load the trained model from the specified path
    
    Args:
        model_path: Path to the model file
        
    Returns:
        Trained model object
    """
    print(f"Loading model from {model_path}")
    
    try:
        # Load the model (supports both pickle and h5 formats)
        if model_path.endswith('.h5'):
            # For h5 models (usually deep learning models)
            try:
                import tensorflow as tf
                model = tf.keras.models.load_model(model_path)
            except ImportError:
                print("TensorFlow not available. Unable to load h5 model.")
                raise
        else:
            # For pickle models (usually sklearn models)
            model = joblib.load(model_path)
            
        print(f"Model loaded successfully: {type(model).__name__}")
        return model
        
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

def make_predictions(model: Any, X_test: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Make predictions using the loaded model
    
    Args:
        model: Trained model object
        X_test: Test features
        
    Returns:
        Tuple containing predicted labels and probabilities
    """
    print("Making predictions on test data...")
    
    # Check if it's a TensorFlow model or sklearn model
    if hasattr(model, 'predict_proba'):
        # scikit-learn model with predict_proba method
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)
    elif hasattr(model, 'predict'):
        # Could be TensorFlow model or other model types
        y_pred_raw = model.predict(X_test)
        
        # Handle TensorFlow model output
        if hasattr(y_pred_raw, 'numpy'):
            y_pred_raw = y_pred_raw.numpy()
            
        # If output is probabilities
        if y_pred_raw.ndim > 1 and y_pred_raw.shape[1] > 1:
            y_prob = y_pred_raw
            y_pred = np.argmax(y_pred_raw, axis=1)
        else:
            # Binary classification with single output neuron
            y_prob = np.column_stack((1 - y_pred_raw, y_pred_raw))
            y_pred = (y_pred_raw > 0.5).astype(int)
    else:
        raise ValueError("Model does not have a predict method")
    
    print(f"Predictions generated: {y_pred.shape}")
    return y_pred, y_prob

def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray, y_prob: np.ndarray) -> Dict[str, Any]:
    """
    Calculate classification metrics
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_prob: Prediction probabilities
        
    Returns:
        Dictionary containing all calculated metrics
    """
    print("Calculating evaluation metrics...")
    
    # Get number of unique classes
    n_classes = len(np.unique(y_true))
    is_binary = n_classes == 2
    
    # Calculate basic metrics
    metrics = {
        "accuracy": float(accuracy_score(y_true, y_pred)),
        "precision": float(precision_score(y_true, y_pred, average='weighted')),
        "recall": float(recall_score(y_true, y_pred, average='weighted')),
        "f1_score": float(f1_score(y_true, y_pred, average='weighted')),
        "classes": n_classes,
    }
    
    # Calculate confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    metrics["confusion_matrix"] = cm.tolist()
    
    # Classification report
    cr = classification_report(y_true, y_pred, output_dict=True)
    metrics["classification_report"] = cr
    
    # ROC AUC and PR AUC for binary classification
    if is_binary:
        # ROC curve and AUC
        fpr, tpr, _ = roc_curve(y_true, y_prob[:, 1])
        metrics["roc_auc"] = float(auc(fpr, tpr))
        metrics["roc_curve"] = {
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist()
        }
        
        # Precision-Recall curve and AUC
        precision, recall, _ = precision_recall_curve(y_true, y_prob[:, 1])
        metrics["pr_auc"] = float(average_precision_score(y_true, y_prob[:, 1]))
        metrics["pr_curve"] = {
            "precision": precision.tolist(),
            "recall": recall.tolist()
        }
    else:
        # For multiclass, we use One-vs-Rest ROC AUC
        y_bin = label_binarize(y_true, classes=np.unique(y_true))
        metrics["roc_auc"] = None
        metrics["pr_auc"] = None
    
    # Print summary metrics
    print("\nEvaluation Metrics:")
    print(f"Accuracy:  {metrics['accuracy']:.4f}")
    print(f"Precision: {metrics['precision']:.4f}")
    print(f"Recall:    {metrics['recall']:.4f}")
    print(f"F1 Score:  {metrics['f1_score']:.4f}")
    if is_binary:
        print(f"ROC AUC:   {metrics['roc_auc']:.4f}")
        print(f"PR AUC:    {metrics['pr_auc']:.4f}")
    
    return metrics

def plot_confusion_matrix(metrics: Dict[str, Any], output_path: str) -> None:
    """
    Plot and save confusion matrix as a heatmap
    
    Args:
        metrics: Dictionary containing metrics including confusion matrix
        output_path: Path to save the plot
    """
    print(f"Plotting confusion matrix and saving to {output_path}")
    
    # Extract confusion matrix
    cm = np.array(metrics["confusion_matrix"])
    n_classes = metrics["classes"]
    
    # Create class labels
    if n_classes == 2:
        class_labels = ["Normal", "Intrusion"]
    else:
        class_labels = [str(i) for i in range(n_classes)]
    
    # Create figure
    plt.figure(figsize=(10, 8))
    
    # Plot heatmap
    sns.heatmap(
        cm, 
        annot=True, 
        fmt="d", 
        cmap="Blues",
        xticklabels=class_labels,
        yticklabels=class_labels
    )
    
    # Add labels and title
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.title("Confusion Matrix")
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_roc_curve(metrics: Dict[str, Any], output_path: str) -> None:
    """
    Plot and save ROC curve
    
    Args:
        metrics: Dictionary containing metrics including ROC curve data
        output_path: Path to save the plot
    """
    print(f"Plotting ROC curve and saving to {output_path}")
    
    # Check if we have ROC data
    if "roc_curve" not in metrics:
        print("No ROC curve data available for plotting")
        return
    
    # Extract ROC data
    fpr = metrics["roc_curve"]["fpr"]
    tpr = metrics["roc_curve"]["tpr"]
    roc_auc = metrics["roc_auc"]
    
    # Create figure
    plt.figure(figsize=(10, 8))
    
    # Plot ROC curve
    plt.plot(
        fpr, 
        tpr, 
        color='darkorange',
        lw=2, 
        label=f'ROC curve (area = {roc_auc:.3f})'
    )
    
    # Plot diagonal line (random classifier)
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    
    # Add labels and settings
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('False Positive Rate')
    plt.ylabel('True Positive Rate')
    plt.title('Receiver Operating Characteristic (ROC) Curve')
    plt.legend(loc="lower right")
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def plot_precision_recall_curve(metrics: Dict[str, Any], output_path: str) -> None:
    """
    Plot and save Precision-Recall curve
    
    Args:
        metrics: Dictionary containing metrics including PR curve data
        output_path: Path to save the plot
    """
    print(f"Plotting Precision-Recall curve and saving to {output_path}")
    
    # Check if we have PR data
    if "pr_curve" not in metrics:
        print("No Precision-Recall curve data available for plotting")
        return
    
    # Extract PR data
    precision = metrics["pr_curve"]["precision"]
    recall = metrics["pr_curve"]["recall"]
    pr_auc = metrics["pr_auc"]
    
    # Create figure
    plt.figure(figsize=(10, 8))
    
    # Plot PR curve
    plt.plot(
        recall, 
        precision, 
        color='green',
        lw=2, 
        label=f'PR curve (area = {pr_auc:.3f})'
    )
    
    # Add labels and settings
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('Recall')
    plt.ylabel('Precision')
    plt.title('Precision-Recall Curve')
    plt.legend(loc="lower left")
    
    # Save the plot
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    plt.close()

def save_metrics(metrics: Dict[str, Any], output_path: str) -> None:
    """
    Save metrics to a JSON file
    
    Args:
        metrics: Dictionary containing all calculated metrics
        output_path: Path to save the metrics JSON file
    """
    print(f"Saving metrics to {output_path}")
    
    # Add timestamp
    metrics["timestamp"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Save to JSON
    with open(output_path, 'w') as f:
        json.dump(metrics, f, indent=4)

def main():
    """Main function to evaluate the model"""
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Evaluate a trained NIDS model")
    parser.add_argument("--model_path", type=str, required=True, 
                        help="Path to the trained model (.pkl or .h5)")
    parser.add_argument("--test_data", type=str, required=True,
                        help="Path to the test data (.pkl)")
    parser.add_argument("--output_dir", type=str, default="backend/eval",
                        help="Directory to save evaluation results")
    args = parser.parse_args()
    
    # Extract model name from path
    model_name = os.path.basename(args.model_path).split('.')[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create output directory if it doesn't exist
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Define output paths
    metrics_path = output_dir / f"metrics_{model_name}_{timestamp}.json"
    cm_plot_path = output_dir / f"confusion_matrix_{model_name}_{timestamp}.png"
    roc_plot_path = output_dir / f"roc_curve_{model_name}_{timestamp}.png"
    pr_plot_path = output_dir / f"pr_curve_{model_name}_{timestamp}.png"
    
    try:
        # Load test data
        X_test, y_test = load_test_data(args.test_data)
        
        # Load model
        model = load_model(args.model_path)
        
        # Make predictions
        y_pred, y_prob = make_predictions(model, X_test)
        
        # Calculate metrics
        metrics = calculate_metrics(y_test, y_pred, y_prob)
        
        # Generate and save plots
        plot_confusion_matrix(metrics, cm_plot_path)
        
        # For binary classification, plot ROC and PR curves
        if metrics["classes"] == 2:
            plot_roc_curve(metrics, roc_plot_path)
            plot_precision_recall_curve(metrics, pr_plot_path)
        
        # Save metrics to JSON
        save_metrics(metrics, metrics_path)
        
        print("\nEvaluation completed successfully!")
        print(f"Results saved to {output_dir}")
        
    except Exception as e:
        print(f"Error during evaluation: {e}")
        raise

if __name__ == "__main__":
    main() 