# APIs

API contracts, capability discovery, events, runtime control, and integrations.

This page documents the API boundary currently present in the repository.

## Guide

### 1. API architecture

<table>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 API</strong><br><sub>(Node.js 22 · TypeScript · Express 4 · HTTP/JSON · RFC 9110)</sub></td>
</tr>
<tr>
<td align="center"><strong>WEB WORKSPACE</strong><br><sub>(React · TypeScript · Vite)</sub></td>
<td align="center"><strong>c107 CLI</strong><br><sub>(TypeScript · Node.js · POSIX)</sub></td>
<td align="center"><strong>CONNECTED CLIENTS</strong><br><sub>(HTTP / JSON)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>HEALTH</strong><br><sub>/api/v1/health</sub></td>
<td align="center"><strong>WORKSPACES</strong><br><sub>/api/v1/workspaces</sub></td>
<td align="center"><strong>APPLICATIONS</strong><br><sub>/api/v1/applications</sub></td>
</tr>
<tr>
<td align="center"><strong>USERS</strong><br><sub>/api/v1/users</sub></td>
<td align="center"><strong>BILLING</strong><br><sub>/api/v1/billing</sub></td>
<td align="center"><strong>UPDATES</strong><br><sub>/api/v1/updates/status</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>POSTGRESQL</strong><br><sub>(SQL · Drizzle · PostgreSQL protocol)</sub></td>
</tr>
</table>

**Note:** The blueprint shows the current API surface documented by the repository. Detailed behavior belongs to the corresponding implemented route and service.

**Reference:** [Architecture](../architecture/) · [Express](https://expressjs.com/)

### 2. API base path

<table><tr><td align="center"><strong>Cloud107 server</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>/api</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>/v1</strong></td></tr><tr><td align="center">↓</td></tr><tr><td>health · users · workspaces · applications · billing · updates</td></tr></table>

**Endpoint base**

```text
/api/v1
```

**Note:** Current application API routes are versioned under `/api/v1`.

**Expected result:** Requests to a documented API endpoint use the `/api/v1` prefix.

**Reference:** [Express routing](https://expressjs.com/en/guide/routing.html)

### 3. Check API health

<table><tr><td align="center"><strong>Client</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>GET /api/v1/health</strong><br><sub>HTTP</sub></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Cloud107 health response</strong></td></tr></table>

**Command**

```bash
curl http://localhost:3000/api/v1/health
```

**Note:** Use the health endpoint to check the running application boundary.

**Expected result:** The running Cloud107 server returns an HTTP response from the health route.

**Reference:** [HTTP overview — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) · [Runtime](../runtime/)

### 4. Check update status

<table><tr><td align="center"><strong>Client</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>GET /api/v1/updates/status</strong><br><sub>HTTP</sub></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Update manager status</strong></td></tr></table>

**Command**

```bash
curl http://localhost:3000/api/v1/updates/status
```

**Note:** The update status endpoint reports the current update-related runtime information exposed by the application.

**Expected result:** The running Cloud107 instance returns the update status response.

**Reference:** [Updates](../updates/) · [HTTP overview — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

### 5. Request path

<table><tr><td align="center"><strong>HTTP request</strong><br><sub>HTTP · RFC 9110</sub></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Express</strong><br><sub>Node.js · TypeScript</sub></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Request context / logging</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Security middleware</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>JSON parsing</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Versioned API route</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Service / persistence boundary</strong></td></tr></table>

**Note:** Authentication, authorization, validation, persistence, and external-provider behavior should be documented at the point where the implementation actually enforces them.

**Reference:** [Express middleware](https://expressjs.com/en/guide/using-middleware.html) · [Security](../security/)

### 6. Interface map

| Boundary | Technology | Interface |
|---|---|---|
| Browser → API | TypeScript / React / Vite | HTTP |
| CLI → API | TypeScript / Node.js | HTTP |
| API → database | Drizzle / PostgreSQL | SQL |
| Update status | Express / TypeScript | HTTP / JSON |

<table><tr><td align="center"><strong>Browser / c107</strong><br><sub>React / TypeScript · CLI</sub></td></tr><tr><td align="center">↓ HTTP / JSON</td></tr><tr><td align="center"><strong>Express API</strong><br><sub>Node.js · TypeScript</sub></td></tr><tr><td align="center">↓ SQL</td></tr><tr><td align="center"><strong>PostgreSQL</strong></td></tr></table>

**Note:** Protocol and standards names should describe interfaces actually used by the implementation.

**Reference:** [HTTP — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP) · [PostgreSQL](https://www.postgresql.org/docs/)

### 7. API development check

<table><tr><td align="center"><strong>API change</strong></td></tr><tr><td align="center">↓</td></tr><tr><td align="center">lint · test · build</td></tr><tr><td align="center">↓</td></tr><tr><td align="center"><strong>Reviewed API change</strong></td></tr></table>

**Commands**

```bash
npm run lint
npm test
npm run build
```

**Note:** Keep route changes, service changes, and API contract changes aligned.

**Expected result:** The configured checks complete successfully before the API change is treated as ready.

**Reference:** [Vitest](https://vitest.dev/) · [ESLint](https://eslint.org/docs/latest/) · [Vite](https://vite.dev/guide/)

## Current route areas

| Area | Current path |
|---|---|
| Health | `/api/v1/health` |
| Users | `/api/v1/users` |
| Workspaces | `/api/v1/workspaces` |
| Applications | `/api/v1/applications` |
| Billing | `/api/v1/billing` |
| Updates | `/api/v1/updates/status` |

**Note:** This table describes the current documented route areas. Planned integrations should be marked as planned until their implementation exists and has been verified.

**Reference:** [Architecture](../architecture/) · [Updates](../updates/)
