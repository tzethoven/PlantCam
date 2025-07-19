<script lang="ts">
	import { onMount } from 'svelte';
	import FloatingLeaves from './FloatingLeaves.svelte';
	import SunlightRays from './SunlightRays.svelte';
	import Dewdrops from './Dewdrops.svelte';

	// Animation control props
	export let animationSpeed: 'slow' | 'normal' | 'fast' = 'normal';
	export let enableLeaves = true;
	export let enableSunlight = true;
	export let enableDewdrops = true;

	// Customization props
	export let leafCount = 12;
	export let rayCount = 6;
	export let dropCount = 8;

	// Reduced motion detection
	let prefersReducedMotion = false;

	onMount(() => {
		// Check for reduced motion preference
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;

		// Listen for changes to the preference
		const handleChange = (e: MediaQueryListEvent) => {
			prefersReducedMotion = e.matches;
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
</script>

<!-- Animated nature background layers -->
<div class="nature-background" aria-hidden="true">
	{#if prefersReducedMotion}
		<!-- Static nature elements for reduced motion -->
		{#if enableSunlight}
			<div class="static-sunlight" />
		{/if}
		{#if enableLeaves}
			<div class="static-leaves">
				{#each Array.from({ length: Math.min(leafCount, 6) }, (_, i) => i) as i (i)}
					<div class="static-leaf static-leaf-{i + 1}">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
							<path
								d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z"
								fill="currentColor"
								opacity="0.6"
							/>
						</svg>
					</div>
				{/each}
			</div>
		{/if}
		{#if enableDewdrops}
			<div class="static-dewdrops">
				{#each Array.from({ length: Math.min(dropCount, 4) }, (_, i) => i) as i (i)}
					<div class="static-dewdrop static-dewdrop-{i + 1}" />
				{/each}
			</div>
		{/if}
	{:else}
		<!-- Animated elements for users who don't prefer reduced motion -->
		{#if enableSunlight}
			<SunlightRays {rayCount} {animationSpeed} />
		{/if}

		{#if enableLeaves}
			<FloatingLeaves {leafCount} {animationSpeed} />
		{/if}

		{#if enableDewdrops}
			<Dewdrops {dropCount} {animationSpeed} />
		{/if}
	{/if}
</div>

<style>
	.nature-background {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1;
		overflow: hidden;
	}

	/* Static alternatives for reduced motion */
	.static-sunlight {
		position: absolute;
		top: 10%;
		left: 20%;
		width: 200px;
		height: 300px;
		background: linear-gradient(
			45deg,
			rgba(255, 235, 59, 0.3) 0%,
			rgba(255, 193, 7, 0.2) 50%,
			transparent 100%
		);
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		filter: blur(1px);
		opacity: 0.7;
	}

	.static-leaves {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.static-leaf {
		position: absolute;
		color: #22c55e;
		opacity: 0.6;
	}

	.static-leaf-1 {
		top: 20%;
		left: 15%;
		color: #16a34a;
	}

	.static-leaf-2 {
		top: 35%;
		right: 25%;
		color: #22c55e;
	}

	.static-leaf-3 {
		top: 60%;
		left: 30%;
		color: #15803d;
	}

	.static-leaf-4 {
		top: 45%;
		right: 40%;
		color: #84cc16;
	}

	.static-leaf-5 {
		top: 75%;
		left: 60%;
		color: #eab308;
	}

	.static-leaf-6 {
		top: 25%;
		left: 70%;
		color: #f97316;
	}

	.static-dewdrops {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.static-dewdrop {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: radial-gradient(
			circle at 30% 30%,
			rgba(255, 255, 255, 0.8) 0%,
			rgba(173, 216, 230, 0.5) 40%,
			rgba(135, 206, 235, 0.3) 100%
		);
		box-shadow:
			inset 0 1px 2px rgba(255, 255, 255, 0.6),
			0 1px 3px rgba(0, 0, 0, 0.1);
		opacity: 0.7;
	}

	.static-dewdrop-1 {
		top: 25%;
		left: 20%;
	}

	.static-dewdrop-2 {
		top: 50%;
		right: 30%;
	}

	.static-dewdrop-3 {
		top: 70%;
		left: 45%;
	}

	.static-dewdrop-4 {
		top: 40%;
		right: 15%;
	}

	/* Ensure static elements are properly positioned on mobile */
	@media (max-width: 768px) {
		.static-sunlight {
			width: 150px;
			height: 200px;
		}

		.static-leaf {
			transform: scale(0.8);
		}

		.static-dewdrop {
			width: 10px;
			height: 10px;
		}
	}
</style>
