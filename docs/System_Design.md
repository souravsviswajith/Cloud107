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

---

# 4. Architecture Deep Dive — For Enthusiasts

This appendix is for contributors, infrastructure engineers, systems programmers, self-hosters, and technically curious users who want to understand the boundaries and execution model of Cloud107.

## 4.1 Architectural Thesis

Cloud107 is not fundamentally a dashboard. The dashboard is one projection of a larger control system.

The core model is:

    Intent
      ↓
    Client Surface
      ↓
    Management / Control Plane
      ├── Identity
      ├── Authorization
      ├── Workspace Lifecycle
      ├── Node / Provider Selection
      ├── Operation Tracking
      └── Persistent State
              ↓
        Worker / Runtime
              ↓
        Workload Execution
              ↓
        Session / Data Plane
              ↓
          Native Client

The system separates five concerns:

1. **Intent** — what the operator wants.
2. **Control** — how Cloud107 decides and orchestrates.
3. **State** — what Cloud107 persistently knows.
4. **Execution** — where the workload actually runs.
5. **Transport** — how interactive workload data reaches the user.

A UI action should not become an infrastructure side effect without crossing the appropriate control-plane boundary.

## 4.2 Control Plane vs. Data Plane

### Control Plane

The control plane owns comparatively low-bandwidth, stateful operations:

- authentication and authorization
- workspace creation
- workspace lifecycle
- node registration
- resource configuration
- provider selection
- application/session metadata
- policy
- operation tracking
- configuration
- audit information
- source-first updates

Typical path:

    Client → API → Service → Provider / Runtime → Persistent State

### Data Plane

The data plane carries workload interaction:

- desktop frames
- audio
- input
- application interaction
- high-throughput workload traffic
- worker-local communication

Interactive media should not unnecessarily traverse the management API.

    Control:
    Client ───────────────→ Cloud107 API
                              ├── Database
                              ├── Provider
                              └── Worker control

    Data:
    Client ═══════════════════════════ Worker
             interactive session

## 4.3 Management Plane

The management plane is the authoritative orchestration boundary.

Its major responsibilities are identity, authorization, validation, lifecycle management, node/provider selection, operation tracking, persistence, and policy.

The conceptual request sequence is:

    Request
      ↓
    Authentication
      ↓
    Authorization
      ↓
    Validation
      ↓
    Service operation
      ↓
    Provider / runtime action
      ↓
    State persistence
      ↓
    Event / status projection

Authentication answers **who** is calling.

Authorization answers **what that identity may do**.

Validation answers **whether the requested operation is structurally valid**.

These concerns should remain distinct.

## 4.4 Workspace Lifecycle

A workspace is a state machine, not a boolean.

Cloud107 already models states including:

    Offline → Starting → Running → Connecting → Streaming
       ↑                                      ↓
       └──── Stopped ← Stopping ← Disconnected

Failure must be explicit:

    Active state → Error → Recovery / retry / operator action

The UI should project this lifecycle rather than inventing independent infrastructure states.

Provisioning and connection animations must not be treated as proof that a workspace is ready. Readiness should eventually come from actual backend/runtime evidence:

- provider accepted the operation
- workspace reached the expected state
- runtime became reachable
- session transport became available
- required capabilities were negotiated

Animation communicates progress; infrastructure state establishes truth.

## 4.5 Provider and Runtime Abstraction

Cloud107 should distinguish the **provider** from the **workspace runtime**.

A provider answers:

> Where and how is compute allocated?

A runtime answers:

> How is the workspace created and controlled on that compute?

Conceptually:

    Cloud107
      ├── Provider
      │     ├── Hyper-V
      │     ├── Cloud VM
      │     └── Other infrastructure
      │
      └── Workspace Runtime
            ├── VM
            ├── Container
            └── Host session

The control plane should operate on normalized concepts such as node, workspace, resource profile, operation, session, and capability rather than exposing provider-specific details throughout the product.

## 4.6 Node Architecture

A node is an execution endpoint managed by Cloud107.

A node may expose:

- CPU capacity
- memory capacity
- GPU capability
- storage
- network capability
- runtime capabilities
- current workload
- health
- software version
- connectivity

A useful conceptual lifecycle is:

    Discovered → Registered → Healthy → Available → Allocated
                                      ↓
                                   Draining
                                      ↓
                                    Offline

Health and availability are different concepts. A healthy node can still be unavailable because it is allocated, draining, reserved, administratively disabled, or incompatible with the requested workload.

## 4.7 Capability Negotiation

Cloud107 should discover capabilities instead of assuming every node supports every feature.

Examples include:

- hardware encoding
- WebRTC
- audio
- virtualization
- GPU
- VM runtime
- container runtime
- supported codecs
- supported session modes

The principle is:

> **Feature availability is discovered, not assumed.**

Capability negotiation should influence placement, connection mode, codec selection, application availability, diagnostics, and recovery behavior.

## 4.8 Workspace and Session Are Different Entities

A workspace represents compute state.

A session represents an interaction with that workspace.

    Workspace
      ├── Session A
      ├── Session B
      └── Session C

This distinction permits reconnecting without recreating a workspace, different session types, session-specific permissions, telemetry, and clean session termination.

A socket connection should not itself be treated as the authoritative definition of a session.

## 4.9 Signaling vs. Media

WebSocket signaling and WebRTC media serve different purposes.

Signaling exchanges:

- SDP offers
- SDP answers
- ICE candidates
- negotiation metadata
- connection state

Interactive transport carries:

- video
- audio
- input
- other low-latency session data

Conceptually:

    Client ── WebSocket ──→ Signaling
    Client ←─ WebSocket ── Signaling
                 ↓
          negotiation complete
                 ↓
    Client ═════ WebRTC ═════ Worker

The signaling service should not automatically become a permanent media proxy simply because it handles negotiation.

## 4.10 Persistent State

PostgreSQL is the durable source for control-plane state.

Persistent records should include information required to reconstruct the control-plane view after restart, such as:

- identities
- credential metadata
- nodes
- workspaces
- resource configuration
- operations
- sessions
- application metadata
- version information
- audit-relevant records

Ephemeral transport state should remain ephemeral.

> **Persist what must survive process failure; keep transport state ephemeral.**

## 4.11 State and Event Flow

The preferred conceptual flow is:

    Command
      ↓
    Service
      ↓
    State transition
      ↓
    Persistence
      ↓
    Event / notification
      ↓
    Client projection

For long-running operations:

    Command → Operation → Provider execution → State transition → Completion

This makes asynchronous infrastructure actions observable without keeping an HTTP request open.

## 4.12 Frontend Architecture

The web client is a control-plane surface, not an infrastructure authority.

Its responsibilities are:

- render server state
- collect user intent
- initiate operations
- show operation progress
- establish interactive sessions
- display diagnostics
- handle user input

A useful hierarchy is:

    API / Realtime State
           ↓
    State Mapping
           ↓
    Workspace Shell
           ↓
    Dashboard / Workspace
           ↓
    Desktop / Application Surface
           ↓
    Session Renderer

The frontend may own transient presentation state such as selected workspace, active tab, modal visibility, and animation phase. Infrastructure truth belongs to the backend/runtime.

## 4.13 UI State vs. Infrastructure State

Infrastructure state includes:

- workspace running
- node unavailable
- session connected
- operation failed

UI state includes:

- connection modal open
- dashboard tab selected
- diagnostics panel expanded
- Desktop Mode selected

UI state can be optimistic for interaction convenience.

Infrastructure state cannot be fabricated.

This is why the provisioning/connection experience should eventually move from timer-driven simulation to actual lifecycle and session events.

## 4.14 Desktop Rendering Boundary

The desktop renderer should sit between Cloud107 session state and the desktop visual surface:

    Workspace
      ↓
    Session
      ↓
    DesktopRenderer
      ↓
    Desktop

The renderer should consume normalized session/workspace information rather than provider-specific internals.

This creates a stable boundary for WebRTC, local preview, remote desktop protocols, application streaming, and diagnostic fallback.

## 4.15 Authentication and Security Boundary

The security boundary is:

    Operator
      ↓
    Authentication
      ↓
    Authorization
      ↓
    Control Plane
      ↓
    Provider / Worker
      ↓
    Workspace

Security-sensitive values should:

- remain outside source control
- be supplied through environment/secret management
- be rotated
- be scoped to their purpose
- never be exposed through frontend state

A registered worker should be treated as a privileged execution boundary, not as an implicitly trusted machine.

## 4.16 Source-First Update Model

Cloud107 treats software updates as an infrastructure operation.

The intended trust chain is:

    Source / Release
         ↓
    Cryptographic signature
         ↓
    Verification
         ↓
    Staging
         ↓
    Validation
         ↓
    Atomic activation
         ↓
    Health verification
         ↓
    Rollback if required

The important property is **fail closed**.

If an artifact cannot be authenticated or validated, activation must not proceed.

## 4.17 CLI Relationship

The `c107` CLI is another control surface over the same Cloud107 concepts.

    Web Client ─────┐
    Native Client ─┤
    CLI ───────────┤
    Automation ────┘
            ↓
      Cloud107 Control
            ↓
       Infrastructure

Where possible, CLI and UI operations should map to the same domain operations rather than implementing independent business rules.

## 4.18 Cross-Platform Direction

Cloud107 follows the principle:

> **Shared semantics, native surfaces.**

Shared semantics include:

- identity
- workspace
- node
- operation
- session
- capabilities
- lifecycle states
- errors
- transport contracts

Rendering and operating-system integration should remain native where platform integration matters.

The intended surfaces include Windows, Linux, macOS, Android, iOS, iPadOS, Web, WSL, containers, VMs, and lightweight embedded environments where appropriate.

## 4.19 Android Surface

The Android client follows the same model.

The intended state flow is:

    Persistent Android State
            ↓
    Cloud107 State Repository
            ↓
          StateFlow
          ├── MainActivity
          └── App Widget

The Live Widget is a launcher surface and projection of state. It is not the source of truth.

Its interaction model is:

    Android Home
        ↓
    Cloud107 Live Widget
        ↓
    PendingIntent
        ↓
    MainActivity
        ↓
    Cloud107 application surface

The widget should not become a miniature fake home screen.

## 4.20 Visual Architecture

Cloud107's visual language may use liquid glass, aquamorphic surfaces, crystalline/glacial materials, spatial depth, restrained motion, translucent surfaces, and telemetry visualization.

These are material concepts, not a requirement to reproduce another operating system.

> **Material language may be shared; interaction conventions remain platform-native.**

Accessibility overrides visual fidelity. Transparency, blur, animation, and color must never be the only mechanisms used to communicate state.

## 4.21 Observability

A distributed control system needs correlation across boundaries:

    User action
      ↓
    HTTP request
      ↓
    Operation
      ↓
    Provider action
      ↓
    Worker event
      ↓
    Session event

Useful observability dimensions include:

- request latency
- operation duration
- provider failures
- workspace transition failures
- worker health
- session establishment time
- WebRTC failures
- resource utilization
- update verification failures

Structured logs and correlation identifiers make these events usable by both humans and machines.

## 4.22 Failure and Recovery

Cloud107 should assume components fail independently.

Examples include:

- client disconnect
- API restart
- database interruption
- worker failure
- provider failure
- WebSocket interruption
- WebRTC failure
- partial workspace startup
- stale session
- update validation failure

Recovery should be state-aware.

    Streaming
       ↓
    transport failure
       ↓
    Disconnected
       ↓
    reconnect
      ├── success → Streaming
      └── failure → Error / operator action

A transport failure should not automatically imply that the underlying workspace must be recreated.

## 4.23 Idempotency

Infrastructure operations must be designed with retries in mind.

A network timeout does not necessarily mean that the provider operation failed.

> **Client timeout ≠ provider rollback.**

Operations such as start, stop, restart, and provisioning should distinguish:

- command accepted
- command executing
- command completed
- command failed
- command outcome unknown

Operation identifiers or idempotency keys should be used where necessary to prevent duplicate side effects.

## 4.24 Deployment Topology

Cloud107 is architecturally better suited to a persistent host than to a purely serverless deployment model because the system includes a stateful Express control plane, PostgreSQL connectivity, provider/runtime processes, long-lived sessions, and WebSocket/WebRTC signaling.

A representative deployment is:

    Internet / Private Network
              │
         TLS termination
              │
        Cloud107 Control Plane
           ┌──┴─────┐
           │        │
       PostgreSQL  Workers
                    │
                 Runtime
                    │
                Workspace

The exact infrastructure provider is not part of the core architecture.

Cloud107 should remain deployable on a dedicated server, VM, VPS, private cloud, self-hosted cluster, or container host.

## 4.25 Repository Boundaries

The current repository separates major responsibilities:

    Cloud107/
    ├── src/                 Web + control-plane application
    ├── server.ts            Server entry
    ├── desktop-agent/       Desktop/session agent
    ├── workspace-runtime/   Workspace execution
    ├── agents/              Agent services
    ├── infra/               Infrastructure definitions
    ├── scripts/             Operational tooling
    └── docs/                Architecture documentation

These boundaries are more important than any individual framework choice.

A new module should have a clear reason to exist and a clear owner for its state.

## 4.26 Contributor Decision Sequence

When adding a feature, answer these questions in order:

1. What is the domain concept?
2. Who owns its state?
3. Is the state durable or ephemeral?
4. Is this control-plane or data-plane behavior?
5. Which boundary performs the operation?
6. How does failure behave?
7. How is the operation observable?
8. How does the UI project the resulting state?
9. Can the operation be retried safely?
10. Does it introduce a provider-specific dependency?

If these questions cannot be answered cleanly, the boundary probably needs refinement before implementation.

## 4.27 Reference Feature Flow

A new infrastructure feature should generally follow:

    Requirement
       ↓
    Domain concept
       ↓
    Type / contract
       ↓
    API endpoint or command
       ↓
    Service operation
       ↓
    Provider / runtime adapter
       ↓
    Persistence
       ↓
    Event / status
       ↓
    Client state mapping
       ↓
    UI projection
       ↓
    Tests
       ↓
    Documentation

## 4.28 Testing Strategy

### Unit Tests

Cover:

- state transitions
- validation
- service behavior
- authentication helpers
- provider adapters
- parsers
- update verification

### Integration Tests

Cover:

- API + database
- service + provider
- authentication flow
- lifecycle transitions
- operation persistence

### End-to-End Tests

Cover:

- authentication
- workspace creation
- workspace startup
- session connection
- disconnect/reconnect
- workspace shutdown
- recovery

### Infrastructure Tests

Cover:

- Terraform
- network rules
- worker bootstrap
- update verification
- deployment configuration

Tests should verify architectural boundaries, not only component rendering.

## 4.29 Architectural Invariants

Unless an explicit architecture decision changes them:

1. **The backend is authoritative for infrastructure state.**
2. **The UI is a projection and control surface, not the infrastructure authority.**
3. **Control traffic and interactive data traffic are separate concerns.**
4. **Provider-specific behavior belongs behind provider/runtime boundaries.**
5. **Persistent state survives process restarts; ephemeral transport state does not need to.**
6. **Authentication and authorization remain distinct.**
7. **Infrastructure operations are explicit state transitions.**
8. **Long-running operations are observable.**
9. **Retries must not silently duplicate side effects.**
10. **Updates fail closed when verification fails.**
11. **Clients share semantics but retain native platform surfaces.**
12. **Visual state must not be the only representation of system state.**
13. **Security-sensitive configuration never belongs in source control.**
14. **Self-hosting must not depend on a proprietary control service.**

## 4.30 Mental Model

The shortest useful mental model for Cloud107 is:

    Cloud107 is the control system.

    The UI expresses intent.
    The API carries intent.
    The service layer interprets intent.
    The database remembers control-plane state.
    Providers allocate infrastructure.
    Runtimes execute workspaces.
    Workers perform the actual computation.
    Signaling establishes sessions.
    WebRTC carries interactive data.
    Clients render the resulting state.
    The CLI exposes the same control model to automation.
    The update engine protects the software supply chain.

That separation is the architectural foundation on which Cloud107 should evolve.
