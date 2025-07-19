<script lang="ts">
	import { signUp, useSession } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let isLoading = false;
	let error = '';
	let success = '';

	const session = useSession();

	onMount(() => {
		// Redirect to dashboard if already authenticated
		if (session.data) {
			goto('/');
		}
	});

	async function handleSignup() {
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
				success = 'Account created successfully! Please check your email to verify your account.';
				// Clear form
				name = '';
				email = '';
				password = '';
				confirmPassword = '';
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

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50"
>
	<div class="w-full max-w-md space-y-8 p-8">
		<div class="text-center">
			<h2 class="mb-2 text-3xl font-bold text-gray-900">Create Account</h2>
			<p class="text-gray-600">Join PlantCam to monitor your plants</p>
		</div>

		<form class="mt-8 space-y-6" on:submit|preventDefault={handleSignup}>
			<div class="space-y-4">
				<div>
					<label for="name" class="mb-1 block text-sm font-medium text-gray-700"> Full Name </label>
					<input
						id="name"
						type="text"
						bind:value={name}
						on:keypress={handleKeyPress}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
						placeholder="Enter your full name"
						disabled={isLoading}
					/>
				</div>

				<div>
					<label for="email" class="mb-1 block text-sm font-medium text-gray-700">
						Email Address
					</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						on:keypress={handleKeyPress}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
						placeholder="Enter your email"
						disabled={isLoading}
					/>
				</div>

				<div>
					<label for="password" class="mb-1 block text-sm font-medium text-gray-700">
						Password
					</label>
					<input
						id="password"
						type="password"
						bind:value={password}
						on:keypress={handleKeyPress}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
						placeholder="Enter your password (min 8 characters)"
						disabled={isLoading}
					/>
				</div>

				<div>
					<label for="confirmPassword" class="mb-1 block text-sm font-medium text-gray-700">
						Confirm Password
					</label>
					<input
						id="confirmPassword"
						type="password"
						bind:value={confirmPassword}
						on:keypress={handleKeyPress}
						required
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:outline-none"
						placeholder="Confirm your password"
						disabled={isLoading}
					/>
				</div>
			</div>

			{#if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-600">{error}</p>
				</div>
			{/if}

			{#if success}
				<div class="rounded-md border border-green-200 bg-green-50 p-3">
					<p class="text-sm text-green-600">{success}</p>
				</div>
			{/if}

			<button
				type="submit"
				disabled={isLoading}
				class="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
			>
				{#if isLoading}
					<svg
						class="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
						></circle>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						></path>
					</svg>
					Creating account...
				{:else}
					Create Account
				{/if}
			</button>
		</form>

		<div class="text-center">
			<p class="text-sm text-gray-600">
				Already have an account?
				<a href="/login" class="font-medium text-green-600 hover:text-green-500"> Sign in here </a>
			</p>
		</div>
	</div>
</div>
