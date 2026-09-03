import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
	return new Response(
		JSON.stringify({
			message: 'hello',
			timestamp: Date.now(),
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
};