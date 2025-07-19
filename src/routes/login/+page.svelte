<script lang="ts">
	import { signIn, useSession } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let isLoading = false;
	let error = '';

	const session = useSession();

	onMount(() => {
		// Redirect to dashboard if already authenticated
		if ($session?.data) {
			goto('/');
		}
	});

	async function handleLogin() {
		if (!email || !password) {
			error = 'Please fill in all fields';
			return;
		}

		isLoading = true;
		error = '';

		try {
			const result = await signIn.email({
				email,
				password,
				rememberMe: true
			});

			if (result.error) {
				error = result.error.message || 'Login failed';
			} else {
				// Redirect to dashboard on success
				goto('/');
			}
		} catch (err) {
			error = 'An unexpected error occurred';
			console.error('Login error:', err);
		} finally {
			isLoading = false;
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleLogin();
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50"
>
	<div class="w-full max-w-md space-y-8 p-8">
		<div class="text-center">
			<h2 class="mb-2 text-3xl font-bold text-gray-900">Welcome Back</h2>
			<p class="text-gray-600">Sign in to your PlantCam dashboard</p>
		</div>

		<form class="mt-8 space-y-6" on:submit|preventDefault={handleLogin}>
			<div class="space-y-4">
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
						placeholder="Enter your password"
						disabled={isLoading}
					/>
				</div>
			</div>

			{#if error}
				<div class="rounded-md border border-red-200 bg-red-50 p-3">
					<p class="text-sm text-red-600">{error}</p>
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
					Signing in...
				{:else}
					Sign In
				{/if}
			</button>
		</form>

		<div class="text-center">
			<p class="text-sm text-gray-600">
				Don't have an account?
				<a href="/signup" class="font-medium text-green-600 hover:text-green-500"> Sign up here </a>
			</p>
		</div>
	</div>
</div>
