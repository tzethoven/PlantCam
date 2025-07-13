<script lang="ts">
	import { onMount } from 'svelte';

	interface SensorData {
		temperature: number;
		humidity: number;
		soilMoisture: number;
		lightLevel: number;
	}

	let sensorData: SensorData = {
		temperature: 0,
		humidity: 0,
		soilMoisture: 0,
		lightLevel: 0
	};

	async function updateSensorData() {
		try {
			const response = await fetch('/api/sensors/data');
			if (response.ok) {
				sensorData = await response.json();
			}
		} catch (error) {
			console.error('Failed to fetch sensor data:', error);
		}
	}

	onMount(() => {
		updateSensorData();
		const interval = setInterval(updateSensorData, 5000);

		return () => clearInterval(interval);
	});
</script>

<div>
	<h2 class="mb-4 text-xl font-semibold">Sensor Readings</h2>

	<div class="grid grid-cols-2 gap-4">
		<div class="rounded-lg bg-gray-50 p-4">
			<div class="text-sm text-gray-600">Temperature</div>
			<div class="text-2xl font-medium">{sensorData.temperature}°C</div>
		</div>

		<div class="rounded-lg bg-gray-50 p-4">
			<div class="text-sm text-gray-600">Humidity</div>
			<div class="text-2xl font-medium">{sensorData.humidity}%</div>
		</div>

		<div class="rounded-lg bg-gray-50 p-4">
			<div class="text-sm text-gray-600">Soil Moisture</div>
			<div class="text-2xl font-medium">{sensorData.soilMoisture}%</div>
		</div>

		<div class="rounded-lg bg-gray-50 p-4">
			<div class="text-sm text-gray-600">Light Level</div>
			<div class="text-2xl font-medium">{sensorData.lightLevel} lux</div>
		</div>
	</div>
</div>
