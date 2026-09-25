# Research References

This page records external projects, specifications, documentation, datasets/data sources, and research papers that are relevant to Cloud107.

These references are inputs to engineering decisions. They are not evidence that Cloud107 implements the referenced system.

## Open-source projects and specifications

### Development environments

- **Development Containers** — open specification for development-specific container content and settings.
  - https://containers.dev/
  - Relevant to prepared, portable development environments.

- **Nix** — declarative and reproducible package/system configuration.
  - https://nixos.org/
  - Relevant to reproducible environments and dependency isolation.

- **Bazel** — build system and toolchain model.
  - https://bazel.build/
  - Relevant to hermetic builds, toolchains, and reproducible build inputs.

- **Docker / OCI ecosystem** — container images, runtimes, and distribution.
  - https://docs.docker.com/
  - https://opencontainers.org/
  - Relevant to packaged workloads and portable execution.

### Toolchains and compilation

- **LLVM** — modular compiler and toolchain infrastructure.
  - https://llvm.org/docs/
  - Relevant to source → IR → object/executable toolchain abstraction.

- **GCC / Binutils** — compiler, assembler, linker, and binary-toolchain ecosystem.
  - https://gcc.gnu.org/
  - https://sourceware.org/binutils/
  - Relevant to native and cross-compilation environments.

- **Buildroot** — embedded Linux build system for toolchains, root filesystems, kernels, and bootloaders.
  - https://buildroot.org/docs.html
  - Relevant to low-level target preparation.

- **Yocto Project** — embedded Linux build and SDK infrastructure.
  - https://docs.yoctoproject.org/
  - Relevant to target-specific environments and cross-toolchains.

### Workload and resource orchestration

- **Nomad** — workload scheduler/orchestrator supporting containers, binaries, batch jobs, virtual machines, and heterogeneous resources.
  - https://developer.hashicorp.com/nomad/docs
  - Relevant to Nodes, Workloads, resource placement, lifecycle, and reconciliation.

- **Kubernetes** — container orchestration and cluster API model.
  - https://kubernetes.io/docs/
  - Relevant to workload, node, resource, and declarative control-plane concepts.

- **Slurm** — HPC workload manager and scheduler.
  - https://slurm.schedmd.com/
  - Relevant to high-resource and distributed workload allocation.

### Secure updates and provenance

- **The Update Framework (TUF)** — framework/specification for securing software update systems.
  - https://theupdateframework.io/docs/
  - Relevant to Cloud107's update trust model, metadata, signatures, key separation, and rollback threat model.

- **Uptane** — secure software update framework derived from TUF concepts for automotive systems.
  - https://uptane.org/
  - Relevant to distributed update trust and multiple update targets.

- **GitHub Artifact Attestations** — signed build provenance and integrity claims.
  - https://docs.github.com/en/actions/concepts/security/artifact-attestations
  - Relevant to release provenance and future CI/release verification.

### AI agents and computer interfaces

- **SWE-agent / mini-SWE-agent** — open-source agentic software-engineering systems using an Agent-Computer Interface (ACI).
  - https://github.com/SWE-agent/SWE-agent
  - Relevant to the separation between model reasoning, tool interfaces, execution environments, and observable results.

- **OpenHands** — open-source AI software-development agent platform.
  - https://github.com/All-Hands-AI/OpenHands
  - Relevant to agent/runtime separation and controlled execution.

### Game and rendering workloads

- **Unreal Engine** — source-accessible C++ engine and toolchain workflow through GitHub for eligible users.
  - https://dev.epicgames.com/documentation/unreal-engine/
  - Relevant to Cloud107's prepared development environments, native toolchains, large builds, GPU workloads, and Game/DWY.

## Data and source systems

### Git and GitHub

Git repositories provide version history, source revisions, branches, tags, commits, and release references.

GitHub adds repository hosting, Actions, releases, artifacts, and provenance mechanisms.

- https://git-scm.com/doc
- https://docs.github.com/

For Cloud107, Git/GitHub is treated as source and provenance infrastructure rather than merely a file-hosting service.

### Software supply-chain data

Relevant data includes:

- Git commit SHA
- release/tag
- source origin
- dependency lockfiles
- artifact SHA-256
- SBOM
- build provenance/attestation
- signing metadata
- compatibility metadata

These data points can be combined into a verifiable release record.

### Runtime/resource data

Cloud107 should distinguish authoritative runtime data from descriptive documentation.

Potential runtime sources include:

- node identity
- CPU architecture
- operating system
- available CPU/GPU/accelerator resources
- memory
- storage
- network capability
- installed/prepared toolchains
- workload state
- process state
- health state
- execution logs
- provider-reported billing data

The UI should consume these sources rather than synthesize operational state.

## Scientific and CSE research

### Reproducible environments and containers

**Moreau, Wiebels & Boettiger (2023), “Containers for computational reproducibility,” Nature Reviews Methods Primers.**

This review describes how containers address software-environment complexity and compatibility problems in computational research and discusses their use across heterogeneous systems and HPC environments.

https://www.nature.com/articles/s43586-023-00236-9

**Moreau & Wiebels (2026), “Nine quick tips for software containerization,” PLOS Computational Biology.**

The paper emphasizes that containers improve portability and reproducibility but do not automatically guarantee reproducibility; dependency, data, versioning, security, and lifecycle decisions remain important.

https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1014197

**Samuel et al. (2026), “Containing the Reproducibility Gap: Automated Repository-Level Containerization for Scholarly Jupyter Notebooks.”**

The work studies automated reconstruction of execution environments from repositories and reports both the benefits and remaining limitations of containerization for reproducibility.

https://arxiv.org/abs/2604.01072

**FAIRly big (2022), “A framework for computationally reproducible processing of large-scale data,” Scientific Data.**

The work combines containerization and machine-actionable provenance for reproducible large-scale data processing.

https://www.nature.com/articles/s41597-022-01163-2

### Agentic software engineering

**Yang et al. (2024), “SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering,” NeurIPS 2024.**

The paper studies an Agent-Computer Interface in which an LM interacts with software-engineering tools through a constrained interface. The research is relevant to Cloud107's model of separating AI interpretation from deterministic execution.

https://arxiv.org/abs/2405.15793

Important distinction: SWE-agent demonstrates an agent/tool interaction architecture; it does not establish Cloud107's architecture or validate Cloud107's AI-control model.

### Quantum / heterogeneous computing

**Bertels et al. (2019), “Quantum Computer Architecture: Towards Full-Stack Quantum Accelerators.”**

The paper describes a full stack from application and algorithm layers through quantum compilation and assembly to device-specific execution.

https://arxiv.org/abs/1903.09575

This is relevant to the Cloud107 abstraction:

```text
Workload
  ↓
Programming model
  ↓
Compiler / toolchain
  ↓
Target representation
  ↓
Hardware-specific execution
```

**Cross et al. (2022), “OpenQASM 3: A broader and deeper quantum assembly language.”**

The paper discusses multiple levels of specificity and the distinction between real-time and near-time classical/quantum interaction.

https://arxiv.org/abs/2104.14722

This is relevant to separating high-level workload intent from target-specific execution details.

**Shan, Zhu & Zhao (2022), “A high-performance compilation strategy for multiplexing quantum control architecture,” Scientific Reports.**

The work demonstrates that compilation and scheduling must account for target hardware constraints, dependencies, control channels, and execution timing.

https://www.nature.com/articles/s41598-022-11154-3

**Raj et al. (2026), “Quantum Integrated High-Performance Computing: Foundations, Architectural Elements and Future Directions.”**

The paper proposes treating CPUs, GPUs, FPGAs, and QPUs as heterogeneous resources under a unified resource-management and workflow model.

https://arxiv.org/abs/2604.19814

This is relevant to Cloud107's heterogeneous resource abstraction, but it is a research framework rather than an established implementation standard.

## How these references are used

The references are grouped by the engineering problem they help investigate:

| Cloud107 problem | Relevant references |
|---|---|
| Prepared environments | Dev Containers, Nix, Bazel, Docker/OCI |
| Toolchain abstraction | LLVM, GCC/Binutils, Buildroot, Yocto |
| Nodes and workloads | Nomad, Kubernetes, Slurm |
| Updates and release trust | TUF, Uptane, GitHub Attestations |
| AI control surface | SWE-agent, OpenHands |
| Git/source provenance | Git, GitHub |
| Game/rendering environments | Unreal Engine |
| Reproducibility | Containers research, FAIRly big |
| Heterogeneous compute | HPC/quantum research |
| Quantum execution abstraction | Full-Stack Quantum Accelerators, OpenQASM 3 |

## Research rule

External projects and papers are reference material.

Cloud107 should adopt a concept only after checking:

1. The problem it solves.
2. The assumptions it makes.
3. Its applicable scope.
4. Its implementation cost.
5. Its security implications.
6. Its compatibility with Cloud107's existing contracts.
7. Whether the concept is a standard, an implementation, a research result, or an experimental proposal.

No external project should be copied into Cloud107 merely because it is popular.


## Research documents

- [Compiler and Toolchain References](./compilers.md) — open-source compilers, assemblers, linkers, IR/code-generation systems, hardware compilation, and quantum compilation.
- [Infrastructure, Graphics, and Computer Vision](./infrastructure-graphics-cv.md) — emulation, virtualization infrastructure, graphics, rendering, and computer-vision projects.
- [Hypervisor References](./hypervisors.md) — KVM, Xen, bhyve, Hyper-V, VMMs, microVMs, VirtIO, and virtual firmware.
- [Cloud Provider References](./cloud-providers.md) — Google Cloud, AWS, and Azure infrastructure documentation and provider-adapter concepts.
- [LLM Project and API References](./llm.md) — open-source LLM runtimes/inference projects and OpenAI, Anthropic, and Google Gemini documentation.
- [CLI and AI Agent References](./cli-and-ai-agents.md) — infrastructure CLIs, Unix terminal utilities, and the division of work between user intent, AI orchestration, and authoritative execution.

