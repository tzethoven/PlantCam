import dht from 'node-dht-sensor';
import mockSensorData from './data/mockSensorData.json';
import { storeSensorReading, getSensorReadings } from './database.js';

if (process.env.NODE_ENV === 'development') {
	dht.initialize({ test: { fake: { temperature: 20, humidity: 40 } } });
}

export type SensorReading = { timestamp: number; temperature: number; humidity: number };
const windowSize = 200;
const readings: SensorReading[] = [];

function pollSensor() {
	const result = dht.read(11, 4); // DHT11 on GPIO4

	const reading = {
		timestamp: Date.now(),
		temperature: result.temperature,
		humidity: result.humidity
	};

	// Store in memory for backward compatibility
	readings.push(reading);
	if (readings.length > windowSize) readings.shift();

	// Store in database
	storeSensorReading(reading.timestamp, reading.temperature, reading.humidity);
}

// Only start polling if not building
if (!process.env.BUILDING) {
	// Start polling every 5 minutes
	setInterval(pollSensor, 300_000);
	pollSensor(); // Initial read
}

export function getReadings() {
	if (process.env.NODE_ENV === 'development') {
		return mockSensorData;
	} else {
		// Return data from database instead of memory
		const dbReadings = getSensorReadings(24); // Last 24 hours
		return dbReadings.map((row) => ({
			timestamp: row.timestamp,
			temperature: row.temperature,
			humidity: row.humidity
		}));
	}
}
