#!/bin/bash

# This script sets up a sparse clone of the repository, only pulling the build folder
# Usage: ./pi-setup.sh <github-repo-url>

if [ -z "$1" ]; then
    echo "Please provide your GitHub repository URL"
    echo "Usage: ./pi-setup.sh https://github.com/username/plantcam2.git"
    exit 1
fi

REPO_URL=$1
PROJECT_NAME="plantcam2"

# Create and enter project directory
echo "Creating project directory..."
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

# Initialize git and set up sparse checkout
echo "Initializing git repository..."
git init
git remote add origin $REPO_URL

echo "Setting up sparse checkout for build folder only..."
git sparse-checkout init
git sparse-checkout set build/

# Pull the code
echo "Pulling latest build..."
git pull origin main

# Set up environment
echo "Setting up environment..."
echo "PORT=3000" > .env

# Create startup script
echo "Creating startup script..."
cat > start.sh << 'EOL'
#!/bin/bash

# Load environment variables
set -a
source .env
set +a

# Start the application
echo "Starting PlantCam application..."
node build
EOL

# Make startup script executable
chmod +x start.sh

echo "Setup complete!"
echo "To start the application, run: ./start.sh"
