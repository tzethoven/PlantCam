<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { triggerHapticFeedback, showSuccess, showError } from '$lib/utils/notifications';

	let videoElement: HTMLVideoElement;
	let isLoading = true;
	let isConnected = false;
	let streamError = false;
	let showControls = false;
	let isCapturing = false;
	let isFullscreen = false;
	let websocket: WebSocket;

	// Camera control functions
	function takeSnapshot() {
		if (isCapturing) return;

		triggerHapticFeedback('click');
		isCapturing = true;

		// Simulate capture process
		setTimeout(() => {
			isCapturing = false;
			showSuccess('Snapshot captured successfully!', 'Camera');
			// Here you would implement actual snapshot functionality
			console.log('Snapshot taken!');
		}, 1000);
	}

	function toggleFullscreen() {
		triggerHapticFeedback('click');
		isFullscreen = !isFullscreen;

		if (isFullscreen) {
			showSuccess('Entered fullscreen mode', 'Camera');
		} else {
			showSuccess('Exited fullscreen mode', 'Camera');
		}

		// Here you would implement actual fullscreen functionality
		console.log('Fullscreen toggled:', isFullscreen);
	}

	function refreshStream() {
		triggerHapticFeedback('click');
		isLoading = true;
		isConnected = false;
		streamError = false;

		// Simulate reconnection
		setTimeout(() => {
			isLoading = false;
			isConnected = true;
			showSuccess('Camera stream refreshed', 'Camera');
		}, 1500);
	}

	function handleRetryClick() {
		triggerHapticFeedback('click');
		showError('Retrying connection...', 'Camera');
	}

	onMount(() => {
		// Simulate loading delay for demonstration
		setTimeout(() => {
			isLoading = false;
			isConnected = true;
		}, 2000);

		// Initialize WebSocket connection for camera stream
		websocket = new WebSocket(`wss://${window.location.host}/api/camera/stream`);
		websocket.onopen = () => {
			isLoading = false;
			isConnected = true;
			streamError = false;
		};
		websocket.onmessage = async (event) => {
			// Handle incoming video stream data
			const blob = new Blob([event.data], { type: 'image/jpeg' });
			const imageUrl = URL.createObjectURL(blob);
			if (videoElement) {
				videoElement.src = imageUrl;
			}
		};
		websocket.onerror = () => {
			isLoading = false;
			isConnected = false;
			streamError = true;
		};
	});

	onDestroy(() => {
		if (websocket) {
			websocket.close();
		}
	});
</script>

<div class="camera-container">
	<!-- Modern glassmorphism frame -->
	<div class="camera-frame">
		<!-- Loading skeleton with shimmer effect -->
		{#if isLoading}
			<div class="loading-skeleton">
				<div class="shimmer-overlay"></div>
				<div class="loading-content">
					<div class="loading-icon">📷</div>
					<p class="loading-text">Connecting to camera...</p>
					<div class="loading-dots">
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>
		{:else if streamError}
			<!-- Error state -->
			<div class="error-state">
				<div class="error-icon">📷</div>
				<p class="error-text">Camera unavailable</p>
				<button class="retry-button" on:click={handleRetryClick}> Retry Connection </button>
			</div>
		{:else}
			<!-- Video stream with fade-in transition -->
			<div
				class="video-container"
				class:stream-loaded={isConnected}
				on:mouseenter={() => (showControls = true)}
				on:mouseleave={() => (showControls = false)}
				role="button"
				tabindex="0"
			>
				<video bind:this={videoElement} class="camera-video" autoplay playsinline muted>
					<track kind="captions" />
				</video>

				<!-- Placeholder content for demo -->
				<div class="demo-placeholder">
					<div class="demo-content">
						<div class="plant-icon">🌱</div>
						<p class="demo-text">Live Camera Feed</p>
						<p class="demo-subtext">Your plant monitoring view</p>
					</div>
				</div>

				<!-- Interactive Camera Controls -->
				<div class="camera-controls" class:visible={showControls}>
					<!-- Snapshot Button -->
					<button
						class="control-button snapshot-button"
						class:capturing={isCapturing}
						on:click={takeSnapshot}
						disabled={isCapturing}
						title="Take Snapshot"
					>
						<div class="button-icon">
							{#if isCapturing}
								<div class="capture-animation">
									<div class="capture-ring"></div>
									<div class="capture-flash"></div>
								</div>
							{:else}
								📸
							{/if}
						</div>
						<span class="button-label">
							{isCapturing ? 'Capturing...' : 'Snapshot'}
						</span>
					</button>

					<!-- Fullscreen Button -->
					<button
						class="control-button fullscreen-button"
						class:active={isFullscreen}
						on:click={toggleFullscreen}
						title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
					>
						<div class="button-icon">
							{isFullscreen ? '🗗' : '⛶'}
						</div>
						<span class="button-label">
							{isFullscreen ? 'Exit' : 'Fullscreen'}
						</span>
					</button>

					<!-- Refresh Button -->
					<button
						class="control-button refresh-button"
						on:click={refreshStream}
						title="Refresh Stream"
					>
						<div class="button-icon">🔄</div>
						<span class="button-label">Refresh</span>
					</button>
				</div>

				<!-- Touch feedback overlay for mobile -->
				<div class="touch-feedback" class:active={showControls}></div>
			</div>
		{/if}

		<!-- Status indicator -->
		<div
			class="status-indicator"
			class:connected={isConnected}
			class:loading={isLoading}
			class:error={streamError}
		>
			<div class="status-dot"></div>
			<span class="status-text">
				{#if isLoading}
					Connecting...
				{:else if streamError}
					Offline
				{:else}
					Live
				{/if}
			</span>
		</div>
	</div>
</div>

<style>
	.camera-container {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.camera-frame {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.05) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		backdrop-filter: blur(20px);
		border-radius: 1.5rem;
		border: 2px solid;
		border-image: linear-gradient(
				135deg,
				rgba(34, 197, 94, 0.3) 0%,
				rgba(14, 165, 233, 0.3) 50%,
				rgba(168, 85, 247, 0.3) 100%
			)
			1;
		box-shadow:
			0 25px 50px -12px rgba(31, 38, 135, 0.25),
			0 0 40px rgba(34, 197, 94, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		overflow: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.camera-frame:hover {
		transform: translateY(-4px) scale(1.02);
		box-shadow:
			0 35px 70px -12px rgba(31, 38, 135, 0.35),
			0 0 60px rgba(34, 197, 94, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		background: linear-gradient(
			135deg,
			rgba(255, 255, 255, 0.15) 0%,
			rgba(255, 255, 255, 0.08) 50%,
			rgba(255, 255, 255, 0.15) 100%
		);
	}

	.loading-skeleton {
		position: relative;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			rgba(156, 163, 175, 0.1) 0%,
			rgba(107, 114, 128, 0.05) 50%,
			rgba(156, 163, 175, 0.1) 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.shimmer-overlay {
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 100%
		);
		animation: shimmer 2s infinite;
	}

	.loading-content {
		text-align: center;
		z-index: 1;
	}

	.loading-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
		opacity: 0.7;
		animation: pulse 2s infinite;
	}

	.loading-text {
		color: rgba(75, 85, 99, 0.8);
		font-size: 1.1rem;
		font-weight: 500;
		margin: 0 0 1rem 0;
	}

	.loading-dots {
		display: flex;
		justify-content: center;
		gap: 0.5rem;
	}

	.loading-dots span {
		width: 0.5rem;
		height: 0.5rem;
		background: rgba(34, 197, 94, 0.6);
		border-radius: 50%;
		animation: loading-bounce 1.4s infinite ease-in-out both;
	}

	.loading-dots span:nth-child(1) {
		animation-delay: -0.32s;
	}
	.loading-dots span:nth-child(2) {
		animation-delay: -0.16s;
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
		font-size: 1.1rem;
		font-weight: 500;
		margin: 0 0 1.5rem 0;
	}

	.retry-button {
		padding: 0.75rem 1.5rem;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: 0.75rem;
		color: rgba(34, 197, 94, 0.9);
		font-weight: 500;
		cursor: pointer;
		transition: all 0.3s ease;
		backdrop-filter: blur(8px);
	}

	.retry-button:hover {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.5);
		transform: translateY(-2px);
	}

	.video-container {
		position: relative;
		width: 100%;
		height: 100%;
		opacity: 0;
		transform: scale(0.95);
		transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.video-container.stream-loaded {
		opacity: 1;
		transform: scale(1);
	}

	.camera-video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 1.25rem;
	}

	.demo-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			135deg,
			rgba(34, 197, 94, 0.1) 0%,
			rgba(14, 165, 233, 0.1) 50%,
			rgba(168, 85, 247, 0.1) 100%
		);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 1.25rem;
	}

	.demo-content {
		text-align: center;
	}

	.plant-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
		animation: gentle-sway 3s ease-in-out infinite;
	}

	.demo-text {
		color: rgba(75, 85, 99, 0.9);
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.5rem 0;
	}

	.demo-subtext {
		color: rgba(107, 114, 128, 0.7);
		font-size: 1rem;
		margin: 0;
	}

	.status-indicator {
		position: absolute;
		top: 1rem;
		right: 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(12px);
		border-radius: 2rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
		transition: all 0.3s ease;
	}

	.status-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.status-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: rgba(75, 85, 99, 0.9);
	}

	.status-indicator.loading .status-dot {
		background: rgba(251, 191, 36, 0.8);
		box-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
		animation: pulse 2s infinite;
	}

	.status-indicator.connected .status-dot {
		background: rgba(34, 197, 94, 0.8);
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
		animation: pulse 2s infinite;
	}

	.status-indicator.error .status-dot {
		background: rgba(239, 68, 68, 0.8);
		box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
	}

	/* Camera Controls */
	.camera-controls {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.75rem;
		opacity: 0;
		visibility: hidden;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 10;
	}

	.camera-controls.visible {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) translateY(0);
	}

	.control-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.75rem;
		background: rgba(255, 255, 255, 0.15);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		color: rgba(75, 85, 99, 0.9);
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		position: relative;
		overflow: hidden;
		min-width: 4rem;
	}

	.control-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
	}

	.control-button:hover::before {
		left: 100%;
	}

	.control-button:hover {
		transform: translateY(-4px) scale(1.05);
		background: rgba(255, 255, 255, 0.25);
		border-color: rgba(255, 255, 255, 0.4);
		box-shadow:
			0 16px 48px rgba(31, 38, 135, 0.25),
			0 0 20px rgba(34, 197, 94, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.control-button:active {
		transform: translateY(-2px) scale(1.02);
	}

	.control-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.control-button:disabled:hover {
		transform: none;
		background: rgba(255, 255, 255, 0.15);
	}

	.button-icon {
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		position: relative;
	}

	.button-label {
		font-size: 0.75rem;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
	}

	/* Snapshot Button Specific Styles */
	.snapshot-button.capturing {
		background: rgba(34, 197, 94, 0.2);
		border-color: rgba(34, 197, 94, 0.4);
		animation: capture-pulse 1s ease-in-out;
	}

	.capture-animation {
		position: relative;
		width: 2rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.capture-ring {
		position: absolute;
		width: 100%;
		height: 100%;
		border: 2px solid rgba(34, 197, 94, 0.6);
		border-radius: 50%;
		animation: capture-ring 1s ease-out;
	}

	.capture-flash {
		position: absolute;
		width: 1rem;
		height: 1rem;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 50%;
		animation: capture-flash 0.3s ease-out;
	}

	/* Fullscreen Button Specific Styles */
	.fullscreen-button.active {
		background: rgba(14, 165, 233, 0.2);
		border-color: rgba(14, 165, 233, 0.4);
		color: rgba(14, 165, 233, 0.9);
	}

	/* Refresh Button Specific Styles */
	.refresh-button:hover .button-icon {
		animation: spin 0.6s ease-in-out;
	}

	/* Touch Feedback */
	.touch-feedback {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.05);
		opacity: 0;
		transition: opacity 0.3s ease;
		pointer-events: none;
		border-radius: 1.25rem;
	}

	.touch-feedback.active {
		opacity: 1;
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

	@keyframes loading-bounce {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

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

	@keyframes gentle-sway {
		0%,
		100% {
			transform: rotate(-2deg) scale(1);
		}
		50% {
			transform: rotate(2deg) scale(1.05);
		}
	}

	@keyframes capture-pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	@keyframes capture-ring {
		0% {
			transform: scale(0.8);
			opacity: 1;
		}
		100% {
			transform: scale(1.4);
			opacity: 0;
		}
	}

	@keyframes capture-flash {
		0% {
			opacity: 0;
			transform: scale(0.5);
		}
		50% {
			opacity: 1;
			transform: scale(1);
		}
		100% {
			opacity: 0;
			transform: scale(1.2);
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Enhanced Responsive Design */

	/* Tablet Landscape (768px - 1023px) - Optimized for touch */
	@media (max-width: 1023px) and (min-width: 768px) {
		.camera-frame {
			border-radius: 1.25rem;
			aspect-ratio: 16 / 10; /* Slightly taller for tablet viewing */
		}

		.demo-placeholder {
			border-radius: 1rem;
		}

		.plant-icon {
			font-size: 3.5rem;
		}

		.demo-text {
			font-size: 1.375rem;
		}

		.demo-subtext {
			font-size: 1.0625rem;
		}

		.status-indicator {
			top: 1rem;
			right: 1rem;
			padding: 0.625rem 1rem;
			font-size: 0.9375rem;
		}

		.status-dot {
			width: 0.625rem;
			height: 0.625rem;
		}

		/* Tablet camera controls - optimized for touch */
		.camera-controls {
			bottom: 1rem;
			gap: 0.875rem;
			/* Show controls with slight opacity on tablet for discoverability */
			opacity: 0.7;
			visibility: visible;
		}

		.camera-controls.visible {
			opacity: 1;
		}

		.control-button {
			padding: 0.875rem;
			min-width: 4.5rem;
			min-height: 4.5rem; /* Larger touch targets for tablet */
			border-radius: 1.125rem;
		}

		.button-icon {
			font-size: 1.375rem;
			width: 1.75rem;
			height: 1.75rem;
		}

		.button-label {
			font-size: 0.8125rem;
			font-weight: 600;
		}

		/* Enhanced hover effects for tablet */
		.control-button:hover {
			transform: translateY(-6px) scale(1.08);
		}

		/* Touch feedback optimized for tablet */
		.touch-feedback.active {
			opacity: 0.08;
		}

		/* Tablet-specific loading states */
		.loading-icon {
			font-size: 3.5rem;
		}

		.loading-text {
			font-size: 1.1875rem;
		}

		.error-icon {
			font-size: 3.5rem;
		}

		.error-text {
			font-size: 1.1875rem;
		}

		.retry-button {
			padding: 0.875rem 1.75rem;
			font-size: 1rem;
			min-height: 44px;
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) */
	@media (max-width: 767px) and (min-width: 481px) {
		.camera-frame {
			border-radius: 1rem;
			aspect-ratio: 16 / 9;
		}

		.demo-placeholder {
			border-radius: 0.875rem;
		}

		.plant-icon {
			font-size: 3.25rem;
		}

		.demo-text {
			font-size: 1.3125rem;
		}

		.demo-subtext {
			font-size: 1rem;
		}

		.status-indicator {
			top: 0.875rem;
			right: 0.875rem;
			padding: 0.5rem 0.875rem;
		}

		.camera-controls {
			bottom: 0.875rem;
			gap: 0.75rem;
			opacity: 0.9; /* More opaque for better visibility */
			visibility: visible;
		}

		.control-button {
			padding: 0.75rem;
			min-width: 4rem;
			min-height: 4rem;
			background: rgba(255, 255, 255, 0.8); /* More opaque background */
			border: 1px solid rgba(255, 255, 255, 0.35);
			color: rgba(75, 85, 99, 0.9); /* Better contrast */
		}

		.control-button:hover {
			background: rgba(255, 255, 255, 0.9);
			border-color: rgba(255, 255, 255, 0.5);
		}

		.button-icon {
			font-size: 1.3125rem;
			width: 1.625rem;
			height: 1.625rem;
		}

		.button-label {
			font-size: 0.75rem;
			font-weight: 600; /* Make text bolder */
		}
	}

	/* Mobile (320px - 480px) */
	@media (max-width: 480px) {
		.camera-frame {
			border-radius: 1rem;
			aspect-ratio: 16 / 12; /* Make it taller on mobile */
		}

		.demo-placeholder {
			border-radius: 0.75rem;
		}

		.plant-icon {
			font-size: 3rem;
		}

		.demo-text {
			font-size: 1.25rem;
		}

		.status-indicator {
			top: 0.75rem;
			right: 0.75rem;
			padding: 0.375rem 0.75rem;
		}

		/* Mobile camera controls - more opaque */
		.camera-controls {
			bottom: 0.75rem;
			gap: 0.5rem;
			opacity: 0.95; /* More opaque for better visibility */
			visibility: visible;
		}

		.camera-controls.visible {
			opacity: 1;
		}

		.control-button {
			padding: 0.5rem;
			min-width: 3.5rem;
			min-height: 3.5rem;
			background: rgba(255, 255, 255, 0.85); /* Much more opaque background */
			backdrop-filter: blur(20px);
			border: 1px solid rgba(255, 255, 255, 0.4);
			color: rgba(75, 85, 99, 0.95); /* Darker text for better contrast */
		}

		.control-button:hover {
			background: rgba(255, 255, 255, 0.95);
			border-color: rgba(255, 255, 255, 0.6);
		}

		.button-icon {
			font-size: 1.25rem;
			width: 1.5rem;
			height: 1.5rem;
		}

		.button-label {
			font-size: 0.625rem;
			font-weight: 600; /* Make text bolder for better readability */
		}

		/* Touch feedback is more prominent on mobile */
		.touch-feedback.active {
			opacity: 0.1;
		}

		/* Disable hover effects on mobile */
		.camera-frame:hover {
			transform: none;
			box-shadow:
				0 25px 50px -12px rgba(31, 38, 135, 0.25),
				0 0 40px rgba(34, 197, 94, 0.1),
				inset 0 1px 0 rgba(255, 255, 255, 0.2);
		}

		.control-button:hover {
			transform: none;
		}
	}

	/* Extra small mobile (max 320px) */
	@media (max-width: 320px) {
		.camera-controls {
			flex-direction: row;
			gap: 0.375rem;
		}

		.control-button {
			padding: 0.375rem;
			min-width: 3rem;
			min-height: 3rem;
		}

		.button-label {
			display: none; /* Hide labels on very small screens */
		}

		.plant-icon {
			font-size: 2.5rem;
		}

		.demo-text {
			font-size: 1.125rem;
		}
	}

	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.camera-frame:hover {
			transform: none;
		}

		.shimmer-overlay {
			animation: none;
		}

		.loading-icon,
		.status-dot,
		.plant-icon {
			animation: none;
		}

		.loading-dots span {
			animation: none;
			opacity: 0.6;
		}

		.video-container {
			opacity: 1;
			transform: none;
			transition: none;
		}
	}
</style>
