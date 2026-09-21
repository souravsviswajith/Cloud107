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
