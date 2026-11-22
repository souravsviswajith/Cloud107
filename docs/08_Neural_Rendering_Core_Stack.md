# Neural Rendering Core Stack: OpenDLSS-NR

**Status:** Architecture baseline  
**Scope:** Technology catalog and integration boundaries for the Neural Rendering Engine (NRE) and related 107 projects.  
**Upstream reference:** [OpenDLSS-NR](https://github.com/maanHimself/OpenDLSS-NR)  
**Browser reference:** `three-dlss-nr` browser/WebGPU port.

## 1. Language and API inventory

The core stack records the implementation languages and GPU APIs by role. This is a capability catalog, not a requirement that every project adopt every language.

| Language / technology | Classification | Intended responsibility |
|---|---|---|
| C++20 | Native implementation language | Performance-sensitive native integration, renderer components, resource lifetime, and CPU-side orchestration |
| GLSL | GPU shader language | Vulkan compute/shader stages where used by the native backend |
| Vulkan | Native graphics/compute API | Explicit GPU resource management and native execution |
| PTX | NVIDIA GPU virtual ISA / generated low-level target | NVIDIA-specific generated or optimized GPU code where the selected toolchain supports it; not a portable source-language requirement |
| Python 3 | Tooling language | Development scripts, experiments, test/data tooling, and kernel-generation workflows where present |
| TypeScript | Browser implementation language | Typed browser-side integration and the WebGPU port |
| JavaScript | Browser runtime language | Execution of compiled browser code and JavaScript-based integration/tooling |
| Three.js | Browser 3D library | Browser-side rendering integration where used by the WebGPU port |
| WebGPU | Browser graphics/compute API | Portable browser GPU access, subject to browser and device support |
| WGSL | WebGPU shader language | Use for WebGPU shader code when the browser backend implements shaders in WGSL; verify against the selected port's actual source before marking it as an upstream dependency |

C++20, Vulkan, GLSL, PTX-related output, Python tooling, and the TypeScript/WebGPU browser direction are tracked as the principal OpenDLSS-NR-related technologies. PTX is not a general-purpose application language, and WGSL is listed as a WebGPU shader-language capability rather than asserted as a verified dependency of every upstream implementation.

## 2. Build and developer tooling

These are permitted supporting tools, not claims about the upstream project's required toolchain:

- **CMake** — native build configuration where the project uses CMake.
- **PowerShell / POSIX shell** — Windows and Unix-like automation scripts where needed.
- **Git and CI** — source control, reproducible checks, and build validation.

Keep build-tool requirements scoped to the repository and target platform. Do not add a language runtime or SDK to every Cloud107 environment solely because the neural-rendering backend may use it.

## 3. 107 project ownership boundaries

| Project | Ownership |
|---|---|
| **Neural Rendering Engine (NRE)** | Neural-rendering orchestration, backend selection, inference integration, and renderer-facing capability adapters |
| **Animation Engine** | Animation/media workflow and rendering-runtime integration |
| **Cloud Emulation** | Execution-environment and hardware-profile modeling, provisioning compatibility, and runtime validation |
| **Cloud107** | Workload planning, scheduling, placement/allocation coordination, recovery, and artifact orchestration |
| **Compiler107** | Canonical IR, validation, transformation, and lowering; not the owner of neural-rendering execution |
| **Hype Visor** | Authenticated execution boundary and policy enforcement |
| **Browser107** | Browser runtime and web-facing integration, including capability detection for WebGPU |
| **MediaHub107** | Media and artifact workflows |

These are independent project boundaries. Sharing a technology catalog does not merge their repositories or create mandatory dependencies between them.

## 4. Backend contract

Expose neural rendering through a vendor-neutral capability interface. Backend implementations may include:

- Native Vulkan-based execution.
- Browser WebGPU execution when supported.
- A conventional renderer/upscaling fallback when a neural backend is unavailable or incompatible.

Backend selection must be based on validated runtime capabilities, including API support, device/driver compatibility, required model assets, precision/features, and resource limits. Do not assume that Vulkan support implies NVIDIA PTX support, or that WebGPU support implies identical output or performance to a native backend.

The scheduler and environment model may supply hardware and compatibility facts, but must not own renderer internals. NRE owns backend orchestration; Cloud Emulation validates the execution environment; Cloud107 coordinates workload allocation and lifecycle.

## 5. Licensing, assets, and operational constraints

- Treat OpenDLSS-NR as an independent reimplementation, not an official NVIDIA release.
- Verify each upstream repository's license and asset provenance before redistributing code, weights, generated binaries, or model files.
- Do not imply access to NVIDIA proprietary model weights or APIs unless separately and lawfully available.
- Prefer local execution and open tooling where supported. Cloud execution is optional and must not become a mandatory paid dependency.
- Record tested OS, GPU, driver, API, model version, precision, and fallback behavior in validation results.

## 6. Shared architecture model

This stack participates in the existing system pipeline:

`I_t → S_0 → S_1 → S_2 → S_3 → S_4 → O_t → I_{t+1}`

The technology catalog informs representation, compatibility validation, execution selection, and observation. It does not override the ownership boundaries above.
