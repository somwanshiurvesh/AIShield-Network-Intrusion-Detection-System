# NIDS Evaluation

This directory contains evaluation results and visualizations for the Network Intrusion Detection System models.

## Evaluation Files

The following types of files are stored in this directory:

### Evaluation Results
- `{model_name}_eval_{timestamp}.json` - Model evaluation metrics in JSON format

### Visualization Plots
- `{model_name}_confusion_matrix_{timestamp}.png` - Confusion matrix visualization
- `{model_name}_roc_curve_{timestamp}.png` - ROC curve (for binary classification)
- Other performance visualization plots

## Metrics Included

The evaluation results include the following metrics:
- Accuracy
- Precision
- Recall
- F1 Score
- ROC AUC (for binary classification)
- Confusion Matrix
- Full Classification Report

## Viewing Results

Evaluation results can be viewed:
1. Directly in the JSON files
2. Through the web dashboard in the frontend
3. Using the utility functions in `utils/evaluation.py` 