<script lang="ts">
	import '../app.css';
	import NotificationContainer from '$lib/components/ui/NotificationContainer.svelte';
	import AuthGuard from '$lib/components/auth/AuthGuard.svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';

	let { children } = $props();

	// Define public routes that don't require authentication
	const publicRoutes = ['/login', '/signup'];
</script>

{#if browser && publicRoutes.includes(page.url.pathname)}
	{@render children()}
{:else if browser}
	<AuthGuard>
		{@render children()}
	</AuthGuard>
{:else}
	<!-- SSR fallback - render without auth check -->
	{@render children()}
{/if}

<!-- Global Notification Container -->
<NotificationContainer position="top-right" />
