#!/bin/bash
set -e

echo "Running npm install..."
npm install

echo "Running npm build..."
export BUILDING=true
npm run build

echo "Setup complete. You can now run start.sh."