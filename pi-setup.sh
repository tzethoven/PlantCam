#!/bin/bash
set -e

# Load environment variables if .env exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo "Running npm install..."
npm install

echo "Running npm build..."
npm run build

echo "Setup complete."