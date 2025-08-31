<script lang="ts">
	import '../app.css';
	import NotificationContainer from '$lib/components/ui/NotificationContainer.svelte';
	import AuthGuard from '$lib/components/auth/AuthGuard.svelte';
	import AnimatedNatureBackground from '$lib/components/background/AnimatedNatureBackground.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onMount } from 'svelte';

	let { children } = $props();

	// Define public routes that don't require authentication
	const publicRoutes = ['/login', '/signup', '/two-factor/verify'];

	// Background configuration based on route
	let showBackground = true;
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	// Determine background settings based on current route using derived state
	const backgroundVariant = $derived.by(() => {
		if (!browser || !page?.url?.pathname) return 'default';

		const currentPath = page.url.pathname;
		return publicRoutes.includes(currentPath) ? 'auth' : 'default';
	});
</script>

<!-- Animated Nature Background - conditionally rendered -->
{#if showBackground && mounted}
	<AnimatedNatureBackground
		animationSpeed={backgroundVariant === 'auth' ? 'slow' : 'normal'}
		enableLeaves={true}
		enableSunlight={true}
		enableDewdrops={backgroundVariant === 'auth'}
		leafCount={backgroundVariant === 'auth' ? 8 : 12}
		rayCount={backgroundVariant === 'auth' ? 4 : 6}
		dropCount={backgroundVariant === 'auth' ? 6 : 8}
	/>
{/if}

<!-- Main Application Content -->
<div class="app-container" class:auth-layout={backgroundVariant === 'auth'} class:mounted>
	{#if browser && publicRoutes.includes(page.url.pathname)}
		{@render children()}
	{:else if browser}
		<AuthGuard>
			{@render children()}
		</AuthGuard>
	{:else}
		<!-- SSR fallback - render without auth check -->
		{@render children()}
	{/if}
</div>

<!-- Global Notification Container -->
<NotificationContainer position="top-right" />

<style>
	:global(body) {
		margin: 0;
	}
	.app-container {
		position: relative;
		z-index: 10;
		min-height: 100vh;
		opacity: 0;
		transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.app-container.mounted {
		opacity: 1;
	}

	/* Auth layout specific styling */
	.app-container.auth-layout {
		/* Ensure auth pages have proper backdrop for glass morphism */
		background: rgba(255, 255, 255, 0.02);
		backdrop-filter: blur(1px);
	}

	/* Global background overlay for better contrast on auth pages */
	.app-container.auth-layout::before {
		content: '';
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			rgba(240, 253, 244, 0.1) 0%,
			rgba(220, 252, 231, 0.05) 25%,
			rgba(224, 242, 254, 0.05) 75%,
			rgba(240, 249, 255, 0.1) 100%
		);
		pointer-events: none;
		z-index: 5;
	}

	/* Ensure proper z-index stacking */
	:global(.nature-background) {
		z-index: 1 !important;
	}

	:global(.notification-container) {
		z-index: 1000 !important;
	}

	/* Enhanced glass morphism support for auth pages */
	.app-container.auth-layout :global(.glass-card),
	.app-container.auth-layout :global(.glass-morphism) {
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	/* Ensure consistent transitions across all pages */
	.app-container :global(*) {
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Consistent focus states across all pages */
	.app-container :global(.focus-ring:focus-visible) {
		outline: none;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #22c55e,
			0 0 20px rgba(34, 197, 94, 0.3);
		transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.app-container.auth-layout::before {
			background: linear-gradient(
				135deg,
				rgba(240, 253, 244, 0.15) 0%,
				rgba(220, 252, 231, 0.08) 25%,
				rgba(224, 242, 254, 0.08) 75%,
				rgba(240, 249, 255, 0.15) 100%
			);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.app-container {
			transition: none;
			opacity: 1;
		}
	}
</style>
