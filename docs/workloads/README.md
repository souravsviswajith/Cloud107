# Workloads

Workload types, placement, lifecycle, resource requirements, execution, and observation.

## Workload architecture

<table>
<tr>
<td align="center"><strong>Cloud107</strong><br><sub>Cloud107 Core · API</sub></td>
<td>→</td>
<td align="center"><strong>Workload request</strong><br><sub>HTTP · RFC 9110</sub></td>
<td>→</td>
<td align="center"><strong>Capability matching</strong><br><sub>Cloud107 capability model</sub></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Node A</strong><br><sub>Hardware · ISA · OS · runtime</sub></td>
<td>↔</td>
<td align="center"><strong>Placement</strong><br><sub>Capability-based selection</sub></td>
<td>↔</td>
<td align="center"><strong>Node B</strong><br><sub>Hardware · ISA · OS · runtime</sub></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Execute</strong><br><sub>Runtime · workload</sub></td>
<td>→</td>
<td align="center"><strong>Resources</strong><br><sub>CPU · memory · storage · GPU</sub></td>
<td>↔</td>
<td align="center"><strong>State</strong><br><sub>Runtime state · lifecycle</sub></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr><td colspan="5" align="center"><strong>Observation</strong><br><sub>Health · logs · execution state</sub></td></tr>
</table>

**Note:** A workload is placed against the capabilities actually available on a node. Placement should not assume a resource or runtime that the node does not report.

## Workload lifecycle

<table>
<tr>
<td align="center"><strong>Request</strong></td><td>→</td>
<td align="center"><strong>Validate</strong></td><td>→</td>
<td align="center"><strong>Resolve capabilities</strong></td><td>→</td>
<td align="center"><strong>Select target</strong></td>
</tr>
<tr><td colspan="7" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Prepare environment</strong></td><td>→</td>
<td align="center"><strong>Start</strong></td><td>→</td>
<td align="center"><strong>Observe</strong></td><td>→</td>
<td align="center"><strong>Stop / complete</strong></td>
</tr>
</table>

The exact lifecycle for each workload type should be documented when that workload is implemented.

## Capability boundary

<table>
<tr><th>Layer</th><th>Requirement / capability</th></tr>
<tr><td>Hardware</td><td>CPU, memory, storage, GPU and other available resources</td></tr>
<tr><td>ISA</td><td>x86-64, ARM64 or another supported instruction-set architecture</td></tr>
<tr><td>OS</td><td>Execution platform available on the target node</td></tr>
<tr><td>Toolchain</td><td>Compiler, SDK and build tools required by the workload</td></tr>
<tr><td>Runtime</td><td>Runtime required to execute the workload</td></tr>
<tr><td>Dependencies</td><td>Libraries, services and other declared requirements</td></tr>
<tr><td colspan="2" align="center">↓</td></tr>
<tr><td colspan="2" align="center"><strong>Available node capabilities → Placement decision</strong></td></tr>
</table>

**Note:** The capability model connects workload requirements to the actual execution environment. Unsupported requirements should result in an explicit unavailable state rather than an invented capability.

## Execution interfaces

| Boundary | Current technology / model | Role |
|---|---|---|
| Workload control | Cloud107 API · HTTP | Request and lifecycle control |
| Node control | Express · TypeScript · Node.js | Application control boundary |
| Environment | Node.js · Docker · Compose | Current application runtime |
| State | PostgreSQL · Drizzle | Persistent application state |
| CLI control | c107 · TypeScript · Node.js | Command-line operations |

**Note:** These entries describe the current Cloud107 application/runtime boundaries. They do not establish that every workload type can already run on every node class.

## CLI operations

After installation, Cloud107 operations are exposed through the `c107` command.

```bash
c107 --help
c107 status
c107 nodes
c107 workloads
c107 operations
```

The CLI is an operational interface for both human users and AI agents. It provides a common command surface for querying Cloud107 state and initiating supported operations.

| Interface | Purpose |
|---|---|
| Human → c107 | Direct operation and diagnosis |
| AI agent → c107 | Structured inspection and controlled operations |
| c107 → Cloud107 | Authoritative API/control path |

**Note:** AI reasoning does not replace Cloud107's authoritative state. The agent interprets returned state and chooses subsequent commands; Cloud107 remains responsible for actual infrastructure state and execution.

## Validation

Before documenting a workload as supported, verify:

<table>
<tr>
<td align="center"><strong>Workload</strong></td><td>→</td>
<td align="center"><strong>Requirements known</strong></td><td>→</td>
<td align="center"><strong>Target node identified</strong></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Environment prepared</strong></td><td>→</td>
<td align="center"><strong>Execution verified</strong></td><td>→</td>
<td align="center"><strong>Runtime state observed</strong></td>
</tr>
</table>

**Note:** A workload definition, interface, or target package is not by itself proof of execution support.

## Scope

This page documents the workload model and current application boundaries. Specific workload implementations should add their own execution requirements, lifecycle, interfaces, and validation results.
