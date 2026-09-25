# Cloud107 OS and Device Runtime

Modular Cloud107 operating environment for existing hardware.

<table>
<tr><th colspan="5">CLOUD107 OS</th></tr>
<tr><td>Hardware detection</td><td>→</td><td>Base system</td><td>→</td><td>Selected modules</td></tr>
<tr><td>MCU / SBC</td><td>ARM / ARM64</td><td>x86 / x86-64</td><td>Industrial PC</td><td>Server / data centre</td></tr>
<tr><td>Device runtime</td><td>Desktop</td><td>Server</td><td>Industrial integration</td><td>Dashboard / cluster</td></tr>
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

## 2. Installation

**Detect → Select base → Select hardware modules → Select services → Configure → Install → Verify**

| Module group | Examples |
|---|---|
| Base | System components, boot support, core services |
| Hardware | Architecture, board support, drivers, device interfaces |
| Network | Ethernet, Wi-Fi, Bluetooth/BLE |
| Storage | Disks, filesystems, storage services |
| Compute | CPU, GPU, accelerators |
| Runtime | Containers, language runtimes, toolchains |
| Operations | c107, diagnostics, logs, updates |
| Interface | CLI, desktop workspace, terminal, Notepad, dashboard |
| Workloads | Web, database, AI, media, development, industrial integration |
| Cluster | Multi-node and data-centre services |

## 3. Hardware model

| Class | Hardware | Interface | Cloud107 layer |
|---|---|---|---|
| Constrained | MCU, sensor controller | Device interface / firmware | Device Runtime |
| Embedded | Raspberry Pi, SBC | CLI / local UI / services | Cloud107 OS |
| Desktop | PC, workstation | Desktop / terminal | Cloud107 OS |
| Industrial | Industrial PC, machine gateway | Operations / device interface | OS + integration modules |
| Server | Physical or virtual server | CLI / services / dashboard | Cloud107 OS |
| Data centre | Multi-node infrastructure | Dashboard / c107 / APIs | Cluster environment |

## 4. Industrial interfaces

Supported integration targets include:

- CNC machines
- PLC-connected systems
- industrial PCs
- robotic cells
- production-line gateways
- sensors and instrumentation
- machine telemetry systems

| Function | Cloud107 interface |
|---|---|
| Device discovery | Hardware and capability discovery |
| Telemetry | Operational data collection |
| Operations | Supported device/software operations |
| Diagnostics | Node, runtime and workload inspection |
| Data | Data forwarding and processing workloads |
| Dashboard | Operational visualization and control interfaces |

Safety-critical machine controllers and certified control systems remain separate control boundaries.

## 5. Node model

**Hardware → ISA → OS / firmware → toolchain → runtime → capabilities → Cloud107 node → workload**

Node capability data may include:

- Architecture
- CPU / cores
- Memory
- Storage
- Network interfaces
- GPU / accelerator
- Operating environment
- Runtime availability
- Connected devices
- Supported operations
- Workload constraints

Provider- and board-specific identifiers remain metadata.

## 6. Installation profiles

| Target | Example modules |
|---|---|
| Embedded | Base + board support + network + device runtime |
| Raspberry Pi | Base + ARM support + network + containers + c107 |
| Developer workstation | Base + graphics + desktop + terminal + Notepad + development runtimes |
| Industrial gateway | Base + hardware + network + device integration + telemetry + c107 |
| Server | Base + storage + network + runtime + operations |
| Data-centre node | Server + storage/network/compute + cluster + dashboard |

## 7. Compatibility

**Hardware detection → capability discovery → module selection → configuration → installation → verification → workload execution**

The base installation contains only required components. Hardware-specific, runtime-specific, and workload-specific functionality is installed as modules.

