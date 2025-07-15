import { json } from '@sveltejs/kit';
import { getReadings } from '$lib/server/sensorData';

export function GET() {
	return json(getReadings());
}
