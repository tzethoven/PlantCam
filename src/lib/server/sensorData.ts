import dht from 'node-dht-sensor';

export type SensorReading = { timestamp: number; temperature: number; humidity: number };
const windowSize = 100;
const readings: SensorReading[] = [];

function pollSensor() {
	const result = dht.read(11, 4); // DHT11 on GPIO4
	console.log('dht.read', { result });

	const reading = {
		timestamp: Date.now(),
		temperature: result.temperature,
		humidity: result.humidity
	};
	readings.push(reading);
	if (readings.length > windowSize) readings.shift();
}

// Start polling every 30 seconds
setInterval(pollSensor, 30_000);
pollSensor(); // Initial read

export function getReadings() {
	return readings;
}
