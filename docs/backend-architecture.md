# Backend Architecture

## Overview
The backend is a Node.js + Express application built with TypeScript, designed to serve as the single API layer for the Cloud Workspace project. It sits behind the Vite proxy during development and serves the built Vite assets in production.

## Tech Stack
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Cloud SQL)
- **ORM:** Drizzle ORM
- **Authentication:** Self-Hosted Cloud107 Identity (WebAuthn / FIDO2 + Sovereign Tokens)

## Modularity & Structure
The project follows a layered architecture to separate concerns:

- `src/server/app.ts`: Express application setup (middleware, logging, routing).
- `src/server/routes/`: Express route definitions, grouped by API version (e.g., `v1`).
- `src/server/middleware/`: Reusable Express middleware (e.g., authentication, error handling, correlation ID).
- `src/server/services/`: Business logic layer. Controllers call these services.
- `src/server/repositories/`: Database interaction layer using Drizzle ORM.
- `src/server/utils/`: Helper functions (e.g., standardized API responses).

## Key Features
1. **Standardized Responses:** All API endpoints return a predictable JSON structure (`{ success: boolean, data?: any, error?: { message, code } }`).
2. **Correlation IDs:** Every request is assigned a unique UUID to track requests across logs.
3. **Security:** Helmet for headers, CORS enabled, and Cloud107 Identity tokens verified on protected routes.
4. **Graceful Shutdown:** Handles `SIGINT` and `SIGTERM` to safely close the server.

## Database Access
SQL queries are not written in route handlers. Instead, the `UserRepository` abstracts the DB queries, and the `UserService` handles the logic of finding or creating users.

## Execution
- **Dev:** `npm run dev` starts the Express server using `tsx`, which also mounts Vite in middleware mode.
- **Build:** `npm run build` compiles Vite assets and bundles the Express backend using `esbuild` into `dist/server.cjs`.
- **Start:** `npm start` runs the bundled CJS server.
