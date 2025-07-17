<script lang="ts">
	import { notifications, removeNotification } from '$lib/utils/notifications';
	import NotificationToast from './NotificationToast.svelte';

	export let position:
		| 'top-right'
		| 'top-left'
		| 'bottom-right'
		| 'bottom-left'
		| 'top-center'
		| 'bottom-center' = 'top-right';
	export let maxNotifications: number = 5;

	$: visibleNotifications = $notifications.slice(-maxNotifications);
</script>

<div class="notification-container {position}">
	{#each visibleNotifications as notification (notification.id)}
		<NotificationToast
			type={notification.type}
			title={notification.title}
			message={notification.message}
			duration={notification.duration}
			dismissible={notification.dismissible}
			showIcon={notification.showIcon}
			showProgress={notification.showProgress}
			{position}
			on:dismiss={() => removeNotification(notification.id)}
		/>
	{/each}
</div>

<style>
	.notification-container {
		position: fixed;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		pointer-events: none;
	}

	.notification-container.top-right {
		top: 1rem;
		right: 1rem;
	}

	.notification-container.top-left {
		top: 1rem;
		left: 1rem;
	}

	.notification-container.bottom-right {
		bottom: 1rem;
		right: 1rem;
		flex-direction: column-reverse;
	}

	.notification-container.bottom-left {
		bottom: 1rem;
		left: 1rem;
		flex-direction: column-reverse;
	}

	.notification-container.top-center {
		top: 1rem;
		left: 50%;
		transform: translateX(-50%);
	}

	.notification-container.bottom-center {
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		flex-direction: column-reverse;
	}

	/* Mobile adjustments */
	@media (max-width: 480px) {
		.notification-container {
			gap: 0.5rem;
		}

		.notification-container.top-right,
		.notification-container.top-left {
			top: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
		}

		.notification-container.bottom-right,
		.notification-container.bottom-left {
			bottom: 0.5rem;
			left: 0.5rem;
			right: 0.5rem;
		}

		.notification-container.top-center,
		.notification-container.bottom-center {
			left: 0.5rem;
			right: 0.5rem;
			transform: none;
		}
	}
</style>
