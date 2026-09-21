# System Design Document

**Project:** Cloud107 Sovereign Cloud Workspace v1.0
**Role:** Principal Software Architect / Supply-Chain Security Engineer

## 1. Architectural Overview

Cloud107 is a self-hosted sovereign workspace system consisting of a client-side web application, a unified Cloud107 management backend, and isolated high-performance worker nodes with cryptographically verified source-first updates.

### 1.1 High-Level Components

1. **Web Client (Frontend):** React 19, TypeScript, Tailwind CSS, Sovereign Workspace Shell. Renders WebRTC video/audio stream, manages applications, handles low-latency input.
2. **Management Plane (Backend):** Cloud107 API service orchestrating workspace lifecycle, routing, and session state.
3. **Database & Auth:** PostgreSQL & local storage (state/metadata), WebAuthn / FIDO2 & Cloud107 Identity (phishing-resistant authentication).
4. **Signaling Server:** WebSockets service responsible for WebRTC SDP offer/answer exchange and ICE candidates.
5. **Worker Node:** GPU-accelerated workspace running pre-configured images with low-latency streaming agent.
6. **Update Engine:** `c107` CLI providing cryptographically verified source-first updates with fail-closed atomic activation and rollback.

## 2. Engineering Priorities Alignment

- **Performance First:** Direct hardware encoding, WebRTC for UDP transport, sub-20ms latency target.
- **Efficiency:** Unified TypeScript/Node control plane, optimized Vite asset bundle.
- **Reliability:** Relational ACID storage, state machine lifecycle management.
- **Security & Sovereignty:** Self-hosted WebAuthn / FIDO2 identity, Ed25519 cryptographic signatures for updates, zero SaaS lock-in.

## 3. Core Technologies Stack

- **UI/Frontend:** React 19, Vite, Tailwind CSS, Lucide icons.
- **Backend:** Cloud107 modular control plane.
- **Database/Auth/Storage:** PostgreSQL via Drizzle ORM, WebAuthn / FIDO2 Cloud107 Identity.
- **CLI & Updates:** `c107` source-first updater with Ed25519 verification.
- **Infrastructure:** Hyper-V, Cloud VM providers, Docker, WebRTC.
- **DevOps & CI:** Vitest, ESLint, automated update verification tests.
