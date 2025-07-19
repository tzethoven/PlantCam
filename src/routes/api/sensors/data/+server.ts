import { json } from '@sveltejs/kit';
import { getReadings } from '$lib/server/sensorData';
import { requireAuth } from '$lib/server/auth';

export async function GET({ request }) {
	await requireAuth(request.headers);

	return json(getReadings());
}
