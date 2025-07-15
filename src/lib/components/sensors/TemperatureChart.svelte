<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { SensorReading } from '$lib/server/sensorData';

	let data: SensorReading[] = [];
	let canvas: HTMLCanvasElement;
	let chart: Chart;

	async function fetchData() {
		const res = await fetch('/api/sensors/data');
		data = await res.json();
	}

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 30_000);

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: data.map((r) => new Date(r.timestamp).toLocaleTimeString()),
				datasets: [
					{
						label: 'Temperature (°C)',
						data: data.map((r) => r.temperature),
						borderColor: 'red',
						backgroundColor: 'rgba(255,0,0,0.1)',
						fill: false,
						tension: 0.4,
						yAxisID: 'y'
					},
					{
						label: 'Air Humidity (%)',
						data: data.map((r) => r.humidity),
						borderColor: 'blue',
						backgroundColor: 'rgba(0,0,255,0.1)',
						fill: false,
						tension: 0.4,
						yAxisID: 'y1'
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: { display: true }
				},
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Temperature (°C)'
						},
						beginAtZero: true
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: 'Air Humidity (%)'
						},
						beginAtZero: true,
						grid: {
							drawOnChartArea: false
						}
					},
					x: {
						title: {
							display: true,
							text: 'Time'
						}
					}
				}
			}
		});
		return () => {
			chart.destroy();
			clearInterval(interval);
		};
	});
</script>

<canvas bind:this={canvas} width="400" height="200"></canvas>
