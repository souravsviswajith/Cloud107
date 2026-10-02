# AI

LLM107 and agent integration, capability discovery, planning, validation boundaries, and agent-facing APIs.

## AI architecture

<table><tr><td align="center"><strong>User</strong></td><td>→</td><td align="center"><strong>AI Agent</strong><br><sub>Planning · intent</sub></td><td>→</td><td align="center"><strong>LLM107</strong><br><sub>Provider-neutral layer</sub></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td align="center"><strong>Capability selection</strong></td><td>→</td><td align="center"><strong>c107</strong><br><sub>TypeScript · Node.js · CLI</sub></td><td>→</td><td align="center"><strong>Cloud107</strong><br><sub>Authoritative execution layer</sub></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td align="center"><strong>Nodes</strong></td><td>↔</td><td align="center"><strong>Workloads</strong></td><td>↔</td><td align="center"><strong>Runtime</strong></td></tr></table>

**Note:** The AI layer plans and requests operations. Cloud107 remains the authoritative execution and resource layer.

## Control boundary

<table><tr><td align="center"><strong>AI / Agent</strong></td><td>→</td><td align="center"><strong>Intent / operation request</strong></td><td>→</td><td align="center"><strong>c107 verification boundary</strong></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td align="center"><strong>Command / operation validation</strong></td><td>+</td><td align="center"><strong>Update verification</strong><br><sub>where applicable</sub></td><td>→</td><td align="center"><strong>Cloud107 API / runtime</strong></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td colspan="5" align="center"><strong>Actual system state</strong></td></tr></table>

The AI layer must not invent infrastructure state, resource availability, permissions, or execution results.

## Capability discovery

<table><tr><td align="center"><strong>Cloud107 capabilities</strong></td><td>→</td><td align="center"><strong>LLM107 / agent</strong></td><td>→</td><td align="center"><strong>Plan using available capabilities</strong></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td align="center"><strong>Request operation</strong></td><td>→</td><td colspan="3" align="center"><strong>Cloud107 validates and executes</strong></td></tr></table>

**Note:** Capability discovery should expose what the execution layer actually reports. Unsupported capabilities should remain unavailable.

## Agent-facing interfaces

| Boundary | Current technology / model | Role |
|---|---|---|
| Agent orchestration | LLM107 | Provider-neutral model routing and planning |
| Control transport | c107 · TypeScript · Node.js | Verified operation transport |
| Execution | Cloud107 | Authoritative runtime/resource control |
| State | Cloud107 API · PostgreSQL | Application state |
| User interface | Web workspace | User-visible control and observation |

**Note:** Provider-specific model integrations should remain replaceable behind the LLM107 capability boundary.

## Validation boundary

<table><tr><td align="center"><strong>AI proposal</strong></td><td>→</td><td align="center"><strong>Capability check</strong></td><td>→</td><td align="center"><strong>Permission / operation check</strong></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td align="center"><strong>c107 verification</strong></td><td>→</td><td align="center"><strong>Cloud107 execution</strong></td><td>→</td><td align="center"><strong>Observed result</strong></td></tr><tr><td colspan="5" align="center">↓</td></tr><tr><td colspan="5" align="center"><strong>Agent response</strong></td></tr></table>

The agent should distinguish between:
- requested operation
- accepted operation
- executed operation
- observed result
- unavailable or failed operation

## CLI diagnosis path

After installation, the operational interface available to both humans and AI agents is `c107`.

```bash
c107 --help
c107 status
c107 nodes
c107 workloads
c107 operations
```

For diagnosis, the agent can inspect returned state, identify the affected boundary, and request the next supported operation through `c107`.

**Note:** This does not give the AI direct authority over infrastructure. The agent operates through the defined command and verification boundary.

## Scope

This page documents the AI integration boundary. Autonomous infrastructure actions, hidden agent permissions, and unsupported execution paths should not be treated as implemented unless the corresponding controls exist and have been verified.