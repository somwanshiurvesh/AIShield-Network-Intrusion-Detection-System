# Model Evaluation Script

`evaluate_model.py` is a comprehensive script for evaluating NIDS (Network Intrusion Detection System) models and generating detailed performance metrics and visualizations.

## Features

- Evaluates both scikit-learn and TensorFlow/Keras models
- Calculates key classification metrics (accuracy, precision, recall, F1)
- Generates and saves visualization plots:
  - Confusion matrix (heatmap)
  - ROC curve (for binary classification)
  - Precision-Recall curve (for binary classification)
- Saves all metrics to a structured JSON file
- Handles both binary and multi-class classification models

## Usage

```bash
python evaluate_model.py --model_path models/nids_model_rf.pkl --test_data models/test_data.pkl
```

### Arguments

- `--model_path`: Path to the trained model (.pkl or .h5)
- `--test_data`: Path to the test data (.pkl)
- `--output_dir`: Directory to save evaluation results (default: backend/eval)

## Output Files

The script produces the following files:

- `metrics_{model_name}_{timestamp}.json`: All evaluation metrics in JSON format
- `confusion_matrix_{model_name}_{timestamp}.png`: Confusion matrix heatmap
- `roc_curve_{model_name}_{timestamp}.png`: ROC curve (binary classification only)
- `pr_curve_{model_name}_{timestamp}.png`: Precision-Recall curve (binary classification only)

## Metrics Included

- Basic metrics:
  - Accuracy
  - Precision (weighted)
  - Recall (weighted)
  - F1-score (weighted)
- For binary classification:
  - ROC AUC
  - Precision-Recall AUC
- Detailed metrics:
  - Confusion matrix
  - Full classification report (precision, recall, f1 by class)

## Example

To evaluate the Random Forest model:

```bash
python backend/eval/evaluate_model.py \
  --model_path backend/models/nids_model_rf.pkl \
  --test_data backend/models/test_data.pkl \
  --output_dir backend/eval
```

## Visualization Samples

### Confusion Matrix
The confusion matrix shows true vs. predicted labels with color intensity representing counts.

### ROC Curve
The ROC curve plots the true positive rate against the false positive rate at various thresholds.

### Precision-Recall Curve
The PR curve visualizes the trade-off between precision and recall. 