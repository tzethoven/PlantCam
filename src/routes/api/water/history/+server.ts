import { json } from '@sveltejs/kit';
import { getWateringEvents, getWateringEventsForRange } from '$lib/server/database.js';

export function GET({ url }) {
	const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
	const startTime = url.searchParams.get('start');
	const endTime = url.searchParams.get('end');

	try {
		let data;

		if (startTime && endTime) {
			// Get data for specific date range
			data = getWateringEventsForRange(parseInt(startTime), parseInt(endTime));
		} else {
			// Get recent data
			data = getWateringEvents(limit);
		}

		return json({
			success: true,
			data: data.map((row) => ({
				id: row.id,
				timestamp: row.timestamp,
				duration_seconds: row.duration_seconds,
				triggered_by: row.triggered_by,
				created_at: row.created_at
			}))
		});
	} catch (error) {
		console.error('Error fetching watering history:', error);
		return json({ success: false, error: 'Failed to fetch watering history' }, { status: 500 });
	}
}
