import type { RequestHandler } from '@sveltejs/kit';
import { startWatering, stopWatering, getWateringStatus } from '$lib/server/relayControl';

export const POST: RequestHandler = async ({ request }) => {
	try {
		if (process.env.NODE_ENV === 'development') {
			return new Response(
				JSON.stringify({
					success: true,
					state: true,
					message: `Watering started`
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}
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
