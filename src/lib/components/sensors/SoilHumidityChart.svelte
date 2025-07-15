<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';

	let canvas: HTMLCanvasElement;
	let chart: Chart;

	// Example/mock data
	const labels = ['10:00', '10:05', '10:10', '10:15', '10:20'];
	const data = [45, 50, 48, 52, 47];

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Soil Humidity (%)',
						data,
						borderColor: 'rgba(75,192,192,1)',
						backgroundColor: 'rgba(75,192,192,0.2)',
						fill: true,
						tension: 0.4
					}
				]
			},
			options: {
				responsive: true,
				plugins: {
					legend: { display: true }
				},
				scales: {
					y: { beginAtZero: true, max: 100 }
				}
			}
		});

		return () => chart.destroy();
	});
</script>

<canvas bind:this={canvas} width="400" height="200"></canvas>
