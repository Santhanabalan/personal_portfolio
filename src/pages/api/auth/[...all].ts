import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { auth } from '../../../lib/auth';

export const prerender = false;

export const ALL: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	if (request.method === 'POST' && url.pathname.endsWith('/api/auth/unlink-account')) {
		const session = await auth.api.getSession({ headers: request.headers });
		if (!session) return Response.json({ error: 'Authentication required.' }, { status: 401 });

		const body: unknown = await request
			.clone()
			.json()
			.catch(() => null);
		const accountId = body && typeof body === 'object' && 'accountId' in body ? body.accountId : null;
		if (typeof accountId !== 'string') return Response.json({ error: 'A valid account is required.' }, { status: 400 });

		const account = await env.DB.prepare(
			`select "id" from "account"
			where "id" = ? and "userId" = ? and "providerId" in ('github', 'google')`,
		)
			.bind(accountId, session.user.id)
			.first<{ id: string }>();
		if (!account) return Response.json({ error: 'OAuth account not found.' }, { status: 404 });

		const providers = await env.DB.prepare(
			`select count(*) as "count" from "account"
			where "userId" = ? and "providerId" in ('github', 'google')`,
		)
			.bind(session.user.id)
			.first<{ count: number }>();
		if (Number(providers?.count ?? 0) <= 1) {
			return Response.json({ error: 'Connect another provider before unlinking this one.' }, { status: 400 });
		}
	}

	return auth.handler(request);
};
