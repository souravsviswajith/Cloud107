# Runtime

Cloud107 currently runs as a Node.js application with a web interface and API.

This page describes the runtime boundaries and execution paths currently present in the repository.

## Guide

### 1. Runtime architecture

```text
                              Cloud107
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        ▼                         ▼                         ▼
 Web Workspace               c107 CLI                 Core / Contracts
 React / TypeScript          TypeScript / Node.js      C# / .NET
 HTML / CSS / Vite           Git / shell tooling       .NET APIs
        │                         │                         │
        └─────────────────────────┼─────────────────────────┘
                                  ▼
                         Node.js Application
                         TypeScript / Express
                                  │
                    HTTP / JSON / API boundary
                                  │
                 ┌────────────────┴───────────────┐
                 ▼                                ▼
          PostgreSQL                        Update System
          SQL / Drizzle                    TypeScript / Node.js
                 │                         Git / cryptography
                 ▼                                │
          Persistent state                       ▼
                                      Verify → Stage → Activate
                                      → Health → Rollback

Platform boundary:
OS / platform APIs → supported hardware / network interfaces
```

**Note:** Platform-native or lower-level components are included only where the repository implements or explicitly depends on them.

**Reference:** [Architecture](../architecture/) · [Node.js](https://nodejs.org/docs/latest/api/) · [.NET](https://learn.microsoft.com/en-us/dotnet/)

### 2. Start the production runtime

```text
Source
  │
  ▼
npm run build
  │
  ▼
dist/
  │
  ▼
node dist/server.cjs
  │
  ▼
HTTP :3000
```

**Commands**

```bash
npm run build
node dist/server.cjs
```

**Note:** The production server runs the generated server bundle and serves the built application.

**Expected result:** Cloud107 listens on port `3000` and binds to `0.0.0.0`.

**Reference:** [Node.js](https://nodejs.org/docs/latest/api/) · [Vite build guide](https://vite.dev/guide/build.html)

### 3. Development runtime

```text
Cloud107 source
      │
      ▼
Node.js / Express
      │
      ├── Vite middleware
      │       │
      │       ▼
      │   Web workspace
      │
      └── API routes
```

**Command**

```bash
npm run dev
```

**Note:** Development mode mounts Vite middleware into the Express server.

**Expected result:** The development workspace and API run through the configured development server.

**Reference:** [Vite server guide](https://vite.dev/guide/) · [Express](https://expressjs.com/)

### 4. Request path

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

**Note:** Middleware processes the request before it reaches the API routes. The correlation ID connects request activity in the logs.

**Reference:** [Express middleware](https://expressjs.com/en/guide/using-middleware.html) · [HTTP overview — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

### 5. Runtime interfaces

| Boundary | Current technology | Interface |
|---|---|---|
| Browser → application | React / TypeScript / Vite | HTTP |
| Client → API | Node.js / Express / TypeScript | HTTP / JSON |
| Application → database | Drizzle / PostgreSQL | SQL |
| Update pipeline | TypeScript / Node.js | Git / cryptographic verification |
| Process shutdown | Node.js | SIGTERM / SIGINT |

**Note:** Protocol and standard names should describe interfaces actually implemented by the repository.

**Reference:** [React](https://react.dev/learn) · [Express](https://expressjs.com/) · [PostgreSQL](https://www.postgresql.org/docs/)

### 6. Database runtime

```text
Cloud107
   │
   ▼
Drizzle
   │
   ▼
PostgreSQL
   ▲
   │
npm run db:migrate
```

**Command**

```bash
npm run db:migrate
```

**Note:** Apply the database migrations required by the current source version.

**Expected result:** PostgreSQL contains the schema required by the current application source.

**Reference:** [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) · [PostgreSQL](https://www.postgresql.org/docs/)

### 7. Shutdown

```text
SIGTERM / SIGINT
       │
       ▼
HTTP server
       │
       ▼
Server closed
       │
       ▼
Process exits
```

**Note:** The server handles `SIGTERM` and `SIGINT` and closes the HTTP server before exiting.

**Expected result:** The HTTP server stops cleanly before the process exits.

**Reference:** [Node.js process signals](https://nodejs.org/api/process.html#signal-events)

### 8. Development and production environments

```text
Environment
    │
    ├── Development
    │     ├── Express
    │     ├── Vite middleware
    │     └── source-oriented workflow
    │
    └── Production
          ├── built frontend
          ├── bundled server
          └── Node.js runtime
```

| Environment | Server behavior |
|---|---|
| Development | Vite middleware mounted into Express |
| Production | Built frontend served from `dist/`; bundled server runs with Node.js |

**Note:** Workspace/runtime-related components that are not fully implemented are documented as such rather than treated as current runtime behavior.

**Reference:** [Vite](https://vite.dev/guide/) · [Node.js](https://nodejs.org/docs/latest/api/)

### 9. Update execution

```text
c107
 │
 ▼
Canonical origin
 │
 ▼
Metadata
 │
 ▼
Provenance
 │
 ▼
Release signature
 │
 ▼
SHA-256
 │
 ▼
Compatibility
 │
 ▼
Checkpoint
 │
 ▼
Stage
 │
 ▼
Build
 │
 ▼
Validate
 │
 ▼
Health
 │
 ▼
Atomic activation
 │
 ▼
Post-verification
 │
 ▼
Commit / rollback
```

**Command**

```bash
npm run c107:update
```

**Note:** The update pipeline is implemented in `src/cli/update/`. A failure after checkpoint creation enters the fail-closed rollback path.

**Expected result:** The configured update stages execute in sequence; failed validation or post-checks can prevent activation or trigger rollback.

**Reference:** [Update documentation](../updates/) · [The Update Framework](https://theupdateframework.io/) · [Git](https://git-scm.com/doc)

### 10. Runtime state

```text
Application / connected resource
             │
             ▼
        Runtime state
             │
             ▼
          Cloud107 UI
```

**Note:** Runtime state exposed by Cloud107 should come from the application and connected resources. The UI must not invent process, node, resource, billing, or health state.

**Expected result:** An unavailable capability is reported as unavailable rather than represented with simulated values.

**Reference:** [Operations](../operations/) · [Nodes](../nodes/) · [Workloads](../workloads/)

## Scope

This page documents runtime behavior currently present in the repository. Planned runtime features should be added only after implementation and verification.

**Note:** The runtime page is a description of the source, not a target architecture.

**Reference:** [Architecture](../architecture/) · [Development](../development/)
