#!/bin/bash
set -e

echo "Running npm install..."
npm install

echo "Running npm build..."
npm run build

echo "Setup complete."