# Backend Design (Components 13-14)

## 13. Database Design (Self-Hosted Relational Store)

PostgreSQL and local storage provide ACID persistence, auditability, and sovereign session management.

### Tables & Entities

- **`users`**
  - `id`, `uid` (WebAuthn / Sovereign ID), `email`, `role`, `createdAt`, `preferences`
- **`workspaces`**
  - `id`, `name`, `state`, `userId`, `createdAt`, `updatedAt`
- **`applications`**
  - `id`, `name`, `category`, `icon`, `color`, `enabled`, `installed`
- **`application_sessions`**
  - `id`, `applicationId`, `workspaceId`, `userId`, `status`
- **`nodes`** (Capability API, Release Candidate)
  - `id`, `name`, `providerId`, `state`, `userId`, `vcpuCount`, `memoryBytes`, `diskSizeBytes`, `primaryIpAddress`, `metadata`, `startedAt`, `createdAt`, `updatedAt`
- **`operations`** (Capability API, Release Candidate — async operation ledger)
  - `id`, `nodeId`, `userId`, `type`, `status` (`pending` → `running` → `completed` | `failed`), `payload`, `result`, `error`, `completedAt`, `createdAt`, `updatedAt`
- **`audit_logs`**
  - `id`, `userId`, `action`, `timestamp`, `metadata`

## 14. API Design (Cloud107 Control Plane)

RESTful API for sovereign workspace control and signaling.

### REST Endpoints

- `POST /api/v1/workspaces` - Provisions a new sovereign workspace.
- `POST /api/v1/workspaces/:id/start` - Allocates workspace workload, boots node.
- `POST /api/v1/workspaces/:id/stop` - Safely stops workspace, flushes storage.
- `GET /api/v1/workspaces/:id` - Returns workspace state and metrics.
- `GET /api/v1/health` - Internal and external health verification.
- `GET /api/v1/updates/status` - Cryptographically verified update status (`c107 update`).

### Capability API (Release Candidate)

Sovereign compute control plane. Mutating calls are authorized via policy
checks, validated from `unknown` with zod, executed by the `ComputeProvider`
(real OS interrogation — `os` + `child_process`, no mocks), and tracked in
the persistent `operations` ledger (`pending` → `running` → `completed` | `failed`).

- `GET /api/v1/capabilities` - Provider descriptor and capability flags.
- `GET /api/v1/capabilities/health` - Live host prerequisite checks (audited as an operation).
- `GET /api/v1/nodes` - List owned nodes (`?state=`, `?all=true` admin-only).
- `POST /api/v1/nodes` - Provision a node (`name`, `virtualCpuCount`, `memoryBytes`, `diskSizeBytes`, ...).
- `GET /api/v1/nodes/:id` - Node state and provider-reported facts.
- `GET /api/v1/nodes/:id/metrics` - Live CPU/memory/IO telemetry (audited as an operation).
- `GET /api/v1/nodes/:id/operations` - Operation history for a node.
- `POST /api/v1/nodes/:id/start` - Activate a `Stopped` node.
- `POST /api/v1/nodes/:id/stop` - Halt a `Running` node (`{ force?: boolean }`).
- `POST /api/v1/nodes/:id/terminate` - Reclaim node resources.
- `POST /api/v1/nodes/:id/attach-network` - Attach networking (`networkType`, `subnetCidr`, `enableNat`, `assignedPort?`).
- `GET /api/v1/operations` - List owned operations (`?nodeId=`, `?all=true` admin-only).
- `GET /api/v1/operations/:id` - Single operation with payload/result/error.

### WebSocket Endpoints

- `WS /api/v1/signaling/{sessionId}`
  - Client and Host Agent connect here.
  - Message types: `offer`, `answer`, `ice_candidate`.
  - Cloud107 acts as a sovereign router, forwarding encrypted payloads between peers.
