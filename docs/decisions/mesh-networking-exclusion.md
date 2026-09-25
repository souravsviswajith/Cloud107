# Mesh Networking Exclusion

**Status:** Accepted  
**Scope:** Cloud107 architecture and all Cloud107-managed workloads

## Decision

Cloud107 MUST NOT implement, introduce, depend upon, or autonomously select custom mesh-networking technology.

This is an architectural boundary, not merely a deferred implementation item.

## Rationale

Cloud107 is intended to provide a usable infrastructure and execution layer for both technical and normal users. Introducing an additional networking/control-plane mechanism would expand the networking surface and create capabilities that are not required by the current architecture.

The project therefore uses existing, explicit networking capabilities instead of creating a separate mesh layer.

## Prohibited

Cloud107 must not add or depend on:

- custom mesh routing;
- mesh-specific node discovery;
- mesh-specific network identity;
- custom mesh control planes;
- custom mesh NAT traversal;
- proprietary mesh overlays;
- an AI-agent fallback that selects mesh networking;
- hidden or implicit mesh networking inside another Cloud107 subsystem.

A third-party component that requires a mesh overlay must not become a Cloud107 core dependency merely because it is convenient for a workload.

## Allowed Networking

The project may use standard connectivity provided by the host platform or explicitly supported infrastructure, including:

- Ethernet;
- Wi-Fi;
- LAN;
- WAN / Internet;
- Bluetooth / BLE;
- NFC;
- standard application protocols such as TCP/IP, HTTP(S), and MQTT where appropriate.

Optional integrations with existing ecosystems such as Google Home, Apple Home, or Amazon Alexa remain adapters rather than Cloud107 networking infrastructure.

## AI-Agent Boundary

LLM107 and external AI agents must operate within the same architectural constraint.

An agent may select among capabilities exposed by Cloud107, but mesh networking is not a Cloud107 capability.

If a requested workload requires unsupported mesh networking, the system must report the constraint rather than silently introducing or enabling a mesh implementation.

## Security and Authorization Boundary

The exclusion does not remove the need for:

- authentication;
- authorization;
- node identity;
- encrypted transport;
- secure provisioning;
- network isolation where required.

Those controls must be implemented using the applicable standard platform and protocol mechanisms.

## Exception Process

Reconsideration requires an explicit architecture decision.

No individual provider, workload, dependency, update, generated code path, or AI-agent action may override this decision implicitly.

Any future exception must document:

1. the concrete requirement;
2. why existing networking cannot satisfy it;
3. the additional attack and operational surface;
4. affected users and workloads;
5. security controls;
6. migration and rollback behavior;
7. explicit architectural approval.

Until such a decision is accepted, mesh networking remains outside Cloud107's architecture.

## Relationship to Device Connectivity

This decision formalizes the networking boundary described in `docs/architecture/device-connectivity.md`.

Cloud107 uses existing device and platform connectivity capabilities and exposes them through Cloud107 capability interfaces. It does not create a new networking subsystem to replace them.