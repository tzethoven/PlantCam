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
		updateChart();
	}

	function updateChart() {
		if (chart && data.length) {
			chart.data.labels = data.map((d) =>
				new Date(d.timestamp).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hourCycle: 'h23'
				})
			);
			chart.data.datasets[0].data = data.map((d) => d.temperature);
			chart.data.datasets[1].data = data.map((d) => d.humidity);
			chart.update();
		}
	}

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 30_000);

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Temperature (°C)',
						data: [],
						borderColor: 'red',
						backgroundColor: 'rgba(255,0,0,0.1)',
						fill: false,
						tension: 0.4,
						yAxisID: 'y'
					},
					{
						label: 'Air Humidity (%)',
						data: [],
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
						min: 10,
						max: 30
					},
					y1: {
						type: 'linear',
						display: true,
						position: 'right',
						title: {
							display: true,
							text: 'Air Humidity (%)'
						},
						min: 40,
						max: 80,
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
