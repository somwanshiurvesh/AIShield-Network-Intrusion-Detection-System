import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report, roc_curve, auc
)
from pathlib import Path
import json
import datetime

def evaluate_prediction(y_true, y_pred, y_prob=None, save_results=True, model_name="default_model"):
    """
    Evaluate model predictions and optionally save results
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_prob: Prediction probabilities (if available)
        save_results: Whether to save evaluation results
        model_name: Name of the model being evaluated
        
    Returns:
        dict: Dictionary containing evaluation metrics
    """
    # Calculate metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average='weighted')
    recall = recall_score(y_true, y_pred, average='weighted')
    f1 = f1_score(y_true, y_pred, average='weighted')
    
    # Create confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    
    # Create classification report
    report = classification_report(y_true, y_pred, output_dict=True)
    
    # ROC curve and AUC (if probabilities are provided)
    roc_auc = None
    if y_prob is not None and len(np.unique(y_true)) == 2:  # Binary classification
        fpr, tpr, _ = roc_curve(y_true, y_prob[:, 1])
        roc_auc = auc(fpr, tpr)
    
    # Compile results
    results = {
        "model_name": model_name,
        "timestamp": datetime.datetime.now().isoformat(),
        "metrics": {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc) if roc_auc is not None else None
        },
        "confusion_matrix": cm.tolist(),
        "classification_report": report
    }
    
    # Save results if requested
    if save_results:
        save_evaluation_results(results, model_name)
        
        # Save plots if probabilities are provided
        if y_prob is not None:
            save_evaluation_plots(y_true, y_pred, y_prob, model_name)
    
    return results

def save_evaluation_results(results, model_name):
    """
    Save evaluation results to a JSON file
    
    Args:
        results: Dictionary of evaluation results
        model_name: Name of the model
    """
    # Create eval directory if it doesn't exist
    eval_dir = Path("eval")
    eval_dir.mkdir(exist_ok=True)
    
    # Save results to JSON file
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = eval_dir / f"{model_name}_eval_{timestamp}.json"
    
    with open(file_path, 'w') as f:
        json.dump(results, f, indent=4)
        
    print(f"Evaluation results saved to {file_path}")

def save_evaluation_plots(y_true, y_pred, y_prob, model_name):
    """
    Generate and save evaluation plots
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        y_prob: Prediction probabilities
        model_name: Name of the model
    """
    # Create eval directory if it doesn't exist
    eval_dir = Path("eval")
    eval_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Confusion Matrix
    plt.figure(figsize=(10, 8))
    cm = confusion_matrix(y_true, y_pred)
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
    plt.title(f'Confusion Matrix - {model_name}')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.savefig(eval_dir / f"{model_name}_confusion_matrix_{timestamp}.png")
    plt.close()
    
    # ROC Curve (for binary classification)
    if len(np.unique(y_true)) == 2:
        plt.figure(figsize=(10, 8))
        fpr, tpr, _ = roc_curve(y_true, y_prob[:, 1])
        roc_auc = auc(fpr, tpr)
        
        plt.plot(fpr, tpr, color='darkorange', lw=2, label=f'ROC curve (area = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title(f'ROC Curve - {model_name}')
        plt.legend(loc="lower right")
        plt.savefig(eval_dir / f"{model_name}_roc_curve_{timestamp}.png")
        plt.close()
        
    print(f"Evaluation plots saved to {eval_dir}")

def load_evaluation_results(model_name=None):
    """
    Load evaluation results for a specific model or all models
    
    Args:
        model_name: Name of the model to load results for, or None for all models
        
    Returns:
        dict or list: Evaluation results
    """
    eval_dir = Path("eval")
    
    if not eval_dir.exists():
        return []
    
    if model_name:
        # Load results for specific model
        files = list(eval_dir.glob(f"{model_name}_eval_*.json"))
    else:
        # Load all results
        files = list(eval_dir.glob("*_eval_*.json"))
    
    results = []
    for file in files:
        with open(file, 'r') as f:
            results.append(json.load(f))
    
    return results 