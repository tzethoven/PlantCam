<script lang="ts">
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import {
		buttonClickFeedback,
		successActionFeedback,
		errorActionFeedback,
		triggerHapticFeedback
	} from '$lib/utils/notifications';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';

	let isWatering = false;
	let wateringProgress = 0;
	let remainingTime = 0;
	let totalDuration = 30; // seconds
	let progressInterval: NodeJS.Timeout | null = null;
	let isLoading = false;
	let isInitialLoading = true; // Add initial loading state
	let buttonElement: HTMLButtonElement;

	let schedule = {
		enabled: false,
		frequency: 24, // hours
		duration: 30 // seconds
	};

	// Form validation state
	let validationErrors = {
		frequency: '',
		duration: ''
	};

	let isFormValid = true;

	// Validation functions
	function validateFrequency(value: number): string {
		if (!value || value < 1) {
			return 'Frequency must be at least 1 hour';
		}
		if (value > 72) {
			return 'Frequency cannot exceed 72 hours';
		}
		return '';
	}

	function validateDuration(value: number): string {
		if (!value || value < 5) {
			return 'Duration must be at least 5 seconds';
		}
		if (value > 300) {
			return 'Duration cannot exceed 300 seconds (5 minutes)';
		}
		return '';
	}

	function validateForm() {
		validationErrors.frequency = validateFrequency(schedule.frequency);
		validationErrors.duration = validateDuration(schedule.duration);

		isFormValid = !validationErrors.frequency && !validationErrors.duration;
		return isFormValid;
	}

	function handleFrequencyChange(event: Event) {
		const target = event.target as HTMLInputElement;
		schedule.frequency = parseInt(target.value) || 0;
		validationErrors.frequency = validateFrequency(schedule.frequency);
		isFormValid = !validationErrors.frequency && !validationErrors.duration;
	}

	function handleDurationChange(event: Event) {
		const target = event.target as HTMLInputElement;
		schedule.duration = parseInt(target.value) || 0;
		totalDuration = schedule.duration;
		validationErrors.duration = validateDuration(schedule.duration);
		isFormValid = !validationErrors.frequency && !validationErrors.duration;
	}

	async function fetchWateringStatus() {
		try {
			// Mock watering status for development
			if (process.env.NODE_ENV === 'development') {
				return;
			}

			const response = await fetch('/api/water/status');
			if (response.ok) {
				const data = await response.json();
				isWatering = data.isWatering;

				// If watering stopped externally, reset progress
				if (!isWatering && progressInterval) {
					clearInterval(progressInterval);
					progressInterval = null;
					wateringProgress = 0;
					remainingTime = 0;
				}
			}
		} catch (error) {
			console.error('Failed to fetch watering status:', error);
		}
	}

	function startProgressTracking() {
		wateringProgress = 0;
		remainingTime = totalDuration;

		progressInterval = setInterval(() => {
			if (remainingTime > 0) {
				remainingTime--;
				wateringProgress = ((totalDuration - remainingTime) / totalDuration) * 100;
			} else {
				// Auto-stop when duration is reached
				stopWatering();
			}
		}, 1000);
	}

	function stopProgressTracking() {
		if (progressInterval) {
			clearInterval(progressInterval);
			progressInterval = null;
		}
		wateringProgress = 0;
		remainingTime = 0;
	}

	async function startWatering() {
		isLoading = true;
		try {
			// Mock watering status for development
			if (process.env.NODE_ENV === 'development') {
				isWatering = !isWatering;
				startProgressTracking();
				successActionFeedback('Watering started successfully!', 'Plant Care');
				return;
			}

			const response = await fetch('/api/water/toggle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ state: true })
			});

			if (response.ok) {
				const data = await response.json();
				isWatering = data.state;
				if (isWatering) {
					startProgressTracking();
					successActionFeedback('Watering started successfully!', 'Plant Care');
				}
			} else {
				throw new Error('Failed to start watering');
			}
		} catch (error) {
			console.error('Failed to start watering:', error);
			errorActionFeedback('Failed to start watering. Please try again.', 'Watering Error');
		} finally {
			isLoading = false;
		}
	}

	async function stopWatering() {
		isLoading = true;
		try {
			// Mock watering status for development
			if (process.env.NODE_ENV === 'development') {
				isWatering = !isWatering;
				return;
			}

			const response = await fetch('/api/water/toggle', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ state: false })
			});

			if (response.ok) {
				const data = await response.json();
				isWatering = data.state;
				stopProgressTracking();
				successActionFeedback('Watering stopped successfully!', 'Plant Care');
			} else {
				throw new Error('Failed to stop watering');
			}
		} catch (error) {
			console.error('Failed to stop watering:', error);
			errorActionFeedback('Failed to stop watering. Please try again.', 'Watering Error');
		} finally {
			isLoading = false;
		}
	}

	async function toggleWatering() {
		// Provide immediate haptic feedback
		buttonClickFeedback(buttonElement);

		if (isWatering) {
			await stopWatering();
		} else {
			await startWatering();
		}
	}

	function handleToggleClick() {
		triggerHapticFeedback('click');
	}

	function handleInputFocus() {
		triggerHapticFeedback('click');
	}

	onMount(() => {
		fetchWateringStatus();
		// Check status every 5 seconds to stay in sync
		const interval = setInterval(fetchWateringStatus, 5000);

		// Set initial loading to false after a short delay to show the skeleton
		setTimeout(() => {
			isInitialLoading = false;
		}, 1500);

		return () => {
			clearInterval(interval);
			if (progressInterval) {
				clearInterval(progressInterval);
			}
		};
	});
</script>

<div class="watering-control">
	{#if isInitialLoading}
		<!-- Loading Skeleton -->
		<div class="loading-skeleton-container">
			<!-- Watering Button Skeleton -->
			<div class="watering-button-skeleton">
				<div class="skeleton-circle"></div>
				<div class="skeleton-text">
					<div class="skeleton-line skeleton-line-long"></div>
					<div class="skeleton-line skeleton-line-short"></div>
				</div>
			</div>

			<!-- Schedule Section Skeleton -->
			<div class="schedule-skeleton">
				<div class="skeleton-title"></div>
				<div class="skeleton-toggle">
					<div class="skeleton-toggle-slider"></div>
					<div class="skeleton-toggle-label"></div>
				</div>
				<div class="skeleton-inputs">
					<div class="skeleton-input-group">
						<div class="skeleton-label"></div>
						<div class="skeleton-input"></div>
					</div>
					<div class="skeleton-input-group">
						<div class="skeleton-label"></div>
						<div class="skeleton-input"></div>
					</div>
				</div>
				<div class="skeleton-preview">
					<div class="skeleton-preview-header"></div>
					<div class="skeleton-preview-content"></div>
				</div>
			</div>
		</div>
	{:else}
		<!-- Enhanced Watering Button -->
		<div class="watering-button-container">
			<button
				bind:this={buttonElement}
				class="watering-button {isWatering ? 'watering-active' : 'watering-ready'}"
				class:loading={isLoading}
				on:click={toggleWatering}
				disabled={isLoading}
			>
				<!-- Progress Ring -->
				<div class="progress-ring">
					<svg class="progress-svg" viewBox="0 0 120 120">
						<circle
							class="progress-track"
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="rgba(255, 255, 255, 0.2)"
							stroke-width="4"
						/>
						<circle
							class="progress-bar"
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="url(#progressGradient)"
							stroke-width="4"
							stroke-linecap="round"
							style="stroke-dasharray: 339.292; stroke-dashoffset: {339.292 -
								(339.292 * wateringProgress) / 100};"
						/>
						<defs>
							<linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
								<stop offset="0%" style="stop-color:#60A5FA;stop-opacity:1" />
								<stop offset="100%" style="stop-color:#3B82F6;stop-opacity:1" />
							</linearGradient>
						</defs>
					</svg>
				</div>

				<!-- Water Drop Icon -->
				<div class="water-drop-container">
					<div class="water-drop {isWatering ? 'filling' : ''}">
						<svg viewBox="0 0 24 24" class="drop-icon">
							<path d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0z" fill="currentColor" />
						</svg>
						<div class="water-fill" style="height: {wateringProgress}%"></div>
					</div>
				</div>

				<!-- Button Text -->
				<div class="button-content">
					<span class="button-text">
						{#if isWatering}
							<span class="action-text">Watering...</span>
							<span class="time-text">{remainingTime}s remaining</span>
						{:else}
							<span class="action-text">Start Watering</span>
							<span class="time-text">Ready to water</span>
						{/if}
					</span>
				</div>

				<!-- Pulsing Effect -->
				{#if isWatering}
					<div class="pulse-effect"></div>
				{/if}
			</button>
		</div>

		<!-- Watering Schedule Section -->
		<div class="schedule-section">
			<h3 class="schedule-title">Watering Schedule</h3>

			<!-- Toggle Switch -->
			<div class="toggle-container">
				<label class="toggle-switch">
					<input type="checkbox" bind:checked={schedule.enabled} class="toggle-input" />
					<span class="toggle-slider">
						<span class="toggle-thumb"></span>
					</span>
					<span class="toggle-label">Enable automatic watering</span>
				</label>
			</div>

			{#if schedule.enabled}
				<div class="schedule-controls">
					<div class="control-group">
						<label class="control-label">
							<span class="label-text">Frequency (hours)</span>
							<div class="input-container">
								<input
									type="number"
									min="1"
									max="72"
									bind:value={schedule.frequency}
									on:input={handleFrequencyChange}
									on:focus={handleInputFocus}
									class="modern-input {validationErrors.frequency ? 'error' : ''}"
									class:shake={validationErrors.frequency}
								/>
								<div class="input-accent"></div>
								{#if validationErrors.frequency}
									<div class="error-message" transition:slide={{ duration: 300 }}>
										<span class="error-icon">⚠️</span>
										<span class="error-text">{validationErrors.frequency}</span>
									</div>
								{/if}
							</div>
						</label>
					</div>

					<div class="control-group">
						<label class="control-label">
							<span class="label-text">Duration (seconds)</span>
							<div class="input-container">
								<input
									type="number"
									min="5"
									max="300"
									bind:value={schedule.duration}
									on:input={handleDurationChange}
									class="modern-input {validationErrors.duration ? 'error' : ''}"
									class:shake={validationErrors.duration}
								/>
								<div class="input-accent"></div>
								{#if validationErrors.duration}
									<div class="error-message" transition:slide={{ duration: 300 }}>
										<span class="error-icon">⚠️</span>
										<span class="error-text">{validationErrors.duration}</span>
									</div>
								{/if}
							</div>
						</label>
					</div>

					<!-- Schedule Preview -->
					<div class="schedule-preview">
						<div class="preview-header">
							<span class="preview-title">Schedule Preview</span>
						</div>
						<div class="timeline-visualization">
							<div class="timeline-item">
								<div class="timeline-dot"></div>
								<div class="timeline-content">
									<span class="timeline-label">Next watering</span>
									<span class="timeline-time"
										>Every {schedule.frequency}h for {schedule.duration}s</span
									>
								</div>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.watering-control {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* Enhanced Watering Button */
	.watering-button-container {
		display: flex;
		justify-content: center;
		margin-bottom: 1rem;
	}

	.watering-button {
		position: relative;
		width: 200px;
		height: 200px;
		border-radius: 50%;
		border: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%);
		box-shadow:
			0 20px 40px rgba(34, 197, 94, 0.3),
			0 8px 16px rgba(34, 197, 94, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		/* Performance optimizations */
		will-change: transform, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.watering-button:hover {
		transform: translateY(-4px) scale(1.05);
		box-shadow:
			0 32px 64px rgba(34, 197, 94, 0.4),
			0 16px 32px rgba(34, 197, 94, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.watering-button:active {
		transform: translateY(-2px) scale(1.02);
	}

	.watering-button.watering-active {
		background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%);
		box-shadow:
			0 20px 40px rgba(59, 130, 246, 0.3),
			0 8px 16px rgba(59, 130, 246, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		animation: pulse-active 2s infinite;
	}

	.watering-button.watering-active:hover {
		box-shadow:
			0 32px 64px rgba(59, 130, 246, 0.4),
			0 16px 32px rgba(59, 130, 246, 0.3),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.watering-button.loading {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%);
		box-shadow:
			0 20px 40px rgba(107, 114, 128, 0.3),
			0 8px 16px rgba(107, 114, 128, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
		cursor: not-allowed;
		animation: loading-pulse 1.5s ease-in-out infinite;
	}

	.watering-button.loading:hover {
		transform: none;
		box-shadow:
			0 20px 40px rgba(107, 114, 128, 0.3),
			0 8px 16px rgba(107, 114, 128, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.watering-button.loading .water-drop {
		animation: loading-spin 2s linear infinite;
	}

	/* Progress Ring */
	.progress-ring {
		position: absolute;
		top: -10px;
		left: -10px;
		right: -10px;
		bottom: -10px;
		pointer-events: none;
	}

	.progress-svg {
		width: 100%;
		height: 100%;
		transform: rotate(-90deg);
	}

	.progress-bar {
		transition: stroke-dashoffset 0.5s ease;
	}

	/* Water Drop Icon */
	.water-drop-container {
		position: relative;
		z-index: 2;
	}

	.water-drop {
		position: relative;
		width: 3rem;
		height: 3rem;
		color: white;
		overflow: hidden;
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
		transition: all 0.3s ease;
	}

	.drop-icon {
		width: 100%;
		height: 100%;
		position: relative;
		z-index: 2;
	}

	.water-fill {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
		transition: height 0.5s ease;
		border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
	}

	.water-drop.filling {
		animation: drop-bounce 0.6s ease-in-out;
	}

	/* Button Content */
	.button-content {
		position: relative;
		z-index: 2;
		text-align: center;
		color: white;
	}

	.button-text {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.action-text {
		font-size: 1.1rem;
		font-weight: 600;
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
	}

	.time-text {
		font-size: 0.875rem;
		opacity: 0.9;
		font-weight: 500;
	}

	/* Pulsing Effect */
	.pulse-effect {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.2);
		transform: translate(-50%, -50%);
		animation: pulse-ring 2s infinite;
		pointer-events: none;
	}

	/* Schedule Section */
	.schedule-section {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
	}

	.schedule-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #374151;
		margin-bottom: 1.5rem;
		text-align: center;
	}

	/* Toggle Switch */
	.toggle-container {
		margin-bottom: 2rem;
	}

	.toggle-switch {
		display: flex;
		align-items: center;
		gap: 1rem;
		cursor: pointer;
	}

	.toggle-input {
		display: none;
	}

	.toggle-slider {
		position: relative;
		width: 3.5rem;
		height: 2rem;
		background: #e5e7eb;
		border-radius: 2rem;
		transition:
			background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
		/* Performance optimizations */
		will-change: background-color, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.toggle-thumb {
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		width: 1.5rem;
		height: 1.5rem;
		background: white;
		border-radius: 50%;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		/* Performance optimizations */
		will-change: transform, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.toggle-input:checked + .toggle-slider {
		background: linear-gradient(135deg, #22c55e, #16a34a);
		box-shadow: 0 0 20px rgba(34, 197, 94, 0.3);
	}

	.toggle-input:checked + .toggle-slider .toggle-thumb {
		transform: translateX(1.5rem);
		box-shadow: 0 2px 12px rgba(34, 197, 94, 0.4);
	}

	.toggle-label {
		font-weight: 500;
		color: #374151;
	}

	/* Schedule Controls */
	.schedule-controls {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		animation: slideDown 0.3s ease-out;
	}

	.control-group {
		display: flex;
		flex-direction: column;
	}

	.control-label {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.label-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: #6b7280;
	}

	.input-container {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.modern-input {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 0.75rem;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		font-size: 1rem;
		font-weight: 500;
		color: #374151;
		transition:
			border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
		/* Performance optimizations */
		will-change: transform, border-color, background-color, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.modern-input:focus {
		outline: none;
		border-color: #22c55e;
		background: rgba(255, 255, 255, 0.2);
		box-shadow:
			0 0 0 3px rgba(34, 197, 94, 0.1),
			0 8px 32px rgba(31, 38, 135, 0.15);
		transform: translateY(-2px);
	}

	.input-accent {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(90deg, #22c55e, #0ea5e9);
		border-radius: 0 0 0.75rem 0.75rem;
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.modern-input:focus + .input-accent {
		transform: scaleX(1);
	}

	/* Error States */
	.modern-input.error {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
		box-shadow:
			0 0 0 3px rgba(239, 68, 68, 0.1),
			0 4px 16px rgba(239, 68, 68, 0.2);
	}

	.modern-input.error:focus {
		border-color: #dc2626;
		box-shadow:
			0 0 0 3px rgba(239, 68, 68, 0.2),
			0 8px 32px rgba(239, 68, 68, 0.25);
	}

	.modern-input.shake {
		animation: shake 0.5s ease-in-out;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0.5rem;
		backdrop-filter: blur(10px);
		animation: errorSlideIn 0.3s ease-out;
	}

	.error-icon {
		font-size: 1rem;
		animation: errorPulse 1s ease-in-out infinite;
	}

	.error-text {
		font-size: 0.875rem;
		color: #dc2626;
		font-weight: 500;
	}

	/* Schedule Preview */
	.schedule-preview {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 0.75rem;
		padding: 1rem;
		margin-top: 1rem;
	}

	.preview-header {
		margin-bottom: 0.75rem;
	}

	.preview-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #6b7280;
	}

	.timeline-visualization {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.timeline-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.timeline-dot {
		width: 0.75rem;
		height: 0.75rem;
		background: linear-gradient(135deg, #22c55e, #16a34a);
		border-radius: 50%;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
		animation: pulse-dot 2s infinite;
	}

	.timeline-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.timeline-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #374151;
	}

	.timeline-time {
		font-size: 0.75rem;
		color: #6b7280;
	}

	/* Animations */
	@keyframes pulse-active {
		0%,
		100% {
			box-shadow:
				0 20px 40px rgba(59, 130, 246, 0.3),
				0 8px 16px rgba(59, 130, 246, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}
		50% {
			box-shadow:
				0 25px 50px rgba(59, 130, 246, 0.4),
				0 12px 24px rgba(59, 130, 246, 0.3),
				inset 0 1px 0 rgba(255, 255, 255, 0.4);
		}
	}

	@keyframes pulse-ring {
		0% {
			transform: translate(-50%, -50%) scale(1);
			opacity: 0.8;
		}
		100% {
			transform: translate(-50%, -50%) scale(1.5);
			opacity: 0;
		}
	}

	@keyframes drop-bounce {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
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
			transform: scale(1.1);
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes shake {
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

	@keyframes errorSlideIn {
		from {
			opacity: 0;
			transform: translateY(-10px) scale(0.95);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes errorPulse {
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

	@keyframes loading-pulse {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.8;
			transform: scale(1.02);
		}
	}

	@keyframes loading-spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	/* Enhanced Responsive Design */

	/* Tablet Landscape (768px - 1023px) */
	@media (max-width: 1023px) and (min-width: 768px) {
		.watering-button {
			width: 180px;
			height: 180px;
		}

		.water-drop {
			width: 2.75rem;
			height: 2.75rem;
		}

		.action-text {
			font-size: 1.05rem;
		}

		.time-text {
			font-size: 0.8125rem;
		}

		.schedule-section {
			padding: 1.25rem;
		}

		.toggle-slider {
			width: 3.25rem;
			height: 1.875rem;
		}

		.toggle-thumb {
			width: 1.375rem;
			height: 1.375rem;
		}

		.toggle-input:checked + .toggle-slider .toggle-thumb {
			transform: translateX(1.375rem);
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) */
	@media (max-width: 767px) and (min-width: 481px) {
		.watering-control {
			gap: 1.5rem;
		}

		.watering-button {
			width: 160px;
			height: 160px;
		}

		.water-drop {
			width: 2.5rem;
			height: 2.5rem;
		}

		.action-text {
			font-size: 1rem;
		}

		.time-text {
			font-size: 0.75rem;
		}

		.schedule-section {
			padding: 1rem;
		}

		.schedule-title {
			font-size: 1.125rem;
		}

		.toggle-slider {
			width: 3rem;
			height: 1.75rem;
		}

		.toggle-thumb {
			width: 1.25rem;
			height: 1.25rem;
		}

		.toggle-input:checked + .toggle-slider .toggle-thumb {
			transform: translateX(1.25rem);
		}

		.modern-input {
			padding: 0.625rem 0.875rem;
			font-size: 0.9375rem;
		}
	}

	/* Mobile (320px - 480px) */
	@media (max-width: 480px) {
		.watering-control {
			gap: 1.25rem;
		}

		.watering-button {
			width: 140px;
			height: 140px;
		}

		.water-drop {
			width: 2.25rem;
			height: 2.25rem;
		}

		.action-text {
			font-size: 0.9375rem;
		}

		.time-text {
			font-size: 0.6875rem;
		}

		.schedule-section {
			padding: 0.875rem;
		}

		.schedule-title {
			font-size: 1rem;
			margin-bottom: 1.25rem;
		}

		.toggle-container {
			margin-bottom: 1.5rem;
		}

		.toggle-switch {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.toggle-slider {
			width: 2.75rem;
			height: 1.625rem;
		}

		.toggle-thumb {
			width: 1.125rem;
			height: 1.125rem;
			top: 0.25rem;
			left: 0.25rem;
		}

		.toggle-input:checked + .toggle-slider .toggle-thumb {
			transform: translateX(1.125rem);
		}

		.toggle-label {
			font-size: 0.875rem;
		}

		.schedule-controls {
			gap: 1.25rem;
		}

		.modern-input {
			padding: 0.625rem 0.75rem;
			font-size: 0.875rem;
			border-radius: 0.625rem;
		}

		.label-text {
			font-size: 0.8125rem;
		}

		.error-message {
			padding: 0.625rem;
			margin-top: 0.375rem;
		}

		.error-text {
			font-size: 0.8125rem;
		}

		.schedule-preview {
			padding: 0.875rem;
		}

		.preview-title {
			font-size: 0.8125rem;
		}

		.timeline-label {
			font-size: 0.8125rem;
		}

		.timeline-time {
			font-size: 0.6875rem;
		}

		/* Disable hover effects on mobile */
		.watering-button:hover {
			transform: none;
			box-shadow:
				0 20px 40px rgba(34, 197, 94, 0.3),
				0 8px 16px rgba(34, 197, 94, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}

		.watering-button.watering-active:hover {
			box-shadow:
				0 20px 40px rgba(59, 130, 246, 0.3),
				0 8px 16px rgba(59, 130, 246, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3);
		}

		.modern-input:focus {
			transform: none;
		}

		/* Optimize touch targets */
		.watering-button {
			min-height: 44px;
			min-width: 44px;
		}

		.toggle-slider {
			min-height: 24px;
			min-width: 40px;
		}

		.modern-input {
			min-height: 44px;
		}
	}

	/* Extra small mobile (max 320px) */
	@media (max-width: 320px) {
		.watering-control {
			gap: 1rem;
		}

		.watering-button {
			width: 120px;
			height: 120px;
		}

		.water-drop {
			width: 2rem;
			height: 2rem;
		}

		.action-text {
			font-size: 0.875rem;
		}

		.time-text {
			font-size: 0.625rem;
		}

		.schedule-section {
			padding: 0.75rem;
		}

		.schedule-title {
			font-size: 0.9375rem;
			margin-bottom: 1rem;
		}

		.toggle-slider {
			width: 22px;
			height: 11px;
		}

		.toggle-thumb {
			width: 1rem;
			height: 1rem;
		}

		.toggle-input:checked + .toggle-slider .toggle-thumb {
			transform: translateX(1rem);
		}

		.modern-input {
			padding: 0.5rem 0.625rem;
			font-size: 0.8125rem;
		}

		.schedule-preview {
			padding: 0.75rem;
		}
	}

	/* Comprehensive Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		/* Disable all transitions and animations */
		.watering-button,
		.toggle-slider,
		.toggle-thumb,
		.modern-input,
		.progress-bar,
		.input-accent,
		.error-message,
		.schedule-controls {
			transition: none !important;
			animation: none !important;
		}

		/* Static button states */
		.watering-button:hover,
		.watering-button:active {
			transform: none !important;
		}

		.watering-button.watering-active {
			animation: none !important;
			background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%) !important;
			box-shadow:
				0 20px 40px rgba(59, 130, 246, 0.3),
				0 8px 16px rgba(59, 130, 246, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
		}

		.watering-button.watering-active:hover {
			box-shadow:
				0 20px 40px rgba(59, 130, 246, 0.3),
				0 8px 16px rgba(59, 130, 246, 0.2),
				inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
		}

		/* Disable animated effects */
		.pulse-effect {
			animation: none !important;
			opacity: 0 !important;
		}

		.timeline-dot {
			animation: none !important;
			opacity: 1 !important;
		}

		.water-drop.filling {
			animation: none !important;
		}

		/* Static input states */
		.modern-input:focus {
			transform: none !important;
		}

		.modern-input.shake {
			animation: none !important;
		}

		.input-accent {
			transform: scaleX(1) !important;
			transition: none !important;
		}

		.modern-input:focus + .input-accent {
			transform: scaleX(1) !important;
		}

		/* Static error states */
		.error-message {
			animation: none !important;
		}

		.error-icon {
			animation: none !important;
		}

		/* Ensure functionality remains intact */
		.toggle-input:checked + .toggle-slider {
			background: linear-gradient(135deg, #22c55e, #16a34a) !important;
			box-shadow: 0 0 20px rgba(34, 197, 94, 0.3) !important;
		}

		.toggle-input:checked + .toggle-slider .toggle-thumb {
			transform: translateX(1.5rem) !important;
		}

		/* Maintain visual feedback without motion */
		.section-badge:hover {
			background: rgba(255, 255, 255, 0.3) !important;
			transform: none !important;
		}
	}

	/* Loading Skeleton Styles */
	.loading-skeleton-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.watering-button-skeleton {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 2rem;
	}

	.skeleton-circle {
		width: 200px;
		height: 200px;
		border-radius: 50%;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
		position: relative;
		overflow: hidden;
	}

	.skeleton-text {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.skeleton-line {
		height: 1rem;
		border-radius: 0.5rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-line-long {
		width: 120px;
	}

	.skeleton-line-short {
		width: 80px;
	}

	.schedule-skeleton {
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 1rem;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.skeleton-title {
		height: 1.5rem;
		width: 60%;
		border-radius: 0.5rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-toggle {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.skeleton-toggle-slider {
		width: 3.5rem;
		height: 2rem;
		border-radius: 2rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-toggle-label {
		height: 1rem;
		width: 150px;
		border-radius: 0.5rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-inputs {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.skeleton-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.skeleton-label {
		height: 0.875rem;
		width: 40%;
		border-radius: 0.25rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-input {
		height: 3rem;
		border-radius: 0.75rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-preview {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 0.75rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.skeleton-preview-header {
		height: 1rem;
		width: 50%;
		border-radius: 0.25rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	.skeleton-preview-content {
		height: 2rem;
		border-radius: 0.5rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 25%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 75%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 2s infinite;
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.8;
		}
	}

	/* Reduced motion support for skeleton */
	@media (prefers-reduced-motion: reduce) {
		.loading-skeleton-container,
		.skeleton-circle,
		.skeleton-line,
		.skeleton-title,
		.skeleton-toggle-slider,
		.skeleton-toggle-label,
		.skeleton-label,
		.skeleton-input,
		.skeleton-preview-header,
		.skeleton-preview-content {
			animation: none;
		}
	}
</style>
