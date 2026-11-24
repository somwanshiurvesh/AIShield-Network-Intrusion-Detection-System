import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib

# NSL-KDD dataset column names
# Based on the KDD Cup 1999 dataset description
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

# Map attack types to their respective categories
ATTACK_MAPPING = {
    'normal': 'normal',
    # DoS attacks
    'apache2': 'dos', 'back': 'dos', 'land': 'dos', 'neptune': 'dos', 
    'mailbomb': 'dos', 'pod': 'dos', 'processtable': 'dos', 'smurf': 'dos', 
    'teardrop': 'dos', 'udpstorm': 'dos',
    # Probe attacks
    'ipsweep': 'probe', 'mscan': 'probe', 'nmap': 'probe', 'portsweep': 'probe', 
    'saint': 'probe', 'satan': 'probe',
    # R2L attacks
    'ftp_write': 'r2l', 'guess_passwd': 'r2l', 'httptunnel': 'r2l', 'imap': 'r2l', 
    'multihop': 'r2l', 'named': 'r2l', 'phf': 'r2l', 'sendmail': 'r2l', 
    'snmpgetattack': 'r2l', 'snmpguess': 'r2l', 'spy': 'r2l', 'warezclient': 'r2l', 
    'warezmaster': 'r2l', 'worm': 'r2l', 'xlock': 'r2l', 'xsnoop': 'r2l',
    # U2R attacks
    'buffer_overflow': 'u2r', 'loadmodule': 'u2r', 'perl': 'u2r', 'ps': 'u2r', 
    'rootkit': 'u2r', 'sqlattack': 'u2r', 'xterm': 'u2r'
}

def load_kdd_data(file_path, binary=True, add_column_names=True):
    """
    Load NSL-KDD dataset
    
    Args:
        file_path: Path to the NSL-KDD dataset file
        binary: Whether to convert the classification to binary (normal vs attack)
        add_column_names: Whether to add column names to the DataFrame
        
    Returns:
        pandas.DataFrame: Loaded dataset
    """
    file_path = Path(file_path)
    
    # Check if file exists
    if not file_path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
    
    # Load the dataset
    if add_column_names:
        df = pd.read_csv(file_path, header=None, names=KDD_COLUMNS)
    else:
        df = pd.read_csv(file_path, header=None)
    
    # Extract features and labels
    X = df.iloc[:, :-1]
    y = df.iloc[:, -1]
    
    # Clean labels (remove dot and convert to lowercase)
    if isinstance(y.iloc[0], str):
        y = y.str.lower().str.replace('.', '')
    
    # Convert to binary classification if requested
    if binary:
        y = y.map(lambda x: 0 if x == 'normal' else 1)
    else:
        # Map to attack categories
        y = y.map(lambda x: ATTACK_MAPPING.get(x, 'unknown'))
    
    # Update the DataFrame with processed labels
    df.iloc[:, -1] = y
    
    return df

def preprocess_kdd_data(df, save_preprocessors=False, scaler_path=None, encoder_path=None, feature_names_path=None):
    """
    Preprocess the NSL-KDD dataset
    
    Args:
        df: DataFrame containing the dataset
        save_preprocessors: Whether to save the preprocessors for later use
        scaler_path: Path to save the scaler
        encoder_path: Path to save the encoder
        feature_names_path: Path to save the feature names
        
    Returns:
        tuple: (X_processed, y) where X_processed is the preprocessed features and y is the labels
    """
    # Identify categorical and numerical columns
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    categorical_cols = [col for col in categorical_cols if col != 'class']
    
    numerical_cols = df.select_dtypes(include=['number']).columns.tolist()
    
    # Extract features and target
    X = df.drop('class', axis=1)
    y = df['class']
    
    # Define preprocessing steps
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols)
        ])
    
    # Fit and transform the data
    X_processed = preprocessor.fit_transform(X)
    
    # Save preprocessors if requested
    if save_preprocessors:
        # Extract the scaler and encoder
        scaler = preprocessor.named_transformers_['num']
        encoder = preprocessor.named_transformers_['cat']
        
        # Save the feature names
        feature_names = numerical_cols + categorical_cols
        
        # Save to disk
        if scaler_path:
            joblib.dump(scaler, scaler_path)
        else:
            joblib.dump(scaler, "models/scaler.pkl")
            
        if encoder_path:
            joblib.dump(encoder, encoder_path)
        else:
            joblib.dump(encoder, "models/encoder.pkl")
            
        if feature_names_path:
            joblib.dump(feature_names, feature_names_path)
        else:
            joblib.dump(feature_names, "models/feature_names.pkl")
    
    return X_processed, y

def load_and_preprocess_kdd_data(file_path, binary=True, save_preprocessors=False):
    """
    Load and preprocess the NSL-KDD dataset in one step
    
    Args:
        file_path: Path to the NSL-KDD dataset file
        binary: Whether to convert the classification to binary
        save_preprocessors: Whether to save the preprocessors
        
    Returns:
        tuple: (X_processed, y) where X_processed is the preprocessed features and y is the labels
    """
    df = load_kdd_data(file_path, binary=binary)
    return preprocess_kdd_data(df, save_preprocessors=save_preprocessors)

def get_dataset_stats(file_path, binary=True):
    """
    Get statistics about the dataset
    
    Args:
        file_path: Path to the NSL-KDD dataset file
        binary: Whether to convert the classification to binary
        
    Returns:
        dict: Dictionary containing dataset statistics
    """
    df = load_kdd_data(file_path, binary=binary)
    
    # Count instances per class
    class_counts = df['class'].value_counts().to_dict()
    
    # Calculate percentages
    total_instances = len(df)
    class_percentages = {k: (v / total_instances) * 100 for k, v in class_counts.items()}
    
    # Get other useful statistics
    stats = {
        'total_instances': total_instances,
        'feature_count': df.shape[1] - 1,  # Excluding the class column
        'class_counts': class_counts,
        'class_percentages': class_percentages,
        'binary_classification': binary
    }
    
    return stats 