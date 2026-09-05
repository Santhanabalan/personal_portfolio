# Personal Portfolio

A server-rendered personal portfolio built with Astro and deployed to Cloudflare Workers. The application includes account authentication, optional GitHub sign-in, protected API routes, profile management, and role-based administration backed by Cloudflare D1.

## Tech stack

- [Astro](https://astro.build/) with the Cloudflare adapter
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) for deployment
- [Cloudflare D1](https://developers.cloudflare.com/d1/) for persistence
- [Better Auth](https://www.better-auth.com/) for authentication and administration
- [Tailwind CSS](https://tailwindcss.com/) for styling
- TypeScript, ESLint, and Prettier for code quality

## Prerequisites

- Node.js 22.12 or later
- npm
- A Cloudflare account for edge previews and deployment

## Quick start

1. Install dependencies:

   ```sh
   npm install
   ```

2. Apply the D1 migrations to the local database:

   ```sh
   npx wrangler d1 migrations apply personal-portfolio-auth --local
   ```

3. Add local secrets to a `.dev.vars` file:

   ```dotenv
   BETTER_AUTH_SECRET=replace-with-a-random-secret
   BETTER_AUTH_URL=http://localhost:4321
   ```

4. Start the Astro development server:

   ```sh
   npm run dev
   ```

The application is available at `http://localhost:4321`.

## Configuration

The Worker expects the following bindings and variables:

| Name                   | Required | Purpose                                                         |
| ---------------------- | -------- | --------------------------------------------------------------- |
| `DB`                   | Yes      | D1 database binding used by Better Auth and the admin audit log |
| `BETTER_AUTH_SECRET`   | Yes      | Secret used to sign and encrypt authentication data             |
| `BETTER_AUTH_URL`      | Yes      | Public application origin, without a trailing slash             |
| `GITHUB_CLIENT_ID`     | No       | Enables GitHub sign-in when paired with `GITHUB_CLIENT_SECRET`  |
| `GITHUB_CLIENT_SECRET` | No       | GitHub OAuth client secret                                      |

For local development, keep secrets in `.dev.vars`. For production, add secrets with Wrangler:

```sh
npx wrangler secret put BETTER_AUTH_SECRET
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
```

GitHub OAuth is enabled only when both GitHub variables are present. Configure the OAuth callback URL as:

```text
https://<your-domain>/api/auth/callback/github
```

## Database migrations

Migration files live in `migrations/` and are applied in filename order.

Apply migrations locally:

```sh
npx wrangler d1 migrations apply personal-portfolio-auth --local
```

Apply migrations to the production database:

```sh
npx wrangler d1 migrations apply personal-portfolio-auth --remote
```

The migrations create the Better Auth schema, admin role fields, and the admin audit log.

## Available commands

| Command                  | Description                                          |
| ------------------------ | ---------------------------------------------------- |
| `npm run dev`            | Start the Astro development server                   |
| `npm run build`          | Create a production build in `dist/`                 |
| `npm run preview`        | Preview the Astro production build locally           |
| `npm run preview:edge`   | Build and run the application with Wrangler          |
| `npm run deploy`         | Build and deploy the Worker to Cloudflare            |
| `npm run generate-types` | Regenerate Cloudflare binding types                  |
| `npm run lint`           | Run ESLint                                           |
| `npm run format`         | Format the repository with Prettier                  |
| `npm run format:check`   | Check formatting without changing files              |
| `npm run check`          | Run formatting, linting, and production build checks |

## Project structure

```text
.
├── migrations/             # D1 schema migrations
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable Astro components
│   ├── layouts/            # Shared page layouts
│   ├── lib/                # Authentication configuration
│   ├── pages/              # Pages and API route handlers
│   ├── styles/             # Global styles
│   └── middleware.ts       # Request logging and API authentication
├── astro.config.mjs        # Astro, Tailwind, and Cloudflare setup
└── wrangler.jsonc          # Worker, D1, domain, and observability config
```

Routes under `/api/` require an authenticated session, except for Better Auth handlers under `/api/auth/`.

## Deploy

1. Authenticate Wrangler:

   ```sh
   npx wrangler login
   ```

2. Apply production database migrations:

   ```sh
   npx wrangler d1 migrations apply personal-portfolio-auth --remote
   ```

3. Configure the required production secrets.

4. Build and deploy:

   ```sh
   npm run deploy
   ```

Deployment settings, including the custom domain and D1 binding, are defined in `wrangler.jsonc`.
