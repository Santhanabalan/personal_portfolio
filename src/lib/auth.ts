import { env } from 'cloudflare:workers';
import { betterAuth } from 'better-auth';
import { admin } from 'better-auth/plugins';

interface AuthEnv {
	DB: D1Database;
	BETTER_AUTH_SECRET?: string;
	BETTER_AUTH_URL?: string;
	GITHUB_CLIENT_ID?: string;
	GITHUB_CLIENT_SECRET?: string;
}

const authEnv = env as unknown as AuthEnv;
const trustedOrigins = [authEnv.BETTER_AUTH_URL, 'http://localhost:4321', 'http://localhost:8787'].filter(
	(origin): origin is string => Boolean(origin),
);
const githubProvider =
	authEnv.GITHUB_CLIENT_ID && authEnv.GITHUB_CLIENT_SECRET
		? {
				github: {
					clientId: authEnv.GITHUB_CLIENT_ID,
					clientSecret: authEnv.GITHUB_CLIENT_SECRET,
				},
			}
		: {};

export const auth = betterAuth({
	database: authEnv.DB,
	secret: authEnv.BETTER_AUTH_SECRET,
	baseURL: authEnv.BETTER_AUTH_URL,
	trustedOrigins,
	socialProviders: githubProvider,
	plugins: [
		admin({
			defaultRole: 'user',
			adminRoles: ['admin'],
		}),
	],
});
