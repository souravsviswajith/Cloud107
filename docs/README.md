# Cloud107 Documentation

Technical documentation for Cloud107.

Cloud107 documentation is split by the part of the system being described. The root [README](../README.md) is the installation and everyday-use guide.

## Product and source model

Cloud107 is maintained as an open-source project and distributed as a usable product.

<table>
<tr><th>Layer</th><th>Purpose</th></tr>
<tr><td><strong>Source</strong></td><td>Complete project source, documentation, development workflow, and architecture.</td></tr>
<tr><td><strong>Release</strong></td><td>Validated, packaged, pre-configured artifacts for supported platforms.</td></tr>
<tr><td><strong>Operation</strong></td><td>The installed Cloud107 system used through the workspace, <code>c107</code>, and supported interfaces.</td></tr>
</table>

<table>
<tr><td align="center"><strong>Source repository</strong></td><td>→</td><td align="center"><strong>Build</strong></td><td>→</td><td align="center"><strong>Validation</strong></td><td>→</td><td align="center"><strong>Package</strong></td><td>→</td><td align="center"><strong>Pre-configuration</strong></td><td>→</td><td align="center"><strong>Release artifact</strong></td></tr>
</table>

**Note:** The source repository is the path for users who need to inspect, modify, test, or build Cloud107. The release artifact is the path for users who only need to install and operate the system.

**Documentation rule:** Product-facing documentation should explain how to install and use the release. Technical documentation should explain the source, architecture, interfaces, validation, and operational behavior.

## Documentation map

<table><tr><td colspan="4" align="center"><strong>Cloud107</strong></td></tr><tr><td align="center">Architecture<br>Design<br>Development<br>Runtime</td><td align="center">Deployment<br>Security<br>Updates<br>APIs</td><td align="center">CLI<br>Environments<br>Nodes<br>Workloads</td><td align="center">AI<br>Operations<br>Decisions<br>Research</td></tr></table>

| Section | Use it for | Guide |
|---|---|---|
| [Architecture](architecture/) | System structure, components, boundaries | Start here for architecture |
| [Design](design/) | UI and interaction structure | Understand the workspace surface |
| [Development](development/) | Source workflow and local development | Build from source |
| [Runtime](runtime/) | Runtime behavior and interfaces | Follow execution flow |
| [Deployment](deployment/) | Docker and Kubernetes deployment | Deploy Cloud107 |
| [Security](security/) | Trust boundaries and controls | Review security behavior |
| [Updates](updates/) | Update verification and activation | Follow the update path |
| [APIs](APIs/) | HTTP API structure | Review API interfaces |
| [CLI](CLI/) | `c107` commands and update flow | Use the terminal interface |
| [Environments](environments/) | Toolchains and reproducibility | Prepare execution environments |
| [Nodes](nodes/) | Nodes, capabilities, and connectivity | Understand resource registration |
| [Workloads](workloads/) | Workload placement and lifecycle | Understand execution |
| [AI](AI/) | LLM107, agents, and Cloud107 control | Review AI boundaries |
| [Operations](operations/) | Health, logging, recovery, troubleshooting | Operate the system |
| [Decisions](decisions/) | Accepted architecture decisions | Check constraints before changes |
| [Research](research/) | External references and prior art | Study related implementations |

## How to use a page

Each technical guide should answer one concrete question.

<table><tr><td align="center"><strong>Description</strong></td><td>→</td><td align="center"><strong>Diagram</strong></td><td>→</td><td align="center"><strong>Command / configuration</strong></td><td>→</td><td align="center"><strong>Note</strong></td><td>→</td><td align="center"><strong>Expected result / next step</strong></td><td>→</td><td align="center"><strong>Relevant reference</strong></td></tr></table>

### 1. Description

State what the page covers and where it fits in Cloud107.

**Note:** Keep the description short. The diagram should carry most of the structure.

### 2. Diagram

Show the components, interfaces, dependencies, or execution flow.

**Note:** Label important parts with the actual language, runtime, framework, protocol, platform API, hardware/ISA, standard, or reference technology used by that part.

### 3. Command / configuration

Use the actual command or configuration needed for the documented operation.

```bash
# Example only
command
```

**Note:** Do not replace an actual command with a conceptual description when the operation is executable.

### 4. Note

Explain only what the command, diagram, or result needs the reader to understand.

**Note:** Use common language. Avoid marketing terminology and unnecessary theory.

### 5. Expected result / next step

State what the user should see or what to do next.

<table><tr><td align="center"><strong>Command</strong></td><td>→</td><td align="center"><strong>Expected result</strong></td><td>→</td><td align="center"><strong>Next guide</strong></td></tr></table>

### 6. Relevant reference

Link to the original documentation for the technology being used.

| Reference type | Example |
|---|---|
| Language | [TypeScript](https://www.typescriptlang.org/docs/) |
| Runtime | [Node.js](https://nodejs.org/docs/latest/api/) |
| Framework | [React](https://react.dev/reference/react) |
| Database | [PostgreSQL](https://www.postgresql.org/docs/) |
| Container | [Docker](https://docs.docker.com/) |
| Orchestration | [Kubernetes](https://kubernetes.io/docs/) |
| Standard/specification | [IETF RFCs](https://www.rfc-editor.org/) |

**Note:** Link the technology actually used by the page. Do not add references only to make the page look comprehensive.

## Documentation state

Documentation describes the system as it exists unless a section is explicitly marked otherwise.

| State | Meaning |
|---|---|
| Implemented | Exists in the current source |
| Planned | Intended future work |
| Experimental | Being tested and may change |
| Research | External material or prior art |
| Decision | Accepted architectural constraint |

**Note:** Keep planned work, experiments, research, and accepted decisions distinguishable from implemented behavior.

## Related

- [Cloud107 source README](../README.md)
- [Architecture](architecture/)
- [Development](development/)
- [Deployment](deployment/)
- [Research](research/)
- [Decisions](decisions/)
