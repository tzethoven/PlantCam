// import { Chip, type Line } from 'node-libgpiod';
import dht from 'node-dht-sensor';
import mockSensorData from './data/mockSensorData.json';
import { storeDHTSensorReading, getDHTSensorReadings } from './database.js';

// const SOIL_MOISTURE_PIN = 23;
// const GPIO_CHIP = 0;

// export type SoilMoistureReading = { timestamp: number; soilMoisture: number };
// let soilMoistureLine: Line | null = null;
// let soilMoistureChip: Chip | null = null;

if (process.env.NODE_ENV === 'development') {
	dht.initialize({ test: { fake: { temperature: 20, humidity: 40 } } });
}

export type DHTSensorReading = { timestamp: number; temperature: number; humidity: number };
const windowSize = 200;
const dhtReadings: DHTSensorReading[] = [];
// const soilMoistureReadings: SoilMoistureReading[] = [];

// function initializeSoilMoistureSensor() {
// 	soilMoistureChip = new Chip(GPIO_CHIP);
// 	soilMoistureLine = soilMoistureChip.getLine(SOIL_MOISTURE_PIN);
// }

function pollDHTSensor() {
	const result = dht.read(11, 4); // DHT11 on GPIO4

	const reading = {
		timestamp: Date.now(),
		temperature: result.temperature,
		humidity: result.humidity
	};

	// Store in memory for backward compatibility
	dhtReadings.push(reading);
	if (dhtReadings.length > windowSize) dhtReadings.shift();

	// Store in database
	storeDHTSensorReading(reading.timestamp, reading.temperature, reading.humidity);
}

// function pollSoilMoistureSensor() {
// 	const value = soilMoistureLine?.getValue();

// 	if (value === undefined) return;

// 	const reading = {
// 		timestamp: Date.now(),
// 		soilMoisture: value
// 	};

// 	soilMoistureReadings.push(reading);
// 	if (soilMoistureReadings.length > windowSize) soilMoistureReadings.shift();

// 	// storeSensorReading(reading.timestamp, reading.soilMoisture, );
// }

// Only start polling if not building
if (!process.env.BUILDING) {
	// Start polling every 5 minutes
	setInterval(pollDHTSensor, 300_000);
	pollDHTSensor(); // Initial read
}

export function getReadings() {
	if (process.env.NODE_ENV === 'development') {
		return mockSensorData;
	} else {
		// Return data from database instead of memory
		const dbReadings = getDHTSensorReadings(24); // Last 24 hours
		return dbReadings.map((row) => ({
			timestamp: row.timestamp,
			temperature: row.temperature,
			humidity: row.humidity
		}));
	}
}
