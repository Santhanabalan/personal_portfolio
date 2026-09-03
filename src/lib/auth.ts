import { env } from 'cloudflare:workers';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';

interface AuthEnv {
	DB: D1Database;
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
}

const authEnv = env as unknown as AuthEnv;
const trustedOrigins = [authEnv.BETTER_AUTH_URL, 'http://localhost:4321', 'http://localhost:8787'].filter(
	(origin): origin is string => Boolean(origin),
);

export const auth = betterAuth({
	database: authEnv.DB,
	secret: authEnv.BETTER_AUTH_SECRET,
	baseURL: authEnv.BETTER_AUTH_URL,
	trustedOrigins,
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
	],
});
