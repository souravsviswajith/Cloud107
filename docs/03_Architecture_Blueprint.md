# Architecture Blueprint (Components 3-12)

## 3. High Level Architecture

The platform is divided into three planes:

1. **Control Plane:** Cloud107 React/Vite Workspace UI + Cloud107 API. Manages user requests, workspace allocation, telemetry, and source-first updates.
2. **Signaling Plane:** Cloud107 WebSockets routing SDP offers, answers, and ICE candidates between client and workspace node.
3. **Data/Media Plane:** Direct Peer-to-Peer (or relayed via TURN) WebRTC connection between the user's browser and the allocated workspace.

## 4. Component Diagram

- **React/Vite Workspace UI** <--> **Cloud107 Identity** (WebAuthn / FIDO2 / Sovereign Token)
- **React/Vite Workspace UI** <--> **Cloud107 API** (REST API & WS Signaling)
- **Cloud107 Control Plane** <--> **PostgreSQL Store** (Session State & Workspace Registry)
- **Cloud107 Control Plane** <--> **Hyper-V / Cloud Provider API** (VM Start/Stop/Attach Disk)
- **React/Vite Workspace UI** <== WebRTC UDP ==> **Workspace Host** (Host Streaming Agent)

## 5. Networking Architecture

- **Frontend/Backend:** Unified sovereign node, accessible via HTTPS (TCP 443 / 3000).
- **WebRTC Transport:** Requires outbound UDP ports. STUN servers resolve public IPs. TURN servers relay traffic if symmetric NAT blocks direct P2P.
- **Node Isolation:** Workloads reside in a private virtual network. The only ingress allowed is the WebRTC UDP port range and a secure control channel.

## 6. Streaming Architecture

- **Capture:** Desktop Duplication API (DXGI) captures frames at 60+ Hz directly from the GPU framebuffer.
- **Encode:** Hardware accelerated NVENC encodes raw frames into H.264/HEVC/AV1.
- **Transport:** WebRTC handles network jitter, packet loss (NACKs), and dynamic bitrate adaptation (GCC algorithm).
- **Input:** WebRTC DataChannels (SCTP) transport input events.

## 7. Authentication Architecture

- Users authenticate via **WebAuthn / FIDO2** or sovereign local operator credentials.
- Client receives a cryptographically signed sovereign session token.
- Client passes the token in the `Authorization: Bearer` header to the **Cloud107 API**.
- Cloud107 validates the token using local cryptographic verification.

## 8. Session Management

- Managed via local relational persistence (`workspaces` and `application_sessions` tables).
- States: `PENDING` -> `PROVISIONING` -> `READY` -> `ACTIVE` -> `DISCONNECTED` -> `TERMINATED`.
- Health probes monitor workspace health. If disconnected, sessions persist safely without data loss.

## 9. Storage Architecture

- **OS Disk:** Sovereign image baseline.
- **User Profile Disk:** Dedicated persistent block volume formatted and attached during boot.

## 10. Provisioning Strategy

- Maintain a pool of pre-warmed nodes.
- On session request, allocate a node, attach the persistent storage, and transition state to `READY`.

## 11. GPU Strategy

- Utilize Datacenter GPUs with PCIe passthrough or partitionable GPUs.

## 12. Hardware Optimization Strategy

A lightweight service runs on boot to optimize the OS:

1. **GPU Validation:** Verifies NVENC capabilities, CUDA health, and DirectX.
2. **Power Plan:** Sets system to High Performance.
3. **Network Tuning:** Tunes MTU and low-latency buffer profiles.


## 13. Basis Language and System Foundation

Cloud107 does not adopt an industry-template technology stack. Language, operating-system interfaces, runtime, and tooling are selected from the requirements of each subsystem.

The architectural basis is language-neutral and permits multiple implementation bases where the computational problem requires them:

- **Unix / POSIX:** process model, shell orchestration, filesystem and IPC primitives, service lifecycle, deployment and runtime operations.
- **Assembly:** architecture-specific instructions and lowest-level operations where direct machine-level control is justified.
- **C:** operating-system interfaces, native runtime components, hardware-near services, and portable systems primitives.
- **C++:** performance-sensitive native systems, rendering, simulation, and complex runtime components where its execution model is appropriate.
- **C# / .NET:** managed systems components, cross-platform services, tooling, and platform integrations where the .NET runtime and ecosystem are appropriate.
- **SQL:** relational persistence, queries, constraints, transactions, and database-side computation.
- **Python:** automation, data processing, machine learning, experimentation, and scripting where its ecosystem and iteration speed are appropriate.
- **Java:** JVM-based components where portability, ecosystem compatibility, or platform requirements justify it.
- **JavaScript / TypeScript:** browser-facing interfaces and server components where the JavaScript runtime is the appropriate execution environment.
- **Rust, Go, or other languages:** permitted when their concrete safety, concurrency, portability, or systems characteristics fit the subsystem.
- **Platform-native toolchains:** used where Android, Windows, Linux, Apple, or another target platform exposes capabilities that require or materially benefit from native integration.

The choice is made **after the subsystem boundary and requirements are established**, not before them. Different subsystems may therefore use different basis languages while communicating through explicit architectural contracts.

No language is selected merely because it is conventional for a particular industry category, and no subsystem is forced into a common language for stylistic uniformity.


## 14. Experience Boundary: Cloud107 and Project Atlas

Cloud107 and Project Atlas are separate project boundaries.

**Cloud107** provides the underlying computational and infrastructure substrate: preconfigured environments, runtimes, dependencies, workloads, nodes, operations, terminal control, deployment, and universal update management. Its plug-and-play objective is achieved by resolving technical complexity before the workload reaches the end user.

**Project Atlas** is the separate higher-level project for non-technical users. Cloud107 should not be reduced to an Atlas-style consumer abstraction merely to make its core infrastructure accessible.

This preserves two complementary layers:

**Cloud107:** prepare and operate the machinery.  
**Project Atlas:** expose appropriate capabilities to non-technical users.

The boundary is architectural, not merely visual. Atlas may consume Cloud107 capabilities where integration is appropriate, while Cloud107 remains independently usable as an infrastructure and execution platform.


## 15. Preconfigured Environment and Plug-and-Play Execution

Cloud107 treats the preconfigured execution environment as an architectural capability rather than a convenience feature.

A supported deployment target is prepared with the runtime components, libraries, system dependencies, platform integration, configuration, and operational tooling required by the workloads it exposes. These components are versioned and validated as part of the deployment environment.

The intended user flow is:

**Provision / install → initialize → validate environment → expose capability → use.**

The user should not be required to manually resolve ordinary dependency installation, runtime selection, library compatibility, or environment configuration before using a supported capability.

### Environment layers

1. **System layer** — operating system, kernel/platform interfaces, drivers, devices, filesystem, networking, and security primitives.
2. **Runtime layer** — language runtimes, execution engines, native runtimes, and platform frameworks required by supported workloads.
3. **Dependency layer** — libraries, packages, SDKs, codecs, tools, and other workload dependencies.
4. **Cloud107 layer** — control services, agents, workspace/runtime components, identity, operations, terminal, and update management.
5. **Workload layer** — projects and applications consuming the prepared environment.
6. **Experience layer** — Cloud107's operator/developer interface or an integrated higher-level project such as Project Atlas.

### Reproducibility

The prepared environment must be describable, versionable, verifiable, and reproducible across supported deployment targets. Environment changes therefore belong under Universal Update Management rather than being treated as ad-hoc manual maintenance.

This does not mean every target receives identical binaries or identical system components. The environment contract is preserved while implementation remains target-appropriate for x86_64, ARM64, Windows, Linux, WSL, Android, Apple, ISO, container, or other supported targets.

### Boundary

Plug-and-play applies to the **user-facing execution experience**. It does not remove developer or operator control. Developers and operators retain access to the underlying environment through the appropriate Cloud107 interfaces, including Terminal, Operations, Settings, deployment tooling, and Universal Update Management.
