import { auth } from '$lib/server/auth';
import type { RequestEvent } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import type { ResolveFn } from 'vite';

export async function handle({ event, resolve }: { event: RequestEvent; resolve: ResolveFn }) {
	return svelteKitHandler({ event, resolve, auth });
}
