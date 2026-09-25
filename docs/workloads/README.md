# Workloads

Workload types, placement, lifecycle, resource requirements, execution, and observation.

## Workload architecture

```text
                         Cloud107
                            │
                            ▼
                     Workload request
                            │
                            ▼
                    Capability matching
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
             Node A                  Node B
          capabilities            capabilities
                │                       │
                └───────────┬───────────┘
                            ▼
                         Placement
                            │
                            ▼
                         Execute
                            │
                 ┌──────────┼──────────┐
                 ▼          ▼          ▼
              Runtime    Resources   State
                 │          │          │
                 └──────────┼──────────┘
                            ▼
                       Observation
```

**Note:** A workload is placed against the capabilities actually available on a node. Placement should not assume a resource or runtime that the node does not report.

## Workload lifecycle

```text
Request
  ↓
Validate
  ↓
Resolve capabilities
  ↓
Select execution target
  ↓
Prepare environment
  ↓
Start
  ↓
Observe
  ↓
Stop / complete
```

The exact lifecycle for each workload type should be documented when that workload is implemented.

## Capability boundary

```text
Workload requirements
        │
        ▼
Hardware → ISA → OS → Toolchain → Runtime → Dependencies
        │
        ▼
Available node capabilities
        │
        ▼
Placement decision
```

**Note:** The capability model connects workload requirements to the actual execution environment. Unsupported requirements should result in an explicit unavailable state rather than an invented capability.

## Execution interfaces

| Boundary | Current technology / model | Role |
|---|---|---|
| Workload control | Cloud107 API | Request and lifecycle control |
| Node control | Express / TypeScript | Application control boundary |
| Environment | Node.js / Docker / Compose | Current application runtime |
| State | PostgreSQL / Drizzle | Persistent application state |
| CLI control | c107 / TypeScript / Node.js | Command-line operations |

**Note:** These entries describe the current Cloud107 application/runtime boundaries. They do not establish that every workload type can already run on every node class.

## Validation

Before documenting a workload as supported, verify:

```text
Workload
   │
   ├── Requirements known
   ├── Target node identified
   ├── Environment prepared
   ├── Execution verified
   └── Runtime state observed
```

**Note:** A workload definition, interface, or target package is not by itself proof of execution support.

## Scope

This page documents the workload model and current application boundaries. Specific workload implementations should add their own execution requirements, lifecycle, interfaces, and validation results.
