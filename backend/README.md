# Network Intrusion Detection System Backend

This is the backend server for the Network Intrusion Detection System (NIDS) project.

## Models

The system includes several machine learning models for network intrusion detection:

- **Random Forest (RF)**: 82.22% accuracy - **DEFAULT MODEL**
- **Multilayer Perceptron (MLP)**: 79.26% accuracy
- **Gradient Boosting (GB)**: Lower accuracy, experimental

The Random Forest model is set as the default due to its higher accuracy.

## API Endpoints

### Prediction Endpoints

- `/api/predict`: Single prediction endpoint
- `/api/batch-predict`: Batch prediction endpoint for JSON data
- `/api/upload-predict`: File upload prediction endpoint (basic)

### Enhanced Batch Processing

- `/api/predict-batch`: Advanced CSV file upload endpoint with detailed results and file download options
- `/api/download/{file_id}`: Download endpoint for retrieving annotated CSV with predictions

## Usage

Run the backend server:

```bash
uvicorn main:app --reload
```

The API will be accessible at http://localhost:8000.

Visit http://localhost:8000/docs for interactive API documentation.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   venv\Scripts\activate  # On Windows
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Data Preprocessing

Before training models, you need to preprocess the NSL-KDD dataset:

```
python utils/preprocess.py --input data/KDDTrain+_20Percent.txt --output models
```

This will:
- Load the NSL-KDD dataset
- Encode categorical features
- Normalize numerical features
- Split into training and testing sets (80/20)
- Save preprocessed data and preprocessing objects to the models directory

## Training Models

You can train different types of models:

### Random Forest (best performance)

```
python models/train_model_sklearn.py --data-dir models --model-type rf --plot
```

- **Accuracy**: 82.22%
- **Precision**: 81.65%
- **Recall**: 82.22%
- **F1 Score**: 81.41%

### Neural Network (MLP)

```
python models/train_model_sklearn.py --data-dir models --model-type mlp --plot
```

- **Accuracy**: 79.26%
- **Precision**: 78.79%
- **Recall**: 79.26%
- **F1 Score**: 78.69%

### Gradient Boosting Classifier

```
python models/train_model_sklearn.py --data-dir models --model-type gb --plot
```

*Note: This model does not perform well with this dataset.*

## Outputs

The training process produces:
- Trained model file (`nids_model_{model_type}.pkl`)
- Metrics file with detailed evaluation results (`metrics_{model_type}_{timestamp}.json`)
- Confusion matrix plot (`confusion_matrix_{model_type}.png`)

## API Usage

The trained models can be used through the FastAPI endpoints in the `api` directory. Start the API server with:

```
uvicorn main:app --reload
``` 