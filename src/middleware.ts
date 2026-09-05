import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request }, next) => {
	const startedAt = performance.now();
	const path = new URL(request.url).pathname;
	const requestId = request.headers.get('cf-ray') ?? crypto.randomUUID();
	const requestContext = {
		requestId,
		method: request.method,
		path,
		country: request.cf?.country ?? null,
		colo: request.cf?.colo ?? null,
		asn: request.cf?.asn ?? null,
		asOrganization: request.cf?.asOrganization ?? null,
	};

	try {
		const response = await next();

		console.log({
			event: 'request.completed',
			...requestContext,
			status: response.status,
			durationMs: Math.round(performance.now() - startedAt),
		});

		return response;
	} catch (error) {
		console.error({
			event: 'request.failed',
			...requestContext,
			durationMs: Math.round(performance.now() - startedAt),
			errorName: error instanceof Error ? error.name : 'UnknownError',
		});

		throw error;
	}
});
