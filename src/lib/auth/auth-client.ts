import { createAuthClient } from 'better-auth/svelte';
export const { signIn, signUp, useSession, signOut } = createAuthClient({});
