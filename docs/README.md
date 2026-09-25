# Cloud107 Documentation

Technical documentation for Cloud107.

## Documentation map

| Section | Scope |
|---|---|
| [Architecture](architecture/) | System structure, components and boundaries |
| [Design](design/) | UI architecture and interaction structure |
| [Development](development/) | Source workflow, languages and tooling |
| [Runtime](runtime/) | Runtime components and execution boundaries |
| [Deployment](deployment/) | Docker and Kubernetes deployment |
| [Security](security/) | Trust boundaries and security controls |
| [Updates](updates/) | Update verification, activation and rollback |
| [APIs](APIs/) | HTTP API interfaces |
| [CLI](CLI/) | c107 commands |
| [Environments](environments/) | Toolchains, dependencies and reproducible environments |
| [Nodes](nodes/) | Node registration, capabilities and connectivity |
| [Workloads](workloads/) | Workload execution and lifecycle |
| [AI](AI/) | AI interfaces and control boundaries |
| [Operations](operations/) | Health, logging, recovery and diagnostics |
| [Decisions](decisions/) | Accepted technical constraints |
| [Research](research/) | External technical references and prior art |
| [Phase 3](phase-3/) | Cloud107 OS, modular images and device runtime |

## Page structure

Each page documents one technical area.

**Description → Architecture / flow → Command or configuration → Expected result → Reference**

### Description
State the component, interface or operation being documented.

### Architecture / flow
Use rendered Markdown/HTML diagrams or tables. Identify relevant language, runtime, protocol, platform API, hardware/ISA, standard or reference implementation.

### Command / configuration
Use executable commands and actual configuration where applicable.

### Expected result
State the observable result and next required operation.

### Reference

| Type | Reference |
|---|---|
| Language | [TypeScript](https://www.typescriptlang.org/docs/) |
| Runtime | [Node.js](https://nodejs.org/docs/latest/api/) |
| Framework | [React](https://react.dev/reference/react) |
| Database | [PostgreSQL](https://www.postgresql.org/docs/) |
| Container | [Docker](https://docs.docker.com/) |
| Orchestration | [Kubernetes](https://kubernetes.io/docs/) |
| Standards | [RFC Editor](https://www.rfc-editor.org/) |

## Documentation states

| State | Meaning |
|---|---|
| Implemented | Present in the current source |
| Planned | Intended future implementation |
| Experimental | Under active testing |
| Research | External technical material |
| Decision | Accepted technical constraint |

Implementation state must be explicit when a page describes functionality that is not implemented.

## Technical scope

Documentation contains technical system information:

- Architecture
- APIs and interfaces
- Commands
- Configuration
- Runtime behavior
- Supported hardware and platforms
- Dependencies
- Protocols and standards
- Security controls
- Deployment
- Validation
- Diagnostics
- Compatibility
- Technical references
