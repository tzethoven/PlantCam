import type { RequestHandler } from '@sveltejs/kit';
import { startWatering, stopWatering, getWateringStatus } from '$lib/server/relayControl';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { state } = await request.json();
		let success = false;
		let actualState = getWateringStatus();

		if (state && !actualState) {
			// Start watering
			success = startWatering();
			actualState = success;
		} else if (!state && actualState) {
			// Stop watering
			success = stopWatering();
			actualState = !success;
		} else {
			// No change needed
			success = true;
		}

		return new Response(
			JSON.stringify({
				success,
				state: actualState,
				message: success
					? `Watering ${actualState ? 'started' : 'stopped'}`
					: 'Failed to control watering'
			}),
			{
				status: success ? 200 : 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (error) {
		return new Response(
			JSON.stringify({
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	}
};
