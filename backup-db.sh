#!/bin/bash

# Database backup script for PlantCam
# Run this script to backup your SQLite database

# Configuration
DB_PATH="./plantcam.db"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/plantcam_${DATE}.db"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
    echo "Error: Database file not found at $DB_PATH"
    exit 1
fi

# Create backup
echo "Creating backup: $BACKUP_FILE"
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "Backup created successfully!"
    
    # Keep only the last 30 days of backups
    echo "Cleaning up old backups (keeping last 30 days)..."
    find "$BACKUP_DIR" -name "plantcam_*.db" -mtime +30 -delete
    
    # Show backup size
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Backup size: $BACKUP_SIZE"
else
    echo "Error: Failed to create backup"
    exit 1
fi

echo "Backup completed!" 