<script lang="ts">
	import { onMount } from 'svelte';
	import Chart, { type EasingFunction } from 'chart.js/auto';
	import type { SensorReading } from '$lib/server/sensorData';
	import { showError, triggerHapticFeedback } from '$lib/utils/notifications';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
	import { smartDownsample, getOptimalTargetPoints } from '$lib/utils/chartDataProcessor';
	import { getResponsiveConfig } from '$lib/utils/chartConfig';

	let data: SensorReading[] = [];
	let canvas: HTMLCanvasElement;
	let chart: Chart;
	let isLoading = true;
	let hasError = false;
	let isDownsampled = false;
	let downsampledData: Array<{
		timestamp: number;
		value: number;
		min: number;
		max: number;
		avg: number;
		count: number;
	}> = [];

	// Temperature zone definitions
	const TEMP_ZONES = {
		optimal: { min: 18, max: 24, color: 'rgba(34, 197, 94, 0.1)' },
		warning: { min: 15, max: 18, color: 'rgba(251, 191, 36, 0.1)' },
		critical: { min: 10, max: 15, color: 'rgba(239, 68, 68, 0.1)' }
	};

	async function fetchData() {
		try {
			isLoading = true;
			hasError = false;
			const res = await fetch('/api/sensors/data');

			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}

			data = await res.json();
			updateChart();
			isLoading = false;
		} catch (error) {
			console.error('Failed to fetch temperature data:', error);
			hasError = true;
			isLoading = false;
			showError('Failed to load temperature data', 'Sensor Error');
		}
	}

	function getTemperatureStatus(temp: number): 'optimal' | 'warning' | 'critical' {
		if (temp >= TEMP_ZONES.optimal.min && temp <= TEMP_ZONES.optimal.max) return 'optimal';
		if (temp >= TEMP_ZONES.warning.min && temp < TEMP_ZONES.optimal.min) return 'warning';
		return 'critical';
	}

	function createGradient(
		ctx: CanvasRenderingContext2D,
		chartArea: { top: number; bottom: number }
	) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, 'rgba(251, 113, 133, 0.1)'); // Light red-pink
		gradient.addColorStop(0.5, 'rgba(249, 115, 22, 0.3)'); // Orange
		gradient.addColorStop(1, 'rgba(239, 68, 68, 0.6)'); // Red
		return gradient;
	}

	function createBorderGradient(
		ctx: CanvasRenderingContext2D,
		chartArea: { top: number; bottom: number }
	) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, '#f87171'); // Light red
		gradient.addColorStop(0.5, '#f97316'); // Orange
		gradient.addColorStop(1, '#dc2626'); // Dark red
		return gradient;
	}

	function updateChart() {
		if (chart && chart.ctx && data.length) {
			const ctx = chart.ctx;
			const chartArea = chart.chartArea;

			// Determine optimal number of points based on screen size
			const isMobile = window.innerWidth <= 480;
			const targetPoints = getOptimalTargetPoints(data.length, isMobile);

			// Apply smart downsampling to preserve trends and anomalies
			downsampledData = smartDownsample(data, targetPoints, 'temperature');

			// Check if data was downsampled
			isDownsampled = downsampledData.length < data.length;

			chart.data.labels = downsampledData.map((d) =>
				new Date(d.timestamp).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hourCycle: 'h23'
				})
			);

			chart.data.datasets[0].data = downsampledData.map((d) => d.value);
			chart.data.datasets[0].backgroundColor = createGradient(ctx, chartArea);
			chart.data.datasets[0].borderColor = createBorderGradient(ctx, chartArea);

			// Smooth animation update
			chart.update('active');
		}
	}

	function handleRetryClick() {
		triggerHapticFeedback('click');
		fetchData();
	}

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 30_000);
		return () => {
			clearInterval(interval);
			if (chart) {
				chart.destroy();
			}
		};
	});

	$: if (chart && chart.ctx && data.length && !isLoading) {
		updateChart();
	}

	$: if (!isLoading && !hasError && canvas) {
		if (chart) chart.destroy();

		const config = getResponsiveConfig();
		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Temperature (°C)',
						data: [],
						borderColor: '#f97316',
						backgroundColor: 'rgba(249, 115, 22, 0.2)',
						fill: true,
						tension: 0.4,
						borderWidth: config.borderWidth,
						pointBackgroundColor: '#ffffff',
						pointBorderColor: '#f97316',
						pointBorderWidth: 2,
						pointRadius: config.pointRadius,
						pointHoverRadius: config.pointHoverRadius,
						pointHoverBackgroundColor: '#ffffff',
						pointHoverBorderColor: '#dc2626',
						pointHoverBorderWidth: 3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: config.animationDuration,
					easing: config.animationEasing
				},
				interaction: {
					intersect: false,
					mode: 'index'
				},
				plugins: {
					legend: {
						display: true,
						position: 'top',
						labels: {
							usePointStyle: true,
							padding: config.legendPadding,
							font: {
								size: config.legendFontSize,
								weight: 500
							},
							color: '#374151',
							generateLabels: function (chart) {
								const defaultLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);
								if (isDownsampled && defaultLabels.length > 0) {
									defaultLabels[0].text = `Temperature (°C) (${downsampledData.length}/${data.length} points)`;
								}
								return defaultLabels;
							}
						}
					},
					tooltip: {
						enabled: true,
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
						titleColor: '#374151',
						bodyColor: '#6b7280',
						borderColor: 'rgba(249, 115, 22, 0.3)',
						borderWidth: 1,
						cornerRadius: 12,
						displayColors: true,
						padding: config.tooltipPadding,
						titleFont: {
							size: config.tooltipFontSize,
							weight: 600
						},
						bodyFont: {
							size: config.tooltipBodySize
						},
						callbacks: {
							title: function (context) {
								return `Time: ${context[0].label}`;
							},
							label: function (context) {
								const temp = context.parsed.y;
								const status = getTemperatureStatus(temp);
								const statusEmoji =
									status === 'optimal' ? '✅' : status === 'warning' ? '⚠️' : '🔥';

								// Get the downsampled data point to show range information
								const downsampledData = smartDownsample(
									data,
									getOptimalTargetPoints(data.length, window.innerWidth <= 480),
									'temperature'
								);
								const dataPoint = downsampledData[context.dataIndex];

								if (dataPoint && dataPoint.count > 1) {
									return [
										`${statusEmoji} ${temp}°C (${status})`,
										`Range: ${dataPoint.min.toFixed(1)}°C - ${dataPoint.max.toFixed(1)}°C`,
										`Avg: ${dataPoint.avg.toFixed(1)}°C (${dataPoint.count} readings)`
									];
								}

								return `${statusEmoji} ${temp}°C (${status})`;
							}
						}
					}
				},
				scales: {
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						title: {
							display: true,
							text: 'Temperature (°C)',
							font: {
								size: config.axisTitleSize,
								weight: 600
							},
							color: '#374151'
						},
						min: 10,
						max: 30,
						grid: {
							color: 'rgba(156, 163, 175, 0.2)'
						},
						ticks: {
							color: '#6b7280',
							font: {
								size: config.axisTickSize
							},
							callback: function (value) {
								return value + '°C';
							}
						}
					},
					x: {
						title: {
							display: true,
							text: 'Time',
							font: {
								size: config.axisTitleSize,
								weight: 600
							},
							color: '#374151'
						},
						grid: {
							color: 'rgba(156, 163, 175, 0.2)'
						},
						ticks: {
							color: '#6b7280',
							font: {
								size: config.axisTickSize
							}
						}
					}
				}
			},
			plugins: [
				{
					id: 'temperatureZones',
					beforeDraw: (chart) => {
						const ctx = chart.ctx;
						const chartArea = chart.chartArea;
						const yScale = chart.scales.y;

						// Draw temperature zones
						Object.entries(TEMP_ZONES).forEach(([, config]) => {
							const yTop = yScale.getPixelForValue(config.max);
							const yBottom = yScale.getPixelForValue(config.min);

							ctx.save();
							ctx.fillStyle = config.color;
							ctx.fillRect(chartArea.left, yTop, chartArea.width, yBottom - yTop);
							ctx.restore();
						});
					}
				}
			]
		});
	}
</script>

<div class="temperature-chart-container">
	{#if isLoading}
		<LoadingSkeleton variant="chart" height="100%" />
	{:else if hasError}
		<div class="error-state">
			<div class="error-icon">🌡️</div>
			<p class="error-text">Failed to load temperature data</p>
			<button class="retry-button" on:click={handleRetryClick}> Retry </button>
		</div>
	{:else}
		<div class="chart-wrapper">
			<canvas bind:this={canvas}></canvas>
		</div>
	{/if}
</div>

<style>
	.temperature-chart-container {
		position: relative;
		height: 300px;
		width: 100%;
		max-width: 700px;
		margin: 0 auto;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border-radius: 1rem;
		border: 1px solid rgba(255, 255, 255, 0.2);
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		box-sizing: border-box;
	}

	.chart-wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		overflow: hidden;
	}

	.temperature-chart-container:hover {
		background: rgba(255, 255, 255, 0.15);
		box-shadow:
			0 12px 40px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	canvas {
		width: 100% !important;
		height: 100% !important;
		max-width: 100% !important;
		display: block !important;
	}

	.error-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		text-align: center;
		padding: 2rem;
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.error-text {
		color: rgba(239, 68, 68, 0.8);
		font-size: 1rem;
		font-weight: 500;
		margin: 0 0 1.5rem 0;
	}

	.retry-button {
		padding: 0.75rem 1.5rem;
		background: rgba(249, 115, 22, 0.1);
		border: 1px solid rgba(249, 115, 22, 0.3);
		border-radius: 0.75rem;
		color: rgba(249, 115, 22, 0.9);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.retry-button:hover {
		background: rgba(249, 115, 22, 0.2);
		border-color: rgba(249, 115, 22, 0.5);
		transform: translateY(-2px);
	}

	/* Responsive Design */

	/* Tablet Landscape (768px - 1023px) */
	@media (max-width: 1023px) and (min-width: 768px) {
		.temperature-chart-container {
			height: 280px;
			padding: 0.875rem;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) */
	@media (max-width: 767px) and (min-width: 481px) {
		.temperature-chart-container {
			height: 260px;
			padding: 0.75rem;
		}
	}

	/* Mobile (320px - 480px) */
	@media (max-width: 480px) {
		.temperature-chart-container {
			height: 240px;
			padding: 0.75rem;
			border-radius: 0.75rem;
		}

		/* Disable hover effects on mobile */
		.temperature-chart-container:hover {
			background: rgba(255, 255, 255, 0.1);
			box-shadow:
				0 8px 32px rgba(31, 38, 135, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: none;
		}
	}

	/* Extra small mobile (max 320px) */
	@media (max-width: 320px) {
		.temperature-chart-container {
			height: 220px;
			padding: 0.625rem;
		}
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.temperature-chart-container {
			transition: none !important;
		}

		.temperature-chart-container:hover {
			transform: none !important;
			background: rgba(255, 255, 255, 0.1) !important;
			box-shadow:
				0 8px 32px rgba(31, 38, 135, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
		}
	}
</style>
