# AI

LLM107 and agent integration, capability discovery, planning, validation boundaries, and agent-facing APIs.

## AI architecture

```text
                         User
                          │
                          ▼
                       AI Agent
                          │
                   planning / intent
                          │
                          ▼
                       LLM107
                 provider-neutral layer
                          │
                 capability selection
                          │
                          ▼
                         c107
              TypeScript / Node.js / CLI
                          │
                    verification
                          │
                          ▼
                       Cloud107
              authoritative execution layer
                          │
             ┌────────────┼────────────┐
             ▼            ▼            ▼
           Nodes       Workloads     Runtime
```

**Note:** The AI layer plans and requests operations. Cloud107 remains the authoritative execution and resource layer.

## Control boundary

```text
AI / Agent
    │
    ▼
Intent / operation request
    │
    ▼
c107 verification boundary
    │
    ├── command / operation validation
    └── update verification where applicable
    │
    ▼
Cloud107 API / runtime
    │
    ▼
Actual system state
```

The AI layer must not invent infrastructure state, resource availability, permissions, or execution results.

## Capability discovery

```text
Cloud107 capabilities
        │
        ▼
LLM107 / agent
        │
        ▼
Plan using available capabilities
        │
        ▼
Request operation
        │
        ▼
Cloud107 validates and executes
```

**Note:** Capability discovery should expose what the execution layer actually reports. Unsupported capabilities should remain unavailable.

## Agent-facing interfaces

| Boundary | Current technology / model | Role |
|---|---|---|
| Agent orchestration | LLM107 | Provider-neutral model routing and planning |
| Control transport | c107 / TypeScript / Node.js | Verified operation transport |
| Execution | Cloud107 | Authoritative runtime/resource control |
| State | Cloud107 API / PostgreSQL | Application state |
| User interface | Web workspace | User-visible control and observation |

**Note:** Provider-specific model integrations should remain replaceable behind the LLM107 capability boundary.

## Validation boundary

```text
AI proposal
    ↓
Capability check
    ↓
Permission / operation check
    ↓
c107 verification
    ↓
Cloud107 execution
    ↓
Observed result
    ↓
Agent response
```

The agent should distinguish between:

- requested operation
- accepted operation
- executed operation
- observed result
- unavailable or failed operation

## Scope

This page documents the AI integration boundary. Autonomous infrastructure actions, hidden agent permissions, and unsupported execution paths should not be treated as implemented unless the corresponding controls exist and have been verified.
