# Decisions

Concise technical decision records: context, alternatives, decision, and consequences.

> **Rule:** Record architectural decisions here when they change a boundary, dependency, security property, deployment model, or supported capability.

## Decision flow

```text
Problem
  ↓
Context
  ↓
Options
  ↓
Decision
  ↓
Consequences
  ↓
Implementation
  ↓
Validation
```

**Note:** The decision record explains *why* a change exists. Implementation documentation explains *how* it works.

## Decision record format

| Field | What to record |
|---|---|
| **Status** | Proposed / Accepted / Rejected / Superseded |
| **Context** | Problem and constraints |
| **Options** | Relevant alternatives |
| **Decision** | Selected architectural direction |
| **Consequences** | Effects, trade-offs, and constraints |
| **Implementation** | Files/components affected |
| **Validation** | Evidence that the decision is implemented |
| **Date** | Decision date |
| **Related** | Related architecture, security, or research documents |

### Example

> **Decision:** Exclude a custom mesh networking layer.

| Item | Record |
|---|---|
| **Context** | Custom mesh networking would add another routing, discovery, identity, and control boundary. |
| **Decision** | Do not introduce custom mesh networking into Cloud107 without a new accepted architecture decision. |
| **Allowed** | Standard Ethernet, Wi-Fi, LAN/WAN, Bluetooth/BLE, NFC, and appropriate standard application protocols. |
| **Excluded** | Custom mesh routing, mesh-specific discovery/identity, custom mesh control planes, custom NAT traversal, hidden AI-selected mesh behavior. |
| **Validation** | See `docs/decisions/mesh-networking-exclusion.md`. |

## Markdown usage

Use Markdown features when they improve technical readability:

- headings for hierarchy
- tables for structured facts
- fenced code blocks for commands/configuration
- diagrams for architecture and flow
- `> **Note:**` for short operational notes
- links to related repository documents
- `<details>` for long optional material when appropriate
- checklists for validation
- short lists instead of long prose

**Note:** The page should remain technical and easy to scan. Do not add formatting merely for decoration.

## Decision validation checklist

- [ ] Context is stated.
- [ ] Alternatives are identified.
- [ ] Decision is explicit.
- [ ] Consequences are recorded.
- [ ] Affected implementation is identified.
- [ ] Validation evidence exists.
- [ ] Related documentation is linked.