# Architecture

Cloud107 is organized around a web workspace, an API layer, persistent state, and connected workloads and resources.

## Architecture flow

```text
User
  │
  ▼
Web workspace / c107
  │
  ▼
API / CLI operations
  │
  ├── application state ──► PostgreSQL
  ├── workload operations ─► Runtime / resources
  └── updates ─────────────► Update pipeline
```

**Note:** The diagram shows the main control paths. Components below the application boundary are only represented where the repository currently implements or connects them.

## Current application structure

```text
Browser
  │
  ▼
Cloud107 server
  ├── Web application
  └── /api
       └── /v1
            ├── health
            ├── users
            ├── workspaces
            ├── applications
            ├── billing
            └── updates
  │
  ▼
PostgreSQL
```

The CLI provides a separate command-line interface to Cloud107 and includes the update pipeline.

## Request flow

```text
Client
  │
  ▼
Express application
  │
  ├── request context
  ├── request logging
  ├── security middleware
  ├── CORS
  ├── compression
  └── JSON parsing
  │
  ▼
API routes
  │
  ▼
Application services / persistence
```

The frontend is served through the same application boundary. During development, Vite middleware provides the frontend. Production serves the built frontend.

## Workspace model

The UI organizes the operator experience around:

```text
Overview
Projects
Nodes
Operations
Terminal
Settings
```

Workspace and application state is exposed through the API rather than being treated as static UI data.

The interface is progressively disclosed: deeper node and runtime information is shown after the user selects the relevant resource.

## Runtime and resources

Cloud107 contains workspace/runtime-related components for executing workloads and interacting with resources. The repository currently exposes only the portions that are implemented and connected to the application.

Resource state presented to users should come from the runtime or connected provider. The interface must not fabricate health, utilization, billing, or execution state.

## Update boundary

Universal Update Management is implemented separately from the HTTP request path in the CLI update subsystem.

Its responsibilities include:

- provenance verification
- release signature verification
- artifact hash verification
- compatibility checking
- checkpoint creation
- staged update
- validation
- health checking
- atomic activation
- post-activation verification
- rollback on failure

See the update documentation for the update-specific implementation.

## Architecture boundaries

- **Frontend** — presents Cloud107 capabilities to the user.
- **API** — exposes application operations over HTTP.
- **Database** — stores persistent application state.
- **CLI** — provides command-line access and update operations.
- **Runtime/workload components** — execute or manage workloads where implemented.
- **Connected providers** — supply external resource capabilities such as billing when configured.

These boundaries should be extended only when the corresponding implementation exists.

## Source of truth

Current infrastructure state comes from Cloud107 and its connected resources.

Documentation and external knowledge systems may describe decisions, procedures, and history, but they do not replace runtime state as the authority for what is currently running.
