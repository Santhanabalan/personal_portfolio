import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { auth } from '../../../../lib/auth';

export const prerender = false;

const actions = ['role', 'ban', 'unban', 'sessions'] as const;
type AdminAction = (typeof actions)[number];

const getReason = (action: AdminAction, role?: 'admin' | 'user') => {
	switch (action) {
		case 'role':
			return `Role changed to ${role}`;
		case 'ban':
			return 'Disabled by administrator';
		case 'unban':
			return 'Access restored by administrator';
		case 'sessions':
			return 'All active sessions revoked';
	}
};

export const POST: APIRoute = async ({ request, params }) => {
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return Response.json({ error: 'Authentication required.' }, { status: 401 });
	if (session.user.role !== 'admin') return Response.json({ error: 'Administrator access required.' }, { status: 403 });

	const targetUserId = params.userId;
	if (!targetUserId) return Response.json({ error: 'A target user is required.' }, { status: 400 });
	if (targetUserId === session.user.id)
		return Response.json({ error: 'You cannot manage your own access.' }, { status: 400 });

	const input: unknown = await request.json().catch(() => null);
	if (!input || typeof input !== 'object' || !('action' in input) || typeof input.action !== 'string') {
		return Response.json({ error: 'A valid action is required.' }, { status: 400 });
	}
	if (!actions.includes(input.action as AdminAction)) {
		return Response.json({ error: 'This admin action is not supported.' }, { status: 400 });
	}

	const action = input.action as AdminAction;
	const role = 'role' in input && (input.role === 'admin' || input.role === 'user') ? input.role : undefined;
	if (action === 'role' && !role) return Response.json({ error: 'A valid role is required.' }, { status: 400 });

	const database = env.DB;
	const auditId = crypto.randomUUID();
	const reason = getReason(action, role);
	await database
		.prepare(
			'insert into "adminAuditLog" ("id", "actorUserId", "targetUserId", "action", "reason", "status", "createdAt") values (?, ?, ?, ?, ?, ?, ?)',
		)
		.bind(auditId, session.user.id, targetUserId, action, reason, 'pending', Date.now())
		.run();

	try {
		switch (action) {
			case 'role':
				await auth.api.setRole({ headers: request.headers, body: { userId: targetUserId, role: role! } });
				break;
			case 'ban':
				await auth.api.banUser({
					headers: request.headers,
					body: { userId: targetUserId, banReason: reason },
				});
				break;
			case 'unban':
				await auth.api.unbanUser({ headers: request.headers, body: { userId: targetUserId } });
				break;
			case 'sessions':
				await auth.api.revokeUserSessions({ headers: request.headers, body: { userId: targetUserId } });
				break;
		}
		await database.prepare('update "adminAuditLog" set "status" = ? where "id" = ?').bind('succeeded', auditId).run();
		return Response.json({ success: true });
	} catch (error) {
		await database.prepare('update "adminAuditLog" set "status" = ? where "id" = ?').bind('failed', auditId).run();
		console.error('Audited admin action failed.', { auditId, action, error });
		return Response.json({ error: 'The access change could not be completed.' }, { status: 500 });
	}
};
