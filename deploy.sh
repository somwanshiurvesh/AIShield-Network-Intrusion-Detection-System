#!/bin/bash

# NIDS Project Deployment Script
# This script helps set up and deploy the Network Intrusion Detection System

echo "===== NIDS Project Deployment ====="
echo "This script will help you deploy the NIDS project on port 80"
echo

# Check for Docker and Docker Compose
echo "Checking prerequisites..."
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Docker and Docker Compose are installed."
echo

# Check if port 80 is available
echo "Checking if port 80 is available..."
if command -v nc &> /dev/null; then
    if nc -z localhost 80 2>/dev/null; then
        echo "Warning: Port 80 is already in use. You may need to stop other services using this port."
        echo "Do you want to continue anyway? (y/n)"
        read -r response
        if [[ "$response" != "y" ]]; then
            echo "Deployment canceled."
            exit 1
        fi
    else
        echo "Port 80 is available."
    fi
else
    echo "Cannot check port availability. Please ensure port 80 is not in use by other services."
fi
echo

# Build and start the services
echo "Building and starting services..."
docker-compose down 2>/dev/null
docker-compose build

if [ $? -ne 0 ]; then
    echo "Build failed. Please check the error messages above."
    exit 1
fi

echo "Starting services in detached mode..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Failed to start services. Please check the error messages above."
    exit 1
fi

echo
echo "===== Deployment Successful ====="
echo "The NIDS project has been deployed successfully."
echo
echo "You can access the application at:"
echo "- Frontend: http://localhost:80"
echo "- Backend API: http://localhost:8000"
echo
echo "To view logs:"
echo "  docker-compose logs"
echo
echo "To stop the application:"
echo "  docker-compose down"
echo
echo "For troubleshooting, please refer to DEPLOYMENT.md"

# Make the script executable
# chmod +x deploy.sh 