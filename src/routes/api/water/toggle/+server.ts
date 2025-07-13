import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { state } = await request.json();
        
        // Mock response - we'll implement actual GPIO control on the Raspberry Pi later
        return new Response(JSON.stringify({ 
            success: true,
            state: state,
            message: 'Watering control simulated (GPIO control will be implemented on Raspberry Pi)'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};
