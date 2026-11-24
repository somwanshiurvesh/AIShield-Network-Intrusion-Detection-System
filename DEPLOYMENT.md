# Deployment Guide for NIDS Project

This guide will help you deploy the Network Intrusion Detection System (NIDS) on a new system.

## Prerequisites

Ensure that the following software is installed on your target system:

- Docker (version 20.10.0 or later)
- Docker Compose (version 2.0.0 or later)
- Git (optional, for cloning the repository)

## Deployment Steps

### 1. Get the Project Files

Either clone the repository or transfer the project files to the target system:

**Option 1: Clone the repository (if using Git)**
```bash
git clone <repository-url>
cd NIDS_PROJECT2
```

**Option 2: Transfer project files**
- Compress the NIDS_PROJECT2 directory
- Transfer the compressed file to the target system
- Extract it in the desired location

### 2. Configure the Application

The project is already configured to run on port 80 for the frontend and port 8000 for the backend API.

If you need to change these ports (for example, if port 80 is already in use), edit the `docker-compose.yml` file:

```bash
# Edit port mappings if necessary
nano docker-compose.yml
```

### 3. Build and Start the Services

Navigate to the project directory and run:

```bash
cd /path/to/NIDS_PROJECT2
docker-compose build
docker-compose up -d
```

This will:
- Build the Docker images for the frontend and backend
- Start the containers in detached mode

### 4. Verify the Deployment

- The frontend should be accessible at: http://localhost:80
- The backend API should be accessible at: http://localhost:8000

You can check the logs to verify everything is running correctly:

```bash
docker-compose logs
```

If you need to see logs for a specific service:

```bash
docker-compose logs frontend
docker-compose logs backend
```

### 5. Stopping the Application

To stop the application:

```bash
docker-compose down
```

## Troubleshooting

### Port Conflicts

If port 80 is already in use:
- Edit the `docker-compose.yml` file and change the frontend port mapping (e.g., from `"80:3001"` to `"8080:3001"`)
- Rebuild and restart: `docker-compose down && docker-compose up -d`

### NetworkIntrusionDetector Error

If you see an error related to `NetworkIntrusionDetector`:
- The model will be created automatically on startup
- If problems persist, check that the backend container has appropriate permissions to create files in the models directory

### JSON Serialization Error

If you encounter a `numpy.bool_` serialization error:
- Check the `/backend/requirements.txt` file to ensure all dependencies are correctly listed
- Ensure numpy version is at least 1.24.3

## System Requirements

- At least 2GB of RAM
- At least 10GB of free disk space
- Network connectivity between containers
- Port 80 and 8000 available (or configure different ports) 