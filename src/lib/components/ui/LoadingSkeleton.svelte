<script lang="ts">
	export let variant: 'card' | 'chart' | 'button' | 'text' | 'avatar' | 'stats' = 'card';
	export let width: string = '100%';
	export let height: string = 'auto';
	export let rounded: boolean = true;
	export let animated: boolean = true;
	export let lines: number = 3; // For text variant
	export let showIcon: boolean = false;
</script>

<div class="skeleton-container {variant}" class:animated style="width: {width}; height: {height};">
	{#if variant === 'card'}
		<div class="skeleton-card" class:rounded>
			{#if showIcon}
				<div class="skeleton-icon"></div>
			{/if}
			<div class="skeleton-content">
				<div class="skeleton-line skeleton-title"></div>
				<div class="skeleton-line skeleton-subtitle"></div>
				<div class="skeleton-line skeleton-text"></div>
			</div>
		</div>
	{:else if variant === 'chart'}
		<div class="skeleton-chart" class:rounded>
			<div class="skeleton-chart-header">
				<div class="skeleton-line skeleton-chart-title"></div>
				<div class="skeleton-chart-legend">
					<div class="skeleton-legend-item"></div>
					<div class="skeleton-legend-item"></div>
				</div>
			</div>
			<div class="skeleton-chart-body">
				<div class="skeleton-chart-bars">
					{#each Array(8) as _, i}
						<div class="skeleton-bar" style="height: {Math.random() * 60 + 20}%"></div>
					{/each}
				</div>
				<div class="skeleton-chart-axis"></div>
			</div>
		</div>
	{:else if variant === 'button'}
		<div class="skeleton-button" class:rounded></div>
	{:else if variant === 'text'}
		<div class="skeleton-text-block">
			{#each Array(lines) as _, i}
				<div
					class="skeleton-line"
					style="width: {i === lines - 1 ? Math.random() * 40 + 60 : 100}%"
				></div>
			{/each}
		</div>
	{:else if variant === 'avatar'}
		<div class="skeleton-avatar" class:rounded></div>
	{:else if variant === 'stats'}
		<div class="skeleton-stats" class:rounded>
			<div class="skeleton-stats-header">
				<div class="skeleton-stats-icon"></div>
				<div class="skeleton-stats-trend"></div>
			</div>
			<div class="skeleton-stats-content">
				<div class="skeleton-stats-value"></div>
				<div class="skeleton-stats-label"></div>
			</div>
		</div>
	{/if}

	<!-- Shimmer overlay -->
	{#if animated}
		<div class="skeleton-shimmer"></div>
	{/if}
</div>

<style>
	.skeleton-container {
		position: relative;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(8px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.skeleton-container.rounded {
		border-radius: 1rem;
	}

	.skeleton-shimmer {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.4) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite ease-in-out;
		z-index: 1;
	}

	.skeleton-container.animated .skeleton-shimmer {
		animation-duration: 2s;
	}

	/* Card Skeleton */
	.skeleton-card {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: 200px;
	}

	.skeleton-icon {
		width: 3rem;
		height: 3rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.75rem;
		margin-bottom: 0.5rem;
	}

	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.skeleton-line {
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.25rem;
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-title {
		height: 1.5rem;
		width: 70%;
	}

	.skeleton-subtitle {
		height: 1rem;
		width: 50%;
	}

	.skeleton-text {
		height: 0.875rem;
		width: 90%;
	}

	/* Chart Skeleton */
	.skeleton-chart {
		padding: 1rem;
		min-height: 300px;
		display: flex;
		flex-direction: column;
	}

	.skeleton-chart-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.skeleton-chart-title {
		height: 1.25rem;
		width: 40%;
	}

	.skeleton-chart-legend {
		display: flex;
		gap: 1rem;
	}

	.skeleton-legend-item {
		width: 4rem;
		height: 0.75rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.25rem;
	}

	.skeleton-chart-body {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
	}

	.skeleton-chart-bars {
		display: flex;
		align-items: flex-end;
		gap: 0.5rem;
		height: 200px;
		margin-bottom: 1rem;
	}

	.skeleton-bar {
		flex: 1;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.25rem 0.25rem 0 0;
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-bar:nth-child(odd) {
		animation-delay: 0.2s;
	}

	.skeleton-chart-axis {
		height: 1px;
		background: rgba(156, 163, 175, 0.2);
	}

	/* Button Skeleton */
	.skeleton-button {
		height: 2.5rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.5rem;
		animation: pulse 2s infinite ease-in-out;
	}

	/* Text Skeleton */
	.skeleton-text-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	/* Avatar Skeleton */
	.skeleton-avatar {
		width: 3rem;
		height: 3rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 50%;
		animation: pulse 2s infinite ease-in-out;
	}

	.skeleton-avatar.rounded {
		border-radius: 0.75rem;
	}

	/* Stats Skeleton */
	.skeleton-stats {
		padding: 1.5rem;
		min-height: 140px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.skeleton-stats-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.skeleton-stats-icon {
		width: 3.5rem;
		height: 3.5rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.75rem;
	}

	.skeleton-stats-trend {
		width: 2rem;
		height: 2rem;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.5rem;
	}

	.skeleton-stats-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-stats-value {
		height: 2rem;
		width: 60%;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.25rem;
	}

	.skeleton-stats-label {
		height: 1rem;
		width: 40%;
		background: rgba(156, 163, 175, 0.3);
		border-radius: 0.25rem;
	}

	/* Animations */
	@keyframes shimmer {
		0% {
			left: -100%;
		}
		100% {
			left: 100%;
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.6;
		}
	}

	/* Responsive Design */
	@media (max-width: 480px) {
		.skeleton-card {
			padding: 1rem;
			min-height: 160px;
		}

		.skeleton-chart {
			padding: 0.75rem;
			min-height: 240px;
		}

		.skeleton-chart-bars {
			height: 150px;
		}

		.skeleton-stats {
			padding: 1rem;
			min-height: 120px;
		}

		.skeleton-stats-icon {
			width: 2.75rem;
			height: 2.75rem;
		}
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.skeleton-shimmer {
			animation: none;
			opacity: 0;
		}

		.skeleton-line,
		.skeleton-bar,
		.skeleton-button,
		.skeleton-avatar {
			animation: none;
			opacity: 0.6;
		}
	}
</style>
