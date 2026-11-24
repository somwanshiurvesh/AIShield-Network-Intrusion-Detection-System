import requests
import time

# API endpoint
url = 'http://localhost:8001/api/upload-predict'

def test_consistency(file_path, iterations=5):
    """Test the consistency of the upload-predict endpoint by calling it multiple times"""
    results = []
    
    print(f"Testing consistency with {file_path} for {iterations} iterations")
    print("=" * 50)
    
    for i in range(iterations):
        # Set up files and data for multipart form upload
        files = {'file': open(file_path, 'rb')}
        data = {'model_name': 'default_model'}
        
        try:
            # Make the POST request
            response = requests.post(url, files=files, data=data)
            
            # Check if request was successful
            if response.status_code == 200:
                result = response.json()
                results.append(result)
                print(f"\nIteration {i+1}:")
                print(f"  Total records: {result['total']}")
                print(f"  Intrusions detected: {result['intrusions_detected']}")
                print(f"  Normal traffic: {result['normal_traffic']}")
                print(f"  Intrusion percentage: {result['intrusion_percentage']:.2f}%")
            else:
                print(f"\nIteration {i+1} - Error: Status code {response.status_code}")
                print(response.text)
        except Exception as e:
            print(f"\nIteration {i+1} - Exception occurred: {str(e)}")
        finally:
            # Close the file
            files['file'].close()
        
        # Small delay between requests
        time.sleep(1)
    
    # Analyze consistency
    if results:
        print("\n" + "=" * 50)
        print("Consistency Analysis:")
        
        # Check if all results have the same intrusion count
        intrusion_counts = [r['intrusions_detected'] for r in results]
        if len(set(intrusion_counts)) == 1:
            print(f"✓ Consistent intrusion counts: {intrusion_counts[0]}")
        else:
            print(f"✗ Inconsistent intrusion counts: {intrusion_counts}")
        
        # Check if all results have the same normal count
        normal_counts = [r['normal_traffic'] for r in results]
        if len(set(normal_counts)) == 1:
            print(f"✓ Consistent normal counts: {normal_counts[0]}")
        else:
            print(f"✗ Inconsistent normal counts: {normal_counts}")
        
        # Check if all results have the same percentage
        percentages = [r['intrusion_percentage'] for r in results]
        if len(set(percentages)) == 1:
            print(f"✓ Consistent intrusion percentages: {percentages[0]:.2f}%")
        else:
            print(f"✗ Inconsistent intrusion percentages: {percentages}")

if __name__ == "__main__":
    print("Testing normal_traffic.csv:")
    test_consistency('normal_traffic.csv', 3)
    
    print("\n\nTesting dos_attacks.csv:")
    test_consistency('dos_attacks.csv', 3) 