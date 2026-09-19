# Cloud 107

A self-hosted, source-first infrastructure control plane for nodes, workloads, runtimes, applications, resources, and observed state.

## Features
- **Frontend**: React 19, Vite, Tailwind CSS, sovereign workspace shell.
- **Backend**: Cloud107 modular control-plane architecture.
- **Database**: PostgreSQL via Drizzle ORM, with local relational session persistence.
- **Auth**: Self-Hosted Cloud107 Identity (WebAuthn / FIDO2 + sovereign local operator credentials).
- **CLI**: `c107` CLI supporting cryptographically verified source-first updates (`c107 update`).

## Getting Started

1. Set up your `.env` file using `.env.example` as a template.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

The dev server will run on port `3000`.

## Scripts
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the frontend and backend for production.
- `npm run start` - Starts the built production server.
- `npm run lint` - Lints the codebase using ESLint Flat Config.
- `npm run format` - Formats code using Prettier.
- `npm run test` - Runs Vitest tests.
- `npm run c107` - Runs the Cloud107 CLI.
- `npm run c107:update` - Runs the cryptographically verified source-first updater.

## Architecture
See `docs/backend-architecture.md` for a detailed breakdown of the backend structure and architectural decisions.
