# Terminology & Architecture Alignment: Cryptography vs. Hashing

**Status:** Crystallized
**Tags:** #architecture #security #terminology

## Core Clarification

To maintain consistent engineering terminology across the Cloud107 codebase, documentation, and CLI output:

1. **SHA-256 Hash Verification (Active):**
   - Used for deterministic artifact integrity checks before deployment transport.
   - Compares the computed SHA-256 checksum of a local file against the cryptographic hash parameter embedded in the Cloud107 URN (`hash=sha256:...`).

2. **Digital Signatures (Target Implementation):**
   - Asymmetric cryptography (e.g., Ed25519) for cross-node provenance and verifiable releases remains part of the long-term artifact model, not an active CLI feature.

## Network Topology Language

References to a "mesh control plane" are replaced by standard network terminology. Cloud107 relies on standard LAN/WAN and HTTP/WebSocket transport primitives rather than custom proprietary mesh overlay networks.
