import { betterAuth } from 'better-auth';
import { db } from './database.js';

export const auth = betterAuth({
	database: db,
	emailAndPassword: {
		enabled: true
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7, // 7 days
		updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
	}
});

// Helper function to check if user is authenticated
export async function requireAuth(headers: Headers) {
	const session = await auth.api.getSession({ headers });

	if (!session) {
		throw new Error('Authentication required');
	}

	return session;
}
