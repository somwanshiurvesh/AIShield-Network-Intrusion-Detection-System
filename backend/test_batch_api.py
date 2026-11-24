"""
Test script for the batch prediction endpoints.
This script will generate a sample CSV file and test the batch prediction endpoint.
"""

import requests
import pandas as pd
import numpy as np
import os
import time
from pathlib import Path

# Define the API endpoints
API_BASE_URL = "http://localhost:8000"
PREDICT_BATCH_URL = f"{API_BASE_URL}/api/predict-batch"
DOWNLOAD_URL = f"{API_BASE_URL}/api/download"

def generate_sample_csv(num_samples=100, output_path="test_data.csv"):
    """Generate a sample CSV file with network traffic data"""
    # Create sample data with typical NSL-KDD features
    np.random.seed(42)  # For reproducibility
    
    data = {
        "duration": np.random.randint(0, 500, num_samples),
        "protocol_type": np.random.choice(["tcp", "udp", "icmp"], num_samples),
        "service": np.random.choice(["http", "ftp_data", "smtp", "other"], num_samples),
        "flag": np.random.choice(["SF", "S0", "REJ", "RSTO", "other"], num_samples),
        "src_bytes": np.random.randint(0, 10000, num_samples),
        "dst_bytes": np.random.randint(0, 10000, num_samples),
    }
    
    df = pd.DataFrame(data)
    df.to_csv(output_path, index=False)
    print(f"Generated sample CSV file with {num_samples} rows at {output_path}")
    return output_path

def test_predict_batch_endpoint(csv_path):
    """Test the predict-batch endpoint"""
    print("\n--- Testing /api/predict-batch endpoint ---")
    
    # Prepare the files and form data
    files = {
        "file": (os.path.basename(csv_path), open(csv_path, "rb"), "text/csv")
    }
    form_data = {
        "model_name": "nids_model_rf",
        "include_probabilities": "true"
    }
    
    # Send request
    print("Sending request...")
    response = requests.post(PREDICT_BATCH_URL, files=files, data=form_data)
    
    # Check response
    if response.status_code == 200:
        print("Request successful")
        result = response.json()
        print(f"Total records: {result['total_records']}")
        print(f"Intrusions detected: {result['intrusions_detected']} ({result['intrusion_percentage']:.2f}%)")
        print(f"Normal traffic: {result['normal_traffic']}")
        print(f"File ID for download: {result['file_id']}")
        
        # Print preview of the first few predictions
        print("\nPreview of predictions:")
        for i, record in enumerate(result['preview'][:3]):  # Show first 3 only
            print(f"Record {i+1}: {record}")
        
        return result
    else:
        print(f"Request failed with status code {response.status_code}")
        print(f"Error message: {response.text}")
        return None

def test_download_endpoint(file_id):
    """Test the download endpoint"""
    print("\n--- Testing /api/download endpoint ---")
    
    download_path = Path(f"downloaded_results_{int(time.time())}.csv")
    download_url = f"{DOWNLOAD_URL}/{file_id}"
    
    print(f"Downloading results from {download_url}")
    response = requests.get(download_url)
    
    if response.status_code == 200:
        print("Download successful")
        with open(download_path, "wb") as f:
            f.write(response.content)
        
        print(f"Results saved to {download_path}")
        
        # Show a preview of the downloaded file
        df = pd.read_csv(download_path)
        print("\nPreview of downloaded CSV:")
        print(df.head(3))
        
        return download_path
    else:
        print(f"Download failed with status code {response.status_code}")
        print(f"Error message: {response.text}")
        return None

def main():
    """Main test function"""
    print("Starting batch API test")
    
    # Generate sample CSV
    csv_path = generate_sample_csv(num_samples=50)
    
    # Test predict-batch endpoint
    result = test_predict_batch_endpoint(csv_path)
    
    # Test download endpoint if predict-batch was successful
    if result and 'file_id' in result:
        download_path = test_download_endpoint(result['file_id'])
    
    print("\nTest completed")

if __name__ == "__main__":
    main() 