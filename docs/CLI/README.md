# CLI

`c107` commands, configuration, output, authentication, and update operations.

The CLI is the terminal control surface for Cloud107.

## Guide

### 1. CLI architecture

<table>
<tr>
<td colspan="3" align="center"><strong>c107 CLI</strong><br><sub>(TypeScript · Node.js · Terminal / process · POSIX where applicable)</sub></td>
</tr>
<tr>
<td align="center"><strong>COMMANDS</strong><br><sub>(Command parsing)</sub></td>
<td align="center"><strong>CONFIG</strong><br><sub>(Environment / local state)</sub></td>
<td align="center"><strong>UPDATE</strong><br><sub>(Git · Ed25519 · SHA-256 · RFC 8032 · FIPS 180-4)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 API</strong><br><sub>(Express · TypeScript · HTTP/JSON · RFC 9110)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 RUNTIME / OPERATIONS</strong><br><sub>(Authoritative application and runtime state)</sub></td>
</tr>
</table>

**Note:** `c107` is the command-line control surface. It operates against the Cloud107 application boundary and contains the update operation implemented under `src/cli/update/`.

**Reference:** [Node.js CLI](https://nodejs.org/api/cli.html) · [Architecture](../architecture/)

### 2. Start the CLI

<table><tr><td align="center"><strong>Terminal</strong></td><td>→</td><td align="center"><strong>npm run c107</strong></td><td>→</td><td align="center"><strong>c107 process</strong></td></tr></table>

**Command**

```bash
npm run c107
```

**Note:** Run the CLI from the Cloud107 source checkout so it uses the repository's configured runtime and dependencies.

**Expected result:** The configured `c107` CLI starts and displays its available command behavior.

**Reference:** [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) · [Node.js CLI](https://nodejs.org/api/cli.html)

### 3. Inspect CLI commands

<table><tr><td align="center"><strong>c107</strong></td><td>→</td><td><strong>--help</strong><br><strong>--version</strong></td></tr></table>

**Commands**

```bash
npm run c107 -- --help
npm run c107 -- --version
```

**Note:** These commands expose the CLI help and version information through the repository script.

**Expected result:** The CLI prints the configured help or version output.

**Reference:** [Node.js command-line options](https://nodejs.org/api/cli.html)

### 4. Run the update operation

<table><tr><td align="center"><strong>c107</strong></td><td>→</td><td align="center"><strong>Update pipeline</strong><br><sub>provenance · signature · hash · compatibility<br>checkpoint · validation · health · activation · rollback</sub></td></tr></table>

**Command**

```bash
npm run c107:update
```

**Note:** The update operation uses the source-first verification pipeline documented in `docs/updates/`.

**Expected result:** The configured verification and update stages execute and a failed required check stops successful activation.

**Reference:** [Updates](../updates/) · [The Update Framework](https://theupdateframework.io/)

### 5. CLI boundary

<table><tr><td align="center"><strong>Terminal</strong></td><td>→</td><td align="center"><strong>c107 process</strong><br><sub>command parsing · configuration · operation · update pipeline</sub></td><td>→</td><td align="center"><strong>Cloud107 API / runtime</strong></td></tr></table>

**Note:** The CLI should report operation state returned by Cloud107 rather than inventing runtime, node, resource, billing, or health information.

**Reference:** [APIs](../APIs/) · [Operations](../operations/)

### 6. Interface map

| Part | Current technology | Interface |
|---|---|---|
| CLI | TypeScript / Node.js | Terminal / process |
| API control | Express / TypeScript | HTTP / JSON |
| Update source | Git / repository tooling | Source revision / metadata |
| Local scripts | Shell / npm | Process execution |

<table><tr><td align="center"><strong>Terminal</strong></td><td>→</td><td align="center"><strong>TypeScript / Node.js</strong></td><td>→</td><td>process / terminal<br>HTTP / JSON<br>Git / update metadata</td></tr></table>

**Note:** Protocols, standards, and platform APIs should be listed only when the implementation explicitly depends on them.

**Reference:** [TypeScript](https://www.typescriptlang.org/docs/) · [Node.js](https://nodejs.org/docs/latest/api/) · [Git](https://git-scm.com/doc)

### 7. Validate CLI changes

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

## Docker-style command model

The installed CLI is intended to use `c107` directly. Commands are grouped by Cloud107 resource, similar to the command hierarchy used by Docker.

### Top-level commands

| Command | Purpose |
|---|---|
| `c107 --help` | Display CLI help |
| `c107 --version` | Display CLI version |
| `c107 info` | Show installation and runtime information |
| `c107 status` | Show overall Cloud107 state |
| `c107 health` | Check API/runtime health |
| `c107 stats` | Show runtime/resource statistics |
| `c107 logs` | Show Cloud107 logs |
| `c107 events` | Show runtime and operation events |
| `c107 diagnostics` | Run the combined read-only diagnostic path |
| `c107 update` | Run the update operation |

### Resource commands

| Resource | Commands |
|---|---|
| Node | `c107 node ls`, `c107 node inspect <node>`, `c107 node logs <node>` |
| Workload | `c107 workload ls`, `c107 workload inspect <workload>`, `c107 workload logs <workload>` |
| Application | `c107 application ls`, `c107 application inspect <application>`, `c107 application logs <application>` |
| Environment | `c107 environment ls`, `c107 environment inspect <environment>` |
| Operation | `c107 operation ls`, `c107 operation inspect <operation>` |

### Diagnosis flow

<table>
<tr><th>Step</th><th>Command</th><th>Purpose</th></tr>
<tr><td>1</td><td><code>c107 status</code></td><td>Check whether Cloud107 is responding.</td></tr>
<tr><td>2</td><td><code>c107 health</code></td><td>Check API/runtime health.</td></tr>
<tr><td>3</td><td><code>c107 node ls</code></td><td>Find connected nodes.</td></tr>
<tr><td>4</td><td><code>c107 node inspect &lt;node&gt;</code></td><td>Inspect a node's reported state and capabilities.</td></tr>
<tr><td>5</td><td><code>c107 workload ls</code></td><td>Find workloads and their state.</td></tr>
<tr><td>6</td><td><code>c107 workload inspect &lt;workload&gt;</code></td><td>Inspect workload state and placement.</td></tr>
<tr><td>7</td><td><code>c107 operation ls</code></td><td>Find current and recent operations.</td></tr>
<tr><td>8</td><td><code>c107 operation inspect &lt;operation&gt;</code></td><td>Inspect an operation and its reported state.</td></tr>
<tr><td>9</td><td><code>c107 logs</code></td><td>Review recorded evidence.</td></tr>
<tr><td>10</td><td><code>c107 diagnostics</code></td><td>Run the combined diagnostic check.</td></tr>
</table>

**Note:** The commands above define the intended CLI model. They are not claims that every command is implemented today.

## Current command surface

| Command | Purpose |
|---|---|
| `npm run c107` | Start the CLI |
| `npm run c107 -- --help` | Display CLI help |
| `npm run c107 -- --version` | Display CLI version |
| `npm run c107:update` | Run the update operation |

**Note:** This table describes the currently documented command surface. Planned commands should remain marked as planned until implemented and verified.

**Reference:** [Cloud107 updates](../updates/)
