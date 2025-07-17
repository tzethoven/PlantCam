import type { RequestHandler } from '@sveltejs/kit';
import { getWateringStatus } from '$lib/server/relayControl';

export const GET: RequestHandler = async () => {
	try {
		if (process.env.NODE_ENV === 'development') {
			return new Response(
				JSON.stringify({
					success: true,
					isWatering: true
				}),
				{
					status: 200,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		}

		const isWatering = getWateringStatus();

		return new Response(
			JSON.stringify({
				success: true,
				isWatering
			}),
			{
				status: 200,
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
