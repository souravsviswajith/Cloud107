# Runtime

Cloud107 currently runs as a Node.js application with a web interface and API.

## Application runtime

The production server is started with:

```bash
node dist/server.cjs
```

The server listens on port `3000` and binds to `0.0.0.0`.

In development, the server mounts Vite middleware. In production, it serves the built frontend from `dist/`.

## Request path

Requests enter the Express application through the server application layer:

```text
HTTP request
    │
    ▼
Request context
    │
    ▼
Request logging
    │
    ▼
Security / CORS / compression
    │
    ▼
JSON parsing
    │
    ▼
/api routes
    │
    ▼
Error handling
```

The request context provides a correlation ID used by the request logger.

## Shutdown

The server handles `SIGTERM` and `SIGINT`.

Shutdown closes the HTTP server before the process exits.

## Database runtime

```text
Cloud107
   │
   ▼
PostgreSQL
   ▲
   │
npm run db:migrate
```

Cloud107 uses PostgreSQL for persistent application state.

**Command**

```bash
npm run db:migrate
```

**Note:** Apply the database migrations required by the current source version.

In the Docker Compose deployment, the migration service completes before the application service starts.

## Environments

Cloud107 has separate development and production server behavior:

- **Development** — Vite middleware is mounted into the Express server.
- **Production** — the built frontend is served from `dist/` and the bundled server runs with Node.js.

The repository also contains workspace/runtime-related components. Their detailed execution contracts should be documented here as those components are implemented and verified.

## Update execution

The `c107` update pipeline is implemented as a source-first, verification-oriented sequence.

The current pipeline includes:

1. Identify the canonical origin.
2. Obtain update metadata.
3. Verify provenance.
4. Verify the release signature.
5. Verify artifact SHA-256 hashes.
6. Check compatibility.
7. Create a recovery checkpoint.
8. Stage update artifacts.
9. Build the source update.
10. Validate the staged result.
11. Stage the activation.
12. Run a health check.
13. Activate the update atomically.
14. Verify the activated version.
15. Commit the checkpoint.

A failure after checkpoint creation triggers the fail-closed rollback path.

The implementation is in `src/cli/update/`.

## Runtime state

Runtime state exposed by Cloud107 should come from the application and its connected resources. The UI should not invent process, node, resource, billing, or health state.

When a runtime capability is not connected or available, the interface should report that state rather than presenting simulated values.

## Scope

This page documents runtime behavior that is currently present in the repository. Planned runtime features should be added only after their implementation is available and verified.
