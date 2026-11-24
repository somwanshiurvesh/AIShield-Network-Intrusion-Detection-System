import requests

# API endpoint
url = 'http://localhost:8001/api/upload-predict'

# File to upload
file_path = 'normal_traffic.csv'

# Set up files and data for multipart form upload
files = {'file': open(file_path, 'rb')}
data = {'model_name': 'default_model'}

# Make the POST request
try:
    response = requests.post(url, files=files, data=data)
    
    # Check if request was successful
    if response.status_code == 200:
        print("Success! Response:")
        print(response.json())
    else:
        print(f"Error: Status code {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception occurred: {str(e)}")
finally:
    # Close the file
    files['file'].close() 