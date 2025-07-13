#!/bin/bash

# Load environment variables if .env exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

# Set default port if not set in environment
export PORT=${PORT:-3000}

# Start the application
echo "Starting PlantCam application on port $PORT..."
node build
PORT=${PORT:-3000} node build
