# Security

Cloud107 security behavior is implemented across authentication, request handling, API boundaries, update verification, and secret configuration.

This page documents security controls that are present in the repository. A configuration field or planned component is not treated as an enforced control.

## Guide

### 1. Security model

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

**Note:** Security controls are applied at request, API, update, and configuration boundaries.

**Reference:** [Architecture](../architecture/) · [OWASP](https://owasp.org/www-project-web-security-testing-guide/)

### 2. HTTP request boundary

```text
HTTP request
    │
    ▼
Request context
    │
    ├── correlation ID
    ├── request ID
    ├── start time
    ├── client IP
    └── user-agent
    │
    ▼
HTTP middleware
    │
    ├── Helmet
    ├── CORS
    ├── compression
    └── JSON parsing
    │
    ▼
API routes
```

Cloud107 accepts an incoming `X-Correlation-ID` when supplied and otherwise generates one.

Responses include:

```text
X-Correlation-ID
X-Request-ID
```

**Note:** Correlation information is also used by request logging so related request activity can be traced.

**Reference:** [Express middleware](https://expressjs.com/en/guide/using-middleware.html) · [MDN HTTP headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers)

### 3. HTTP security middleware

```text
HTTP request
     │
     ▼
Helmet
     │
     ├── security headers
     │
     ▼
CORS
     │
     ▼
Compression
     │
     ▼
JSON parsing
     │
     ▼
API
```

The API application currently applies:

- Helmet
- CORS
- response compression
- JSON request parsing
- centralized error handling

Helmet's Content Security Policy is currently disabled because the development setup uses Vite middleware.

**Note:** The disabled CSP setting is an implementation detail that must not be documented as an active CSP control.

**Reference:** [Helmet](https://helmetjs.github.io/) · [Express](https://expressjs.com/en/guide/using-middleware.html) · [CORS — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

### 4. API error handling

```text
API operation
     │
     ├── known ApiError
     │       │
     │       ▼
     │   status / code / message / details
     │
     └── unhandled error
             │
             ▼
         logged system error
```

**Note:** The error path uses the request context so operational logs can be correlated with the originating request.

**Expected result:** Known API errors return their configured status and error information; unhandled errors follow the system error path.

**Reference:** [Express error handling](https://expressjs.com/en/guide/error-handling.html)

### 5. Authentication and authorization

```text
Client
  │
  ▼
API boundary
  │
  ├── authentication
  └── authorization
          │
          ▼
    protected operation
```

Authentication and authorization are part of the Cloud107 API boundary.

**Note:** Detailed protection claims should come from the corresponding implemented authentication and authorization components. An authentication-related UI element does not by itself prove that an API operation is protected.

**Expected result:** Only implemented authentication/authorization controls should be documented as enforced behavior.

**Reference:** [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) · [OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)

### 6. Secret configuration

```text
Secret
  │
  ▼
Environment configuration
  │
  ▼
Cloud107 process
  │
  └── source repository does not contain the real value
```

Examples include:

- database passwords
- `C107_AUTH_SECRET`
- provider API keys
- signing keys

**Note:** Do not place real credentials, signing keys, API keys, or production secrets in the repository.

**Reference:** [Node.js environment variables](https://nodejs.org/api/environment_variables.html) · [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)

### 7. Update trust boundary

```text
Update source
     │
     ▼
Provenance
     │
     ▼
Ed25519 signature
     │
     ▼
SHA-256 artifact
     │
     ▼
Compatibility
     │
     ▼
Checkpoint
     │
     ▼
Validation
     │
     ▼
Health
     │
     ▼
Activation
     │
     └── failure → rollback
```

**Command**

```bash
npm run c107:update
```

**Note:** Universal Update Management performs provenance, Ed25519 signature, SHA-256 artifact, and compatibility checks before activation. Failures after checkpoint creation use the rollback path.

**Expected result:** An update that fails its configured verification or validation stages does not proceed as a successful activation.

**Reference:** [Updates](../updates/) · [The Update Framework](https://theupdateframework.io/) · [Ed25519 — RFC 8032](https://www.rfc-editor.org/rfc/rfc8032) · [SHA-2 — FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

### 8. Trust boundaries

```text
Cloud107
   │
   ├── User input
   ├── External providers
   ├── Connected nodes
   ├── Workloads
   └── Update artifacts
        │
        ▼
Separate trust boundaries
```

**Note:** External providers, connected nodes, workloads, update artifacts, and user input should be treated as separate trust boundaries.

**Expected result:** Security claims remain tied to the specific boundary and implemented control rather than to a general security label.

**Reference:** [Architecture](../architecture/) · [Operations](../operations/)

## Implementation and standards map

| Type | Current example |
|---|---|
| Language / runtime | TypeScript / Node.js / Express |
| Middleware | Helmet / CORS |
| Cryptography | Ed25519 / SHA-256 |
| Configuration | Environment variables |
| Protocol / interface | HTTP |
| Standards / specifications | RFCs and NIST publications where directly applicable |

**Note:** Standards and technologies are listed at the boundary where they are used. A library, configuration field, or interface does not by itself establish an enforced security control.
