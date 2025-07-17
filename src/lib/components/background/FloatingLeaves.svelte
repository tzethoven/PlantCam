<script lang="ts">
	import { onMount } from 'svelte';

	export let leafCount = 12;
	export let animationSpeed = 'normal'; // 'slow' | 'normal' | 'fast'

	let leaves: Array<{
		id: number;
		size: number;
		color: string;
		startX: number;
		animationDuration: number;
		animationDelay: number;
		rotationDuration: number;
		opacity: number;
	}> = [];

	const leafColors = [
		'#22c55e', // green-500
		'#16a34a', // green-600
		'#15803d', // green-700
		'#166534', // green-800
		'#14532d', // green-900
		'#84cc16', // lime-500
		'#65a30d', // lime-600
		'#eab308', // yellow-500
		'#ca8a04', // yellow-600
		'#f97316', // orange-500
		'#ea580c' // orange-600
	];

	const speedMultipliers: Record<typeof animationSpeed, number> = {
		slow: 1.5,
		normal: 1,
		fast: 0.7
	};

	onMount(() => {
		// Generate random leaf properties
		leaves = Array.from({ length: leafCount }, (_, i) => ({
			id: i,
			size: Math.random() * 20 + 15, // 15-35px
			color: leafColors[Math.floor(Math.random() * leafColors.length)],
			startX: Math.random() * 100, // 0-100%
			animationDuration: (Math.random() * 15 + 20) * speedMultipliers[animationSpeed], // 20-35s
			animationDelay: Math.random() * 10, // 0-10s delay
			rotationDuration: (Math.random() * 8 + 12) * speedMultipliers[animationSpeed], // 12-20s
			opacity: Math.random() * 0.5 + 0.5 // 0.5-1.0 (more visible)
		}));
	});
</script>

<div class="floating-leaves-container" aria-hidden="true">
	{#each leaves as leaf (leaf.id)}
		<div
			class="leaf"
			style="
				--leaf-size: {leaf.size}px;
				--leaf-color: {leaf.color};
				--start-x: {leaf.startX}%;
				--float-duration: {leaf.animationDuration}s;
				--float-delay: {leaf.animationDelay}s;
				--rotation-duration: {leaf.rotationDuration}s;
				--leaf-opacity: {leaf.opacity};
			"
		>
			<svg
				width={leaf.size}
				height={leaf.size}
				viewBox="0 0 24 24"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<!-- Leaf shape with natural curves -->
				<path
					d="M12 2C12 2 8 6 8 12C8 16 10 18 12 18C14 18 16 16 16 12C16 6 12 2 12 2Z"
					fill="currentColor"
					opacity="0.8"
				/>
				<path
					d="M12 2C12 2 15 5 15 10C15 13 13.5 15 12 15"
					stroke="currentColor"
					stroke-width="0.5"
					fill="none"
					opacity="0.6"
				/>
				<!-- Leaf vein -->
				<path d="M12 4L12 16" stroke="currentColor" stroke-width="0.3" opacity="0.4" />
			</svg>
		</div>
	{/each}
</div>

<style>
	.floating-leaves-container {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 5;
		overflow: hidden;
	}

	.leaf {
		position: absolute;
		color: var(--leaf-color);
		opacity: var(--leaf-opacity);
		left: var(--start-x);
		top: 0;
		animation: floatAndRotate var(--float-duration) linear infinite var(--float-delay);
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateZ(0);
		backface-visibility: hidden;
		contain: layout style paint;
	}

	/* Combined animation - leaves fall, rotate, and sway */
	@keyframes floatAndRotate {
		0% {
			transform: translateY(-10vh) translateX(0px) rotate(0deg);
			opacity: 0;
		}
		10% {
			opacity: var(--leaf-opacity);
		}
		25% {
			transform: translateY(25vh) translateX(15px) rotate(90deg);
		}
		50% {
			transform: translateY(50vh) translateX(-10px) rotate(180deg);
		}
		75% {
			transform: translateY(75vh) translateX(20px) rotate(270deg);
		}
		90% {
			opacity: var(--leaf-opacity);
		}
		100% {
			transform: translateY(110vh) translateX(100px) rotate(360deg);
			opacity: 0;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.leaf {
			animation: none;
			opacity: 0.5;
			position: absolute;
			transform: translateY(50vh);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.leaf:nth-child(n + 8) {
			display: none;
		}
	}

	@media (max-width: 480px) {
		.leaf:nth-child(n + 6) {
			display: none;
		}
	}
</style>
