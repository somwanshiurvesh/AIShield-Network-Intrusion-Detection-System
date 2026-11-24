# NIDS Models

This directory contains trained machine learning models for the Network Intrusion Detection System.

## Model Files

Models are saved in the following format:
- `{model_name}.pkl` - The trained model
- `scaler.pkl` - Feature scaler (if applicable)
- `encoder.pkl` - Categorical feature encoder (if applicable)
- `feature_names.pkl` - List of feature names used during training

## Available Models

- `default_model.pkl` - The default intrusion detection model
- Other specialized models can be added here

## Model Usage

Models are loaded automatically by the API when making predictions. You can specify which model to use by passing the `model_name` parameter in your API requests.

## Training New Models

To train new models, use the training scripts in the project. Models trained will be automatically saved in this directory. 