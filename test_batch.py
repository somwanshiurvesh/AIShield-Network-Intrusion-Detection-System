import requests
import pandas as pd
import sys
import os
from pathlib import Path

# API Endpoint
API_URL = "http://localhost:8001/api/predict-batch"

def test_batch_prediction(csv_file):
    print(f"Testing batch prediction with file: {csv_file}")
    
    if not os.path.exists(csv_file):
        print(f"Error: File not found: {csv_file}")
        return
    
    # Read CSV file
    try:
        df = pd.read_csv(csv_file)
        print(f"Successfully read CSV with {len(df)} records and {len(df.columns)} columns")
    except Exception as e:
        print(f"Error reading CSV: {str(e)}")
        return
    
    # Convert dataframe to dictionary records for API
    data_records = df.to_dict(orient='records')
    
    # Prepare file for upload
    files = {'file': (os.path.basename(csv_file), open(csv_file, 'rb'), 'text/csv')}
    data = {'model_name': 'default_model', 'include_probabilities': 'true'}
    
    # Make API request
    try:
        response = requests.post(API_URL, files=files, data=data)
        
        if response.status_code == 200:
            results = response.json()
            print("\nPrediction Results:")
            print(f"Total Records: {results['total_records']}")
            print(f"Intrusions Detected: {results['intrusions_detected']} ({results['intrusion_percentage']:.2f}%)")
            print(f"Normal Traffic: {results['normal_traffic']}")
            
            print("\nSample Predictions:")
            for i, record in enumerate(results['preview']):
                if i < 5:  # Show first 5 samples
                    print(f"Record {i+1}: {record['prediction_label']}")
            
            print("\nFile ID for download:", results['file_id'])
        else:
            print(f"Error: API returned status code {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error making API request: {str(e)}")

if __name__ == "__main__":
    # If a file is provided as an argument, use it. Otherwise use sample files
    if len(sys.argv) > 1:
        test_batch_prediction(sys.argv[1])
    else:
        # Test with normal traffic
        print("\n=== Testing with normal traffic sample ===")
        test_batch_prediction("normal_traffic.csv")
        
        # Test with attack traffic
        print("\n=== Testing with DoS attack sample ===")
        test_batch_prediction("dos_attacks.csv") 