<script lang="ts">
	import { onMount } from 'svelte';
	import Chart, { type EasingFunction } from 'chart.js/auto';
	import { showError, triggerHapticFeedback } from '$lib/utils/notifications';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';
	import { smartDownsample, getOptimalTargetPoints } from '$lib/utils/chartDataProcessor';

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

	// Soil moisture zones
	const SOIL_ZONES = {
		optimal: { min: 40, max: 70, color: 'rgba(34, 197, 94, 0.15)' },
		acceptable: { min: 25, max: 40, color: 'rgba(101, 163, 13, 0.1)' },
		dry: { min: 10, max: 25, color: 'rgba(251, 191, 36, 0.15)' },
		critical: { min: 0, max: 10, color: 'rgba(239, 68, 68, 0.2)' }
	};

	// Enhanced mock data with more realistic soil moisture patterns
	// In a real implementation, this would come from a soil moisture sensor
	let soilData: Array<{ timestamp: number; moisture: number }> = [];

	// Generate realistic mock data for development
	function generateMockSoilData() {
		const now = Date.now();
		const dataPoints = 50; // Generate 50 data points
		const interval = 5 * 60 * 1000; // 5 minutes between readings

		soilData = [];
		for (let i = dataPoints - 1; i >= 0; i--) {
			const timestamp = now - i * interval;
			// Create realistic soil moisture pattern with gradual decrease and some variation
			const baseMoisture = 45;
			const timeFactor = Math.sin((i / dataPoints) * Math.PI) * 10; // Gradual decrease
			const noise = (Math.random() - 0.5) * 5; // Random variation
			const moisture = Math.max(10, Math.min(70, baseMoisture + timeFactor + noise));

			soilData.push({
				timestamp,
				moisture: Math.round(moisture * 10) / 10
			});
		}
	}

	async function fetchData() {
		try {
			isLoading = true;
			hasError = false;

			// Generate mock soil moisture data for development
			// In production, this would fetch from a real soil moisture sensor
			generateMockSoilData();

			updateChart();
			isLoading = false;
		} catch (error) {
			console.error('Failed to fetch soil moisture data:', error);
			hasError = true;
			isLoading = false;
			showError('Failed to load soil moisture data', 'Sensor Error');
		}
	}

	function getSoilMoistureStatus(moisture: number): 'optimal' | 'acceptable' | 'dry' | 'critical' {
		if (moisture >= SOIL_ZONES.optimal.min && moisture <= SOIL_ZONES.optimal.max) return 'optimal';
		if (moisture >= SOIL_ZONES.acceptable.min && moisture < SOIL_ZONES.optimal.min)
			return 'acceptable';
		if (moisture >= SOIL_ZONES.dry.min && moisture < SOIL_ZONES.acceptable.min) return 'dry';
		return 'critical';
	}

	function createEarthGradient(
		ctx: CanvasRenderingContext2D,
		chartArea: { top: number; bottom: number }
	) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, 'rgba(120, 53, 15, 0.2)'); // Dark brown (dry soil)
		gradient.addColorStop(0.3, 'rgba(146, 64, 14, 0.3)'); // Medium brown
		gradient.addColorStop(0.6, 'rgba(101, 163, 13, 0.4)'); // Olive green
		gradient.addColorStop(1, 'rgba(34, 197, 94, 0.6)'); // Green (moist soil)
		return gradient;
	}

	function createEarthBorderGradient(
		ctx: CanvasRenderingContext2D,
		chartArea: { top: number; bottom: number }
	) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, '#92400e'); // Brown
		gradient.addColorStop(0.5, '#65a30d'); // Olive
		gradient.addColorStop(1, '#22c55e'); // Green
		return gradient;
	}

	function updateChart() {
		if (chart && chart.ctx && soilData.length) {
			const ctx = chart.ctx;
			const chartArea = chart.chartArea;

			// Determine optimal number of points based on screen size
			const isMobile = window.innerWidth <= 480;
			const targetPoints = getOptimalTargetPoints(soilData.length, isMobile);

			// Apply smart downsampling to preserve trends and anomalies
			// Convert soil data to the format expected by the downsampling function
			const sensorDataFormat = soilData.map((d) => ({
				timestamp: d.timestamp,
				temperature: 0, // Not used for soil moisture
				humidity: d.moisture // Use humidity field for moisture data
			}));

			downsampledData = smartDownsample(sensorDataFormat, targetPoints, 'humidity');

			// Check if data was downsampled
			isDownsampled = downsampledData.length < soilData.length;

			chart.data.labels = downsampledData.map((d) =>
				new Date(d.timestamp).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hourCycle: 'h23'
				})
			);

			chart.data.datasets[0].data = downsampledData.map((d) => d.value);
			chart.data.datasets[0].backgroundColor = createEarthGradient(ctx, chartArea);
			chart.data.datasets[0].borderColor = createEarthBorderGradient(ctx, chartArea);

			// Smooth earth-like animation update
			chart.update('active');
		}
	}

	function getResponsiveConfig() {
		const isMobile = window.innerWidth <= 480;
		const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		return {
			pointRadius: isMobile ? 3 : 4,
			pointHoverRadius: isMobile ? 5 : 7,
			borderWidth: isMobile ? 2 : 3,
			legendFontSize: isMobile ? 10 : isTablet ? 11 : 12,
			legendPadding: isMobile ? 12 : isTablet ? 16 : 20,
			tooltipFontSize: isMobile ? 12 : 14,
			tooltipBodySize: isMobile ? 11 : 13,
			tooltipPadding: isMobile ? 8 : 12,
			axisTitleSize: isMobile ? 10 : isTablet ? 11 : 12,
			axisTickSize: isMobile ? 9 : isTablet ? 10 : 11,
			animationDuration: isMobile ? 800 : 1200,
			animationEasing: (prefersReducedMotion ? 'linear' : 'easeInOutCubic') as EasingFunction
		};
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

	$: moistureStatus = getSoilMoistureStatus(
		soilData.length > 0 ? soilData[soilData.length - 1].moisture : 0
	);
	$: isLowMoisture = soilData.length > 0 ? soilData[soilData.length - 1].moisture < 30 : false;

	$: if (chart && chart.ctx && soilData.length && !isLoading) {
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
						label: 'Soil Moisture (%)',
						data: [],
						borderColor: '#65a30d',
						backgroundColor: 'rgba(101, 163, 13, 0.3)',
						fill: true,
						tension: 0.3, // Slightly less tension for more natural soil curves
						borderWidth: config.borderWidth,
						pointBackgroundColor: '#ffffff',
						pointBorderColor: '#65a30d',
						pointBorderWidth: 2,
						pointRadius: config.pointRadius,
						pointHoverRadius: config.pointHoverRadius,
						pointHoverBackgroundColor: '#ffffff',
						pointHoverBorderColor: '#22c55e',
						pointHoverBorderWidth: 3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: config.animationDuration,
					easing: 'easeInOutQuart' // Earth-like easing
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
									defaultLabels[0].text = `Soil Moisture (%) (${downsampledData.length}/${soilData.length} points)`;
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
						borderColor: 'rgba(101, 163, 13, 0.3)',
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
								const moisture = context.parsed.y;
								const status = getSoilMoistureStatus(moisture);
								const statusEmoji =
									status === 'optimal'
										? '🌱'
										: status === 'acceptable'
											? '🌿'
											: status === 'dry'
												? '🏜️'
												: '⚠️';

								// Get the downsampled data point to show range information
								const dataPoint = downsampledData[context.dataIndex];

								if (dataPoint && dataPoint.count > 1) {
									return [
										`${statusEmoji} ${moisture}% (${status})`,
										`Range: ${dataPoint.min.toFixed(1)}% - ${dataPoint.max.toFixed(1)}%`,
										`Avg: ${dataPoint.avg.toFixed(1)}% (${dataPoint.count} readings)`
									];
								}

								return `${statusEmoji} ${moisture}% (${status})`;
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
							text: 'Soil Moisture (%)',
							font: {
								size: config.axisTitleSize,
								weight: 600
							},
							color: '#374151'
						},
						min: 0,
						max: 100,
						grid: {
							color: 'rgba(101, 163, 13, 0.1)'
						},
						ticks: {
							color: '#6b7280',
							font: {
								size: config.axisTickSize
							},
							callback: function (value) {
								return value + '%';
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
							color: 'rgba(101, 163, 13, 0.1)'
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
					id: 'soilZones',
					beforeDraw: (chart) => {
						const ctx = chart.ctx;
						const chartArea = chart.chartArea;
						const yScale = chart.scales.y;

						// Draw soil moisture zones
						Object.entries(SOIL_ZONES).forEach(([, config]) => {
							const yTop = yScale.getPixelForValue(config.max);
							const yBottom = yScale.getPixelForValue(config.min);

							ctx.save();
							ctx.fillStyle = config.color;
							ctx.fillRect(chartArea.left, yTop, chartArea.width, yBottom - yTop);
							ctx.restore();
						});
					}
				},
				{
					id: 'soilTexture',
					afterDraw: (chart) => {
						const ctx = chart.ctx;
						const chartArea = chart.chartArea;

						// Add subtle soil texture pattern
						ctx.save();
						ctx.globalAlpha = 0.05;
						ctx.fillStyle = '#92400e';

						// Create random soil particle pattern
						for (let i = 0; i < 50; i++) {
							const x = chartArea.left + Math.random() * chartArea.width;
							const y = chartArea.top + Math.random() * chartArea.height;
							const size = Math.random() * 2 + 1;

							ctx.beginPath();
							ctx.arc(x, y, size, 0, Math.PI * 2);
							ctx.fill();
						}
						ctx.restore();
					}
				}
			]
		});
	}
</script>

<div class="soil-humidity-chart-container">
	{#if isLoading}
		<LoadingSkeleton variant="chart" height="100%" />
	{:else if hasError}
		<div class="error-state">
			<div class="error-icon">🌱</div>
			<p class="error-text">Failed to load soil moisture data</p>
			<button class="retry-button" on:click={handleRetryClick}> Retry </button>
		</div>
	{:else}
		<div class="chart-wrapper">
			<canvas bind:this={canvas}></canvas>
		</div>

		<!-- Moisture status indicator -->
		<div
			class="moisture-status"
			class:critical={moistureStatus === 'critical'}
			class:dry={moistureStatus === 'dry'}
		>
			<div class="status-icon">
				{#if moistureStatus === 'optimal'}🌱
				{:else if moistureStatus === 'acceptable'}🌿
				{:else if moistureStatus === 'dry'}🏜️
				{:else}⚠️
				{/if}
			</div>
			<div class="status-text">
				<span class="moisture-value"
					>{soilData.length > 0 ? soilData[soilData.length - 1].moisture : 0}%</span
				>
				<span class="moisture-label">{moistureStatus}</span>
			</div>
		</div>

		<!-- Low moisture warning animation -->
		{#if isLowMoisture}
			<div class="warning-pulse">
				<div class="pulse-ring"></div>
				<div class="pulse-ring pulse-ring-delay"></div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.soil-humidity-chart-container {
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

	.soil-humidity-chart-container:hover {
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
		background: rgba(101, 163, 13, 0.1);
		border: 1px solid rgba(101, 163, 13, 0.3);
		border-radius: 0.75rem;
		color: rgba(101, 163, 13, 0.9);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.retry-button:hover {
		background: rgba(101, 163, 13, 0.2);
		border-color: rgba(101, 163, 13, 0.5);
		transform: translateY(-2px);
	}

	.moisture-status {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(8px);
		border-radius: 0.75rem;
		border: 1px solid rgba(101, 163, 13, 0.2);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		z-index: 3;
		transition: all 0.3s ease;
	}

	.moisture-status.dry {
		border-color: rgba(251, 191, 36, 0.4);
		background: rgba(254, 243, 199, 0.9);
	}

	.moisture-status.critical {
		border-color: rgba(239, 68, 68, 0.4);
		background: rgba(254, 226, 226, 0.9);
		animation: criticalPulse 1.5s ease-in-out infinite;
	}

	.status-icon {
		font-size: 1.25rem;
	}

	.status-text {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.moisture-value {
		font-size: 1rem;
		font-weight: 600;
		color: #374151;
		line-height: 1;
	}

	.moisture-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-transform: capitalize;
		line-height: 1;
	}

	.warning-pulse {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
	}

	.pulse-ring {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 100px;
		height: 100px;
		border: 3px solid rgba(251, 191, 36, 0.6);
		border-radius: 50%;
		animation: pulseRing 2s ease-out infinite;
	}

	.pulse-ring-delay {
		animation-delay: 1s;
	}

	@keyframes lowMoistureGlow {
		0% {
			box-shadow:
				0 8px 32px rgba(251, 191, 36, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
		100% {
			box-shadow:
				0 12px 40px rgba(251, 191, 36, 0.25),
				inset 0 1px 0 rgba(255, 255, 255, 0.4);
		}
	}

	@keyframes criticalPulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.9;
		}
	}

	@keyframes pulseRing {
		0% {
			transform: translate(-50%, -50%) scale(0.5);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -50%) scale(2);
			opacity: 0;
		}
	}

	/* Responsive Design */

	/* Tablet Landscape (768px - 1023px) */
	@media (max-width: 1023px) and (min-width: 768px) {
		.soil-humidity-chart-container {
			height: 280px;
			padding: 0.875rem;
		}

		.moisture-status {
			top: 0.875rem;
			right: 0.875rem;
			padding: 0.625rem 0.875rem;
		}

		.status-icon {
			font-size: 1.125rem;
		}

		.moisture-value {
			font-size: 0.9375rem;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) */
	@media (max-width: 767px) and (min-width: 481px) {
		.soil-humidity-chart-container {
			height: 260px;
			padding: 0.75rem;
		}

		.moisture-status {
			top: 0.75rem;
			right: 0.75rem;
			padding: 0.5rem 0.75rem;
		}

		.status-icon {
			font-size: 1rem;
		}

		.moisture-value {
			font-size: 0.875rem;
		}

		.moisture-label {
			font-size: 0.6875rem;
		}
	}

	/* Mobile (320px - 480px) */
	@media (max-width: 480px) {
		.soil-humidity-chart-container {
			height: 240px;
			padding: 0.75rem;
			border-radius: 0.75rem;
		}

		.moisture-status {
			top: 0.75rem;
			right: 0.75rem;
			padding: 0.5rem 0.75rem;
			border-radius: 0.625rem;
		}

		.status-icon {
			font-size: 1rem;
		}

		.moisture-value {
			font-size: 0.875rem;
		}

		.moisture-label {
			font-size: 0.6875rem;
		}

		.pulse-ring {
			width: 80px;
			height: 80px;
		}

		/* Disable hover effects on mobile */
		.soil-humidity-chart-container:hover {
			background: rgba(255, 255, 255, 0.1);
			box-shadow:
				0 8px 32px rgba(31, 38, 135, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: none;
		}
	}

	/* Extra small mobile (max 320px) */
	@media (max-width: 320px) {
		.soil-humidity-chart-container {
			height: 220px;
			padding: 0.625rem;
		}

		.moisture-status {
			top: 0.625rem;
			right: 0.625rem;
			padding: 0.375rem 0.625rem;
		}

		.status-icon {
			font-size: 0.875rem;
		}

		.moisture-value {
			font-size: 0.8125rem;
		}

		.moisture-label {
			font-size: 0.625rem;
		}

		.pulse-ring {
			width: 60px;
			height: 60px;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.moisture-status.critical {
			animation: none;
		}

		.pulse-ring {
			animation: none;
			opacity: 0;
		}

		.soil-humidity-chart-container:hover {
			transform: none;
		}
	}
</style>
