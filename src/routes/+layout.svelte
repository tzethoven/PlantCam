<script lang="ts">
	import '../app.css';
	import NotificationContainer from '$lib/components/ui/NotificationContainer.svelte';

	let { children } = $props();
</script>

{@render children()}

<!-- Global Notification Container -->
<NotificationContainer position="top-right" />
