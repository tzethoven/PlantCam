<script lang="ts">
	import CameraFeed from '$lib/components/camera/CameraFeed.svelte';
	import WateringControl from '$lib/components/control/WateringControl.svelte';
	import SoilHumidityChart from '$lib/components/sensors/SoilHumidityChart.svelte';
	import TemperatureChart from '$lib/components/sensors/TemperatureChart.svelte';
	import HumidityChart from '$lib/components/sensors/HumidityChart.svelte';

	import StatsOverview from '$lib/components/stats/StatsOverview.svelte';
	import UserMenu from '$lib/components/auth/UserMenu.svelte';
	import { onMount, onDestroy } from 'svelte';
	import { setupIntersectionObserver } from '$lib/utils/intersectionObserver';

	let mounted = false;
	let cleanupIntersectionObserver: (() => void) | null = null;

	onMount(() => {
		mounted = true;

		// Setup intersection observer for scroll-triggered animations
		cleanupIntersectionObserver = setupIntersectionObserver();

		// Performance optimization: Remove will-change after initial animations
		setTimeout(() => {
			const animatedElements = document.querySelectorAll('.animate-entrance');
			animatedElements.forEach((element) => {
				(element as HTMLElement).style.willChange = 'auto';
			});
		}, 1000);
	});

	onDestroy(() => {
		// Cleanup intersection observer
		if (cleanupIntersectionObserver) {
			cleanupIntersectionObserver();
		}
	});
</script>

<!-- Main Dashboard Container -->
<div class="dashboard-container">
	<!-- Header Section -->
	<header class="dashboard-header animate-entrance" class:mounted>
		<div class="header-content">
			<div class="header-text">
				<h1 class="text-display text-gradient-nature">PlantCam</h1>
				<p class="text-body-large text-gray-600">Monitor and care for your plants with style</p>
			</div>
			<div class="header-actions">
				<UserMenu />
			</div>
		</div>
	</header>

	<!-- Stats Overview Cards -->
	<StatsOverview />

	<!-- Main Content Grid -->
	<main class="dashboard-grid">
		<!-- Environmental Charts Section -->
		<section class="charts-section animate-entrance animate-entrance-delay-2" class:mounted>
			<div class="chart-card glass-card">
				<div class="section-header">
					<h2 class="text-heading-2 text-gray-800">Temperature</h2>
					<div class="chart-icon">🌡️</div>
				</div>
				<div class="section-content">
					<TemperatureChart />
				</div>
			</div>

			<div class="chart-card glass-card">
				<div class="section-header">
					<h2 class="text-heading-2 text-gray-800">Air Humidity</h2>
					<div class="chart-icon">💧</div>
				</div>
				<div class="section-content">
					<HumidityChart />
				</div>
			</div>

			<div class="chart-card glass-card">
				<div class="section-header">
					<h2 class="text-heading-2 text-gray-800">Soil Humidity</h2>
					<div class="chart-icon">🌱</div>
				</div>
				<div class="section-content">
					<SoilHumidityChart />
				</div>
			</div>
		</section>

		<!-- Camera Feed Section -->
		<section
			class="camera-section glass-card animate-entrance animate-entrance-delay-3"
			class:mounted
		>
			<div class="section-header">
				<h2 class="text-heading-2 text-gray-800">Live Stream</h2>
				<div class="section-badge">
					<span class="status-dot status-active"></span>
					<span class="text-caption text-gray-600">Live</span>
				</div>
			</div>
			<div class="section-content">
				<CameraFeed />
			</div>
		</section>

		<!-- Watering Control Section -->
		<section
			class="control-section glass-card animate-entrance animate-entrance-delay-4"
			class:mounted
		>
			<div class="section-header">
				<h2 class="text-heading-2 text-gray-800">Watering Control</h2>
				<div class="section-badge">
					<span class="status-dot status-ready"></span>
					<span class="text-caption text-gray-600">Ready</span>
				</div>
			</div>
			<div class="section-content">
				<WateringControl />
			</div>
		</section>
	</main>
</div>

<style>
	.dashboard-container {
		min-height: 100vh;
		position: relative;
		z-index: 10;
		padding: 1.5rem;
		max-width: 1000px;
		margin: 0 auto;
		display: grid;
		grid-template-rows: auto auto 1fr;
		gap: 2rem;
	}

	.dashboard-header {
		padding: 2rem 0;
		max-width: 1000px;
		margin: 0 auto;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-text {
		text-align: left;
		flex: 1;
	}

	.header-actions {
		flex-shrink: 0;
	}

	.dashboard-header h1 {
		margin-bottom: 0.5rem;
		filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.2));
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		grid-template-rows: auto auto auto;
		gap: 2rem;
		grid-template-areas:
			'charts charts charts charts charts charts charts charts charts charts charts charts'
			'camera camera camera camera camera camera camera camera camera camera camera camera'
			'control control control control control control control control control control control control';
		max-width: 1000px;
		margin: 0 auto;
	}

	.charts-section {
		grid-area: charts;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.camera-section {
		grid-area: camera;
	}

	.control-section {
		grid-area: control;
	}

	.chart-card {
		flex: 1;
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		/* Performance optimizations */
		will-change: transform, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.chart-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.8s ease;
		/* Performance optimizations */
		will-change: left;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.chart-card:hover::before {
		left: 100%;
	}

	.chart-card:hover {
		transform: translateY(-4px);
		box-shadow:
			0 25px 50px -12px rgba(31, 38, 135, 0.25),
			0 0 25px rgba(34, 197, 94, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.35);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		position: relative;
	}

	.section-header::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 0;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, #22c55e, #0ea5e9);
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: width;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.glass-card:hover .section-header::after {
		width: 100%;
	}

	.section-header h2 {
		margin: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2rem;
		backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
		transition:
			background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, background-color;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.section-badge:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}

	/* Enhanced Interactive Elements */
	.glass-card {
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.glass-card:focus {
		outline: 2px solid rgba(34, 197, 94, 0.5);
		outline-offset: 2px;
	}

	.glass-card:active {
		transform: translateY(-2px) scale(0.98);
	}

	/* Micro-interaction for section headers */
	.section-header {
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.section-header:hover {
		transform: translateX(4px);
	}

	.section-header:hover h2 {
		color: #22c55e;
	}

	/* Enhanced chart icons with micro-interactions */
	.chart-icon {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
	}

	.chart-icon:hover {
		transform: scale(1.2) rotate(10deg);
		filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
	}

	.chart-icon {
		font-size: 1.5rem;
		opacity: 0.7;
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		display: inline-block;
	}

	.status-active {
		background: #22c55e;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
		animation: pulse 2s infinite;
	}

	.status-ready {
		background: #0ea5e9;
		box-shadow: 0 0 8px rgba(14, 165, 233, 0.6);
	}

	.section-content {
		position: relative;
	}

	/* Enhanced Animation states */
	.animate-entrance {
		opacity: 0;
		transform: translateY(30px) scale(0.95);
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animate-entrance.mounted {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.animate-entrance-delay-2 {
		transition-delay: 0.3s;
	}

	.animate-entrance-delay-3 {
		transition-delay: 0.45s;
	}

	.animate-entrance-delay-4 {
		transition-delay: 0.6s;
	}

	/* Pulse animation for status indicators */
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.7;
			transform: scale(1.1);
		}
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	/* Enhanced Responsive Design */

	/* Large Desktop (1200px+) - Default 3-column layout */
	@media (min-width: 1200px) {
		.dashboard-grid {
			grid-template-columns: repeat(12, 1fr);
			grid-template-areas:
				'charts charts charts charts charts charts charts charts charts charts charts charts'
				'camera camera camera camera camera camera camera camera camera camera camera camera'
				'control control control control control control control control control control control control';
		}
	}

	/* Desktop/Laptop (1024px - 1199px) - Balanced layout */
	@media (max-width: 1199px) and (min-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: repeat(8, 1fr);
			grid-template-areas:
				'charts charts charts charts charts charts charts charts'
				'camera camera camera camera camera camera camera camera'
				'control control control control control control control control';
		}

		.charts-section {
			gap: 1rem;
		}
	}

	/* Tablet Landscape (768px - 1023px) - Enhanced 2-column layout */
	@media (max-width: 1023px) and (min-width: 768px) {
		.dashboard-container {
			padding: 1.25rem;
			gap: 1.5rem;
			max-width: 800px;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			grid-template-areas:
				'charts'
				'camera'
				'control';
			gap: 1.5rem;
			align-items: start;
		}

		.camera-section {
			min-height: 400px;
		}

		.charts-section {
			flex-direction: column;
			gap: 1rem;
			min-height: 400px;
		}

		.chart-card {
			min-height: 180px;
			flex: 1;
		}

		.control-section {
			grid-column: 1 / -1;
			max-width: none;
		}

		/* Enhanced touch targets for tablet */
		.section-badge {
			padding: 0.75rem 1.25rem;
			min-height: 44px;
			font-size: 0.875rem;
			border-radius: 1.5rem;
		}

		/* Tablet-specific section headers */
		.section-header {
			margin-bottom: 1.25rem;
			padding-bottom: 0.875rem;
		}

		.section-header h2 {
			font-size: 1.375rem;
		}

		.chart-icon {
			font-size: 1.375rem;
		}

		/* Tablet-specific animations - slightly faster */
		.animate-entrance {
			transition-duration: 0.6s;
		}

		.animate-entrance-delay-2 {
			transition-delay: 0.2s;
		}

		.animate-entrance-delay-3 {
			transition-delay: 0.3s;
		}

		.animate-entrance-delay-4 {
			transition-delay: 0.4s;
		}

		/* Enhanced hover effects for tablet */
		.chart-card:hover {
			transform: translateY(-6px);
			box-shadow:
				0 20px 40px -12px rgba(31, 38, 135, 0.2),
				0 0 20px rgba(34, 197, 94, 0.08),
				inset 0 1px 0 rgba(255, 255, 255, 0.5);
		}

		.glass-card:hover .section-header::after {
			width: 75%;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) - Single column with optimized spacing */
	@media (max-width: 767px) and (min-width: 481px) {
		.dashboard-container {
			padding: 1rem;
			gap: 1.5rem;
			border-radius: 1rem;
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			grid-template-areas:
				'charts'
				'camera'
				'control';
			gap: 1.25rem;
		}

		.charts-section {
			flex-direction: column;
			gap: 1rem;
		}

		.chart-card {
			min-height: 180px;
		}

		.dashboard-header {
			padding: 1.5rem 0;
		}

		.dashboard-header h1 {
			font-size: 2.5rem;
		}

		/* Enhanced touch targets */
		.section-badge {
			padding: 0.75rem 1.25rem;
			min-height: 44px;
			font-size: 0.875rem;
		}

		/* Optimize section headers for tablet */
		.section-header {
			margin-bottom: 1.25rem;
			padding-bottom: 0.75rem;
		}

		.section-header h2 {
			font-size: 1.5rem;
		}
	}

	/* Mobile (320px - 480px) - Optimized single column */
	@media (max-width: 480px) {
		.dashboard-container {
			padding: 0.75rem;
			gap: 1rem;
			border-radius: 0.75rem;
			margin: 0.5rem;
			max-width: calc(100vw - 1rem);
		}

		.dashboard-grid {
			grid-template-columns: 1fr;
			grid-template-areas:
				'charts'
				'camera'
				'control';
			gap: 1rem;
		}

		.charts-section {
			flex-direction: column;
			gap: 0.75rem;
		}

		.chart-card {
			min-height: 180px;
			padding: 1rem;
		}

		.glass-card {
			padding: 1rem;
		}

		.dashboard-header {
			padding: 1rem 0;
		}

		.dashboard-header h1 {
			font-size: 2rem;
			line-height: 1.1;
		}

		.dashboard-header p {
			font-size: 0.875rem;
			margin-top: 0.25rem;
		}

		/* Mobile-optimized section headers */
		.section-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
			margin-bottom: 1rem;
			padding-bottom: 0.75rem;
		}

		.section-header h2 {
			font-size: 1.25rem;
			line-height: 1.3;
		}

		.section-badge {
			align-self: flex-start;
			padding: 0.5rem 1rem;
			min-height: 40px;
			font-size: 0.75rem;
		}

		/* Optimize chart icons for mobile */
		.chart-icon {
			font-size: 1.25rem;
		}

		/* Mobile-specific animations - faster and less intensive */
		.animate-entrance {
			transition-duration: 0.4s;
		}

		.animate-entrance-delay-2 {
			transition-delay: 0.1s;
		}

		.animate-entrance-delay-3 {
			transition-delay: 0.15s;
		}

		.animate-entrance-delay-4 {
			transition-delay: 0.2s;
		}

		/* Reduce hover effects on mobile */
		.chart-card:hover {
			transform: none;
		}

		.glass-card:hover .section-header::after {
			width: 50%;
		}
	}

	/* Extra small mobile (max 320px) - Ultra compact */
	@media (max-width: 320px) {
		.dashboard-container {
			padding: 0.5rem;
			gap: 0.75rem;
			margin: 0.25rem;
			max-width: calc(100vw - 0.5rem);
		}

		.dashboard-grid {
			gap: 0.75rem;
		}

		.charts-section {
			gap: 0.5rem;
		}

		.chart-card {
			min-height: 140px;
			padding: 0.75rem;
		}

		.glass-card {
			padding: 0.75rem;
		}

		.dashboard-header h1 {
			font-size: 1.75rem;
		}

		.section-header h2 {
			font-size: 1.125rem;
		}
	}

	/* Comprehensive Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		/* Static alternatives for entrance animations */
		.animate-entrance {
			opacity: 1 !important;
			transform: translateY(0) scale(1) !important;
			transition: none !important;
		}

		/* Disable all pulsing and moving animations */
		.status-active {
			animation: none !important;
			box-shadow: 0 0 8px rgba(34, 197, 94, 0.6) !important;
		}

		/* Static hover states */
		.chart-card:hover {
			transform: none !important;
			background: rgba(255, 255, 255, 0.25) !important;
			box-shadow: var(--glass-shadow) !important;
		}

		.chart-card:hover::before {
			left: -100% !important;
		}

		.glass-card:hover .section-header::after {
			width: 0 !important;
		}

		/* Disable shimmer effects */
		@keyframes shimmer {
			0%,
			100% {
				background-position: 0 0;
			}
		}

		/* Ensure functionality remains intact */
		.section-badge:hover {
			background: rgba(255, 255, 255, 0.2) !important;
			transform: none !important;
		}

		/* Maintain visual hierarchy without motion */
		.dashboard-container {
			background: linear-gradient(
				135deg,
				rgba(240, 253, 244, 0.9) 0%,
				rgba(220, 252, 231, 0.7) 25%,
				rgba(224, 242, 254, 0.7) 75%,
				rgba(240, 249, 255, 0.9) 100%
			);
		}
	}

	/* Mobile: Remove container constraints for full-width experience */
	@media (max-width: 768px) {
		.dashboard-container {
			padding: 0;
			max-width: none;
			margin: 0;
			gap: 1rem;
		}

		.dashboard-header {
			padding: 1rem;
			background: rgba(255, 255, 255, 0.1);
			margin: 0 0.5rem 1rem 0.5rem;
			border-radius: 1rem;
			border: 1px solid rgba(255, 255, 255, 0.2);
			max-width: none;
		}

		.dashboard-header h1 {
			font-size: 1.75rem;
		}

		.dashboard-header p {
			font-size: 0.875rem;
		}

		.dashboard-grid {
			gap: 1rem;
			padding: 0 0.5rem;
			max-width: none;
		}

		/* Make individual cards more prominent on mobile */
		.glass-card {
			border-radius: 1rem;
			margin-bottom: 1rem;
		}
	}

	/* Extra small mobile: Even more compact */
	@media (max-width: 480px) {
		.dashboard-container {
			gap: 0.75rem;
		}

		.dashboard-header {
			margin: 0 0.25rem 0.75rem 0.25rem;
			padding: 0.75rem;
		}

		.dashboard-header h1 {
			font-size: 1.5rem;
		}

		.dashboard-grid {
			padding: 0 0.25rem;
			gap: 0.75rem;
		}

		.glass-card {
			border-radius: 0.75rem;
			margin-bottom: 0.75rem;
		}
	}
</style>
