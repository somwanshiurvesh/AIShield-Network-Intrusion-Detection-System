# Network Intrusion Detection System (NIDS)

A machine learning-based system for detecting network intrusions in real-time. This project includes both frontend and backend components, packaged with Docker for easy deployment.

## Features

- **Real-time Network Analysis**: Monitors and analyzes current network traffic
- **Rule-based Detection**: Uses a custom rule-based approach for identifying suspicious patterns
- **Interactive Dashboard**: Visual representation of network status and intrusion probabilities
- **Manual Input Analysis**: Test specific network patterns to evaluate intrusion risk
- **Batch Processing**: Upload CSV files for bulk analysis

## Architecture

The system consists of two main components:

1. **Backend (FastAPI)**
   - RESTful API endpoints for network traffic analysis
   - Rule-based detection model
   - Data preprocessing and feature extraction

2. **Frontend (React)**
   - User interface for interacting with the system
   - Real-time visualization of network status
   - Form for manual input testing

## Quick Start

The easiest way to run the application is using Docker:

```bash
# Clone the repository
git clone <repository-url>
cd NIDS_PROJECT2

# Build and start services
docker-compose build
docker-compose up -d

# Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:8000
```

## Running on Port 80

The project is configured to run on port 80 for the frontend. If you need to deploy on a different system, follow these steps:

1. Transfer the entire project directory to the target system
2. Make sure Docker and Docker Compose are installed
3. Navigate to the project directory
4. Run `docker-compose build` to build the images
5. Run `docker-compose up -d` to start the services
6. Access the application at http://localhost:80

## Manual Testing

You can test the system by:

1. **Live Traffic Analysis**: View the current network status on the home page
2. **Manual Input**: Go to the Live Predict page and enter network traffic parameters

For suspicious traffic detection, try these input combinations:

- For normal traffic: Keep all values low, with zeros for Wrong Fragment, Urgent Packets, Hot Indicators, and Failed Logins
- For suspicious traffic: Set any of the critical indicators (Wrong Fragment, Urgent Packets, Hot Indicators, Failed Logins) to values above 0
- For highly suspicious traffic: Set multiple critical indicators to non-zero values and use high values for Source/Destination Bytes (>1000)

## Troubleshooting

See the DEPLOYMENT.md file for detailed troubleshooting instructions.

## System Requirements

- Docker Engine (20.10.0+)
- Docker Compose (2.0.0+)
- 2GB RAM minimum
- 10GB free disk space
- Available ports: 80 (frontend) and 8000 (backend)

## Project Structure

```
├── backend/              # FastAPI backend
│   ├── api/              # API routes and logic
│   ├── models/           # Trained ML/DL models
│   ├── utils/            # Helper functions
│   ├── data/             # Dataset files
│   ├── eval/             # Evaluation metrics and plots
│   └── main.py           # FastAPI entry point
├── frontend/             # React + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/   # Reusable UI elements
│   │   ├── pages/        # UI pages
│   │   └── assets/       # Logos, images, etc.
│   ├── package.json      # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
└── docker/               # Docker configuration
    ├── Dockerfile.backend # Backend Dockerfile
    ├── Dockerfile.frontend # Frontend Dockerfile
    ├── nginx.conf        # NGINX configuration
    └── docker-compose.yml # Docker Compose configuration
```

## Technologies

- **Backend**: FastAPI, Python, Scikit-learn
- **Frontend**: React, Tailwind CSS, Chart.js
- **Deployment**: Docker, NGINX
- **Machine Learning**: Random Forest, NSL-KDD dataset

## NSL-KDD Dataset

This project uses the NSL-KDD dataset, which is a refined version of the KDD Cup 1999 dataset for network intrusion detection. The dataset consists of the following files:

- `KDDTrain+.txt` - The complete training dataset
- `KDDTest+.txt` - The complete test dataset
- `KDDTrain+_20Percent.txt` - A smaller subset of the training dataset (20%)
- `KDDTest-21.txt` - A subset of the test dataset with more difficult samples

The dataset contains 41 features and a class label indicating whether the network traffic is normal or an intrusion. Intrusions are further categorized into four types:

1. **DoS (Denial of Service)**: Attacks that attempt to make a network resource unavailable
2. **Probe**: Attacks that scan networks to gather information or find vulnerabilities
3. **R2L (Remote to Local)**: Unauthorized access from a remote machine
4. **U2R (User to Root)**: Unauthorized access to root privileges

## Model Training

The system includes scripts for training and evaluating machine learning models:

- `backend/train_model.py`: Trains a Random Forest classifier on the NSL-KDD dataset
- `backend/evaluate_model.py`: Evaluates a trained model on a test dataset

To train a model:

```bash
cd backend
python train_model.py --dataset data/KDDTrain+_20Percent.txt --model_name default_model
```

To evaluate a model:

```bash
cd backend
python evaluate_model.py --dataset data/KDDTest+.txt --model_name default_model
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for development)
- Python 3.9+ (for development)

### Running with Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/nids.git
   cd nids
   ```

2. Start the application using Docker Compose:
   ```
   docker-compose -f docker/docker-compose.yml up --build
   ```

3. Access the application:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the development server:
   ```
   uvicorn main:app --reload
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Data

This project is designed to work with the NSL-KDD dataset, which is a refined version of the KDD Cup 1999 dataset for network intrusion detection. The dataset can be downloaded from:
- https://www.unb.ca/cic/datasets/nsl.html

Place the dataset files in the `backend/data/` directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 