<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let title: string = '';
	export let message: string = '';
	export let duration: number = 4000; // Auto-dismiss after 4 seconds
	export let dismissible: boolean = true;
	export let showIcon: boolean = true;
	export let showProgress: boolean = true;
	export let position:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center' = 'top-right';

	const dispatch = createEventDispatcher();

	let visible = true;
	let progressWidth = 100;
	let progressInterval: NodeJS.Timeout;
	let autoCloseTimeout: NodeJS.Timeout;

	// Icon mapping
	const icons = {
		success: '✅',
		error: '❌',
		warning: '⚠️',
		info: 'ℹ️'
	};

	// Color schemes
	const colorSchemes = {
		success: {
			bg: 'rgba(34, 197, 94, 0.1)',
			border: 'rgba(34, 197, 94, 0.3)',
			text: '#065f46',
			accent: '#22c55e'
		},
		error: {
			bg: 'rgba(239, 68, 68, 0.1)',
			border: 'rgba(239, 68, 68, 0.3)',
			text: '#7f1d1d',
			accent: '#ef4444'
		},
		warning: {
			bg: 'rgba(251, 191, 36, 0.1)',
			border: 'rgba(251, 191, 36, 0.3)',
			text: '#78350f',
			accent: '#fbbf24'
		},
		info: {
			bg: 'rgba(59, 130, 246, 0.1)',
			border: 'rgba(59, 130, 246, 0.3)',
			text: '#1e3a8a',
			accent: '#3b82f6'
		}
	};

	function dismiss() {
		visible = false;
		clearTimers();
		setTimeout(() => {
			dispatch('dismiss');
		}, 300); // Wait for exit animation
		triggerHapticFeedback();
	}

	function clearTimers() {
		if (progressInterval) clearInterval(progressInterval);
		if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
	}

	function startAutoClose() {
		if (duration > 0) {
			// Progress bar animation
			const progressStep = 100 / (duration / 50);
			progressInterval = setInterval(() => {
				progressWidth -= progressStep;
				if (progressWidth <= 0) {
					dismiss();
				}
			}, 50);

			// Auto-close timeout
			autoCloseTimeout = setTimeout(dismiss, duration);
		}
	}

	function pauseAutoClose() {
		clearTimers();
	}

	function resumeAutoClose() {
		if (duration > 0 && visible) {
			const remainingDuration = (progressWidth / 100) * duration;
			const progressStep = progressWidth / (remainingDuration / 50);

			progressInterval = setInterval(() => {
				progressWidth -= progressStep;
				if (progressWidth <= 0) {
					dismiss();
				}
			}, 50);

			autoCloseTimeout = setTimeout(dismiss, remainingDuration);
		}
	}

	// Haptic feedback for mobile
	function triggerHapticFeedback() {
		if ('vibrate' in navigator) {
			// Different vibration patterns for different types
			const patterns = {
				success: [100],
				error: [100, 50, 100],
				warning: [150],
				info: [50]
			};
			navigator.vibrate(patterns[type]);
		}
	}

	onMount(() => {
		startAutoClose();
		triggerHapticFeedback();

		return () => {
			clearTimers();
		};
	});

	$: scheme = colorSchemes[type];
</script>

{#if visible}
	<div
		class="toast-container {position}"
		in:fly={{ y: position.includes('top') ? -100 : 100, duration: 400, easing: quintOut }}
		out:fly={{ y: position.includes('top') ? -100 : 100, duration: 300, easing: quintOut }}
		on:mouseenter={pauseAutoClose}
		on:mouseleave={resumeAutoClose}
		role="alert"
		aria-live="polite"
	>
		<div
			class="toast {type}"
			style="
				background: {scheme.bg};
				border-color: {scheme.border};
				color: {scheme.text};
			"
			in:scale={{ duration: 300, easing: quintOut }}
		>
			<!-- Icon -->
			{#if showIcon}
				<div class="toast-icon" style="color: {scheme.accent}">
					<span class="icon-emoji">{icons[type]}</span>
					<div class="icon-pulse" style="background: {scheme.accent}"></div>
				</div>
			{/if}

			<!-- Content -->
			<div class="toast-content">
				{#if title}
					<h4 class="toast-title">{title}</h4>
				{/if}
				{#if message}
					<p class="toast-message">{message}</p>
				{/if}
			</div>

			<!-- Dismiss Button -->
			{#if dismissible}
				<button
					class="toast-dismiss"
					on:click={dismiss}
					aria-label="Dismiss notification"
					style="color: {scheme.accent}"
				>
					<span class="dismiss-icon">×</span>
				</button>
			{/if}

			<!-- Progress Bar -->
			{#if showProgress && duration > 0}
				<div class="toast-progress">
					<div
						class="progress-bar"
						style="
							width: {progressWidth}%;
							background: {scheme.accent};
						"
					></div>
				</div>
			{/if}

			<!-- Success Animation Overlay -->
			{#if type === 'success'}
				<div class="success-animation">
					<div class="success-checkmark">
						<div class="check-icon">
							<span class="check-left"></span>
							<span class="check-right"></span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Error Animation Overlay -->
			{#if type === 'error'}
				<div class="error-animation">
					<div class="error-shake"></div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		z-index: 1000;
		pointer-events: none;
	}

	.toast-container.top-right {
		top: 1rem;
		right: 1rem;
	}

	.toast-container.top-left {
		top: 1rem;
		left: 1rem;
	}

	.toast-container.bottom-right {
		bottom: 1rem;
		right: 1rem;
	}

	.toast-container.bottom-left {
		bottom: 1rem;
		left: 1rem;
	}

	.toast-container.top-center {
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.toast-container.bottom-center {
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.toast {
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		min-width: 300px;
		max-width: 400px;
		backdrop-filter: blur(20px);
		border: 1px solid;
		border-radius: 0.75rem;
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		pointer-events: auto;
		overflow: hidden;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.toast:hover {
		transform: translateY(-2px);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.15),
			0 20px 20px -5px rgba(0, 0, 0, 0.08);
	}

	.toast-icon {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		flex-shrink: 0;
	}

	.icon-emoji {
		font-size: 1.25rem;
		position: relative;
		z-index: 2;
	}

	.icon-pulse {
		position: absolute;
		inset: 0;
		border-radius: 50%;
		opacity: 0.2;
		animation: iconPulse 2s infinite;
	}

	.toast-content {
		flex: 1;
		min-width: 0;
	}

	.toast-title {
		margin: 0 0 0.25rem 0;
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.25;
	}

	.toast-message {
		margin: 0;
		font-size: 0.8125rem;
		line-height: 1.4;
		opacity: 0.9;
	}

	.toast-dismiss {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		background: none;
		border: none;
		cursor: pointer;
		border-radius: 0.25rem;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.toast-dismiss:hover {
		background: rgba(0, 0, 0, 0.1);
		transform: scale(1.1);
	}

	.dismiss-icon {
		font-size: 1.25rem;
		font-weight: bold;
		line-height: 1;
	}

	.toast-progress {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: rgba(0, 0, 0, 0.1);
	}

	.progress-bar {
		height: 100%;
		transition: width 0.05s linear;
		border-radius: 0 0 0.75rem 0.75rem;
	}

	/* Success Animation */
	.success-animation {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		opacity: 0;
		animation: successFadeIn 0.6s ease-out 0.2s forwards;
	}

	.success-checkmark {
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: rgba(34, 197, 94, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.check-icon {
		position: relative;
		width: 0.75rem;
		height: 0.75rem;
	}

	.check-left,
	.check-right {
		position: absolute;
		background: #22c55e;
		border-radius: 1px;
	}

	.check-left {
		width: 2px;
		height: 6px;
		left: 2px;
		top: 3px;
		transform: rotate(45deg);
		animation: checkLeft 0.3s ease-out 0.4s forwards;
		transform-origin: bottom;
		scale: 0;
	}

	.check-right {
		width: 2px;
		height: 10px;
		right: 1px;
		top: 1px;
		transform: rotate(-45deg);
		animation: checkRight 0.3s ease-out 0.6s forwards;
		transform-origin: bottom;
		scale: 0;
	}

	/* Error Animation */
	.error-animation {
		position: absolute;
		inset: 0;
		pointer-events: none;
		animation: errorShake 0.5s ease-in-out;
	}

	.error-shake {
		position: absolute;
		inset: -2px;
		border: 2px solid rgba(239, 68, 68, 0.3);
		border-radius: 0.75rem;
		animation: errorBorder 0.5s ease-in-out;
	}

	/* Animations */
	@keyframes iconPulse {
		0%,
		100% {
			transform: scale(1);
			opacity: 0.2;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.4;
		}
	}

	@keyframes successFadeIn {
		0% {
			opacity: 0;
			transform: scale(0.8);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes checkLeft {
		0% {
			scale: 0;
		}
		100% {
			scale: 1;
		}
	}

	@keyframes checkRight {
		0% {
			scale: 0;
		}
		100% {
			scale: 1;
		}
	}

	@keyframes errorShake {
		0%,
		100% {
			transform: translateX(0);
		}
		10%,
		30%,
		50%,
		70%,
		90% {
			transform: translateX(-4px);
		}
		20%,
		40%,
		60%,
		80% {
			transform: translateX(4px);
		}
	}

	@keyframes errorBorder {
		0% {
			opacity: 0;
			transform: scale(1.1);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1);
		}
	}

	/* Responsive Design */
	@media (max-width: 480px) {
		.toast-container.top-right,
		.toast-container.top-left {
			top: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
		}

		.toast-container.bottom-right,
		.toast-container.bottom-left {
			bottom: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
		}

		.toast-container.top-center,
		.toast-container.bottom-center {
			left: 0.5rem;
			right: 0.5rem;
			transform: none;
		}

		.toast {
			min-width: auto;
			max-width: none;
			padding: 0.875rem 1rem;
		}

		.toast-title {
			font-size: 0.8125rem;
		}

		.toast-message {
			font-size: 0.75rem;
		}
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.toast {
			transition: none;
		}

		.toast:hover {
			transform: none;
		}

		.icon-pulse {
			animation: none;
			opacity: 0.2;
		}

		.success-animation {
			animation: none;
			opacity: 1;
		}

		.check-left,
		.check-right {
			animation: none;
			scale: 1;
		}

		.error-animation {
			animation: none;
		}

		.error-shake {
			animation: none;
		}
	}
</style>
