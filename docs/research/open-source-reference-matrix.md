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

## 5. Mesh Networking, Identity & Reproducible Systems

How distributed nodes can communicate and how system state can be reproduced and safely updated.

### Headscale

- **Project:** `juanfont/headscale`
- **Relevance:** Self-hosted control server implementing the Tailscale coordination model around WireGuard.
- **Cloud107 lesson:** Study node identity, encrypted mesh networking, coordination, and connectivity across networks.
- **Cloud107 boundary:** Network topology and authorization remain explicit Cloud107 infrastructure concerns.

### NixOS / Nix

- **Project:** `NixOS/nixpkgs`
- **Relevance:** Declarative operating-system and package-management ecosystem.
- **Cloud107 lesson:** Study reproducible environments, immutable-style generations, dependency resolution, rollback, and controlled system transitions.
- **Cloud107 relation:** These concepts are relevant to the design of Cloud107's source-first update and rollback model, but Cloud107 does not depend on NixOS.

## 6. Reference-to-Implementation Mapping

The prior-art references above should feed implementation decisions through explicit subsystem boundaries:

| Cloud107 area | Primary references | Implementation question |
|---|---|---|
| AI agent / `c107` | Open Interpreter, Aider | How are intent, commands, permissions, confirmation, execution, and verification separated? |
| Normal Mode | CasaOS, Umbrel | How much infrastructure detail can remain hidden while keeping operations accessible? |
| Developer Mode | Coder | How are development environments provisioned, accessed, persisted, and controlled? |
| Remote desktop | Sunshine, Kasm | How are capture, encoding, transport, session state, and browser presentation separated? |
| Workload execution | Nomad, K3s | How does Cloud107 select an execution mechanism according to workload and node capabilities? |
| Node networking | Headscale | How are nodes identified, connected, authorized, and observed across networks? |
| Updates / environments | NixOS / Nix | How are versions, dependencies, checkpoints, activation, rollback, and reproducibility controlled? |

## 7. Phase 2 Use

These references belong to the **Implementation & Integration** portion of Phase 2.

The intended progression is:

```text
Open-source reference
        ↓
Isolated subsystem requirement
        ↓
Cloud107 interface / contract
        ↓
Implementation
        ↓
Integration
        ↓
Validation
        ↓
Packaging
        ↓
Artifact verification
        ↓
Release
```

A reference project is not considered adopted merely because it appears in this document. Integration requires a separate implementation decision and validation result.

## 8. Authority Model for AI-Mediated Operations

The reference projects support a common architectural distinction:

```text
User objective
      ↓
AI agent
  ├─ understand
  ├─ decompose
  ├─ select capability
  ├─ select tool
  ├─ prepare
  ├─ validate prerequisites
  └─ request confirmation when required
      ↓
Cloud107 / c107
  ├─ authorize
  ├─ execute
  ├─ validate
  └─ report authoritative state
      ↓
AI agent
      ↓
User
```

The important invariant is:

```text
AI output ≠ infrastructure authority
Generated command ≠ authorized operation
```

Cloud107 remains responsible for execution, policy enforcement, validation, and authoritative infrastructure state.

## 9. Scope

This matrix is a research and implementation reference.

It does not claim that the listed projects are dependencies of Cloud107, that their implementations are copied, or that every referenced capability is already implemented.

Actual implementation status is determined by the Cloud107 source tree, tests, deployment artifacts, and release records.
