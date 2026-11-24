import argparse
import numpy as np
import joblib
from pathlib import Path
from utils.data_loader import load_and_preprocess_kdd_data
from utils.evaluation import evaluate_prediction

def evaluate_model(dataset_path, model_name="default_model"):
    """
    Evaluate a trained model on a test dataset
    
    Args:
        dataset_path: Path to the test dataset
        model_name: Name of the model to evaluate
        
    Returns:
        dict: Evaluation metrics
    """
    print(f"Evaluating model '{model_name}' on dataset: {dataset_path}")
    
    # Load model
    model_path = Path(f"models/{model_name}.pkl")
    if not model_path.exists():
        raise FileNotFoundError(f"Model not found: {model_path}")
    
    model = joblib.load(model_path)
    print(f"Model loaded from {model_path}")
    
    # Load and preprocess the test data
    X, y = load_and_preprocess_kdd_data(dataset_path)
    
    # Convert to numpy arrays if needed
    X = np.array(X)
    y = np.array(y)
    
    print(f"Test dataset size: {X.shape[0]}")
    
    # Make predictions
    print("Making predictions...")
    y_pred = model.predict(X)
    y_prob = model.predict_proba(X)
    
    # Evaluate
    evaluation = evaluate_prediction(
        y_true=y,
        y_pred=y_pred,
        y_prob=y_prob,
        save_results=True,
        model_name=f"{model_name}_test"
    )
    
    print("Evaluation complete!")
    print(f"Accuracy: {evaluation['metrics']['accuracy']:.4f}")
    print(f"Precision: {evaluation['metrics']['precision']:.4f}")
    print(f"Recall: {evaluation['metrics']['recall']:.4f}")
    print(f"F1 Score: {evaluation['metrics']['f1_score']:.4f}")
    if evaluation['metrics']['roc_auc'] is not None:
        print(f"ROC AUC: {evaluation['metrics']['roc_auc']:.4f}")
    
    # Print confusion matrix
    print("\nConfusion Matrix:")
    cm = np.array(evaluation["confusion_matrix"])
    print(cm)
    
    # Print more detailed statistics
    print("\nClass-wise Statistics:")
    report = evaluation["classification_report"]
    for label, metrics in report.items():
        if isinstance(metrics, dict):
            print(f"Class {label}:")
            print(f"  Precision: {metrics['precision']:.4f}")
            print(f"  Recall: {metrics['recall']:.4f}")
            print(f"  F1 Score: {metrics['f1-score']:.4f}")
            print(f"  Support: {metrics['support']}")
    
    return evaluation

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Evaluate a trained model on a test dataset")
    parser.add_argument(
        "--dataset", 
        type=str, 
        default="data/KDDTest+.txt",
        help="Path to the test dataset file"
    )
    parser.add_argument(
        "--model_name", 
        type=str, 
        default="default_model",
        help="Name of the model to evaluate"
    )
    
    args = parser.parse_args()
    
    evaluate_model(args.dataset, args.model_name) 