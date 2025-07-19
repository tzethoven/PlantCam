<script lang="ts">
	import { useSession } from '$lib/auth/auth-client';
	import { goto } from '$app/navigation';
	import LoadingSkeleton from '$lib/components/ui/LoadingSkeleton.svelte';

	let { children, redirectTo = '/login' } = $props();

	const session = useSession();

	$effect(() => {
		if ($session?.data === null) {
			goto(redirectTo);
		}
	});
</script>

{#if $session?.data}
	{@render children()}
{:else}
	<div
		class="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50"
	>
		<div class="text-center">
			<LoadingSkeleton />
			{#if $session?.data === null}
				<p class="mt-4 text-gray-600">Redirecting to login...</p>
			{:else}
				<p class="mt-4 text-gray-600">Checking authentication...</p>
			{/if}
		</div>
	</div>
{/if}
