<script lang="ts">
	import CameraFeed from '$lib/components/camera/CameraFeed.svelte';
	import WateringControl from '$lib/components/control/WateringControl.svelte';
	import SoilHumidityChart from '$lib/components/sensors/SoilHumidityChart.svelte';
	import TemperatureChart from '$lib/components/sensors/TemperatureChart.svelte';
</script>

<main style="display: flex; flex-direction: column; gap: 2rem; max-width: 800px; margin: auto;">
	<h1>PlantCam Dashboard</h1>

	<section>
		<h2>Live Stream</h2>
		<CameraFeed />
	</section>

	<section>
		<h2>Temperature</h2>
		<TemperatureChart />
	</section>

	<section>
		<h2>Soil Humidity</h2>
		<SoilHumidityChart />
	</section>

	<section>
		<h2>Watering Control</h2>
		<WateringControl />
	</section>
</main>
