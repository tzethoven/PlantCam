<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import type { SensorReading } from '$lib/server/sensorData';
	import { showError, triggerHapticFeedback } from '$lib/utils/notifications';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';

	let data: SensorReading[] = [];
	let canvas: HTMLCanvasElement;
	let chart: Chart;
	let isLoading = true;
	let hasError = false;

	// Humidity comfort zones
	const HUMIDITY_ZONES = {
		optimal: { min: 40, max: 60, color: 'rgba(34, 197, 94, 0.1)' },
		acceptable: { min: 30, max: 70, color: 'rgba(59, 130, 246, 0.1)' },
		dry: { min: 0, max: 30, color: 'rgba(251, 191, 36, 0.1)' },
		humid: { min: 70, max: 100, color: 'rgba(14, 165, 233, 0.15)' }
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
			console.error('Failed to fetch humidity data:', error);
			hasError = true;
			isLoading = false;
			showError('Failed to load humidity data', 'Sensor Error');
		}
	}

	function getHumidityStatus(humidity: number): 'optimal' | 'acceptable' | 'dry' | 'humid' {
		if (humidity >= HUMIDITY_ZONES.optimal.min && humidity <= HUMIDITY_ZONES.optimal.max)
			return 'optimal';
		if (humidity >= HUMIDITY_ZONES.acceptable.min && humidity <= HUMIDITY_ZONES.acceptable.max)
			return 'acceptable';
		if (humidity < HUMIDITY_ZONES.dry.max) return 'dry';
		return 'humid';
	}

	function createWaterGradient(ctx: CanvasRenderingContext2D, chartArea: any) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, 'rgba(56, 189, 248, 0.1)'); // Light blue
		gradient.addColorStop(0.3, 'rgba(14, 165, 233, 0.3)'); // Sky blue
		gradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.5)'); // Blue
		gradient.addColorStop(1, 'rgba(37, 99, 235, 0.7)'); // Deep blue
		return gradient;
	}

	function createWaterBorderGradient(ctx: CanvasRenderingContext2D, chartArea: any) {
		const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
		gradient.addColorStop(0, '#38bdf8'); // Light blue
		gradient.addColorStop(0.5, '#0ea5e9'); // Sky blue
		gradient.addColorStop(1, '#2563eb'); // Deep blue
		return gradient;
	}

	function updateChart() {
		if (chart && data.length) {
			const ctx = chart.ctx;
			const chartArea = chart.chartArea;

			chart.data.labels = data.map((d) =>
				new Date(d.timestamp).toLocaleTimeString([], {
					hour: '2-digit',
					minute: '2-digit',
					hourCycle: 'h23'
				})
			);

			chart.data.datasets[0].data = data.map((d) => d.humidity);
			chart.data.datasets[0].backgroundColor = createWaterGradient(ctx, chartArea);
			chart.data.datasets[0].borderColor = createWaterBorderGradient(ctx, chartArea);

			// Smooth flowing animation update
			chart.update('active');
		}
	}

	function getResponsiveConfig() {
		const isMobile = window.innerWidth <= 480;
		const isTablet = window.innerWidth <= 768 && window.innerWidth > 480;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		return {
			pointRadius: isMobile ? 3 : 5,
			pointHoverRadius: isMobile ? 6 : 8,
			borderWidth: isMobile ? 2 : 3,
			legendFontSize: isMobile ? 10 : isTablet ? 11 : 12,
			legendPadding: isMobile ? 12 : isTablet ? 16 : 20,
			tooltipFontSize: isMobile ? 12 : 14,
			tooltipBodySize: isMobile ? 11 : 13,
			tooltipPadding: isMobile ? 8 : 12,
			axisTitleSize: isMobile ? 10 : isTablet ? 11 : 12,
			axisTickSize: isMobile ? 9 : isTablet ? 10 : 11,
			animationDuration: prefersReducedMotion ? 0 : isMobile ? 800 : 1500,
			animationEasing: prefersReducedMotion ? 'linear' : 'easeInOutSine'
		};
	}

	onMount(() => {
		fetchData();
		const interval = setInterval(fetchData, 30_000);

		const config = getResponsiveConfig();
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Build plugins array conditionally based on reduced motion preference
		const chartPlugins = [
			{
				id: 'humidityZones',
				beforeDraw: (chart) => {
					const ctx = chart.ctx;
					const chartArea = chart.chartArea;
					const yScale = chart.scales.y;

					// Draw humidity comfort zones
					Object.entries(HUMIDITY_ZONES).forEach(([zone, config]) => {
						const yTop = yScale.getPixelForValue(config.max);
						const yBottom = yScale.getPixelForValue(config.min);

						ctx.save();
						ctx.fillStyle = config.color;
						ctx.fillRect(chartArea.left, yTop, chartArea.width, yBottom - yTop);
						ctx.restore();
					});
				}
			}
		];

		// Only add animated waterFlow plugin if reduced motion is not preferred
		if (!prefersReducedMotion) {
			chartPlugins.push({
				id: 'waterFlow',
				afterDraw: (chart) => {
					const ctx = chart.ctx;
					const chartArea = chart.chartArea;

					// Create flowing water effect with animated waves
					const time = Date.now() * 0.002;
					const waveHeight = 3;
					const waveLength = 50;

					ctx.save();
					ctx.globalAlpha = 0.1;
					ctx.strokeStyle = '#0ea5e9';
					ctx.lineWidth = 1;

					// Draw multiple wave layers for depth
					for (let layer = 0; layer < 3; layer++) {
						ctx.beginPath();
						const offsetY = chartArea.bottom - layer * 20;
						const phaseOffset = (layer * Math.PI) / 3;

						for (let x = chartArea.left; x <= chartArea.right; x += 2) {
							const waveY =
								offsetY +
								Math.sin((x - chartArea.left) / waveLength + time + phaseOffset) * waveHeight;
							if (x === chartArea.left) {
								ctx.moveTo(x, waveY);
							} else {
								ctx.lineTo(x, waveY);
							}
						}
						ctx.stroke();
					}
					ctx.restore();
				}
			});
		}

		chart = new Chart(canvas, {
			type: 'line',
			data: {
				labels: [],
				datasets: [
					{
						label: 'Air Humidity (%)',
						data: [],
						borderColor: '#0ea5e9',
						backgroundColor: 'rgba(14, 165, 233, 0.2)',
						fill: true,
						tension: prefersReducedMotion ? 0.2 : 0.5, // Reduce tension for reduced motion
						borderWidth: config.borderWidth,
						pointBackgroundColor: '#ffffff',
						pointBorderColor: '#0ea5e9',
						pointBorderWidth: 2,
						pointRadius: config.pointRadius,
						pointHoverRadius: config.pointHoverRadius,
						pointHoverBackgroundColor: '#ffffff',
						pointHoverBorderColor: '#2563eb',
						pointHoverBorderWidth: 3
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				animation: {
					duration: config.animationDuration, // Responsive duration for flowing effect
					easing: config.animationEasing // Responsive easing for reduced motion
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
								weight: '500'
							},
							color: '#374151'
						}
					},
					tooltip: {
						enabled: true,
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
						titleColor: '#374151',
						bodyColor: '#6b7280',
						borderColor: 'rgba(14, 165, 233, 0.3)',
						borderWidth: 1,
						cornerRadius: 12,
						displayColors: true,
						padding: config.tooltipPadding,
						titleFont: {
							size: config.tooltipFontSize,
							weight: '600'
						},
						bodyFont: {
							size: config.tooltipBodySize
						},
						callbacks: {
							title: function (context) {
								return `Time: ${context[0].label}`;
							},
							label: function (context) {
								const humidity = context.parsed.y;
								const status = getHumidityStatus(humidity);
								const statusEmoji =
									status === 'optimal'
										? '💧'
										: status === 'acceptable'
											? '✅'
											: status === 'dry'
												? '🏜️'
												: '🌊';
								return `${statusEmoji} ${humidity}% (${status})`;
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
							text: 'Air Humidity (%)',
							font: {
								size: config.axisTitleSize,
								weight: '600'
							},
							color: '#374151'
						},
						min: 0,
						max: 100,
						grid: {
							color: 'rgba(14, 165, 233, 0.1)',
							drawBorder: false
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
								weight: '600'
							},
							color: '#374151'
						},
						grid: {
							color: 'rgba(14, 165, 233, 0.1)',
							drawBorder: false
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
			plugins: chartPlugins
		});

		return () => {
			chart.destroy();
			clearInterval(interval);
		};
	});
</script>

<div class="humidity-chart-container">
	{#if isLoading}
		<LoadingSkeleton variant="chart" height="100%" />
	{:else if hasError}
		<div class="error-state">
			<div class="error-icon">💧</div>
			<p class="error-text">Failed to load humidity data</p>
			<button class="retry-button" on:click={fetchData}> Retry </button>
		</div>
	{:else}
		<canvas bind:this={canvas}></canvas>
		<div class="water-ripples">
			<div class="ripple ripple-1"></div>
			<div class="ripple ripple-2"></div>
			<div class="ripple ripple-3"></div>
		</div>
	{/if}
</div>

<style>
	.humidity-chart-container {
		position: relative;
		height: 300px;
		width: 100%;
		padding: 1rem;
		background: linear-gradient(
			135deg,
			rgba(224, 242, 254, 0.3) 0%,
			rgba(186, 230, 253, 0.2) 25%,
			rgba(147, 197, 253, 0.3) 75%,
			rgba(96, 165, 250, 0.4) 100%
		);
		backdrop-filter: blur(12px);
		border-radius: 1rem;
		border: 1px solid rgba(14, 165, 233, 0.2);
		box-shadow:
			0 8px 32px rgba(14, 165, 233, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.humidity-chart-container:hover {
		background: linear-gradient(
			135deg,
			rgba(224, 242, 254, 0.4) 0%,
			rgba(186, 230, 253, 0.3) 25%,
			rgba(147, 197, 253, 0.4) 75%,
			rgba(96, 165, 250, 0.5) 100%
		);
		box-shadow:
			0 12px 40px rgba(14, 165, 233, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		transform: translateY(-2px);
	}

	.humidity-chart-container::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.1), transparent);
		transition: left 1s ease;
	}

	.humidity-chart-container:hover::before {
		left: 100%;
	}

	canvas {
		width: 100% !important;
		height: 100% !important;
		position: relative;
		z-index: 2;
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
		background: rgba(14, 165, 233, 0.1);
		border: 1px solid rgba(14, 165, 233, 0.3);
		border-radius: 0.75rem;
		color: rgba(14, 165, 233, 0.9);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.retry-button:hover {
		background: rgba(14, 165, 233, 0.2);
		border-color: rgba(14, 165, 233, 0.5);
		transform: translateY(-2px);
	}

	.water-ripples {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.ripple {
		position: absolute;
		border: 2px solid rgba(14, 165, 233, 0.3);
		border-radius: 50%;
		animation: ripple 4s infinite ease-out;
	}

	.ripple-1 {
		width: 20px;
		height: 20px;
		top: 20%;
		left: 15%;
		animation-delay: 0s;
	}

	.ripple-2 {
		width: 30px;
		height: 30px;
		top: 60%;
		right: 20%;
		animation-delay: 1.5s;
	}

	.ripple-3 {
		width: 25px;
		height: 25px;
		bottom: 25%;
		left: 60%;
		animation-delay: 3s;
	}

	@keyframes ripple {
		0% {
			transform: scale(0);
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			transform: scale(4);
			opacity: 0;
		}
	}

	/* Responsive Design */

	/* Tablet Landscape (768px - 1023px) */
	@media (max-width: 1023px) and (min-width: 768px) {
		.humidity-chart-container {
			height: 280px;
			padding: 0.875rem;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) */
	@media (max-width: 767px) and (min-width: 481px) {
		.humidity-chart-container {
			height: 260px;
			padding: 0.75rem;
		}
	}

	/* Mobile (320px - 480px) */
	@media (max-width: 480px) {
		.humidity-chart-container {
			height: 240px;
			padding: 0.75rem;
			border-radius: 0.75rem;
		}

		/* Disable hover effects on mobile */
		.humidity-chart-container:hover {
			background: linear-gradient(
				135deg,
				rgba(224, 242, 254, 0.3) 0%,
				rgba(186, 230, 253, 0.2) 25%,
				rgba(147, 197, 253, 0.3) 75%,
				rgba(96, 165, 250, 0.4) 100%
			);
			box-shadow:
				0 8px 32px rgba(14, 165, 233, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
			transform: none;
		}

		.humidity-chart-container:hover::before {
			left: -100%;
		}

		/* Simplify ripples on mobile */
		.ripple {
			animation-duration: 3s;
		}
	}

	/* Extra small mobile (max 320px) */
	@media (max-width: 320px) {
		.humidity-chart-container {
			height: 220px;
			padding: 0.625rem;
		}
	}

	/* Comprehensive Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.humidity-chart-container {
			transition: none !important;
		}

		.humidity-chart-container::before {
			transition: none !important;
		}

		.humidity-chart-container:hover {
			transform: none !important;
			background: linear-gradient(
				135deg,
				rgba(224, 242, 254, 0.3) 0%,
				rgba(186, 230, 253, 0.2) 25%,
				rgba(147, 197, 253, 0.3) 75%,
				rgba(96, 165, 250, 0.4) 100%
			) !important;
			box-shadow:
				0 8px 32px rgba(14, 165, 233, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
		}

		.humidity-chart-container:hover::before {
			left: -100% !important;
		}

		.ripple {
			animation: none !important;
			opacity: 0 !important;
		}

		/* Hide water ripples completely for reduced motion */
		.water-ripples {
			display: none;
		}
	}
</style>
