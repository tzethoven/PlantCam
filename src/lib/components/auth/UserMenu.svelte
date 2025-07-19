<script lang="ts">
	import { useSession, signOut } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';

	const session = useSession();

	async function handleLogout() {
		try {
			await signOut();
			goto('/login');
		} catch (error) {
			console.error('Logout error:', error);
		}
	}
</script>

<div class="flex items-center space-x-4">
	{#if $session?.data?.user}
		<div class="flex items-center space-x-3">
			<div class="text-right">
				<p class="text-sm font-medium text-gray-900">{$session.data.user.name}</p>
				<p class="text-xs text-gray-500">{$session.data.user.email}</p>
			</div>
			<button
				on:click={handleLogout}
				class="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm leading-4 font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
			>
				Sign Out
			</button>
		</div>
	{:else}
		<div class="flex items-center space-x-3">
			<a
				href="/login"
				class="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm leading-4 font-medium text-white transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
			>
				Sign In
			</a>
		</div>
	{/if}
</div>
