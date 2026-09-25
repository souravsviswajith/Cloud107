# Nodes

Node registration, capabilities, connectivity, lifecycle, resources, and state.

## Node architecture

```text
                         Cloud107
                            │
                     Control / API layer
                            │
                            ▼
                    Node registration
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
             Identity   Capabilities  State
                 │          │          │
                 └──────────┼──────────┘
                            ▼
                       Node lifecycle
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
           Connect        Operate       Disconnect
              │             │             │
              └─────────────┼─────────────┘
                            ▼
                       Resources
```

**Note:** A node represents a connected execution/resource endpoint. Registration, capability reporting, connectivity, lifecycle, and state should remain separate concerns.

## Connectivity boundary

```text
Node
 │
 ├── Ethernet / Wi-Fi
 ├── Bluetooth / BLE
 └── NFC where applicable
 │
 ▼
Standard network / platform interfaces
 │
 ▼
Cloud107 control boundary
```

Custom mesh networking is excluded by the accepted architecture decision in `docs/decisions/mesh-networking-exclusion.md`.

**Note:** Cloud107 does not silently introduce custom mesh routing, mesh-specific discovery, mesh-specific identity, custom mesh control planes, or custom NAT traversal.

## Node capability model

```text
Node
 │
 ├── Hardware
 ├── ISA / architecture
 ├── Operating system
 ├── Toolchain
 ├── Runtime
 ├── Dependencies
 └── Available workloads
```

The node capability surface should describe what the connected node can actually provide. Unsupported capabilities should be reported as unavailable rather than simulated.

## State boundary

```text
Node resource
    │
    ▼
Authoritative runtime state
    │
    ├── connection
    ├── lifecycle
    ├── resources
    └── workload state
    │
    ▼
Cloud107 API / UI
```

**Note:** The UI should display state obtained from the runtime/control layer. It should not invent node health, resources, billing, or workload state.

## Implementation references

| Boundary | Technology / interface | Status |
|---|---|---|
| Control API | Node.js / TypeScript / Express | Current API layer |
| Persistent state | PostgreSQL / Drizzle | Current application storage |
| LAN connectivity | Ethernet / Wi-Fi / IP | Supported architectural boundary |
| Short-range connectivity | Bluetooth / BLE / NFC | Supported architectural boundary |
| Custom mesh networking | Custom mesh stack | Excluded |

**Note:** Programming languages, protocols, standards, vendor technologies, and platform APIs should be documented separately when an implementation depends on them. The node model does not imply that every listed connectivity option is implemented for every device.

## Scope

This page documents the node model and connectivity boundaries currently defined by Cloud107. Device-specific implementations should be documented when they are implemented and verified.
