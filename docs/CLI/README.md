# CLI

`c107` commands, configuration, output, authentication, and update operations.

The CLI is the terminal control surface for Cloud107.

## Guide

### 1. CLI architecture

<table>
<tr>
<td colspan="3" align="center"><strong>c107 CLI</strong><br><sub>TypeScript · Node.js · Terminal / process · POSIX where applicable</sub></td>
</tr>
<tr>
<td align="center"><strong>COMMANDS</strong><br><sub>Command parsing</sub></td>
<td align="center"><strong>CONFIG</strong><br><sub>Environment / local state</sub></td>
<td align="center"><strong>UPDATE</strong><br><sub>Git · Ed25519 · SHA-256 · RFC 8032 · FIPS 180-4</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 API</strong><br><sub>Express · TypeScript · HTTP/JSON · RFC 9110</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 RUNTIME / OPERATIONS</strong><br><sub>Authoritative application and runtime state</sub></td>
</tr>
</table>

**Note:** `c107` is the command-line control surface. It operates against the Cloud107 application boundary and contains the update operation implemented under `src/cli/update/`.

**Reference:** [Node.js CLI](https://nodejs.org/api/cli.html) · [Architecture](../architecture/)

### 2. CLI command model — locked

The command model is organized around Cloud107 resources and operational state.

| Group | Commands |
|---|---|
| Global | `c107 --help` · `c107 --version` |
| System | `c107 info` · `c107 status` · `c107 health` · `c107 stats` |
| Evidence | `c107 logs` · `c107 events` · `c107 diagnostics` |
| Updates | `c107 update` |
| Nodes | `c107 node ls` · `c107 node inspect <node>` · `c107 node logs <node>` |
| Workloads | `c107 workload ls` · `c107 workload inspect <workload>` · `c107 workload logs <workload>` |
| Applications | `c107 application ls` · `c107 application inspect <application>` · `c107 application logs <application>` |
| Environments | `c107 environment ls` · `c107 environment inspect <environment>` |
| Operations | `c107 operation ls` · `c107 operation inspect <operation>` |

**Lock rule:** `c107` is the stable command namespace. New operations should extend the resource/operation model rather than introduce unrelated command naming.

**Note:** A locked command model does not mean every command is implemented. Implementation state is recorded separately below.

### 3. Start the CLI

<table><tr><td align="center"><strong>Terminal</strong></td><td>→</td><td align="center"><strong>c107</strong></td><td>→</td><td align="center"><strong>Cloud107 CLI process</strong></td></tr></table>

**Source checkout**

```bash
npm run c107
```

**Direct command after package installation/linking**

```bash
c107 --help
c107 --version
```

The package exposes the command through its `bin` entry and the repository launcher at `bin/c107`.

**Note:** Run the source-checkout form when working directly from the repository. Use the `c107` form when the package is installed or linked as a command.

**Expected result:** The configured CLI starts and displays its available command behavior.

**Reference:** [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) · [Node.js CLI](https://nodejs.org/api/cli.html)

### 4. Current implementation surface

| Command | State |
|---|---|
| `c107 --help` / `help` | Implemented |
| `c107 --version` / `version` | Implemented |
| `c107 status` | Implemented |
| `c107 health` | Implemented |
| `c107 checkpoints` | Implemented |
| `c107 rollback` | Implemented |
| `c107 update` | Implemented |
| `c107 info` | Planned |
| `c107 stats` | Planned |
| `c107 logs` | Planned |
| `c107 events` | Planned |
| `c107 diagnostics` | Planned |
| Resource commands | Planned / incremental |

**Note:** This table is intentionally separate from the locked command model. It prevents planned commands from being presented as implemented functionality.

### 5. Run the update operation

<table><tr><td align="center"><strong>c107</strong></td><td>→</td><td align="center"><strong>Update pipeline</strong><br><sub>provenance · signature · hash · compatibility<br>checkpoint · validation · health · activation · rollback</sub></td></tr></table>

**Commands**

```bash
npm run c107:update

# Equivalent command after installation/linking
c107 update
```

**Note:** The update operation uses the source-first verification pipeline documented in `docs/updates/`.

**Expected result:** The configured verification and update stages execute and a failed required check stops successful activation.

**Reference:** [Updates](../updates/) · [The Update Framework](https://theupdateframework.io/)

### 6. CLI boundary

<table><tr><td align="center"><strong>Terminal</strong></td><td>→</td><td align="center"><strong>c107 process</strong><br><sub>command parsing · configuration · operation · update pipeline</sub></td><td>→</td><td align="center"><strong>Cloud107 API / runtime</strong></td></tr></table>

**Note:** The CLI should report operation state returned by Cloud107 rather than inventing runtime, node, resource, billing, or health information.

**Reference:** [APIs](../APIs/) · [Operations](../operations/)

### 7. Interface map

| Part | Current technology | Interface |
|---|---|---|
| CLI | TypeScript / Node.js | Terminal / process |
| API control | Express / TypeScript | HTTP / JSON |
| Update source | Git / repository tooling | Source revision / metadata |
| Local launcher | POSIX shell | Process execution |
| Configuration/data | JSON / environment configuration where applicable | Local/application boundary |

**Note:** Protocols, standards, and platform APIs should be listed only when the implementation explicitly depends on them.

**Reference:** [TypeScript](https://www.typescriptlang.org/docs/) · [Node.js](https://nodejs.org/docs/latest/api/) · [Git](https://git-scm.com/doc)

### 8. Diagnosis flow

<table>
<tr><th>Step</th><th>Command</th><th>Purpose</th></tr>
<tr><td>1</td><td><code>c107 status</code></td><td>Check overall Cloud107 state.</td></tr>
<tr><td>2</td><td><code>c107 health</code></td><td>Check API/runtime health.</td></tr>
<tr><td>3</td><td><code>c107 node ls</code></td><td>Find connected nodes.</td></tr>
<tr><td>4</td><td><code>c107 node inspect &lt;node&gt;</code></td><td>Inspect reported node state and capabilities.</td></tr>
<tr><td>5</td><td><code>c107 workload ls</code></td><td>Find workloads and their state.</td></tr>
<tr><td>6</td><td><code>c107 workload inspect &lt;workload&gt;</code></td><td>Inspect workload state and placement.</td></tr>
<tr><td>7</td><td><code>c107 operation ls</code></td><td>Find current and recent operations.</td></tr>
<tr><td>8</td><td><code>c107 operation inspect &lt;operation&gt;</code></td><td>Inspect an operation and its reported state.</td></tr>
<tr><td>9</td><td><code>c107 logs</code></td><td>Review recorded evidence.</td></tr>
<tr><td>10</td><td><code>c107 diagnostics</code></td><td>Run the combined read-only diagnostic path.</td></tr>
</table>

**Note:** The diagnosis flow is designed so the same command surface can be used by a human operator or an AI agent. The AI can interpret results; Cloud107 remains the authoritative execution and state layer.

### 9. Validate CLI changes

<table><tr><td align="center"><strong>CLI change</strong></td><td>→</td><td>lint · test · build</td><td>→</td><td align="center"><strong>Validated CLI</strong></td></tr></table>

**Commands**

```bash
npm run lint
npm test
npm run build
```

**Note:** Validate the CLI and API boundary together when a command changes API interaction.

**Expected result:** The configured checks complete successfully.

**Reference:** [Vitest](https://vitest.dev/) · [ESLint](https://eslint.org/docs/latest/)

### 10. Local Flutter reference

The Flutter project remains a reference for application organization only. It is not a Cloud107 CLI dependency.

**Reference:** [BusPass Management System using Flutter Template](https://github.com/souravsviswajith/BusPass-Management-System-using-flutter-Template) · [Flutter documentation](https://docs.flutter.dev/)

---
