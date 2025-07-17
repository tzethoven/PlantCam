<script lang="ts">
	import { onMount } from 'svelte';

	export let rayCount = 6;
	export let animationSpeed = 'normal'; // 'slow' | 'normal' | 'fast'

	let rays: Array<{
		id: number;
		width: number;
		height: number;
		startX: number;
		startY: number;
		angle: number;
		animationDuration: number;
		animationDelay: number;
		opacity: number;
		gradient: string;
	}> = [];

	const speedMultipliers: Record<typeof animationSpeed, number> = {
		slow: 1.5,
		normal: 1,
		fast: 0.7
	};

	const sunlightGradients = [
		'linear-gradient(45deg, rgba(255, 235, 59, 0.4) 0%, rgba(255, 193, 7, 0.25) 50%, transparent 100%)',
		'linear-gradient(60deg, rgba(255, 213, 79, 0.35) 0%, rgba(255, 183, 77, 0.2) 50%, transparent 100%)',
		'linear-gradient(30deg, rgba(255, 245, 157, 0.45) 0%, rgba(255, 224, 130, 0.3) 50%, transparent 100%)',
		'linear-gradient(75deg, rgba(255, 238, 88, 0.38) 0%, rgba(255, 202, 40, 0.23) 50%, transparent 100%)',
		'linear-gradient(15deg, rgba(255, 241, 118, 0.42) 0%, rgba(255, 214, 64, 0.27) 50%, transparent 100%)'
	];

	onMount(() => {
		// Generate random ray properties
		rays = Array.from({ length: rayCount }, (_, i) => ({
			id: i,
			width: Math.random() * 150 + 100, // 100-250px
			height: Math.random() * 300 + 200, // 200-500px
			startX: Math.random() * 120 - 10, // -10% to 110% (allows rays to start off-screen)
			startY: Math.random() * 60 - 20, // -20% to 40% (upper portion of screen)
			angle: Math.random() * 30 - 15, // -15 to 15 degrees
			animationDuration: (Math.random() * 20 + 25) * speedMultipliers[animationSpeed], // 25-45s
			animationDelay: Math.random() * 15, // 0-15s delay
			opacity: Math.random() * 0.5 + 0.4, // 0.4-0.9 (much more visible)
			gradient: sunlightGradients[Math.floor(Math.random() * sunlightGradients.length)]
		}));
	});
</script>

<div class="sunlight-rays-container" aria-hidden="true">
	{#each rays as ray (ray.id)}
		<div
			class="sunlight-ray"
			style="
				--ray-width: {ray.width}px;
				--ray-height: {ray.height}px;
				--start-x: {ray.startX}%;
				--start-y: {ray.startY}%;
				--ray-angle: {ray.angle}deg;
				--sweep-duration: {ray.animationDuration}s;
				--sweep-delay: {ray.animationDelay}s;
				--ray-opacity: {ray.opacity};
				--ray-gradient: {ray.gradient};
			"
		></div>
	{/each}
</div>

<style>
	.sunlight-rays-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 1; /* Behind floating leaves */
		overflow: hidden;
	}

	.sunlight-ray {
		position: absolute;
		width: var(--ray-width);
		height: var(--ray-height);
		left: var(--start-x);
		top: var(--start-y);
		background: var(--ray-gradient);
		opacity: var(--ray-opacity);
		transform: rotate(var(--ray-angle));
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		filter: blur(1px);
		animation:
			sweepAcross var(--sweep-duration) ease-in-out infinite var(--sweep-delay),
			fadeInOut calc(var(--sweep-duration) / 3) ease-in-out infinite var(--sweep-delay),
			gentleRotate calc(var(--sweep-duration) * 2) linear infinite var(--sweep-delay);
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: rotate(var(--ray-angle)) translateZ(0);
		backface-visibility: hidden;
		contain: layout style paint;
	}

	/* Main sweeping animation - rays move across the screen */
	@keyframes sweepAcross {
		0% {
			transform: translateX(-50px) translateY(-20px) rotate(var(--ray-angle)) scale(0.8);
		}
		25% {
			transform: translateX(20px) translateY(10px) rotate(calc(var(--ray-angle) + 2deg)) scale(1);
		}
		50% {
			transform: translateX(40px) translateY(20px) rotate(calc(var(--ray-angle) - 1deg)) scale(1.1);
		}
		75% {
			transform: translateX(60px) translateY(30px) rotate(calc(var(--ray-angle) + 1deg)) scale(1);
		}
		100% {
			transform: translateX(100px) translateY(50px) rotate(var(--ray-angle)) scale(0.9);
		}
	}

	/* Opacity animation for realistic sunlight filtering */
	@keyframes fadeInOut {
		0%,
		100% {
			opacity: calc(var(--ray-opacity) * 0.3);
		}
		50% {
			opacity: var(--ray-opacity);
		}
	}

	/* Gentle rotation for natural light movement */
	@keyframes gentleRotate {
		0% {
			transform: rotate(var(--ray-angle));
		}
		25% {
			transform: rotate(calc(var(--ray-angle) + 3deg));
		}
		50% {
			transform: rotate(calc(var(--ray-angle) - 2deg));
		}
		75% {
			transform: rotate(calc(var(--ray-angle) + 1deg));
		}
		100% {
			transform: rotate(var(--ray-angle));
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.sunlight-ray {
			animation: none;
			opacity: calc(var(--ray-opacity) * 0.5);
			transform: rotate(var(--ray-angle));
		}

		.sunlight-rays-container {
			opacity: 0.3;
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.sunlight-ray:nth-child(n + 5) {
			display: none;
		}

		.sunlight-ray {
			filter: blur(0.5px);
		}
	}

	@media (max-width: 480px) {
		.sunlight-ray:nth-child(n + 4) {
			display: none;
		}

		.sunlight-ray {
			opacity: calc(var(--ray-opacity) * 0.7);
		}
	}

	/* Enhanced visual effects for larger screens */
	@media (min-width: 1200px) {
		.sunlight-ray {
			filter: blur(1.5px);
		}
	}
</style>
