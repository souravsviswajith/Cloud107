# Security & Performance (Components 15-17)

## 15. Security Model

- **Identity & Access:** Self-hosted WebAuthn / FIDO2 and Cloud107 Identity provide sovereign, phishing-resistant authentication without third-party SaaS dependencies.
- **Network Isolation:** Workspaces do not require public IPs. They are accessed via WebRTC and WireGuard using STUN/TURN for traversal.
- **Encryption:** Control plane uses TLS 1.3. Media and Data channels use DTLS and SRTP (mandatory in WebRTC).
- **Data Security:** Persistent disks and local session state are encrypted at rest.
- **Zero Trust:** The Host Agent only accepts connections negotiated via the authenticated signaling server.
- **Supply Chain & Updates:** Source-first `c107 update` verifies Ed25519 digital signatures, provenance, and SHA-256 hashes with fail-closed atomic activation and automatic rollback.

## 16. Performance Budget

- **Glass-to-Glass Latency:** Target < 20ms.
  - Capture (DXGI): < 2ms
  - Encode (NVENC): < 4ms
  - Network (UDP): 5-10ms (region dependent)
  - Decode (Browser): < 4ms
- **Framerate:** Sustained 60 FPS.
- **Resolution:** 1080p dynamic scaling up to 4K based on bandwidth.
- **Bitrate:** 5 Mbps to 50 Mbps adaptive.
- **Time-to-Interactive (Cold):** < 45 seconds.
- **Time-to-Interactive (Warm Pool):** < 5 seconds.

## 17. Scaling Strategy

- **Phase 1 (Target: 5 concurrent users):** Static warm pool of 5 instances. Manual scaling.
- **Phase 2 (Auto-scaling):** Sovereign node auto-scaling. Cloud107 workers monitor node health and dynamically provision instances.
- **Stateless Control Plane:** Cloud107 control-plane instances can be scaled horizontally behind an ingress proxy.
