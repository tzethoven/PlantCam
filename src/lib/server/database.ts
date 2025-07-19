import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory where this file is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path - will be created in the project root
const dbPath = join(__dirname, '../../../plantcam.db');

// Initialize database
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Type definitions
export interface SensorReadingRow {
	id: number;
	timestamp: number;
	temperature: number;
	humidity: number;
	soil_humidity: number | null;
	created_at: string;
}

export interface WateringEventRow {
	id: number;
	timestamp: number;
	duration_seconds: number;
	triggered_by: string;
	created_at: string;
}

// Create tables if they don't exist
function initializeDatabase() {
	// Sensor readings table
	db.exec(`
		CREATE TABLE IF NOT EXISTS sensor_readings (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			timestamp INTEGER NOT NULL,
			temperature REAL NOT NULL,
			humidity REAL NOT NULL,
			soil_humidity REAL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Watering events table
	db.exec(`
		CREATE TABLE IF NOT EXISTS watering_events (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			timestamp INTEGER NOT NULL,
			duration_seconds INTEGER NOT NULL,
			triggered_by TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Watering schedules table
	db.exec(`
		CREATE TABLE IF NOT EXISTS watering_schedules (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			cron_expression TEXT NOT NULL,
			duration_seconds INTEGER NOT NULL,
			enabled BOOLEAN DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`);

	// Create indexes for better query performance
	db.exec(`
		CREATE INDEX IF NOT EXISTS idx_sensor_readings_timestamp 
		ON sensor_readings(timestamp)
	`);

	db.exec(`
		CREATE INDEX IF NOT EXISTS idx_watering_events_timestamp 
		ON watering_events(timestamp)
	`);

	console.log('Database initialized successfully');
}

// Initialize database on module load
initializeDatabase();

// Prepare statements for better performance
const insertSensorReading = db.prepare(`
	INSERT INTO sensor_readings (timestamp, temperature, humidity, soil_humidity)
	VALUES (?, ?, ?, ?)
`);

const insertWateringEvent = db.prepare(`
	INSERT INTO watering_events (timestamp, duration_seconds, triggered_by)
	VALUES (?, ?, ?)
`);

const getRecentSensorReadings = db.prepare(`
	SELECT * FROM sensor_readings 
	WHERE timestamp > ? 
	ORDER BY timestamp DESC 
	LIMIT ?
`);

const getSensorReadingsByDateRange = db.prepare(`
	SELECT * FROM sensor_readings 
	WHERE timestamp BETWEEN ? AND ?
	ORDER BY timestamp ASC
`);

const getRecentWateringEvents = db.prepare(`
	SELECT * FROM watering_events 
	ORDER BY timestamp DESC 
	LIMIT ?
`);

const getWateringEventsByDateRange = db.prepare(`
	SELECT * FROM watering_events 
	WHERE timestamp BETWEEN ? AND ?
	ORDER BY timestamp DESC
`);

// Export functions for use in other modules
export function storeSensorReading(
	timestamp: number,
	temperature: number,
	humidity: number,
	soilHumidity?: number
) {
	try {
		insertSensorReading.run(timestamp, temperature, humidity, soilHumidity || null);
		return true;
	} catch (error) {
		console.error('Error storing sensor reading:', error);
		return false;
	}
}

export function storeWateringEvent(
	timestamp: number,
	durationSeconds: number,
	triggeredBy: string
) {
	try {
		insertWateringEvent.run(timestamp, durationSeconds, triggeredBy);
		return true;
	} catch (error) {
		console.error('Error storing watering event:', error);
		return false;
	}
}

export function getSensorReadings(hoursBack: number = 24): SensorReadingRow[] {
	const cutoffTime = Date.now() - hoursBack * 60 * 60 * 1000;
	return getRecentSensorReadings.all(cutoffTime, 1000) as SensorReadingRow[];
}

export function getSensorReadingsForRange(startTime: number, endTime: number): SensorReadingRow[] {
	return getSensorReadingsByDateRange.all(startTime, endTime) as SensorReadingRow[];
}

export function getWateringEvents(limit: number = 50): WateringEventRow[] {
	return getRecentWateringEvents.all(limit) as WateringEventRow[];
}

export function getWateringEventsForRange(startTime: number, endTime: number): WateringEventRow[] {
	return getWateringEventsByDateRange.all(startTime, endTime) as WateringEventRow[];
}

// Close database connection when process exits
process.on('exit', () => {
	db.close();
});

process.on('SIGINT', () => {
	db.close();
	process.exit();
});

process.on('SIGTERM', () => {
	db.close();
	process.exit();
});
