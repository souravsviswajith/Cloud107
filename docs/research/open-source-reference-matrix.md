# Open Source Reference Matrix & Prior Art

This matrix records open-source projects that provide useful reference implementations for isolated Cloud107 subsystems. The purpose is to identify concrete engineering patterns that can inform Cloud107 implementation and integration.

The projects below are references, not claims of direct integration. Each reference should be evaluated against the relevant Cloud107 interface, runtime boundary, security model, and platform requirements.

## 1. AI Orchestration & CLI

How to translate natural-language intent into secure, verifiable infrastructure commands.

### Open Interpreter

- **Project:** `KillianLucas/open-interpreter`
- **Relevance:** An AI agent can use local terminal capabilities to perform tasks from natural-language objectives.
- **Cloud107 lesson:** Study command execution boundaries, confirmation for destructive operations, local execution, and failure reporting.
- **Cloud107 boundary:** `c107` remains the execution and verification boundary. The AI agent interprets and decomposes the user's objective; it does not become infrastructure authority.

### Aider

- **Project:** `paul-gauthier/aider`
- **Relevance:** AI-assisted software development in the terminal.
- **Cloud107 lesson:** Study how an agent maintains repository context, Git state, file context, and incremental changes without exposing unnecessary implementation detail to the user.

## 2. Workspace UI & Progressive Disclosure

How to expose infrastructure through a simple workspace while retaining access to technical controls.

### CasaOS

- **Project:** `IceWhaleTech/CasaOS`
- **Relevance:** Simple open-source server workspace with application-oriented interaction.
- **Cloud107 lesson:** Useful reference for Normal Mode, application presentation, and hiding infrastructure complexity until it is needed.

### Umbrel

- **Project:** `getumbrel/umbrel`
- **Relevance:** Personal server operating environment with a graphical application-oriented interface.
- **Cloud107 lesson:** Useful reference for workspace organization, application presentation, and self-hosted administration UX.

### Coder

- **Project:** `coder/coder`
- **Relevance:** Open-source development environments running on user-controlled infrastructure.
- **Cloud107 lesson:** Useful reference for Developer Mode, environment provisioning, remote development, terminal access, and infrastructure-backed workspaces.

## 3. Remote Streaming & WebRTC

How to provide low-latency remote desktop and rendering access.

### Sunshine

- **Project:** `LizardByte/Sunshine`
- **Relevance:** Open-source low-latency game-streaming host.
- **Cloud107 lesson:** Study Windows graphics capture, hardware encoding, low-latency transport, and host-side streaming architecture.
- **Cloud107 boundary:** These techniques are references for the Windows node and streaming path; they do not imply that Sunshine is part of Cloud107.

### Kasm Workspaces

- **Project:** `kasmtech/workspaces-core`
- **Relevance:** Containerized desktop environments accessible through a browser.
- **Cloud107 lesson:** Study browser-based remote desktop delivery, session handling, and remote workspace presentation for the Workspace application.

## 4. Heterogeneous Compute & Workload Orchestration

How to execute workloads across different environments without assuming every workload is a container.

### HashiCorp Nomad

- **Project:** `hashicorp/nomad`
- **Relevance:** Workload orchestrator supporting multiple task drivers.
- **Cloud107 lesson:** Study the separation between workload scheduling and execution mechanisms. The task-driver concept is relevant to Cloud107's provider/capability model because different workloads may require containers, native processes, virtual machines, or other execution mechanisms.

### K3s

- **Project:** `k3s-io/k3s`
- **Relevance:** Lightweight Kubernetes distribution for constrained and edge environments.
- **Cloud107 lesson:** Study compact distribution, edge deployment, reduced operational footprint, and deployment to smaller nodes.

## 5. Device Connectivity & Existing Ecosystems

Cloud107 should use connectivity already present on user devices rather than introducing a separate mesh-networking layer.

### Local device connectivity

- **Wi-Fi / Ethernet:** Primary IP connectivity for Cloud107 workspaces, nodes, and workloads.
- **Bluetooth / BLE:** Nearby peripherals, sensors, controllers, and device interactions.
- **NFC:** Short-range discovery, provisioning, identity exchange, and device interactions where supported.

These are platform capabilities to be accessed through the appropriate operating-system APIs and device interfaces. Cloud107 does not need to replace the underlying networking stack.

### Home ecosystem integrations

Where useful, Cloud107 may expose supported capabilities through existing home ecosystems:

- Google Home
- Apple Home
- Amazon Alexa

These are optional integration adapters, not Cloud107 core dependencies. Cloud107 remains usable without any of them.

### Mesh networking scope

Custom mesh networking is **deferred for at least two years** and is not part of the current Phase 2 architecture.

The following are therefore out of current scope:

- Headscale/Tailscale control-plane integration
- custom mesh routing
- mesh-specific node discovery
- NAT-traversal control infrastructure
- mesh-specific network identity architecture

Existing authentication, authorization, node identity, and encrypted transport requirements remain where independently required by Cloud107.

## 6. Reproducible Systems & Updates

### NixOS / Nix

- **Project:** `NixOS/nixpkgs`
- **Relevance:** Declarative operating-system and package-management ecosystem.
- **Cloud107 lesson:** Study reproducible environments, immutable-style generations, dependency resolution, rollback, and controlled system transitions.
- **Cloud107 relation:** These concepts are relevant to the design of Cloud107's source-first update and rollback model, but Cloud107 does not depend on NixOS.


## 7. Observability & Configuration Management

### Prometheus

- **Project:** [prometheus/prometheus](https://github.com/prometheus/prometheus)
- **Relevance:** Open-source monitoring and time-series collection system.
- **Cloud107 lesson:** Study metric collection, exporters, scrape-based monitoring, labels, queries, alerting, and operational visibility.
- **Cloud107 boundary:** Prometheus is an observability integration/reference. Cloud107 should expose authoritative metrics where implemented; it should not fabricate metrics.

### Grafana

- **Project:** [grafana/grafana](https://github.com/grafana/grafana)
- **Relevance:** Open-source visualization and observability platform for dashboards, metrics, logs, traces, and operational data.
- **Cloud107 lesson:** Study operational dashboards, visualization of system state, drill-down from aggregate state to resource details, and integration with monitoring backends.
- **Cloud107 boundary:** Grafana is an optional observability interface/reference. The Cloud107 workspace remains the primary product interface.

### Ansible

- **Project:** [ansible/ansible](https://github.com/ansible/ansible)
- **Relevance:** Open-source automation and configuration-management system for provisioning and operating heterogeneous machines.
- **Cloud107 lesson:** Study inventory, idempotent configuration, playbooks, remote execution, role structure, and repeatable machine configuration.
- **Cloud107 boundary:** Ansible can be used as a supported automation tool for appropriate node/environment operations. It does not replace the Cloud107 node, workload, or operation model.

## 8. CI/CD & Telemetry Standards

### Jenkins

- **Project:** [jenkinsci/jenkins](https://github.com/jenkinsci/jenkins)
- **Relevance:** Open-source automation server for building, testing, delivering, and deploying software. citeturn0search5
- **Cloud107 lesson:** Study pipeline execution, build/test stages, artifact handling, deployment automation, and extensible automation through plugins.
- **Cloud107 boundary:** Jenkins is a supported CI/CD ecosystem reference; Cloud107 does not require Jenkins for normal operation.

### OpenTelemetry

- **Project:** [open-telemetry/opentelemetry-collector](https://github.com/open-telemetry/opentelemetry-collector)
- **Relevance:** Vendor-neutral open-source observability framework for generating, collecting, and exporting telemetry such as traces, metrics, and logs. citeturn0search0turn0search3
- **Cloud107 lesson:** Study common telemetry instrumentation, correlation of metrics/logs/traces, collector pipelines, and backend-neutral observability.
- **Cloud107 boundary:** OpenTelemetry is an observability instrumentation/collection reference. It is not itself Cloud107's telemetry backend.

### Grafana Loki

- **Project:** [grafana/loki](https://github.com/grafana/loki)
- **Relevance:** Open-source log aggregation system designed to collect and query infrastructure and application logs; it integrates with Grafana and uses a label-based model related to Prometheus. citeturn0search1turn0search8
- **Cloud107 lesson:** Study structured log streams, labels, log querying, live log access, and correlation of logs with metrics and traces.
- **Cloud107 boundary:** Loki is an optional logging backend/reference. Cloud107's own operation and diagnostic interfaces remain authoritative for Cloud107 state.

## 9. Data Processing & Database Compatibility

### Apache Spark

- **Project:** [apache/spark](https://github.com/apache/spark)
- **Relevance:** Open-source distributed data processing engine for large-scale analytics and batch/stream workloads.
- **Cloud107 lesson:** Study distributed job execution, resource-aware workloads, cluster execution, data locality, scheduling, and integration with existing storage/data systems.
- **Cloud107 boundary:** Spark is a supported workload/runtime reference for data-processing workloads. It does not replace Cloud107's workload and node abstraction.

### Oracle Database

- **Technology:** [Oracle Database](https://www.oracle.com/database/)
- **Relevance:** Enterprise relational database platform and an important compatibility target for applications that cannot use PostgreSQL as their database backend.
- **Cloud107 lesson:** Study relational database portability, SQL compatibility, connection management, migrations, transaction behavior, authentication, and deployment boundaries.
- **Cloud107 boundary:** Oracle Database is a compatibility target/integration option, not a replacement for the current PostgreSQL baseline.

### MongoDB

- **Project:** [mongodb/mongo](https://github.com/mongodb/mongo)
- **Relevance:** Document-oriented database platform for workloads whose data model is not naturally relational.
- **Cloud107 lesson:** Study document storage, collections, indexing, aggregation, connection management, and workload-specific database selection.
- **Cloud107 boundary:** MongoDB compatibility should exist at the application/workload integration boundary. It does not replace PostgreSQL for Cloud107's own relational application state.

**Compatibility rule:** Cloud107 should distinguish between its **internal system database** and **databases used by user applications/workloads**. PostgreSQL remains the current Cloud107 application-state baseline; Oracle Database and MongoDB are compatibility/integration targets for appropriate workloads.
 
## 10. Public Cloud & Virtual Machine Compatibility

Cloud107 should be able to operate on common public-cloud virtual machines without making any one cloud provider the Cloud107 architecture.

### Amazon Web Services

- **Provider:** [AWS](https://aws.amazon.com/)
- **Primary compute reference:** [Amazon EC2](https://docs.aws.amazon.com/ec2/)
- **Relevance:** EC2 provides configurable virtual-machine instances with different CPU, memory, storage, networking, and accelerator characteristics. Instance families include general-purpose, compute-optimized, memory-optimized, storage-optimized, accelerated-computing, and HPC categories.
- **Cloud107 lesson:** Study cloud-node registration, instance capability discovery, region/availability-zone differences, architecture selection, storage/network attachment, and lifecycle operations.
- **Cloud107 boundary:** AWS is a provider integration. EC2 is one possible Cloud107 node type, not the Cloud107 execution model.

### Google Cloud

- **Provider:** [Google Cloud](https://cloud.google.com/)
- **Primary compute reference:** [Compute Engine](https://cloud.google.com/compute)
- **Relevance:** Compute Engine provides VM machine families and types across general-purpose, compute-optimized, memory-optimized, storage-optimized, network-optimized, and accelerator-oriented workloads.
- **Cloud107 lesson:** Study machine-family discovery, CPU/architecture capabilities, VM lifecycle, zones, networking, storage, and custom machine configurations.
- **Cloud107 boundary:** Google Compute Engine is a provider integration and node type; Cloud107 keeps a provider-neutral node/resource model.

### Microsoft Azure

- **Provider:** [Microsoft Azure](https://azure.microsoft.com/)
- **Primary compute reference:** [Azure Virtual Machines](https://learn.microsoft.com/azure/virtual-machines/)
- **Relevance:** Azure VM sizes define CPU, memory, storage, networking, and accelerator characteristics, with families for general-purpose, compute-optimized, memory-optimized, storage-optimized, GPU, and high-performance workloads. Azure VM naming also encodes family, vCPU count, features, accelerator type, memory capacity, and version.
- **Cloud107 lesson:** Study VM-size capability discovery, versioned machine families, OS images, scaling, quotas, and provider-specific resource constraints.
- **Cloud107 boundary:** Azure is a provider integration and node type; Cloud107 should not expose Azure-specific assumptions as universal resource properties.

### EC2 instance compatibility

Cloud107 should treat an EC2 instance as a node with discovered capabilities, not as a special Cloud107 runtime.

<table>
<tr><th>Cloud provider</th><th>Provider compute object</th><th>Cloud107 representation</th></tr>
<tr><td>AWS</td><td>EC2 instance</td><td>Node</td></tr>
<tr><td>Google Cloud</td><td>Compute Engine VM</td><td>Node</td></tr>
<tr><td>Azure</td><td>Virtual Machine</td><td>Node</td></tr>
<tr><td>Local infrastructure</td><td>PC / server / SBC / device</td><td>Node</td></tr>
</table>

**Compatibility rule:** Cloud107 should detect or receive the node's architecture, CPU/vCPU, memory, storage, network, accelerator, OS, runtime, and available capabilities before scheduling a workload. Provider-specific identifiers remain provider metadata.

### Web-server / web-application workload

Cloud107 should also support ordinary web workloads on these nodes:

Web application → runtime → container/process → Cloud107 node → AWS/GCP/Azure/local infrastructure

This keeps a conventional web server or web application workload compatible with the same node/workload model used for other applications.

## 11. Infrastructure Administration & Provisioning

Additional references for the Cloud107 product model: a simple user-facing administration surface backed by direct system interfaces and declarative infrastructure tooling.

### Cockpit

- **Project:** [cockpit-project/cockpit](https://github.com/cockpit-project/cockpit)
- **Relevance:** Web-based server administration that works alongside the terminal and exposes system tasks such as containers, storage, networking, logs, hardware, and performance.
- **Cloud107 lesson:** Study the relationship between a graphical administration surface and the underlying operating-system commands/APIs. Cockpit explicitly supports switching between browser administration and terminal operation.
- **Cloud107 boundary:** Reference for administration UX and system integration; Cloud107 retains its own workspace, API, and c107 model.

### Apache CloudStack

- **Project:** [apache/cloudstack](https://github.com/apache/cloudstack)
- **Relevance:** Open-source IaaS platform with compute orchestration, networking, user/account management, API, resource accounting, web UI, and CLI access.
- **Cloud107 lesson:** Study the separation of API, UI, CLI, resource accounting, and infrastructure control in a mature open-source infrastructure product.
- **Cloud107 boundary:** CloudStack is prior art for infrastructure-product structure, not a Cloud107 dependency or service model.

### OpenTofu

- **Project:** [opentofu/opentofu](https://github.com/opentofu/opentofu)
- **Relevance:** Declarative infrastructure management with execution plans, resource graphs, state, reusable modules, and version-controlled configuration.
- **Cloud107 lesson:** Study explicit plans, dependency graphs, state tracking, and controlled infrastructure changes.
- **Cloud107 boundary:** OpenTofu is an infrastructure-management reference; Cloud107 does not require all infrastructure operations to be represented as OpenTofu configurations.

## 12. Infrastructure Platforms & Product Distribution

How established open-source infrastructure projects separate source, packaged releases, administration interfaces, and execution resources.

### OpenStack

- **Project:** [OpenStack](https://github.com/openstack/openstack)
- **Relevance:** Open-source cloud infrastructure composed of services that manage compute, storage, and networking through APIs and dashboards.
- **Cloud107 lesson:** Study API-first infrastructure management, service boundaries, dashboard/CLI access, resource abstractions, and operational documentation.
- **Cloud107 boundary:** Cloud107 is not an OpenStack distribution and does not reproduce the OpenStack service model wholesale.

### OpenNebula

- **Project:** [OpenNebula](https://github.com/OpenNebula/one)
- **Relevance:** Open-source cloud and edge management platform with web UI, CLI, REST API, Terraform integration, VM, Kubernetes, and GPU workload management.
- **Cloud107 lesson:** Study unified management of heterogeneous compute resources and multiple operator interfaces.
- **Cloud107 boundary:** Reference only; Cloud107 keeps its own node, workload, environment, and operation model.

### Proxmox Virtual Environment

- **Project:** [Proxmox VE](https://github.com/proxmox)
- **Relevance:** Open-source virtualization platform with a web interface for VMs, containers, storage, networking, and clustering.
- **Cloud107 lesson:** Study how complex infrastructure can be exposed through a single administration surface while retaining direct technical controls.
- **Cloud107 boundary:** Cloud107 may use virtualization technologies as execution infrastructure but does not depend on the Proxmox product.

### Portainer

- **Project:** [Portainer](https://github.com/portainer/portainer)
- **Relevance:** Web-based management of Docker, Kubernetes, Podman, and related container environments.
- **Cloud107 lesson:** Study progressive disclosure between a graphical management surface and underlying container operations, plus the relationship between UI and CLI workflows.
- **Cloud107 boundary:** Portainer is a reference for management UX and container operations, not a Cloud107 dependency.

### Incus

- **Project:** [Incus](https://github.com/lxc/incus)
- **Relevance:** Open-source system container and virtual-machine manager with a REST API, supporting single-node and clustered operation.
- **Cloud107 lesson:** Study a unified API for system containers and VMs, image handling, node/resource management, and cluster boundaries.
- **Cloud107 boundary:** Incus is a reference for workload/resource management; Cloud107 retains its own workload abstraction.

### Firecracker

- **Project:** [Firecracker](https://github.com/firecracker-microvm/firecracker)
- **Relevance:** Open-source microVM technology designed for secure, low-overhead isolated execution of container and function workloads.
- **Cloud107 lesson:** Study workload isolation, minimal VMM design, API-controlled VM lifecycle, resource configuration, and host security boundaries.
- **Cloud107 boundary:** Firecracker is an optional execution technology reference; it is not required for every Cloud107 workload.

## 13. Reference-to-Implementation Mapping

The prior-art references should feed implementation decisions through explicit subsystem boundaries:

| Cloud107 area | Primary references | Implementation question |
|---|---|---|
| AI agent / `c107` | Open Interpreter, Aider | How are intent, commands, permissions, confirmation, execution, and verification separated? |
| Normal Mode | CasaOS, Umbrel | How much infrastructure detail can remain hidden while keeping operations accessible? |
| Developer Mode | Coder | How are development environments provisioned, accessed, persisted, and controlled? |
| Remote desktop | Sunshine, Kasm | How are capture, encoding, transport, session state, and browser presentation separated? |
| Workload execution | Nomad, K3s | How does Cloud107 select an execution mechanism according to workload and node capabilities? |
| Device connectivity | OS/device APIs | How does Cloud107 discover and use available Wi-Fi, Bluetooth/BLE, NFC, and related device capabilities? |
| Home integration | Google Home, Apple Home, Amazon Alexa | Which Cloud107 capabilities can be exposed safely through each ecosystem without making them core dependencies? |
| Updates / environments | NixOS / Nix | How are versions, dependencies, checkpoints, activation, rollback, and reproducibility controlled? |
| Infrastructure administration | Cockpit | How can a graphical workspace expose real system state while remaining consistent with terminal/system APIs? |
| IaaS product structure | Apache CloudStack | How are UI, CLI, API, resource management, accounting, and infrastructure control separated? |
| Declarative provisioning | OpenTofu | How are desired state, execution plans, dependencies, state, and controlled changes represented? |
| Observability | Prometheus, Grafana | How are metrics collected, queried, visualized, and connected to operational state? |
| Configuration management | Ansible | How are heterogeneous nodes configured, provisioned, and maintained repeatably? |
| CI/CD | Jenkins | How are source changes built, tested, packaged, and delivered through repeatable automation? |
| Telemetry | OpenTelemetry | How are metrics, logs, and traces generated, collected, correlated, and exported? |
| Log aggregation | Grafana Loki | How are operational logs collected, labeled, queried, and correlated with metrics and traces? |
| Data processing | Apache Spark | How are distributed data-processing workloads scheduled, executed, and connected to Cloud107 resources? |
| Relational database compatibility | Oracle Database | How are applications requiring Oracle supported without changing Cloud107's PostgreSQL baseline? |
| Document database compatibility | MongoDB | How are document-oriented workloads connected while keeping Cloud107's internal relational state separate? |
| Public cloud compatibility | AWS / EC2 | How are AWS virtual machines discovered, registered, operated, and matched to workload requirements? |
| Public cloud compatibility | Google Cloud / Compute Engine | How are Google Cloud VMs represented as Cloud107 nodes with provider-neutral capabilities? |
| Public cloud compatibility | Azure Virtual Machines | How are Azure VM sizes, versions, and capabilities represented without coupling Cloud107 to Azure-specific assumptions? |
| Web workloads | Web servers / web applications | How are conventional web workloads deployed consistently across local and public-cloud nodes? |
| Infrastructure management | OpenStack, OpenNebula, Proxmox | How are compute, storage, networking, virtualization, and cluster resources represented and operated through common interfaces? |
| Container management | Portainer, Incus | How are containers, VMs, images, resources, and operator actions exposed through UI, API, and CLI boundaries? |
| Workload isolation | Firecracker | What isolation, lifecycle, resource, and host-security controls are required for lightweight workloads? |

## 14. Implementation & Integration

These references belong to the **Implementation & Integration** scope.

The intended progression is:

<table>
<tr>
<th>1. Reference</th>
<th>→</th>
<th>2. Requirement</th>
<th>→</th>
<th>3. Interface / contract</th>
<th>→</th>
<th>4. Implementation</th>
<th>→</th>
<th>5. Integration</th>
<th>→</th>
<th>6. Validation</th>
<th>→</th>
<th>7. Packaging</th>
<th>→</th>
<th>8. Artifact verification</th>
<th>→</th>
<th>9. Release</th>
</tr>
<tr>
<td>Open-source reference</td>
<td>→</td>
<td>Isolated subsystem requirement</td>
<td>→</td>
<td>Cloud107 interface / contract</td>
<td>→</td>
<td>Implementation</td>
<td>→</td>
<td>Integration</td>
<td>→</td>
<td>Validation</td>
<td>→</td>
<td>Packaging</td>
<td>→</td>
<td>Artifact verification</td>
<td>→</td>
<td>Release</td>
</tr>
</table>

A reference project is not considered adopted merely because it appears in this document. Integration requires a separate implementation decision and validation result.

## 15. Authority Model for AI-Mediated Operations

The reference projects support a common architectural distinction:

<table>
<tr>
<th>User</th>
<th>→</th>
<th>AI agent</th>
<th>→</th>
<th>Cloud107 / <code>c107</code></th>
<th>→</th>
<th>AI agent</th>
<th>→</th>
<th>User</th>
</tr>
<tr>
<td>Objective</td>
<td>→</td>
<td>
understand<br>
decompose<br>
select capability<br>
select tool<br>
prepare<br>
validate prerequisites<br>
request confirmation when required
</td>
<td>→</td>
<td>
authorize<br>
execute<br>
validate<br>
report authoritative state
</td>
<td>→</td>
<td>Interpret result</td>
<td>→</td>
<td>Receive result</td>
</tr>
</table>

The important invariant is:

<table>
<tr>
<th>AI output</th>
<th>≠</th>
<th>infrastructure authority</th>
</tr>
<tr>
<th>Generated command</th>
<th>≠</th>
<th>authorized operation</th>
</tr>
</table>

Cloud107 remains responsible for execution, policy enforcement, validation, and authoritative infrastructure state.

## 16. Scope

This matrix is a research and implementation reference.

It does not claim that the listed projects are dependencies of Cloud107, that their implementations are copied, or that every referenced capability is already implemented.

Actual implementation status is determined by the Cloud107 source tree, tests, deployment artifacts, and release records.
