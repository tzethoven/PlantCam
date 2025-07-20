<script lang="ts">
	import { signUp, useSession } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let isLoading = $state(false);
	let error = $state('');
	let success = $state('');
	let mounted = $state(false);

	const session = useSession();

	onMount(() => {
		mounted = true;
	});

	$effect(() => {
		// Redirect to dashboard if already authenticated
		if ($session?.data) {
			goto('/');
		}
	});

	async function handleSignup() {
		if (name !== 'Tobi Zethoven') {
			error = 'No new users allowed at the moment';
			return;
		}

		if (!name || !email || !password || !confirmPassword) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters long';
			return;
		}

		isLoading = true;
		error = '';
		success = '';

		try {
			const result = await signUp.email({
				email,
				password,
				name
			});

			if (result.error) {
				error = result.error.message || 'Signup failed';
			} else {
				success = 'Account created successfully!';
				// Clear form
				name = '';
				email = '';
				password = '';
				confirmPassword = '';
				goto('/');
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Signup error:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSignup();
		}
	}
</script>

<!-- Signup Page Container -->
<div class="signup-container">
	<!-- Header Section with PlantCam Branding -->
	<header class="dashboard-header auth-header animate-entrance" class:mounted>
		<div class="header-content">
			<div class="header-text">
				<h1 class="text-display text-gradient-nature">PlantCam</h1>
				<p class="text-body-large text-gray-600">Monitor and care for your plants with style</p>
			</div>
			<div class="header-actions">
				<div class="auth-badge">
					<span class="text-caption text-gray-600">Sign Up</span>
				</div>
			</div>
		</div>
	</header>

	<!-- Main Signup Form Card -->
	<main class="auth-main">
		<div class="auth-card glass-card animate-entrance animate-entrance-delay-2" class:mounted>
			<!-- Form Header -->
			<div class="form-header">
				<h2 class="text-heading-2 text-gray-800">Create Account</h2>
				<p class="text-body text-gray-600">Join PlantCam to monitor your plants</p>
			</div>

			<!-- Signup Form -->
			<form
				class="auth-form"
				class:loading={isLoading}
				onsubmit={(e) => {
					e.preventDefault();
					handleSignup();
				}}
			>
				<div class="form-fields">
					<!-- Name Field -->
					<div class="form-field">
						<label for="name" class="form-label text-body text-gray-700"> Full Name </label>
						<input
							id="name"
							type="text"
							bind:value={name}
							onkeypress={handleKeyPress}
							required
							class="form-input glass focus-ring"
							placeholder="Enter your full name"
							disabled={isLoading}
						/>
					</div>

					<!-- Email Field -->
					<div class="form-field">
						<label for="email" class="form-label text-body text-gray-700"> Email Address </label>
						<input
							id="email"
							type="email"
							bind:value={email}
							onkeypress={handleKeyPress}
							required
							class="form-input glass focus-ring"
							placeholder="Enter your email"
							disabled={isLoading}
						/>
					</div>

					<!-- Password Field -->
					<div class="form-field">
						<label for="password" class="form-label text-body text-gray-700"> Password </label>
						<input
							id="password"
							type="password"
							bind:value={password}
							onkeypress={handleKeyPress}
							required
							class="form-input glass focus-ring"
							placeholder="Enter your password (min 8 characters)"
							disabled={isLoading}
						/>
					</div>

					<!-- Confirm Password Field -->
					<div class="form-field">
						<label for="confirmPassword" class="form-label text-body text-gray-700">
							Confirm Password
						</label>
						<input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							onkeypress={handleKeyPress}
							required
							class="form-input glass focus-ring"
							placeholder="Confirm your password"
							disabled={isLoading}
						/>
					</div>
				</div>

				<!-- Error Message -->
				{#if error}
					<div class="error-message glass animate-entrance" class:mounted>
						<div class="error-icon">⚠️</div>
						<p class="text-body-small text-red-600">{error}</p>
					</div>
				{/if}

				<!-- Success Message -->
				{#if success}
					<div class="success-message glass animate-entrance" class:mounted>
						<div class="success-icon">✅</div>
						<p class="text-body-small text-green-600">{success}</p>
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={isLoading}
					class="submit-button glass-button animate-hover-lift focus-ring"
					class:loading={isLoading}
				>
					{#if isLoading}
						<div class="loading-spinner">
							<svg
								class="spinner-icon"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									class="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									stroke-width="4"
								></circle>
								<path
									class="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							<span class="text-body">Creating account...</span>
						</div>
					{:else}
						<span class="text-body">Create Account</span>
					{/if}
				</button>
			</form>

			<!-- Navigation Link -->
			<div class="auth-navigation">
				<p class="text-body-small text-gray-600">
					Already have an account?
					<a href="/login" class="auth-link text-gradient-nature animate-hover-scale">
						Sign in here
					</a>
				</p>
			</div>
		</div>
	</main>
</div>

<style>
	.signup-container {
		min-height: 100vh;
		position: relative;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		max-width: 500px;
		margin: 0 auto;
		gap: 2rem;
	}

	/* Dashboard Header Styling - Consistent with main dashboard */
	.dashboard-header {
		padding: 2rem 0;
		max-width: 500px;
		margin: 0 auto;
		width: 100%;
	}

	.dashboard-header.auth-header {
		text-align: center;
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.auth-header .header-content {
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}

	.header-text {
		text-align: center;
		flex: 1;
	}

	.header-actions {
		flex-shrink: 0;
	}

	.auth-badge {
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

	.auth-badge:hover {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(1.05);
	}

	/* Header Animation Integration */
	.dashboard-header h1 {
		margin-bottom: 0.5rem;
		filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.2));
		transition: filter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.dashboard-header.mounted h1 {
		filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.3));
	}

	/* Enhanced entrance animation for header elements */
	.header-text {
		opacity: 0;
		transform: translateY(20px);
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.dashboard-header.mounted .header-text {
		opacity: 1;
		transform: translateY(0);
	}

	.header-actions {
		opacity: 0;
		transform: translateX(20px);
		transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
		transition-delay: 0.2s;
	}

	.dashboard-header.mounted .header-actions {
		opacity: 1;
		transform: translateX(0);
	}

	.auth-header h1 {
		margin-bottom: 0.5rem;
		filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.2));
	}

	.auth-main {
		width: 100%;
		display: flex;
		justify-content: center;
	}

	.auth-card {
		width: 100%;
		max-width: 400px;
		background: rgba(255, 255, 255, 0.25);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
		border-radius: 1rem;
		padding: 2rem;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.auth-card::before {
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

	.auth-card:hover::before {
		left: 100%;
	}

	.auth-card:hover {
		transform: translateY(-4px);
		box-shadow:
			0 25px 50px -12px rgba(31, 38, 135, 0.25),
			0 0 25px rgba(34, 197, 94, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.35);
	}

	.form-header {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.3);
		position: relative;
	}

	.form-header::after {
		content: '';
		position: absolute;
		bottom: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, #22c55e, #0ea5e9);
		transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: width;
		transform: translateX(-50%) translateZ(0);
		backface-visibility: hidden;
	}

	.auth-card:hover .form-header::after {
		width: 100%;
	}

	.form-header h2 {
		margin: 0 0 0.5rem 0;
		color: #1f2937;
	}

	.form-header p {
		margin: 0;
		opacity: 0.8;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-fields {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		animation: slideInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateY(20px) translateZ(0);
		backface-visibility: hidden;
	}

	.form-field:nth-child(1) {
		animation-delay: 0.1s;
	}

	.form-field:nth-child(2) {
		animation-delay: 0.2s;
	}

	.form-field:nth-child(3) {
		animation-delay: 0.3s;
	}

	.form-field:nth-child(4) {
		animation-delay: 0.4s;
	}

	.form-label {
		font-weight: 500;
		margin-bottom: 0.25rem;
		transition:
			color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		/* Performance optimizations */
		will-change: color, transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.form-label::after {
		content: '';
		position: absolute;
		bottom: -2px;
		left: 0;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, #22c55e, #0ea5e9);
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 1px;
		box-shadow: 0 0 8px rgba(34, 197, 94, 0.3);
		/* Performance optimizations */
		will-change: width;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.form-input {
		flex: 1;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		font-size: 1rem;
		color: #1f2937;
		position: relative;
		transition:
			border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: border-color, background-color, box-shadow, transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.form-input::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 0.75rem;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08));
		opacity: 0;
		transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
		/* Performance optimizations */
		will-change: opacity;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.form-input:hover::before {
		opacity: 1;
	}

	.form-input::placeholder {
		color: rgba(107, 114, 128, 0.7);
		transition: color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-input:hover {
		transform: translateY(-2px) translateZ(0);
		border-color: rgba(34, 197, 94, 0.4);
		background: rgba(255, 255, 255, 0.28);
		box-shadow:
			0 8px 25px rgba(31, 38, 135, 0.15),
			0 0 15px rgba(34, 197, 94, 0.12),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.form-input:hover::placeholder {
		color: rgba(107, 114, 128, 0.9);
	}

	.form-input:focus {
		outline: none;
		border-color: rgba(34, 197, 94, 0.6);
		background: rgba(255, 255, 255, 0.35);
		transform: translateY(-3px) translateZ(0);
		box-shadow:
			0 0 0 3px rgba(34, 197, 94, 0.15),
			0 12px 35px rgba(31, 38, 135, 0.2),
			0 0 25px rgba(34, 197, 94, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.form-field:focus-within .form-label {
		color: #22c55e;
		transform: translateY(-2px) translateZ(0);
	}

	.form-field:focus-within .form-label::after {
		width: 100%;
	}

	.form-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		background: rgba(255, 255, 255, 0.1);
		transform: none;
		position: relative;
		overflow: hidden;
		transition:
			opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.form-input:disabled::after {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(156, 163, 175, 0.2) 50%,
			transparent 100%
		);
		animation: disabledShimmer 3s ease-in-out infinite;
		/* Performance optimizations */
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.form-input:disabled:hover {
		transform: none;
		border-color: rgba(255, 255, 255, 0.3);
		background: rgba(255, 255, 255, 0.1);
		box-shadow: none;
	}

	.error-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: rgba(239, 68, 68, 0.15);
		border: 1px solid rgba(239, 68, 68, 0.3);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		margin: -0.5rem 0 0.5rem 0;
		position: relative;
		overflow: hidden;
		box-shadow:
			0 8px 25px rgba(239, 68, 68, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		opacity: 0;
		transform: translateY(-10px) scale(0.95);
		animation: errorSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateY(-10px) scale(0.95) translateZ(0);
		backface-visibility: hidden;
	}

	.error-message::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.6s ease;
		/* Performance optimizations */
		will-change: left;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.error-message:hover::before {
		left: 100%;
	}

	.error-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
		animation: errorIconPulse 2s ease-in-out infinite;
	}

	.error-message p {
		margin: 0;
		flex: 1;
		font-weight: 500;
	}

	.success-message {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 1.25rem;
		border-radius: 0.75rem;
		background: rgba(34, 197, 94, 0.15);
		border: 1px solid rgba(34, 197, 94, 0.3);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		margin: -0.5rem 0 0.5rem 0;
		position: relative;
		overflow: hidden;
		box-shadow:
			0 8px 25px rgba(34, 197, 94, 0.1),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		opacity: 0;
		transform: translateY(-10px) scale(0.95);
		animation: successSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateY(-10px) scale(0.95) translateZ(0);
		backface-visibility: hidden;
	}

	.success-message::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
		transition: left 0.6s ease;
		/* Performance optimizations */
		will-change: left;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.success-message:hover::before {
		left: 100%;
	}

	.success-icon {
		font-size: 1.25rem;
		flex-shrink: 0;
		filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
		animation: successIconPulse 2s ease-in-out infinite;
	}

	.success-message p {
		margin: 0;
		flex: 1;
		font-weight: 500;
	}

	.submit-button {
		width: 100%;
		padding: 1.125rem 1.5rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.9));
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		color: white;
		font-weight: 600;
		font-size: 1rem;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		box-shadow:
			0 8px 25px rgba(34, 197, 94, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
		transition:
			background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, background, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.submit-button::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.6s ease;
		/* Performance optimizations */
		will-change: left;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.submit-button:hover:not(:disabled)::before {
		left: 100%;
	}

	.submit-button:hover:not(:disabled) {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 1));
		transform: translateY(-3px) translateZ(0);
		box-shadow:
			0 12px 35px rgba(34, 197, 94, 0.35),
			0 0 25px rgba(34, 197, 94, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3),
			0 0 0 1px rgba(34, 197, 94, 0.1);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(-1px) translateZ(0);
		box-shadow:
			0 6px 20px rgba(34, 197, 94, 0.25),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
		background: linear-gradient(135deg, rgba(107, 114, 128, 0.6), rgba(75, 85, 99, 0.7));
	}

	.submit-button:disabled::before {
		display: none;
	}

	.submit-button.loading {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.7), rgba(22, 163, 74, 0.8));
		cursor: wait;
		transform: scale(0.98) translateZ(0);
		box-shadow:
			0 4px 15px rgba(34, 197, 94, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			0 0 0 1px rgba(34, 197, 94, 0.1);
		transition:
			background 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, background, box-shadow;
		backface-visibility: hidden;
	}

	.submit-button.loading::before {
		display: none;
	}

	.submit-button.loading::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 0.75rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		animation: loadingShimmer 2s ease-in-out infinite;
		/* Performance optimizations */
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* Loading state for entire form */
	.auth-form.loading {
		pointer-events: none;
		position: relative;
	}

	.auth-form.loading::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(2px);
		border-radius: 0.75rem;
		z-index: 1;
		opacity: 0;
		animation: formLoadingOverlay 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
	}

	.loading-spinner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.75rem;
		position: relative;
		opacity: 0;
		transform: scale(0.9);
		animation: loadingSpinnerEnter 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: scale(0.9) translateZ(0);
		backface-visibility: hidden;
	}

	.spinner-icon {
		width: 1.25rem;
		height: 1.25rem;
		animation: dashboardSpin 1.2s linear infinite;
		color: white;
		filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
		position: relative;
		/* Performance optimizations */
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.spinner-icon::before {
		content: '';
		position: absolute;
		top: -2px;
		left: -2px;
		right: -2px;
		bottom: -2px;
		border-radius: 50%;
		background: conic-gradient(from 0deg, transparent, rgba(255, 255, 255, 0.3), transparent);
		animation: dashboardSpin 2s linear infinite reverse;
		z-index: -1;
		/* Performance optimizations */
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* Enhanced loading state visual feedback */
	.submit-button.loading {
		position: relative;
		overflow: hidden;
	}

	.submit-button.loading::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		border-radius: 0.75rem;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.2) 50%,
			rgba(255, 255, 255, 0.1) 100%
		);
		animation: loadingShimmer 2s ease-in-out infinite;
		/* Performance optimizations */
		will-change: transform;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	/* Form submission visual feedback */
	.auth-form.loading .form-input {
		pointer-events: none;
		opacity: 0.7;
		background: rgba(255, 255, 255, 0.15);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.auth-form.loading .form-label {
		opacity: 0.6;
		transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Consistent transition timing with dashboard */
	.signup-container * {
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Ensure consistent focus states across all interactive elements */
	.focus-ring:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #22c55e,
			0 0 20px rgba(34, 197, 94, 0.3);
		transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Ensure smooth transitions match dashboard timing */
	.auth-card,
	.form-input,
	.submit-button,
	.auth-link {
		transition-duration: 0.3s;
		transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Consistent animation delays matching dashboard */
	.animate-entrance-delay-2 {
		transition-delay: 0.3s;
	}

	/* Enhanced visual feedback for form interactions */
	.form-input:valid:not(:placeholder-shown) {
		border-color: rgba(34, 197, 94, 0.4);
		background: rgba(34, 197, 94, 0.05);
	}

	.form-input:invalid:not(:placeholder-shown):not(:focus) {
		border-color: rgba(239, 68, 68, 0.4);
		background: rgba(239, 68, 68, 0.05);
	}

	/* Final consistency polish - ensure all elements use consistent spacing */
	.signup-container {
		--auth-spacing-xs: 0.25rem;
		--auth-spacing-sm: 0.5rem;
		--auth-spacing-md: 1rem;
		--auth-spacing-lg: 1.5rem;
		--auth-spacing-xl: 2rem;
	}

	/* Ensure consistent border radius across all elements */
	.auth-card,
	.form-input,
	.submit-button,
	.error-message,
	.success-message {
		border-radius: 0.75rem;
	}

	/* Consistent shadow depths */
	.auth-card {
		box-shadow:
			0 8px 32px rgba(31, 38, 135, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.form-input:focus {
		box-shadow:
			0 0 0 3px rgba(34, 197, 94, 0.15),
			0 12px 35px rgba(31, 38, 135, 0.2),
			0 0 25px rgba(34, 197, 94, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.4);
	}

	.loading-spinner span {
		position: relative;
		z-index: 1;
		opacity: 0;
		transform: translateY(2px);
		animation: loadingTextFade 0.4s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
		/* Performance optimizations */
		will-change: transform, opacity;
		transform: translateY(2px) translateZ(0);
		backface-visibility: hidden;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes dashboardSpin {
		from {
			transform: rotate(0deg) translateZ(0);
		}
		to {
			transform: rotate(360deg) translateZ(0);
		}
	}

	@keyframes loadingSpinnerEnter {
		0% {
			opacity: 0;
			transform: scale(0.9) translateZ(0);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateZ(0);
		}
	}

	@keyframes loadingTextFade {
		0% {
			opacity: 0;
			transform: translateY(2px) translateZ(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0) translateZ(0);
		}
	}

	@keyframes loadingShimmer {
		0% {
			transform: translateX(-100%) translateZ(0);
		}
		100% {
			transform: translateX(100%) translateZ(0);
		}
	}

	@keyframes disabledShimmer {
		0% {
			transform: translateX(-100%) translateZ(0);
		}
		100% {
			transform: translateX(100%) translateZ(0);
		}
	}

	@keyframes fieldErrorShake {
		0%,
		100% {
			transform: translateX(0) translateZ(0);
		}
		25% {
			transform: translateX(-4px) translateZ(0);
		}
		75% {
			transform: translateX(4px) translateZ(0);
		}
	}

	@keyframes fieldSuccessPulse {
		0% {
			transform: scale(1) translateZ(0);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4);
		}
		50% {
			transform: scale(1.02) translateZ(0);
			box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.1);
		}
		100% {
			transform: scale(1) translateZ(0);
			box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
		}
	}

	@keyframes formLoadingOverlay {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	@keyframes slideInUp {
		0% {
			opacity: 0;
			transform: translateY(20px) translateZ(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0) translateZ(0);
		}
	}

	@keyframes errorSlideIn {
		0% {
			opacity: 0;
			transform: translateY(-10px) scale(0.95) translateZ(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1) translateZ(0);
		}
	}

	@keyframes successSlideIn {
		0% {
			opacity: 0;
			transform: translateY(-10px) scale(0.95) translateZ(0);
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1) translateZ(0);
		}
	}

	@keyframes errorIconPulse {
		0%,
		100% {
			transform: scale(1);
			filter: drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3));
		}
		50% {
			transform: scale(1.1);
			filter: drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4));
		}
	}

	@keyframes successIconPulse {
		0%,
		100% {
			transform: scale(1);
			filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
		}
		50% {
			transform: scale(1.1);
			filter: drop-shadow(0 4px 8px rgba(34, 197, 94, 0.4));
		}
	}

	.auth-navigation {
		text-align: center;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.2);
		margin-top: 0.5rem;
	}

	.auth-navigation p {
		margin: 0;
	}

	.auth-link {
		font-weight: 600;
		text-decoration: none;
		transition:
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			filter 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, filter;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.auth-link:hover {
		transform: scale(1.05);
		filter: drop-shadow(0 2px 4px rgba(34, 197, 94, 0.3));
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

	/* Enhanced Responsive Design - Matching Dashboard Breakpoints */

	/* Large Desktop (1200px+) - Enhanced layout for large screens */
	@media (min-width: 1200px) {
		.signup-container {
			padding: 2.5rem;
			max-width: 550px;
			gap: 2.5rem;
		}

		.auth-card {
			max-width: 450px;
			padding: 2.5rem;
		}

		.dashboard-header {
			padding: 2.5rem 0;
		}

		.auth-header h1 {
			font-size: 4rem;
		}

		.auth-header p {
			font-size: 1.125rem;
		}

		.auth-badge {
			padding: 0.75rem 1.5rem;
			font-size: 0.875rem;
		}

		.form-header h2 {
			font-size: 2rem;
		}

		.form-input {
			padding: 1.25rem 1.5rem;
			font-size: 1.125rem;
		}

		.submit-button {
			padding: 1.25rem 2rem;
			font-size: 1.125rem;
		}
	}

	/* Desktop/Laptop (1024px - 1199px) - Balanced layout */
	@media (max-width: 1199px) and (min-width: 1024px) {
		.signup-container {
			padding: 2rem;
			max-width: 500px;
			gap: 2rem;
		}

		.auth-card {
			max-width: 420px;
			padding: 2.25rem;
		}

		.dashboard-header {
			padding: 2rem 0;
		}

		.auth-header h1 {
			font-size: 3.5rem;
		}

		.auth-badge {
			padding: 0.625rem 1.25rem;
			font-size: 0.8125rem;
		}

		.form-input {
			padding: 1.125rem 1.375rem;
			font-size: 1.0625rem;
		}

		.submit-button {
			padding: 1.125rem 1.75rem;
			font-size: 1.0625rem;
		}
	}

	/* Tablet Landscape (768px - 1023px) - Enhanced tablet experience */
	@media (max-width: 1023px) and (min-width: 768px) {
		.signup-container {
			padding: 1.5rem;
			max-width: 450px;
			gap: 1.75rem;
		}

		.auth-card {
			max-width: 400px;
			padding: 2rem;
			border-radius: 1.25rem;
		}

		.dashboard-header {
			padding: 1.75rem 0;
		}

		.auth-badge {
			padding: 0.5rem 1rem;
			font-size: 0.75rem;
		}

		.auth-header h1 {
			font-size: 3rem;
		}

		.form-fields {
			gap: 1.375rem;
		}

		.form-input {
			padding: 1rem 1.25rem;
			font-size: 1rem;
			border-radius: 0.875rem;
			min-height: 48px; /* Enhanced touch target */
		}

		.submit-button {
			padding: 1rem 1.5rem;
			font-size: 1rem;
			min-height: 48px; /* Enhanced touch target */
			border-radius: 0.875rem;
		}

		/* Enhanced touch targets for tablet */
		.auth-link {
			padding: 0.5rem;
			margin: -0.5rem;
			border-radius: 0.5rem;
			min-height: 44px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		/* Tablet-specific hover effects */
		.auth-card:hover {
			transform: translateY(-6px);
			box-shadow:
				0 20px 40px -12px rgba(31, 38, 135, 0.2),
				0 0 20px rgba(34, 197, 94, 0.08),
				inset 0 1px 0 rgba(255, 255, 255, 0.5);
		}
	}

	/* Tablet Portrait & Large Mobile (481px - 767px) - Optimized for portrait tablets */
	@media (max-width: 767px) and (min-width: 481px) {
		.signup-container {
			padding: 1.25rem;
			max-width: 420px;
			gap: 1.5rem;
		}

		.auth-card {
			max-width: 380px;
			padding: 1.75rem;
			border-radius: 1rem;
		}

		.dashboard-header {
			padding: 1.5rem 0;
		}

		.auth-badge {
			padding: 0.5rem 0.875rem;
			font-size: 0.75rem;
		}

		.auth-header h1 {
			font-size: 2.75rem;
		}

		.form-fields {
			gap: 1.25rem;
		}

		.form-input {
			padding: 0.875rem 1.125rem;
			font-size: 1rem;
			min-height: 48px; /* Enhanced touch target */
			border-radius: 0.75rem;
		}

		.submit-button {
			padding: 1rem 1.375rem;
			font-size: 1rem;
			min-height: 48px; /* Enhanced touch target */
			border-radius: 0.75rem;
		}

		/* Enhanced touch targets */
		.auth-link {
			padding: 0.75rem;
			margin: -0.75rem;
			border-radius: 0.5rem;
			min-height: 44px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		/* Keyboard-aware adjustments */
		.form-input:focus {
			transform: translateY(-2px) translateZ(0);
			z-index: 10;
			position: relative;
		}
	}

	/* Mobile (320px - 480px) - Mobile-first optimizations */
	@media (max-width: 480px) {
		.signup-container {
			padding: 1rem;
			max-width: 100%;
			gap: 1.25rem;
			margin: 0;
		}

		.auth-card {
			max-width: 100%;
			padding: 1.5rem;
			margin: 0 0.5rem;
			border-radius: 1rem;
		}

		.dashboard-header {
			padding: 1.25rem 0;
		}

		.auth-badge {
			padding: 0.375rem 0.75rem;
			font-size: 0.6875rem;
		}

		.auth-header h1 {
			font-size: 2.25rem;
			line-height: 1.1;
		}

		.auth-header p {
			font-size: 0.9375rem;
		}

		.form-header {
			margin-bottom: 1.5rem;
			padding-bottom: 1rem;
		}

		.form-header h2 {
			font-size: 1.625rem;
		}

		.form-fields {
			gap: 1.125rem;
		}

		.form-input {
			padding: 1rem 1rem;
			font-size: 1rem;
			min-height: 52px; /* Enhanced mobile touch target */
			border-radius: 0.75rem;
		}

		.submit-button {
			padding: 1rem 1.25rem;
			font-size: 1rem;
			min-height: 52px; /* Enhanced mobile touch target */
			border-radius: 0.75rem;
		}

		.auth-navigation {
			padding-top: 1.25rem;
		}

		.auth-navigation p {
			font-size: 0.875rem;
		}

		/* Enhanced mobile touch targets */
		.auth-link {
			padding: 0.75rem 1rem;
			margin: -0.75rem -1rem;
			border-radius: 0.5rem;
			min-height: 48px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		/* Mobile keyboard-aware layout adjustments */
		.form-input:focus {
			transform: translateY(-3px) translateZ(0);
			z-index: 10;
			position: relative;
			box-shadow:
				0 0 0 3px rgba(34, 197, 94, 0.15),
				0 8px 25px rgba(31, 38, 135, 0.15),
				0 0 15px rgba(34, 197, 94, 0.1);
		}

		/* Optimize for mobile viewport */
		.signup-container {
			min-height: 100vh;
			min-height: 100dvh; /* Dynamic viewport height for mobile browsers */
		}
	}

	/* Extra small mobile (max 320px) - Ultra compact design */
	@media (max-width: 320px) {
		.signup-container {
			padding: 0.75rem;
			gap: 1rem;
			margin: 0;
		}

		.auth-card {
			padding: 1.25rem;
			margin: 0 0.25rem;
			border-radius: 0.875rem;
		}

		.dashboard-header {
			padding: 1rem 0;
		}

		.auth-badge {
			padding: 0.25rem 0.5rem;
			font-size: 0.625rem;
		}

		.auth-header h1 {
			font-size: 1.875rem;
		}

		.auth-header p {
			font-size: 0.875rem;
		}

		.form-header h2 {
			font-size: 1.375rem;
		}

		.form-fields {
			gap: 1rem;
		}

		.form-input {
			padding: 0.875rem 0.875rem;
			font-size: 0.9375rem;
			min-height: 48px;
		}

		.submit-button {
			padding: 0.875rem 1rem;
			font-size: 0.9375rem;
			min-height: 48px;
		}

		.auth-navigation p {
			font-size: 0.8125rem;
		}
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		/* Static alternatives for entrance animations */
		.animate-entrance {
			opacity: 1 !important;
			transform: translateY(0) scale(1) !important;
			transition: none !important;
		}

		/* Disable hover animations */
		.auth-card:hover {
			transform: none !important;
			background: rgba(255, 255, 255, 0.25) !important;
		}

		.auth-card:hover::before {
			left: -100% !important;
		}

		.auth-card:hover .form-header::after {
			width: 0 !important;
		}

		.submit-button:hover:not(:disabled) {
			transform: none !important;
		}

		.auth-link:hover {
			transform: none !important;
		}

		/* Disable spinner animation */
		.spinner-icon {
			animation: none !important;
		}

		.spinner-icon::before {
			animation: none !important;
			opacity: 0.3;
		}

		/* Disable loading animations */
		.loading-spinner {
			animation: none !important;
		}

		.loading-spinner span {
			animation: none !important;
			opacity: 1;
			transform: translateY(0) translateZ(0);
		}

		.submit-button.loading::after {
			animation: none !important;
			opacity: 0.2;
		}
		.form-input:disabled::after {
			animation: none !important;
			opacity: 0.1;
		}

		/* Maintain functionality without motion */
		.form-input:focus {
			background: rgba(255, 255, 255, 0.3) !important;
		}
	}

	/* Enhanced focus styles for accessibility */
	.focus-ring:focus {
		outline: none;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #22c55e;
	}

	/* Touch-friendly enhancements for mobile devices */
	@media (hover: none) and (pointer: coarse) {
		/* Enhanced touch targets for all interactive elements */
		.form-input {
			padding: 1rem;
			font-size: 1rem;
			min-height: 48px;
			border-radius: 0.75rem;
		}

		.submit-button {
			padding: 1rem 1.5rem;
			font-size: 1rem;
			min-height: 48px;
			border-radius: 0.75rem;
		}

		.auth-link {
			padding: 0.75rem 1rem;
			margin: -0.75rem -1rem;
			min-height: 44px;
			border-radius: 0.5rem;
			display: inline-flex;
			align-items: center;
			justify-content: center;
		}

		/* Optimize form field spacing for touch */
		.form-fields {
			gap: 1.25rem;
		}

		/* Enhanced focus states for touch devices */
		.form-input:focus {
			transform: translateY(-2px) translateZ(0);
			box-shadow:
				0 0 0 3px rgba(34, 197, 94, 0.2),
				0 8px 25px rgba(31, 38, 135, 0.15),
				0 0 15px rgba(34, 197, 94, 0.1);
		}

		/* Remove hover effects that don't work on touch */
		.auth-card:hover {
			transform: none;
			background: rgba(255, 255, 255, 0.25);
			box-shadow:
				0 8px 32px rgba(31, 38, 135, 0.15),
				inset 0 1px 0 rgba(255, 255, 255, 0.4);
		}

		.form-input:hover {
			transform: none;
			border-color: rgba(255, 255, 255, 0.3);
			background: rgba(255, 255, 255, 0.2);
		}

		.submit-button:hover:not(:disabled) {
			transform: none;
			background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.9));
		}
	}

	/* Keyboard navigation and accessibility enhancements */
	@media (any-hover: hover) {
		/* Enhanced keyboard focus indicators for desktop */
		.form-input:focus-visible {
			outline: 2px solid #22c55e;
			outline-offset: 2px;
		}

		.submit-button:focus-visible {
			outline: 2px solid #22c55e;
			outline-offset: 2px;
		}

		.auth-link:focus-visible {
			outline: 2px solid #22c55e;
			outline-offset: 2px;
			border-radius: 0.25rem;
		}
	}

	/* Viewport height adjustments for mobile keyboards */
	@media screen and (max-height: 600px) and (max-width: 768px) {
		.signup-container {
			min-height: 100vh;
			min-height: 100svh; /* Small viewport height for mobile keyboards */
			padding: 0.75rem;
			gap: 1rem;
		}

		.auth-header {
			padding: 0.75rem 0;
		}

		.auth-header h1 {
			font-size: 1.875rem;
		}

		.auth-card {
			padding: 1.25rem;
		}

		.form-header {
			margin-bottom: 1.25rem;
			padding-bottom: 0.75rem;
		}

		.form-fields {
			gap: 1rem;
		}
	}

	/* Landscape orientation optimizations for mobile */
	@media screen and (orientation: landscape) and (max-height: 500px) {
		.signup-container {
			flex-direction: row;
			align-items: center;
			justify-content: center;
			gap: 2rem;
			padding: 1rem;
		}

		.auth-header {
			flex: 0 0 auto;
			padding: 0;
			text-align: left;
			max-width: 200px;
		}

		.auth-header h1 {
			font-size: 1.75rem;
			margin-bottom: 0.25rem;
		}

		.auth-header p {
			font-size: 0.8125rem;
		}

		.auth-main {
			flex: 1;
			max-width: 350px;
		}

		.auth-card {
			padding: 1.5rem;
		}

		.form-header {
			margin-bottom: 1rem;
			padding-bottom: 0.75rem;
		}

		.form-header h2 {
			font-size: 1.375rem;
		}

		.form-fields {
			gap: 0.875rem;
		}

		.form-input {
			padding: 0.75rem 1rem;
		}

		.submit-button {
			padding: 0.75rem 1.25rem;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.auth-card {
			background: rgba(255, 255, 255, 0.9);
			border: 2px solid #000;
		}

		.form-input {
			background: rgba(255, 255, 255, 0.95);
			border: 2px solid #666;
		}

		.form-input:focus {
			border-color: #22c55e;
			box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.3);
		}

		.submit-button {
			background: linear-gradient(135deg, #22c55e, #16a34a);
			border: 2px solid #16a34a;
		}

		.error-message {
			background: rgba(239, 68, 68, 0.9);
			border: 2px solid #dc2626;
		}

		.success-message {
			background: rgba(34, 197, 94, 0.9);
			border: 2px solid #16a34a;
		}
	}

	/* Print styles */
	@media print {
		.signup-container {
			background: white;
			color: black;
		}

		.auth-card {
			background: white;
			border: 1px solid #ccc;
			box-shadow: none;
		}

		.submit-button,
		.loading-spinner {
			display: none;
		}

		.auth-navigation {
			display: none;
		}
	}
</style>
