# APIs

API contracts, capability discovery, events, runtime control, and integrations.

## API architecture

```text
                    Cloud107 clients
             ┌────────────┴────────────┐
             ▼                         ▼
       Web Workspace               c107 CLI
       React / TypeScript          TypeScript / Node.js
             │                         │
             └────────────┬────────────┘
                          ▼
                   Express API
                Node.js / TypeScript
                          │
                   HTTP / JSON
                          │
        ┌─────────────────┼──────────────────┐
        ▼                 ▼                  ▼
      Health          Workspaces        Applications
   /api/v1/health   /api/v1/workspaces  /api/v1/applications
        │                 │                  │
        ├─────────────────┼──────────────────┤
        ▼                 ▼                  ▼
      Users            Billing             Updates
   /api/v1/users     /api/v1/billing   /api/v1/updates/status
                          │
                          ▼
                     PostgreSQL
                     SQL / Drizzle
```

**Note:** The diagram shows the current API surface documented by the repository. Detailed behavior should be added from the corresponding implemented route and service.

## Current API boundary

The application exposes versioned routes under:

```text
/api/v1
```

Current route areas include:

- health
- users
- workspaces
- applications
- billing
- updates

The update status endpoint is:

```text
GET /api/v1/updates/status
```

## Request path

```text
HTTP request
    ↓
Express
    ↓
request context / logging
    ↓
security middleware
    ↓
JSON parsing
    ↓
versioned API route
    ↓
service / persistence boundary
```

**Note:** Authentication, authorization, validation, persistence, and external-provider behavior should be documented at the point where the implementation enforces them.

## Interface references

| Boundary | Technology | Interface |
|---|---|---|
| Browser → API | TypeScript / React / Vite | HTTP |
| CLI → API | TypeScript / Node.js | HTTP |
| API → database | Drizzle / PostgreSQL | SQL |
| Update status | Express / TypeScript | HTTP / JSON |

**Note:** Protocols and standards should be named only when the implementation uses or depends on them. Vendor products are not standards.

## API development check

After changing an API boundary:

```bash
npm run lint
npm test
npm run build
```

**Note:** Keep route changes, service changes, and contract changes aligned. Verify the resulting API behavior before documenting a new endpoint.

## Scope

This page documents the API boundary currently present in the repository. Planned integrations should be marked as planned until their implementation exists and has been verified.
