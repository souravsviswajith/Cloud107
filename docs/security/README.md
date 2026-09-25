# Security

Cloud107 security behavior is implemented across authentication, request handling, API boundaries, update verification, and secret configuration.

## Security model

```text
User / Client
     │
     ▼
HTTP boundary
     │
     ├── Correlation / request IDs
     ├── Helmet
     ├── CORS
     ├── JSON parsing
     └── Error handling
     │
     ▼
API boundary
     │
     ├── Authentication / authorization
     ├── Application operations
     └── External providers / nodes / workloads

Update source
     │
     ▼
Provenance → Ed25519 → SHA-256 → Compatibility
     │
     ▼
Checkpoint → Validation → Health → Activation
     │
     └────────────── failure → rollback
```

**Note:** Security controls are applied at request, API, update, and configuration boundaries. The repository documents a control only where the corresponding implementation exists.

### Implementation and standards

```text
Security boundary
├── TypeScript / Node.js / Express
├── Helmet / CORS
├── HTTP headers and transport controls
├── Environment-based secret configuration
├── Ed25519 signatures
├── SHA-256 hashes
└── Platform / protocol specifications where applicable
```

**Note:** Standards and technologies are listed at the boundary where they are used. A library, configuration field, or interface does not by itself establish an enforced security control.

## Request context

Every HTTP request receives:

- a correlation ID
- a request ID
- request start time
- client IP
- user-agent information

Cloud107 accepts an incoming `X-Correlation-ID` when supplied. Otherwise it generates one.

The response includes:

```text
X-Correlation-ID
X-Request-ID
```

Correlation IDs are also used by request logging.

## HTTP middleware

The API application currently applies:

- Helmet
- CORS
- response compression
- JSON request parsing
- centralized error handling

Helmet's Content Security Policy is currently disabled in the application configuration because the development setup uses Vite middleware.

## Error handling

Known `ApiError` instances are returned with their status, error code, message, and associated details.

Unhandled errors are logged and returned as system errors.

The API error path uses the request context so operational logs can be correlated with the originating request.

## Authentication and authorization

Authentication and authorization are part of the Cloud107 API boundary. Detailed behavior should be documented here from the corresponding implemented authentication and authorization components rather than inferred from the UI.

Do not treat the presence of an authentication-related UI component as proof that an API operation is protected.

## Secrets

Secrets are supplied through environment configuration rather than committed application source.

Examples include database passwords and `C107_AUTH_SECRET`.

Do not place real credentials, signing keys, API keys, or production secrets in the repository.

## Update trust

Universal Update Management performs provenance, Ed25519 signature, SHA-256 artifact, and compatibility checks before activation.

Update failures after checkpoint creation use the rollback path.

See `docs/updates/` for the update protocol.

## Security boundary

Cloud107 should treat external providers, connected nodes, workloads, update artifacts, and user input as separate trust boundaries.

Security claims should be tied to an implemented control. Do not document a control as enforced merely because a configuration field, interface, or planned component exists.
