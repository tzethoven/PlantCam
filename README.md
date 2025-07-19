# PlantCam2

A smart plant monitoring system built with SvelteKit, designed to run on Raspberry Pi. Monitor temperature, humidity, and control automated watering with a beautiful web interface.

## Features

- 🌡️ **Real-time sensor monitoring** - Temperature and humidity tracking
- 💧 **Automated watering control** - Manual and scheduled watering
- 📊 **Data visualization** - Charts and statistics for sensor data
- 📱 **Responsive web interface** - Works on desktop and mobile
- 🗄️ **SQLite database** - Persistent storage for sensor readings and watering events
- 📷 **Camera feed** - Live video stream from Raspberry Pi camera

## Hardware Requirements

- Raspberry Pi (3 or 4 recommended)
- DHT11/DHT22 temperature/humidity sensor
- Relay module for water pump control
- Water pump and tubing
- Optional: Raspberry Pi camera module

## Software Setup

### Prerequisites

1. **Install SQLite on Raspberry Pi:**

   ```bash
   sudo apt update
   sudo apt install sqlite3
   ```

2. **Clone and install dependencies:**
   ```bash
   git clone <your-repo-url>
   cd plantcam2
   npm install
   ```

### Database Setup

The application uses SQLite for data storage. The database will be automatically created when you first run the application.

- **Database file:** `plantcam.db` (created in project root)
- **Tables:**
  - `sensor_readings` - Temperature and humidity data
  - `watering_events` - Watering activity logs
  - `watering_schedules` - Automated watering schedules

### Backup Database

Use the included backup script to protect your data:

```bash
# Manual backup
./backup-db.sh

# Set up automatic daily backups (add to crontab)
crontab -e
# Add this line:
0 2 * * * /path/to/plantcam2/backup-db.sh
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## API Endpoints

### Sensor Data

- `GET /api/sensors/data` - Current sensor readings
- `GET /api/sensors/history?hours=24` - Historical sensor data
- `GET /api/sensors/history?start=1234567890&end=1234567899` - Date range data

### Watering Control

- `GET /api/water/status` - Current watering status
- `POST /api/water/toggle` - Toggle watering on/off
- `GET /api/water/history` - Watering event history

## Deployment on Raspberry Pi

1. **Build the application:**

   ```bash
   npm run build
   ```

2. **Start the production server:**

   ```bash
   npm run start
   ```

3. **Set up auto-start (optional):**

   ```bash
   # Create systemd service
   sudo nano /etc/systemd/system/plantcam.service
   ```

   Add this content:

   ```ini
   [Unit]
   Description=PlantCam Service
   After=network.target

   [Service]
   Type=simple
   User=pi
   WorkingDirectory=/home/pi/plantcam2
   ExecStart=/usr/bin/node build
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   Enable the service:

   ```bash
   sudo systemctl enable plantcam
   sudo systemctl start plantcam
   ```

## Data Storage

The application stores data locally in SQLite format:

- **Sensor readings:** ~50 bytes per reading
- **Watering events:** ~30 bytes per event
- **1 year of data:** ~1-2 MB total

## Troubleshooting

### Database Issues

- Ensure SQLite is installed: `sqlite3 --version`
- Check database file permissions: `ls -la plantcam.db`
- Verify database integrity: `sqlite3 plantcam.db "PRAGMA integrity_check;"`

### GPIO Issues

- Ensure user has GPIO permissions: `sudo usermod -a -G gpio pi`
- Check GPIO pin configuration in `src/lib/server/gpio/water.ts`

## License

MIT License
