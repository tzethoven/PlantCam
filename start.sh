#!/bin/bash

# Load environment variables if .env exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

# Set default port if not set in environment
if [ -z "$PORT" ]; then
    export PORT=3000
else
    export PORT="$PORT"
fi

# Check if build directory exists
if [ ! -d "build" ]; then
    echo "Error: build directory not found. Please run 'npm run build' on your development machine first."
    exit 1
fi

# Start the application
echo "Starting PlantCam application on port $PORT..."
node build

