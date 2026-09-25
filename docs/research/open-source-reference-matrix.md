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


## 7. Infrastructure Platforms & Product Distribution

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

## 8. Reference-to-Implementation Mapping

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
| Infrastructure management | OpenStack, OpenNebula, Proxmox | How are compute, storage, networking, virtualization, and cluster resources represented and operated through common interfaces? |
| Container management | Portainer, Incus | How are containers, VMs, images, resources, and operator actions exposed through UI, API, and CLI boundaries? |
| Workload isolation | Firecracker | What isolation, lifecycle, resource, and host-security controls are required for lightweight workloads? |

## 9. Phase 2 Use

These references belong to the **Implementation & Integration** portion of Phase 2.

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

## 10. Authority Model for AI-Mediated Operations

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

## 11. Scope

This matrix is a research and implementation reference.

It does not claim that the listed projects are dependencies of Cloud107, that their implementations are copied, or that every referenced capability is already implemented.

Actual implementation status is determined by the Cloud107 source tree, tests, deployment artifacts, and release records.
