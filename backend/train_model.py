import os
import argparse
import numpy as np
from pathlib import Path
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from utils.data_loader import load_and_preprocess_kdd_data, get_dataset_stats
from utils.evaluation import evaluate_prediction

def train_model(dataset_path, model_name="default_model", test_size=0.2, random_state=42):
    """
    Train a machine learning model on the NSL-KDD dataset
    
    Args:
        dataset_path: Path to the NSL-KDD dataset
        model_name: Name to save the model as
        test_size: Proportion of data to use for testing
        random_state: Random seed for reproducibility
        
    Returns:
        dict: Evaluation metrics
    """
    print(f"Loading dataset from: {dataset_path}")
    
    # Get dataset statistics
    stats = get_dataset_stats(dataset_path)
    print(f"Dataset statistics: {stats}")
    
    # Load and preprocess the data
    X, y = load_and_preprocess_kdd_data(dataset_path, save_preprocessors=True)
    
    # Convert to numpy arrays if needed
    X = np.array(X)
    y = np.array(y)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Train a RandomForest classifier
    print("Training Random Forest classifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=20,
        min_samples_split=2,
        min_samples_leaf=1,
        random_state=random_state,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Save the model
    model_dir = Path("models")
    model_dir.mkdir(exist_ok=True)
    
    model_path = model_dir / f"{model_name}.pkl"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    # Evaluate the model
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)
    
    evaluation = evaluate_prediction(
        y_true=y_test,
        y_pred=y_pred,
        y_prob=y_prob,
        save_results=True,
        model_name=model_name
    )
    
    print("Evaluation complete!")
    print(f"Accuracy: {evaluation['metrics']['accuracy']:.4f}")
    print(f"Precision: {evaluation['metrics']['precision']:.4f}")
    print(f"Recall: {evaluation['metrics']['recall']:.4f}")
    print(f"F1 Score: {evaluation['metrics']['f1_score']:.4f}")
    if evaluation['metrics']['roc_auc'] is not None:
        print(f"ROC AUC: {evaluation['metrics']['roc_auc']:.4f}")
    
    return evaluation

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train a model on the NSL-KDD dataset")
    parser.add_argument(
        "--dataset", 
        type=str, 
        default="data/KDDTrain+_20Percent.txt",
        help="Path to the NSL-KDD dataset file"
    )
    parser.add_argument(
        "--model_name", 
        type=str, 
        default="default_model",
        help="Name to save the model as"
    )
    parser.add_argument(
        "--test_size", 
        type=float, 
        default=0.2,
        help="Proportion of data to use for testing"
    )
    
    args = parser.parse_args()
    
    train_model(args.dataset, args.model_name, args.test_size) 