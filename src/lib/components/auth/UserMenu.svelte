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

<div class="user-menu">
	{#if $session?.data?.user}
		<div class="user-info">
			<div class="user-details">
				<p class="user-name">{$session.data.user.name}</p>
				<p class="user-email">{$session.data.user.email}</p>
			</div>
			<button
				onclick={handleLogout}
				class="logout-button glass-button animate-hover-lift focus-ring"
			>
				<span class="button-text">Sign Out</span>
			</button>
		</div>
	{:else}
		<div class="auth-actions">
			<a href="/login" class="signin-button glass-button animate-hover-lift focus-ring">
				<span class="button-text">Sign In</span>
			</a>
		</div>
	{/if}
</div>

<style>
	.user-menu {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-info {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.user-details {
		text-align: right;
	}

	.user-name {
		font-size: 0.875rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
		line-height: 1.2;
	}

	.user-email {
		font-size: 0.75rem;
		color: #6b7280;
		margin: 0;
		line-height: 1.2;
	}

	.auth-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.glass-button {
		padding: 0.5rem 1rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255, 255, 255, 0.3);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		font-size: 0.875rem;
		font-weight: 600;
		cursor: pointer;
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
		transition:
			background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
			box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		/* Performance optimizations */
		will-change: transform, background, box-shadow;
		transform: translateZ(0);
		backface-visibility: hidden;
	}

	.glass-button::before {
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

	.glass-button:hover::before {
		left: 100%;
	}

	.logout-button {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.8), rgba(220, 38, 38, 0.9));
		color: white;
		box-shadow:
			0 4px 16px rgba(239, 68, 68, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.logout-button:hover {
		background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 1));
		transform: translateY(-2px) translateZ(0);
		box-shadow:
			0 8px 25px rgba(239, 68, 68, 0.3),
			0 0 15px rgba(239, 68, 68, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.signin-button {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.8), rgba(22, 163, 74, 0.9));
		color: white;
		box-shadow:
			0 4px 16px rgba(34, 197, 94, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.2);
	}

	.signin-button:hover {
		background: linear-gradient(135deg, rgba(34, 197, 94, 0.9), rgba(22, 163, 74, 1));
		transform: translateY(-2px) translateZ(0);
		box-shadow:
			0 8px 25px rgba(34, 197, 94, 0.3),
			0 0 15px rgba(34, 197, 94, 0.2),
			inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}

	.button-text {
		position: relative;
		z-index: 1;
	}

	.animate-hover-lift {
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.animate-hover-lift:hover {
		transform: translateY(-2px) translateZ(0);
	}

	.focus-ring:focus-visible {
		outline: none;
		box-shadow:
			0 0 0 2px white,
			0 0 0 4px #22c55e,
			0 0 20px rgba(34, 197, 94, 0.3);
		transition: box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.user-menu {
			gap: 0.75rem;
		}

		.user-info {
			gap: 0.75rem;
		}

		.user-name {
			font-size: 0.8125rem;
		}

		.user-email {
			font-size: 0.6875rem;
		}

		.glass-button {
			padding: 0.5rem 0.875rem;
			font-size: 0.8125rem;
			min-height: 40px;
		}
	}

	@media (max-width: 480px) {
		.user-info {
			flex-direction: column;
			align-items: flex-end;
			gap: 0.5rem;
		}

		.user-details {
			text-align: right;
		}

		.user-name {
			font-size: 0.75rem;
		}

		.user-email {
			font-size: 0.625rem;
		}

		.glass-button {
			padding: 0.5rem 0.75rem;
			font-size: 0.75rem;
			min-height: 36px;
		}
	}

	/* Reduced Motion Support */
	@media (prefers-reduced-motion: reduce) {
		.glass-button {
			transition: none !important;
		}

		.glass-button:hover {
			transform: none !important;
		}

		.glass-button::before {
			display: none !important;
		}

		.animate-hover-lift:hover {
			transform: none !important;
		}
	}
</style>
