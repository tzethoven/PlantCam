import { json } from '@sveltejs/kit';
import { getDHTSensorReadings, getDHTSensorReadingsForRange } from '$lib/server/database.js';
import { requireAuth } from '$lib/server/auth';

export async function GET({ url, request }) {
	await requireAuth(request.headers);

	const hoursBack = url.searchParams.get('hours') ? parseInt(url.searchParams.get('hours')!) : 24;
	const startTime = url.searchParams.get('start');
	const endTime = url.searchParams.get('end');

	try {
		let data;

		if (startTime && endTime) {
			// Get data for specific date range
			data = getDHTSensorReadingsForRange(parseInt(startTime), parseInt(endTime));
		} else {
			// Get recent data
			data = getDHTSensorReadings(hoursBack);
		}

		return json({
			success: true,
			data: data.map((row) => ({
				timestamp: row.timestamp,
				temperature: row.temperature,
				humidity: row.humidity,
				soil_humidity: row.soil_humidity
			}))
		});
	} catch (error) {
		console.error('Error fetching sensor history:', error);
		return json({ success: false, error: 'Failed to fetch sensor history' }, { status: 500 });
	}
}
