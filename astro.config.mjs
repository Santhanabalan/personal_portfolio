// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

const siteURL = process.env.SITE_URL?.trim();

if (!siteURL) {
	throw new Error('SITE_URL is required. Set it in Cloudflare build variables or export it before running Astro.');
}

// https://astro.build/config
export default defineConfig({
	site: siteURL,
	integrations: [sitemap({ filter: (page) => new URL(page).pathname === '/' })],

	vite: {
		plugins: [tailwindcss()],
	},

	adapter: cloudflare(),
});
