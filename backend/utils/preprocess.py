"""
NSL-KDD Dataset Preprocessing Script

This script processes the NSL-KDD dataset for machine learning:
- Loads the dataset from CSV/TXT files
- Encodes categorical features
- Normalizes numerical features
- Splits data into training and testing sets
- Saves preprocessed data and preprocessing objects for later use
"""

import os
import pandas as pd
import numpy as np
from pathlib import Path
import joblib
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.model_selection import train_test_split

# Define KDD column names directly to avoid import issues
KDD_COLUMNS = [
    'duration', 'protocol_type', 'service', 'flag', 'src_bytes', 'dst_bytes',
    'land', 'wrong_fragment', 'urgent', 'hot', 'num_failed_logins', 'logged_in',
    'num_compromised', 'root_shell', 'su_attempted', 'num_root', 'num_file_creations',
    'num_shells', 'num_access_files', 'num_outbound_cmds', 'is_host_login',
    'is_guest_login', 'count', 'srv_count', 'serror_rate', 'srv_serror_rate',
    'rerror_rate', 'srv_rerror_rate', 'same_srv_rate', 'diff_srv_rate',
    'srv_diff_host_rate', 'dst_host_count', 'dst_host_srv_count', 'dst_host_same_srv_rate',
    'dst_host_diff_srv_rate', 'dst_host_same_src_port_rate', 'dst_host_srv_diff_host_rate',
    'dst_host_serror_rate', 'dst_host_srv_serror_rate', 'dst_host_rerror_rate',
    'dst_host_srv_rerror_rate', 'class'
]

def preprocess_nsl_kdd(input_file, output_dir='models', test_size=0.2, random_state=42):
    """
    Preprocess the NSL-KDD dataset and save the processed data and preprocessing objects
    
    Args:
        input_file (str): Path to the input dataset file
        output_dir (str): Directory to save processed data and objects
        test_size (float): Proportion of data to use for testing
        random_state (int): Random seed for reproducibility
        
    Returns:
        dict: Dictionary containing paths to saved files
    """
    # Create output directory if it doesn't exist
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    print(f"Loading dataset from {input_file}...")
    
    # Check file extension and load accordingly
    file_ext = Path(input_file).suffix
    if file_ext.lower() == '.csv':
        # Load as CSV with headers
        df = pd.read_csv(input_file)
    else:
        # Load as TXT with specified column names
        df = pd.read_csv(input_file, header=None, names=KDD_COLUMNS)
    
    print(f"Dataset loaded with shape: {df.shape}")
    
    # Make a copy to avoid modifying the original dataframe
    df_copy = df.copy()
    
    # Extract the target variable
    y = df_copy.pop('class')
    X = df_copy
    
    print("Preprocessing features...")
    
    # Identify categorical and numerical columns
    categorical_cols = X.select_dtypes(include=['object', 'category']).columns.tolist()
    numerical_cols = X.select_dtypes(include=['number']).columns.tolist()
    
    print(f"Categorical columns: {categorical_cols}")
    print(f"Number of numerical columns: {len(numerical_cols)}")
    
    # Set up preprocessing pipelines
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ],
        verbose_feature_names_out=False
    )
    
    # Fit and transform the features
    X_processed = preprocessor.fit_transform(X)
    
    # Create feature names for the processed data
    onehot_cols = preprocessor.named_transformers_['cat'].get_feature_names_out(categorical_cols)
    feature_names = numerical_cols + onehot_cols.tolist()
    
    print(f"Processed data shape: {X_processed.shape}")
    
    # Encode the target variable (class labels)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Get mapping of encoded labels to original labels
    label_mapping = dict(zip(label_encoder.classes_, range(len(label_encoder.classes_))))
    print(f"Label mapping: {label_mapping}")
    
    # Split into training and testing sets
    print(f"Splitting data with test_size={test_size}, random_state={random_state}")
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y_encoded, 
        test_size=test_size, 
        random_state=random_state, 
        stratify=y_encoded
    )
    
    print(f"Training set shape: {X_train.shape}")
    print(f"Testing set shape: {X_test.shape}")
    
    # Save the preprocessed data
    print("Saving preprocessed data and objects...")
    
    # Create paths for saving
    train_data_path = output_path / 'train_data.pkl'
    test_data_path = output_path / 'test_data.pkl'
    preprocessor_path = output_path / 'preprocessor.pkl'
    label_encoder_path = output_path / 'label_encoder.pkl'
    feature_names_path = output_path / 'feature_names.pkl'
    
    # Save preprocessed training and test sets
    joblib.dump({'X': X_train, 'y': y_train}, train_data_path)
    joblib.dump({'X': X_test, 'y': y_test}, test_data_path)
    
    # Save preprocessor (contains both StandardScaler and OneHotEncoder)
    joblib.dump(preprocessor, preprocessor_path)
    
    # Save label encoder
    joblib.dump(label_encoder, label_encoder_path)
    
    # Save feature names
    joblib.dump(feature_names, feature_names_path)
    
    # Return paths to saved files
    saved_files = {
        'train_data': train_data_path,
        'test_data': test_data_path,
        'preprocessor': preprocessor_path,
        'label_encoder': label_encoder_path,
        'feature_names': feature_names_path
    }
    
    print("Preprocessing complete. Files saved:")
    for name, path in saved_files.items():
        print(f"  - {name}: {path}")
    
    return saved_files

def load_preprocessed_data(data_file):
    """
    Load preprocessed data from a pickle file
    
    Args:
        data_file (str): Path to the preprocessed data file
        
    Returns:
        tuple: (X, y) where X is the features and y is the labels
    """
    data = joblib.load(data_file)
    return data['X'], data['y']

def apply_preprocessing(X, preprocessor_file):
    """
    Apply preprocessing to new data
    
    Args:
        X (DataFrame): Input features
        preprocessor_file (str): Path to the saved preprocessor
        
    Returns:
        array: Preprocessed features
    """
    preprocessor = joblib.load(preprocessor_file)
    return preprocessor.transform(X)

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Preprocess NSL-KDD dataset")
    parser.add_argument("--input", type=str, default="data/KDDTrain+.txt", 
                        help="Path to input dataset file")
    parser.add_argument("--output", type=str, default="models", 
                        help="Directory to save processed data and objects")
    parser.add_argument("--test-size", type=float, default=0.2,
                        help="Proportion of data to use for testing")
    parser.add_argument("--random-state", type=int, default=42,
                        help="Random seed for reproducibility")
    
    args = parser.parse_args()
    
    preprocess_nsl_kdd(
        input_file=args.input,
        output_dir=args.output,
        test_size=args.test_size,
        random_state=args.random_state
    ) 