# Backend Design (Components 13-14)

## 13. Database Design (Self-Hosted Relational Store)
PostgreSQL and local storage provide ACID persistence, auditability, and sovereign session management.

### Tables & Entities
* **`users`**
  * `id`, `uid` (WebAuthn / Sovereign ID), `email`, `role`, `createdAt`, `preferences`
* **`workspaces`**
  * `id`, `name`, `state`, `userId`, `createdAt`, `updatedAt`
* **`applications`**
  * `id`, `name`, `category`, `icon`, `color`, `enabled`, `installed`
* **`application_sessions`**
  * `id`, `applicationId`, `workspaceId`, `userId`, `status`
* **`audit_logs`**
  * `id`, `userId`, `action`, `timestamp`, `metadata`

## 14. API Design (Cloud107 Control Plane)
RESTful API for sovereign workspace control and signaling.

### REST Endpoints
* `POST /api/v1/workspaces` - Provisions a new sovereign workspace.
* `POST /api/v1/workspaces/:id/start` - Allocates workspace workload, boots node.
* `POST /api/v1/workspaces/:id/stop` - Safely stops workspace, flushes storage.
* `GET /api/v1/workspaces/:id` - Returns workspace state and metrics.
* `GET /api/v1/health` - Internal and external health verification.
* `GET /api/v1/updates/status` - Cryptographically verified update status (`c107 update`).

### WebSocket Endpoints
* `WS /api/v1/signaling/{sessionId}`
  * Client and Host Agent connect here.
  * Message types: `offer`, `answer`, `ice_candidate`.
  * Cloud107 acts as a sovereign router, forwarding encrypted payloads between peers.
