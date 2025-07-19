<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { cubicOut } from 'svelte/easing';
	import { showError, triggerHapticFeedback } from '$lib/utils/notifications';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';

	// Data interfaces
	interface SensorReading {
		timestamp: number;
		temperature: number;
		humidity: number;
	}

	interface WateringStatus {
		success: boolean;
		isWatering: boolean;
	}

	interface StatData {
		value: number;
		trend: 'up' | 'down' | 'stable';
		status: 'optimal' | 'warning' | 'critical';
		change: number;
	}

	// Reactive state
	let mounted = false;
	let sensorData: SensorReading[] = [];
	let wateringStatus: WateringStatus = { success: false, isWatering: false };
	let lastUpdate = Date.now();
	let isLoading = true;
	let hasError = false;
	let temperatureStat: StatData;
	let humidityStat: StatData;
	let soilMoistureStat: StatData;
	let systemHealthStat: StatData;

	// Animated values using writable stores with manual animation
	const temperatureValue = writable(0);
	const humidityValue = writable(0);
	const soilMoistureValue = writable(0);
	const systemHealthValue = writable(0);

	// Simple animation function to replace deprecated tweened
	function animateValue(
		store: { subscribe: (fn: (value: number) => void) => () => void; set: (value: number) => void },
		targetValue: number,
		duration: number = 500
	) {
		const startTime = Date.now();
		let startValue = 0;

		// Get current value from store
		store.subscribe((value: number) => {
			startValue = value;
		})();

		const change = targetValue - startValue;

		function update() {
			const elapsed = Date.now() - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = cubicOut(progress);
			const currentValue = startValue + change * easedProgress;

			store.set(currentValue);

			if (progress < 1) {
				requestAnimationFrame(update);
			}
		}

		requestAnimationFrame(update);
	}

	// Computed stats

	$: temperatureStat = calculateStat(sensorData, 'temperature');
	$: humidityStat = calculateStat(sensorData, 'humidity');
	soilMoistureStat = calculateSoilMoistureStat();
	systemHealthStat = calculateSystemHealthStat();

	function calculateStat(data: SensorReading[], field: 'temperature' | 'humidity'): StatData {
		if (data.length === 0) {
			return { value: 0, trend: 'stable', status: 'optimal', change: 0 };
		}

		const current = data[data.length - 1][field];
		const previous = data.length > 1 ? data[data.length - 2][field] : current;
		const change = current - previous;

		let trend: 'up' | 'down' | 'stable' = 'stable';
		if (Math.abs(change) > 0.5) {
			trend = change > 0 ? 'up' : 'down';
		}

		let status: 'optimal' | 'warning' | 'critical' = 'optimal';
		if (field === 'temperature') {
			if (current < 15 || current > 30) status = 'critical';
			else if (current < 18 || current > 26) status = 'warning';
		} else if (field === 'humidity') {
			if (current < 30 || current > 80) status = 'critical';
			else if (current < 40 || current > 70) status = 'warning';
		}

		return { value: current, trend, status, change };
	}

	function calculateSoilMoistureStat(): StatData {
		// Simulate soil moisture data (in a real implementation, this would come from a soil sensor)
		const mockValue = 45 + Math.sin(Date.now() / 100000) * 15;
		let status: 'optimal' | 'warning' | 'critical' = 'optimal';

		if (mockValue < 20) status = 'critical';
		else if (mockValue < 30) status = 'warning';

		return {
			value: mockValue,
			trend: mockValue > 40 ? 'up' : mockValue < 30 ? 'down' : 'stable',
			status,
			change: Math.random() * 4 - 2
		};
	}

	function calculateSystemHealthStat(): StatData {
		const isHealthy = wateringStatus.success;
		const healthValue = isHealthy ? 100 : 75;

		return {
			value: healthValue,
			trend: 'stable',
			status: isHealthy ? 'optimal' : 'warning',
			change: 0
		};
	}

	async function fetchSensorData() {
		try {
			isLoading = true;
			hasError = false;
			const response = await fetch('/api/sensors/data');
			if (response.ok) {
				sensorData = await response.json();
				lastUpdate = Date.now();
				isLoading = false;

				// Animate values to new data
				if (sensorData.length > 0) {
					animateValue(temperatureValue, sensorData[sensorData.length - 1].temperature);
					animateValue(humidityValue, sensorData[sensorData.length - 1].humidity);
				}
			} else {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Failed to fetch sensor data:', error);
			hasError = true;
			isLoading = false;
			showError('Failed to load sensor data', 'Stats Error');
		}
	}

	async function fetchWateringStatus() {
		try {
			// Mock watering status for development
			if (process.env.NODE_ENV === 'development') {
				wateringStatus = { success: true, isWatering: wateringStatus.isWatering };
				// Animate system health values
				animateValue(soilMoistureValue, soilMoistureStat?.value || 0);
				animateValue(systemHealthValue, systemHealthStat?.value || 0);
				return;
			}

			const response = await fetch('/api/water/status');
			if (response.ok) {
				wateringStatus = await response.json();
				// Animate system health values
				animateValue(soilMoistureValue, soilMoistureStat?.value || 0);
				animateValue(systemHealthValue, systemHealthStat?.value || 0);
			} else {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
		} catch (error) {
			console.error('Failed to fetch watering status:', error);
			showError('Failed to load watering status', 'Stats Error');
		}
	}

	function handleCardClick() {
		triggerHapticFeedback('click');
	}

	function handleRetryClick() {
		triggerHapticFeedback('click');
		fetchSensorData();
		fetchWateringStatus();
	}

	function getStatusColor(status: 'optimal' | 'warning' | 'critical'): string {
		switch (status) {
			case 'optimal':
				return '#22c55e';
			case 'warning':
				return '#f59e0b';
			case 'critical':
				return '#ef4444';
		}
	}

	function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
		switch (trend) {
			case 'up':
				return '↗️';
			case 'down':
				return '↘️';
			case 'stable':
				return '→';
		}
	}

	function formatValue(value: number, unit: string): string {
		return `${value.toFixed(1)}${unit}`;
	}

	function getTimeSinceUpdate(): string {
		const minutes = Math.floor((Date.now() - lastUpdate) / 60000);
		if (minutes < 1) return 'Just now';
		if (minutes === 1) return '1 minute ago';
		return `${minutes} minutes ago`;
	}

	onMount(() => {
		mounted = true;
		fetchSensorData();
		fetchWateringStatus();

		// Update data every 30 seconds
		const interval = setInterval(() => {
			fetchSensorData();
			fetchWateringStatus();
		}, 30000);

		// Initialize animated values with current stats
		animateValue(temperatureValue, temperatureStat?.value || 0);
		animateValue(humidityValue, humidityStat?.value || 0);
		animateValue(soilMoistureValue, soilMoistureStat?.value || 0);
		animateValue(systemHealthValue, systemHealthStat?.value || 0);

		return () => clearInterval(interval);
	});
</script>

<section class="stats-overview" class:mounted>
	{#if isLoading}
		<!-- Loading Skeletons -->
		<LoadingSkeleton variant="stats" />
		<LoadingSkeleton variant="stats" />
		<LoadingSkeleton variant="stats" />
		<LoadingSkeleton variant="stats" />
	{:else if hasError}
		<!-- Error State -->
		<div class="error-state">
			<div class="error-icon">📊</div>
			<p class="error-text">Failed to load statistics</p>
			<button class="retry-button" on:click={handleRetryClick}> Retry </button>
		</div>
	{:else}
		<!-- Temperature Card -->
		<div
			class="stat-card temperature-card"
			data-status={temperatureStat?.status}
			on:click={handleCardClick}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? handleCardClick() : null)}
			role="button"
			tabindex="0"
		>
			<div class="stat-header">
				<div class="stat-icon temperature-icon">
					<span class="icon-emoji">🌡️</span>
					<div class="icon-glow"></div>
				</div>
				<div class="trend-indicator" data-trend={temperatureStat?.trend}>
					<span class="trend-arrow">{getTrendIcon(temperatureStat?.trend || 'stable')}</span>
					<span class="trend-value">
						{temperatureStat?.change
							? (temperatureStat.change > 0 ? '+' : '') + temperatureStat.change.toFixed(1)
							: '0.0'}°
					</span>
				</div>
			</div>

			<div class="stat-content">
				<div class="stat-value">
					<span class="value-number">{formatValue($temperatureValue, '°C')}</span>
					<div class="value-bar">
						<div
							class="value-fill"
							style="width: {Math.min(($temperatureValue / 40) * 100, 100)}%"
						></div>
					</div>
				</div>
				<div class="stat-meta">
					<h3 class="stat-title" title="Temperature">🌡️ Temp</h3>
					<p class="stat-subtitle">Current Reading</p>
				</div>
			</div>

			<div
				class="status-indicator"
				style="background-color: {getStatusColor(temperatureStat?.status || 'optimal')}"
			></div>
		</div>

		<!-- Humidity Card -->
		<div class="stat-card humidity-card" data-status={humidityStat?.status}>
			<div class="stat-header">
				<div class="stat-icon humidity-icon">
					<span class="icon-emoji">💧</span>
					<div class="icon-glow"></div>
				</div>
				<div class="trend-indicator" data-trend={humidityStat?.trend}>
					<span class="trend-arrow">{getTrendIcon(humidityStat?.trend || 'stable')}</span>
					<span class="trend-value">
						{humidityStat?.change
							? (humidityStat.change > 0 ? '+' : '') + humidityStat.change.toFixed(1)
							: '0.0'}%
					</span>
				</div>
			</div>

			<div class="stat-content">
				<div class="stat-value">
					<span class="value-number">{formatValue($humidityValue, '%')}</span>
					<div class="value-bar">
						<div class="value-fill" style="width: {Math.min($humidityValue, 100)}%"></div>
					</div>
				</div>
				<div class="stat-meta">
					<h3 class="stat-title">Air Humidity</h3>
					<p class="stat-subtitle">Moisture Level</p>
				</div>
			</div>

			<div
				class="status-indicator"
				style="background-color: {getStatusColor(humidityStat?.status || 'optimal')}"
			></div>
		</div>

		<!-- Soil Moisture Card -->
		<div class="stat-card soil-card" data-status={soilMoistureStat?.status}>
			<div class="stat-header">
				<div class="stat-icon soil-icon">
					<span class="icon-emoji">🌱</span>
					<div class="icon-glow"></div>
				</div>
				<div class="trend-indicator" data-trend={soilMoistureStat?.trend}>
					<span class="trend-arrow">{getTrendIcon(soilMoistureStat?.trend || 'stable')}</span>
					<span class="trend-value">
						{soilMoistureStat?.change
							? (soilMoistureStat.change > 0 ? '+' : '') + soilMoistureStat.change.toFixed(1)
							: '0.0'}%
					</span>
				</div>
			</div>

			<div class="stat-content">
				<div class="stat-value">
					<span class="value-number">{formatValue($soilMoistureValue, '%')}</span>
					<div class="value-bar">
						<div class="value-fill" style="width: {Math.min($soilMoistureValue, 100)}%"></div>
					</div>
				</div>
				<div class="stat-meta">
					<h3 class="stat-title">Soil Health</h3>
					<p class="stat-subtitle">Moisture Level</p>
				</div>
			</div>

			<div
				class="status-indicator"
				style="background-color: {getStatusColor(soilMoistureStat?.status || 'optimal')}"
			></div>
		</div>

		<!-- System Health Card -->
		<div class="stat-card system-card" data-status={systemHealthStat?.status}>
			<div class="stat-header">
				<div class="stat-icon system-icon">
					<span class="icon-emoji">⚡</span>
					<div class="icon-glow pulsing" class:active={wateringStatus.isWatering}></div>
				</div>
				<div class="system-status">
					<span class="status-text" class:watering={wateringStatus.isWatering}>
						{wateringStatus.isWatering ? 'Watering' : 'Ready'}
					</span>
				</div>
			</div>

			<div class="stat-content">
				<div class="stat-value">
					<span class="value-number">{formatValue($systemHealthValue, '%')}</span>
					<div class="value-bar">
						<div class="value-fill" style="width: {$systemHealthValue}%"></div>
					</div>
				</div>
				<div class="stat-meta">
					<h3 class="stat-title">System Health</h3>
					<p class="stat-subtitle">{getTimeSinceUpdate()}</p>
				</div>
			</div>

			<div
				class="status-indicator pulsing"
				class:active={wateringStatus.isWatering}
				style="background-color: {getStatusColor(systemHealthStat?.status || 'optimal')}"
			></div>
		</div>
	{/if}
</section>

<style>
	.stats-overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.stats-overview.mounted {
		opacity: 1;
		transform: translateY(0);
	}

	.stat-card {
		position: relative;
		padding: 1.5rem;
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: 1rem;
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.stat-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.stat-card:hover::before {
		left: 100%;
	}

	.stat-card:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow:
			0 32px 64px -12px rgba(31, 38, 135, 0.3),
			0 0 30px rgba(34, 197, 94, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
		background: rgba(255, 255, 255, 0.35);
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.stat-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3.5rem;
		height: 3.5rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	.icon-emoji {
		font-size: 1.75rem;
		z-index: 2;
	}

	.icon-glow {
		position: absolute;
		inset: -2px;
		border-radius: 0.75rem;
		background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.stat-card:hover .icon-glow {
		opacity: 1;
	}

	.icon-glow.pulsing.active {
		animation: pulse-glow 2s infinite;
		opacity: 1;
	}

	.trend-indicator {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.25rem;
	}

	.trend-arrow {
		font-size: 1.25rem;
		transition: transform 0.3s ease;
	}

	.trend-indicator[data-trend='up'] .trend-arrow {
		color: #22c55e;
		transform: rotate(-45deg);
	}

	.trend-indicator[data-trend='down'] .trend-arrow {
		color: #ef4444;
		transform: rotate(45deg);
	}

	.trend-indicator[data-trend='stable'] .trend-arrow {
		color: #64748b;
	}

	.trend-value {
		font-size: 0.75rem;
		font-weight: 600;
		color: #64748b;
		background: rgba(255, 255, 255, 0.3);
		padding: 0.25rem 0.5rem;
		border-radius: 0.5rem;
		backdrop-filter: blur(8px);
	}

	.stat-content {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
	}

	.stat-value {
		flex: 1;
	}

	.value-number {
		display: block;
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 0.5rem;
		font-variant-numeric: tabular-nums;
	}

	.value-bar {
		width: 100%;
		height: 4px;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 2px;
		overflow: hidden;
		position: relative;
	}

	.value-fill {
		height: 100%;
		background: linear-gradient(90deg, #22c55e, #0ea5e9);
		border-radius: 2px;
		transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.value-fill::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 8px;
		height: 100%;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 2px;
		animation: shimmer 2s infinite;
	}

	.stat-meta {
		text-align: right;
	}

	.stat-title {
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
		/* Handle long titles */
		word-wrap: break-word;
		overflow-wrap: break-word;
		hyphens: auto;
		max-width: 100%;
	}

	.stat-subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0.25rem 0 0 0;
		opacity: 0.8;
	}

	.status-indicator {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.status-indicator.pulsing.active {
		animation: pulse-dot 2s infinite;
	}

	.system-status {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	.status-text {
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		padding: 0.25rem 0.75rem;
		background: rgba(255, 255, 255, 0.3);
		border-radius: 1rem;
		backdrop-filter: blur(8px);
		transition: all 0.3s ease;
	}

	.status-text.watering {
		color: #0ea5e9;
		background: rgba(14, 165, 233, 0.1);
		animation: pulse-text 2s infinite;
	}

	/* Status-specific styling */
	.stat-card[data-status='warning'] {
		border-color: rgba(245, 158, 11, 0.3);
	}

	.stat-card[data-status='critical'] {
		border-color: rgba(239, 68, 68, 0.3);
	}

	.stat-card[data-status='warning']:hover {
		box-shadow:
			0 32px 64px -12px rgba(245, 158, 11, 0.2),
			0 0 30px rgba(245, 158, 11, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	.stat-card[data-status='critical']:hover {
		box-shadow:
			0 32px 64px -12px rgba(239, 68, 68, 0.2),
			0 0 30px rgba(239, 68, 68, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.6);
	}

	/* Animations */
	@keyframes pulse-glow {
		0%,
		100% {
			opacity: 0.5;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.05);
		}
	}

	@keyframes pulse-dot {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.2);
		}
	}

	@keyframes pulse-text {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}

	@keyframes shimmer {
		0% {
			opacity: 0;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}

	/* Enhanced Responsive Design */

	/* Large Desktop (1200px+) - 4 columns */
	@media (min-width: 1200px) {
		.stats-overview {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.5rem;
		}
	}

	/* Desktop/Laptop (1024px - 1199px) - 4 columns with smaller gap */
	@media (max-width: 1199px) and (min-width: 1024px) {
		.stats-overview {
			grid-template-columns: repeat(4, 1fr);
			gap: 1.25rem;
		}

		.stat-card {
			padding: 1.25rem;
		}
	}

	/* Tablet Landscape (768px - 1023px) - 2 columns */
	@media (max-width: 1023px) and (min-width: 768px) {
		.stats-overview {
			grid-template-columns: repeat(2, 1fr);
			gap: 1.25rem;
		}

		.stat-card {
			padding: 1.25rem;
			min-height: 140px;
		}

		.stat-icon {
			width: 3.25rem;
			height: 3.25rem;
		}

		.icon-emoji {
			font-size: 1.625rem;
		}

		.value-number {
			font-size: 1.75rem;
		}

		/* Optimize touch targets for tablet */
		.trend-indicator {
			gap: 0.375rem;
		}

		.trend-value {
			padding: 0.375rem 0.625rem;
			font-size: 0.8125rem;
		}

		.status-text {
			padding: 0.375rem 1rem;
			font-size: 0.9375rem;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) - 2 columns optimized */
	@media (max-width: 767px) and (min-width: 481px) {
		.stats-overview {
			grid-template-columns: repeat(2, 1fr);
			gap: 1rem;
		}

		.stat-card {
			padding: 1rem;
			min-height: 130px;
		}

		.stat-icon {
			width: 3rem;
			height: 3rem;
		}

		.icon-emoji {
			font-size: 1.5rem;
		}

		.value-number {
			font-size: 1.625rem;
			margin-bottom: 0.375rem;
		}

		.stat-title {
			font-size: 0.9375rem;
		}

		.stat-subtitle {
			font-size: 0.6875rem;
		}

		/* Enhanced touch targets */
		.trend-value {
			padding: 0.3125rem 0.5625rem;
			font-size: 0.75rem;
		}

		.status-text {
			padding: 0.3125rem 0.875rem;
			font-size: 0.8125rem;
		}

		/* Reduce hover effects intensity on tablet */
		.stat-card:hover {
			transform: translateY(-4px) scale(1.01);
		}
	}

	/* Mobile (320px - 480px) - Single column optimized */
	@media (max-width: 480px) {
		.stats-overview {
			grid-template-columns: 1fr;
			gap: 0.875rem;
		}

		.stat-card {
			padding: 1rem;
			min-height: 120px;
		}

		.stat-header {
			margin-bottom: 0.875rem;
		}

		.stat-icon {
			width: 2.75rem;
			height: 2.75rem;
		}

		.icon-emoji {
			font-size: 1.375rem;
		}

		.value-number {
			font-size: 1.5rem;
			margin-bottom: 0.375rem;
		}

		.stat-content {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.stat-meta {
			text-align: left;
			width: 100%;
		}

		.stat-title {
			font-size: 0.875rem;
		}

		.stat-subtitle {
			font-size: 0.6875rem;
		}

		.trend-indicator {
			gap: 0.25rem;
		}

		.trend-value {
			padding: 0.25rem 0.5rem;
			font-size: 0.6875rem;
		}

		.status-text {
			padding: 0.25rem 0.75rem;
			font-size: 0.75rem;
		}

		/* Mobile-specific optimizations */
		.value-bar {
			height: 3px;
		}

		.status-indicator {
			width: 6px;
			height: 6px;
			top: 0.625rem;
			right: 0.625rem;
		}

		/* Disable hover effects on mobile */
		.stat-card:hover {
			transform: none;
			box-shadow:
				0 8px 32px rgba(31, 38, 135, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.4);
			background: rgba(255, 255, 255, 0.25);
		}

		.stat-card:hover::before {
			left: -100%;
		}

		.stat-card:hover .icon-glow {
			opacity: 0;
		}

		/* Faster animations for mobile */
		.stats-overview {
			transition-duration: 0.4s;
		}

		.stat-card {
			transition-duration: 0.2s;
		}
	}

	/* Extra small mobile (max 320px) - Ultra compact */
	@media (max-width: 320px) {
		.stats-overview {
			gap: 0.75rem;
		}

		.stat-card {
			padding: 0.875rem;
			min-height: 110px;
		}

		.stat-icon {
			width: 2.5rem;
			height: 2.5rem;
		}

		.icon-emoji {
			font-size: 1.25rem;
		}

		.value-number {
			font-size: 1.375rem;
		}

		.stat-title {
			font-size: 0.8125rem;
		}

		.stat-subtitle {
			font-size: 0.625rem;
		}

		.trend-value {
			padding: 0.1875rem 0.375rem;
			font-size: 0.625rem;
		}

		.status-text {
			padding: 0.1875rem 0.625rem;
			font-size: 0.6875rem;
		}
	}

	/* Error State */
	.error-state {
		grid-column: 1 / -1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		text-align: center;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 1rem;
		box-shadow:
			0 8px 32px rgba(239, 68, 68, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.error-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.5;
	}

	.error-text {
		color: rgba(239, 68, 68, 0.8);
		font-size: 1.1rem;
		font-weight: 500;
		margin: 0 0 1.5rem 0;
	}

	.retry-button {
		padding: 0.75rem 1.5rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.75rem;
		color: rgba(239, 68, 68, 0.9);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.retry-button:hover {
		background: rgba(239, 68, 68, 0.2);
		border-color: rgba(239, 68, 68, 0.5);
		transform: translateY(-2px);
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.stats-overview {
			opacity: 1;
			transform: none;
			transition: none;
		}

		.stat-card:hover {
			transform: none;
		}

		.icon-glow.pulsing.active,
		.status-indicator.pulsing.active,
		.status-text.watering {
			animation: none;
		}

		.value-fill::after {
			animation: none;
		}

		.retry-button:hover {
			transform: none;
		}
	}
</style>
