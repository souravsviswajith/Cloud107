# DevOps & Planning (Components 18-24)

## 18. Infrastructure Diagram

```text
[ User Browser (React/Vite) ]
       | (HTTPS)           \ (UDP/WebRTC Media & Input)
[ Ingress Reverse Proxy ]   \
       |                     \
[ Cloud107 API Server ]       \
       |                       |
[ PostgreSQL / State Store ] [ Workspace Node (Host Agent) ]
                               | (NVMe attached User Storage)
```

## 19. Repository Structure

Monorepo approach for tight coupling of schemas, types, and self-sovereign update mechanism:

- `/src`: Adapted React/Vite UI components, hooks, state management.
- `/src/server`: Cloud107 API, provider implementations, database repositories, auth services.
- `/src/cli`: `c107` CLI and cryptographically verified update pipeline (`c107 update`).
- `/desktop-agent`: Reference Python desktop agent implementation.
- `/workspace-runtime`: Reference Python workspace runtime engine.
- `/infra`: Terraform scripts, Packer configurations for base images.
- `/docs`: Architecture blueprints, security models, ADRs.

## 20. Risk Analysis

1. **GPU Availability & Cost:** Datacenter GPUs are expensive and face scarcity. _Mitigation:_ Aggressive idle-termination policies and spot instances for non-critical workloads.
2. **WebRTC UDP Blocking:** Corporate firewalls block UDP. _Mitigation:_ Fallback to TURN over TCP/443.
3. **Supply Chain Attacks:** Third-party package or unauthorized update tampering. _Mitigation:_ Source-first `c107 update` requiring signed commits, cryptographic hashes, provenance verification, and atomic rollback.

## 21. Architecture Decision Records (ADRs)

- **ADR-001:** Use WebRTC over proprietary streaming protocols for native browser compatibility without plugins.
- **ADR-002:** Separate OS disk from persistent user storage to allow ephemeral compute and fast state attachment.
- **ADR-003:** Self-Hosted Sovereign Identity (WebAuthn / FIDO2) replacing all third-party SaaS authentication.
- **ADR-004:** Cryptographically verified source-first updates (`c107 update`) replacing unverified git pull or external package repositories.

## 22. Development Roadmap

- **Milestone 1:** Architecture Blueprint & Cloud107 Sovereign Lock (Complete)
- **Milestone 2:** Base Image Generation (Packer, Windows 11, Software Toolchain)
- **Milestone 3:** WebRTC Host Agent (Capture, Encode, Streaming)
- **Milestone 4:** Sovereign Control Plane & WebAuthn Identity (Complete)
- **Milestone 5:** Frontend Workspace Client (React, Canvas, Input capture) (Complete)
- **Milestone 6:** Verified Source-First Updates & Compliance Lock (Complete)

## 23. Testing Strategy

- **Unit Testing:** `vitest` for frontend, backend services, providers, and update pipeline.
- **Update Verification:** 16-point compliance test suite verifying cryptographic signatures, hash mismatches, compatibility, and rollback.
- **E2E Testing:** Playwright for workspace streaming flows.

## 24. Deployment Strategy

- **Source-First Verification:** `c107 update` executes provenance verification, hash checks, compatibility analysis, staging, isolated validation, and atomic swap.
- **Rollback:** Automatic rollback on failed build, test, health check, or capability regression.
