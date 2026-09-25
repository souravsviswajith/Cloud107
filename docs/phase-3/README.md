# Phase 3 — Cloud107 OS

Phase 3 extends Cloud107 from a platform that can be installed and operated on existing operating systems into a **modular operating environment for existing hardware**.

The ISO/image is a distribution format. The architecture remains:

**Cloud107 Core → Provider / Capability Contract → Execution Environment**

<table>
<tr><th colspan="5">CLOUD107 OS</th></tr>
<tr><td>Hardware detection</td><td>→</td><td>Base system</td><td>→</td><td>Selected modules</td></tr>
<tr><td colspan="5">↓</td></tr>
<tr><td>MCU / SBC</td><td>ARM / ARM64</td><td>x86 / x86-64</td><td>Industrial PC</td><td>Server / data centre</td></tr>
<tr><td colspan="5">↓</td></tr>
<tr><td>Device runtime</td><td>Desktop</td><td>Server</td><td>Industrial control integration</td><td>Dashboard / cluster</td></tr>
</table>

## 1. Distribution targets

| Hardware | Architecture | Distribution |
|---|---|---|
| Workstation / PC | x86-64 | Cloud107 OS ISO |
| Server | x86-64 | Cloud107 OS ISO |
| ARM workstation / server | ARM64 | ARM64 image / installer |
| Raspberry Pi / SBC | ARM64 / ARM32 by model | Board-compatible image |
| Embedded computer | ARM / x86 and supported targets | Device image |
| Microcontroller | MCU-specific ISA | Cloud107 Device Runtime / firmware |
| Industrial PC | x86-64 / ARM64 | Cloud107 OS or hosted runtime |
| Data-centre node | x86-64 / ARM64 / mixed | Server or cluster installation |

A single identical binary is not required across these classes. The common boundary is the **capability and operation model**.

## 2. Installation model

The installation workflow is intentionally modular, similar in operation to configurable Linux installations:

**Detect → Select base → Select hardware modules → Select services → Configure → Install → Verify**

The user should be able to install only the components required by the device.

| Module group | Examples |
|---|---|
| Base | kernel/system components, boot support, core services |
| Hardware | CPU architecture, board support, drivers, device interfaces |
| Network | Ethernet, Wi-Fi, Bluetooth/BLE and required network tools |
| Storage | local disks, filesystems, storage services |
| Compute | CPU, GPU and accelerator support |
| Runtime | containers, language/runtime environments and required toolchains |
| Operations | c107, diagnostics, logs, updates |
| Interface | CLI, desktop workspace, terminal, Notepad, dashboard |
| Workloads | web, database, AI, media, development, industrial integration |
| Cluster | multi-node coordination and data-centre services |

**Note:** The module list is capability-driven. Cloud107 does not require every module on every device.

## 3. Hardware continuum

Cloud107 should use one resource model across very different devices while keeping their implementation boundaries explicit.

<table>
<tr><th>Class</th><th>Typical hardware</th><th>Primary interface</th><th>Cloud107 layer</th></tr>
<tr><td>Constrained</td><td>MCU, sensor controller</td><td>Device interface / firmware</td><td>Device Runtime</td></tr>
<tr><td>Embedded</td><td>Raspberry Pi, SBC</td><td>CLI / local UI / services</td><td>Cloud107 OS</td></tr>
<tr><td>Desktop</td><td>PC, workstation</td><td>Glass workspace / terminal</td><td>Cloud107 OS</td></tr>
<tr><td>Industrial</td><td>Industrial PC, machine gateway</td><td>Operations / device interface</td><td>OS + integration modules</td></tr>
<tr><td>Server</td><td>Physical or virtual server</td><td>CLI / services / dashboard</td><td>Cloud107 OS</td></tr>
<tr><td>Data centre</td><td>Multi-node infrastructure</td><td>Dashboard / c107 / APIs</td><td>Cluster environment</td></tr>
</table>

## 4. Industrial and automation systems

Industrial automation is a first-class compatibility target.

Examples include:

- CNC machines
- PLC-connected systems
- industrial PCs
- robotic cells
- production-line gateways
- sensors and instrumentation
- machine telemetry systems

Cloud107 should coordinate the surrounding computing and management layer:

<table>
<tr><th>Function</th><th>Cloud107 responsibility</th></tr>
<tr><td>Device discovery</td><td>Identify connected hardware and exposed capabilities</td></tr>
<tr><td>Telemetry</td><td>Collect and expose available operational data</td></tr>
<tr><td>Operations</td><td>Coordinate supported software operations</td></tr>
<tr><td>Diagnostics</td><td>Inspect node, runtime and workload state</td></tr>
<tr><td>Data</td><td>Forward or process machine data through supported workloads</td></tr>
<tr><td>Dashboard</td><td>Provide an appropriate operational interface</td></tr>
</table>

**Note:** Cloud107 does not automatically replace a CNC controller, PLC safety system, certified machine controller, or other safety-critical control system. Existing authoritative control and safety boundaries remain intact.

## 5. Node model

Every supported device becomes a node with discovered or declared capabilities.

**Hardware → ISA → OS / firmware → toolchain → runtime → capabilities → Cloud107 node → workload**

The node can expose properties such as:

- architecture
- CPU / cores
- memory
- storage
- network interfaces
- GPU / accelerator
- operating environment
- runtime availability
- connected devices
- supported operations
- workload constraints

Provider-specific or board-specific identifiers remain metadata rather than becoming universal Cloud107 properties.

## 6. User-selected installation

A workstation and a factory gateway should not receive the same installation.

| User target | Example selection |
|---|---|
| Minimal embedded system | Base + board support + network + device runtime |
| Raspberry Pi gateway | Base + ARM board support + network + containers + c107 |
| Developer workstation | Base + graphics + desktop + terminal + Notepad + development runtimes |
| Industrial gateway | Base + hardware + network + device integration + telemetry + c107 |
| Server | Base + storage + network + runtime + operations |
| Data-centre node | Server base + storage/network/compute modules + cluster services + dashboard |

## 7. Compatibility principle

Phase 3 should maximize hardware compatibility without turning the base system into a collection of unrelated dependencies.

**Support broadly → detect capabilities → install required modules → expose a common interface → execute according to available resources.**

This preserves the Cloud107 principle:

> **Small base, selectable capabilities, common operations.**

## 8. Phase 3 boundary

Phase 3 is the operating-system and device-runtime layer.

| Phase | Responsibility |
|---|---|
| Phase 1 | Cloud107 platform foundation, workspace, API and core operations |
| Phase 2 | Infrastructure/runtime expansion, integrations, packaging and release artifacts |
| **Phase 3** | **Cloud107 OS, modular ISO/images, device runtime and existing-hardware integration** |

Phase 3 does not require Cloud107 to manufacture hardware or replace every existing device controller. It provides the software environment and coordination layer around hardware that can expose a usable compute/control interface.
