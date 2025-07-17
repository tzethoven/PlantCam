<script lang="ts">
	import { onMount } from 'svelte';

	export let dropCount = 8;
	export let animationSpeed = 'normal'; // 'slow' | 'normal' | 'fast'

	let dewdrops: Array<{
		id: number;
		size: number;
		x: number;
		y: number;
		animationDuration: number;
		animationDelay: number;
		cycleDuration: number;
		opacity: number;
		blur: number;
	}> = [];

	const speedMultipliers: Record<typeof animationSpeed, number> = {
		slow: 1.5,
		normal: 1,
		fast: 0.7
	};

	onMount(() => {
		// Generate random dewdrop properties
		dewdrops = Array.from({ length: dropCount }, (_, i) => ({
			id: i,
			size: Math.random() * 12 + 8, // 8-20px (much larger)
			x: Math.random() * 90 + 5, // 5-95% (avoid edges)
			y: Math.random() * 80 + 10, // 10-90% (avoid top/bottom edges)
			animationDuration: (Math.random() * 3 + 2) * speedMultipliers[animationSpeed], // 2-5s growth cycle
			animationDelay: Math.random() * 20, // 0-20s delay
			cycleDuration: (Math.random() * 15 + 10) * speedMultipliers[animationSpeed], // 10-25s full cycle
			opacity: Math.random() * 0.6 + 0.4, // 0.4-1.0 (more visible)
			blur: Math.random() * 0.5 + 0.2 // 0.2-0.7px blur
		}));
	});
</script>

<div class="dewdrops-container" aria-hidden="true">
	{#each dewdrops as drop (drop.id)}
		<div
			class="dewdrop"
			style="
				--drop-size: {drop.size}px;
				--drop-x: {drop.x}%;
				--drop-y: {drop.y}%;
				--growth-duration: {drop.animationDuration}s;
				--growth-delay: {drop.animationDelay}s;
				--cycle-duration: {drop.cycleDuration}s;
				--drop-opacity: {drop.opacity};
				--drop-blur: {drop.blur}px;
			"
		>
			<div class="dewdrop-inner">
				<div class="dewdrop-highlight"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.dewdrops-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 6; /* On top of floating leaves */
		overflow: hidden;
	}

	.dewdrop {
		position: absolute;
		left: var(--drop-x);
		top: var(--drop-y);
		width: var(--drop-size);
		height: var(--drop-size);
		opacity: 0;
		animation:
			dewdropCycle var(--cycle-duration) ease-in-out infinite var(--growth-delay),
			subtleFloat calc(var(--cycle-duration) * 0.3) ease-in-out infinite var(--growth-delay);
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateZ(0);
		backface-visibility: hidden;
		contain: layout style paint;
	}

	.dewdrop-inner {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(
			circle at 30% 30%,
			rgba(255, 255, 255, 0.9) 0%,
			rgba(255, 255, 255, 0.7) 20%,
			rgba(173, 216, 230, 0.6) 40%,
			rgba(135, 206, 235, 0.4) 70%,
			rgba(100, 149, 237, 0.2) 100%
		);
		box-shadow:
			inset 0 1px 2px rgba(255, 255, 255, 0.8),
			inset 0 -1px 1px rgba(0, 0, 0, 0.1),
			0 1px 3px rgba(0, 0, 0, 0.2),
			0 0 8px rgba(173, 216, 230, 0.3);
		filter: blur(var(--drop-blur));
		position: relative;
		overflow: hidden;
		/* Performance optimizations */
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.dewdrop-highlight {
		position: absolute;
		top: 15%;
		left: 25%;
		width: 30%;
		height: 30%;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgba(255, 255, 255, 0.9) 0%,
			rgba(255, 255, 255, 0.4) 50%,
			transparent 100%
		);
		animation: highlightShimmer calc(var(--cycle-duration) * 0.5) ease-in-out infinite;
	}

	/* Main dewdrop lifecycle animation */
	@keyframes dewdropCycle {
		0% {
			opacity: 0;
			transform: scale(0);
		}
		15% {
			opacity: calc(var(--drop-opacity) * 0.3);
			transform: scale(0.3);
		}
		30% {
			opacity: calc(var(--drop-opacity) * 0.7);
			transform: scale(0.7);
		}
		50% {
			opacity: var(--drop-opacity);
			transform: scale(1);
		}
		70% {
			opacity: var(--drop-opacity);
			transform: scale(1.1);
		}
		85% {
			opacity: calc(var(--drop-opacity) * 0.5);
			transform: scale(0.8);
		}
		100% {
			opacity: 0;
			transform: scale(0);
		}
	}

	/* Subtle floating motion */
	@keyframes subtleFloat {
		0%,
		100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-2px);
		}
	}

	/* Highlight shimmer effect */
	@keyframes highlightShimmer {
		0%,
		100% {
			opacity: 0.9;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(1.2);
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.dewdrop {
			animation: none;
			opacity: calc(var(--drop-opacity) * 0.3);
			transform: scale(0.8);
		}

		.dewdrop-highlight {
			animation: none;
			opacity: 0.7;
		}

		.dewdrops-container {
			opacity: 0.5;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.dewdrop:nth-child(n + 6) {
			display: none;
		}

		.dewdrop-inner {
			filter: blur(calc(var(--drop-blur) * 0.7));
		}
	}

	@media (max-width: 480px) {
		.dewdrop:nth-child(n + 5) {
			display: none;
		}

		.dewdrop {
			opacity: calc(var(--drop-opacity) * 0.8);
		}
	}

	/* Enhanced effects for larger screens */
	@media (min-width: 1200px) {
		.dewdrop-inner {
			box-shadow:
				inset 0 1px 3px rgba(255, 255, 255, 0.9),
				inset 0 -1px 2px rgba(0, 0, 0, 0.15),
				0 2px 6px rgba(0, 0, 0, 0.25),
				0 0 12px rgba(173, 216, 230, 0.4);
		}
	}

	/* Special positioning for plant-like areas */
	.dewdrop:nth-child(1) {
		--drop-x: 15%;
		--drop-y: 25%;
	}
	.dewdrop:nth-child(2) {
		--drop-x: 75%;
		--drop-y: 35%;
	}
	.dewdrop:nth-child(3) {
		--drop-x: 45%;
		--drop-y: 60%;
	}
	.dewdrop:nth-child(4) {
		--drop-x: 85%;
		--drop-y: 70%;
	}
	.dewdrop:nth-child(5) {
		--drop-x: 25%;
		--drop-y: 80%;
	}
	.dewdrop:nth-child(6) {
		--drop-x: 65%;
		--drop-y: 20%;
	}
	.dewdrop:nth-child(7) {
		--drop-x: 35%;
		--drop-y: 45%;
	}
	.dewdrop:nth-child(8) {
		--drop-x: 55%;
		--drop-y: 85%;
	}
</style>
