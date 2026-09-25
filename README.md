# Cloud107

Cloud107 lets you run and manage applications, environments, machines, and workloads from one workspace.

It is open source and can be run on infrastructure you control.

## Start here

| Interface | Purpose |
|---|---|
| Web workspace | Main Cloud107 interface |
| `c107` | Terminal control |
| Chrome / Chromium | Browser workspace |
| Firefox | Browser workspace |

The workspace includes:

- **Normal** — everyday applications and workloads
- **Developer** — projects, environments, toolchains, and development tools
- **High-performance virtual computer** — high-resource and distributed workloads when those resources are available

Common workspace areas:

| Area | Purpose |
|---|---|
| Projects | Projects and workloads |
| Nodes | Connected resources |
| Operations | Runtime activity |
| Terminal | Direct command-line access |
| Settings | Configuration |

> **Note:** This README is the shortest path from an installed repository to a working Cloud107 instance. Detailed implementation information is in [docs/](docs/).

## Distribution

Cloud107 can be used from source or from a packaged release artifact.

| Distribution | Function |
|---|---|
| Source | Inspect, modify, test, build and operate |
| Release artifact | Install and operate a validated packaged version |
| Development build | Build and validate source changes |

Release path:

**Source → Build → Validation → Package → Pre-configuration → Verification → Release artifact**

## Architecture

<table>
<tr><th colspan="3">CLOUD107 WORKSPACE</th></tr>
<tr><td>Web workspace<br><sub>React · TypeScript · Vite · HTML/CSS</sub></td><td>c107<br><sub>TypeScript · Node.js</sub></td><td>Human / AI agent<br><sub>Cloud107 control interfaces</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">API / Control Layer<br><sub>Node.js · Express · HTTP · JSON</sub></td></tr>
<tr><td>Applications<br><sub>Lifecycle · HTTP/JSON</sub></td><td>Environments<br><sub>Toolchains · dependencies · runtimes · OCI</sub></td><td>Nodes / Workloads<br><sub>x86-64 · ARM64 · OS/platform APIs</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td>Operations<br><sub>Health · logs · metrics</sub></td><td>PostgreSQL<br><sub>SQL · Drizzle</sub></td><td>Updates<br><sub>Git · SHA-256 · Ed25519</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td>Cloud107 Core<br><sub>C# · .NET · native/platform APIs</sub></td><td>Containers / orchestration<br><sub>Docker · OCI · Kubernetes</sub></td><td>Network<br><sub>Ethernet · Wi-Fi · IP · HTTP · WebSocket</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">Host / Hardware<br><sub>x86-64 · ARM64 · OS APIs · POSIX where applicable</sub></td></tr>
</table>

## Stack

| Layer | Language | Runtime / framework | Technology | Status |
|---|---|---|---|---|
| Web | TypeScript · HTML · CSS | React 19 · Vite 6 | Browser | Current |
| API | TypeScript | Node.js 22 · Express 4 | HTTP / JSON | Current |
| Validation | TypeScript | Zod | API validation | Current |
| Database | SQL | PostgreSQL 15 · Drizzle | SQL | Current |
| Core | C# | .NET | Core/application boundary | Current |
| CLI | TypeScript | Node.js | Terminal / API | Current |
| Updates | TypeScript · shell | Node.js · Git | SHA-256 · Ed25519 | Current |
| Containers | — | Docker Engine / Compose | OCI containers | Current |
| Orchestration | — | Kubernetes | Container orchestration | Current / Phase 2 |
| Native/runtime | C · C++ · Rust · Assembly | Platform-native | OS/platform interfaces | As required |
| Hardware | — | x86-64 · ARM64 | ISA/platform boundary | Supported / target-dependent |

## Standards and interfaces

| Type | Examples |
|---|---|
| Language | C · C++ · C# · Rust · Go · Java · JavaScript · TypeScript · Python · SQL · Assembly |
| Runtime / framework | Node.js · .NET · React · Vite · Express |
| Protocol | HTTP(S) · TCP/IP · WebSocket · MQTT · AMQP · gRPC |
| Configuration / serialization | JSON · YAML · TOML · XML · HCL · Protocol Buffers |
| Standards body | IETF · IEEE · ISO/IEC |
| Specification | RFCs · IEEE specifications · ISO/IEC specifications |
| Platform API | POSIX · Win32 · Android SDK · Apple APIs |
| Hardware / ISA | x86-64 · ARM64 · RISC-V |
| Reference implementation | Kubernetes · LLVM · PostgreSQL |

Only interfaces and specifications used or explicitly required by a subsystem should be listed for that subsystem.

## Quick start with Docker

### 1. Prepare Docker

<table><tr><td align="center"><strong>Docker</strong></td><td>→</td><td align="center"><strong>Docker Engine</strong><br>Docker Compose</td><td>→</td><td align="center"><strong>Cloud107</strong></td></tr></table>

**Requirements**

- Docker
- Docker Compose

**Reference:** [Docker Get Started](https://docs.docker.com/get-started/) · [Docker Compose documentation](https://docs.docker.com/compose/)

**Note:** Docker runs Cloud107 and its PostgreSQL dependency as containers.

### 2. Configure Cloud107

<table><tr><td align="center"><strong>.env.example</strong></td><td>→</td><td align="center"><strong>.env</strong></td><td>→</td><td align="center"><strong>Cloud107 configuration</strong></td></tr></table>

**Command**

```bash
cp .env.example .env
```

Set the required values:

```env
SQL_ADMIN_PASSWORD=change-this
SQL_PASSWORD=change-this
C107_AUTH_SECRET=change-this
```

**Reference:** [Docker environment variables](https://docs.docker.com/compose/how-tos/environment-variables/)

**Note:** Create the local configuration file and replace example secrets with your own values.

### 3. Start Cloud107

<table><tr><td align="center"><strong>docker compose up</strong></td><td>→</td><td align="center">PostgreSQL<br>↓<br>migration<br>↓<br>Cloud107</td></tr></table>

**Command**

```bash
docker compose up -d
```

**Reference:** [Docker Compose](https://docs.docker.com/compose/)

**Note:** The database starts first, the migration runs, and Cloud107 starts afterward.

### 4. Open the workspace

<table><tr><td align="center"><strong>Cloud107 server</strong></td><td>→</td><td align="center"><strong>localhost:3000</strong></td><td>→</td><td align="center"><strong>Web browser</strong></td></tr></table>

**Open**

```text
http://localhost:3000
```

**Reference:** [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

**Note:** Open the local Cloud107 workspace in your browser.

### 5. Stop Cloud107

<table><tr><td align="center"><strong>Cloud107</strong></td><td>→</td><td align="center"><strong>docker compose down</strong></td><td>→</td><td align="center"><strong>Containers stopped</strong></td></tr></table>

**Command**

```bash
docker compose down
```

**Reference:** [docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/)

**Note:** The PostgreSQL volume remains unless it is explicitly removed.

## Run from source

### 1. Install prerequisites

<table><tr><td align="center"><strong>Git + Node.js 22+ + PostgreSQL 15+</strong></td><td>→</td><td align="center"><strong>Cloud107 source</strong></td></tr></table>

| Requirement | Reference |
|---|---|
| Git | [Git documentation](https://git-scm.com/doc) |
| Node.js | [Node.js documentation](https://nodejs.org/docs/latest/api/) |
| PostgreSQL | [PostgreSQL documentation](https://www.postgresql.org/docs/) |

**Note:** These provide source control, the application runtime, and the database environment.

### 2. Get the source and install dependencies

<table><tr><td align="center"><strong>Git repository</strong></td><td>→</td><td align="center"><strong>npm ci</strong></td><td>→</td><td align="center"><strong>Project dependencies</strong></td></tr></table>

**Commands**

```bash
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107
npm ci
```

**Reference:** [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) · [Git clone](https://git-scm.com/docs/git-clone)

**Note:** Install the dependency versions recorded by the lockfile.

### 3. Configure the environment

<table><tr><td align="center"><strong>.env.example</strong></td><td>→</td><td align="center"><strong>.env</strong></td><td>→</td><td align="center"><strong>Application configuration</strong></td></tr></table>

**Command**

```bash
cp .env.example .env
```

**Reference:** [Node.js environment variables](https://nodejs.org/api/environment_variables.html)

**Note:** Set the local values required by Cloud107 before starting it.

### 4. Run database migrations

<table><tr><td align="center"><strong>PostgreSQL</strong></td><td>→</td><td align="center"><strong>db:migrate</strong></td><td>→</td><td align="center"><strong>Cloud107 database schema</strong></td></tr></table>

**Command**

```bash
npm run db:migrate
```

**Reference:** [PostgreSQL documentation](https://www.postgresql.org/docs/) · [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)

**Note:** Create or update the database structure required by the current source version.

### 5. Start development mode

<table><tr><td align="center"><strong>Cloud107 source</strong></td><td>→</td><td align="center"><strong>npm run dev</strong></td><td>→</td><td align="center">API<br>Web workspace</td></tr></table>

**Command**

```bash
npm run dev
```

**Reference:** [Vite Guide](https://vite.dev/guide/) · [Express documentation](https://expressjs.com/)

**Note:** Start Cloud107 in development mode.

### 6. Build and run production mode

<table><tr><td align="center"><strong>Source</strong></td><td>→</td><td align="center"><strong>npm run build</strong></td><td>→</td><td align="center"><strong>dist/</strong></td><td>→</td><td align="center"><strong>npm start</strong></td></tr></table>

**Commands**

```bash
npm run build
npm start
```

**Reference:** [Node.js documentation](https://nodejs.org/docs/latest/api/) · [Vite build guide](https://vite.dev/guide/build.html)

**Note:** Build the production application and then start the generated server.

## c107

The CLI provides a terminal interface to Cloud107.

### Check the CLI

<table><tr><td align="center"><strong>c107</strong></td><td>→</td><td align="center"><strong>--help</strong><br>--version</td></tr></table>

**Installed CLI commands**

```bash
c107 --help
c107 --version
```

**Source checkout invocation**

```bash
npm run c107 -- --help
npm run c107 -- --version
```

**Reference:** [Node.js CLI documentation](https://nodejs.org/api/cli.html)

**Note:** After the CLI is installed, use `c107` directly. The npm form is the repository/source-development invocation.

### Docker-style command model

`c107` follows a command hierarchy similar to Docker: the top-level command identifies the Cloud107 area, and subcommands inspect or operate on that resource.

<table>
<tr><th>Command</th><th>Purpose</th></tr>
<tr><td><code>c107 info</code></td><td>Show Cloud107 installation and runtime information.</td></tr>
<tr><td><code>c107 status</code></td><td>Show overall Cloud107 state.</td></tr>
<tr><td><code>c107 health</code></td><td>Check API/runtime health.</td></tr>
<tr><td><code>c107 stats</code></td><td>Show available runtime/resource statistics.</td></tr>
<tr><td><code>c107 logs</code></td><td>Show relevant Cloud107 logs.</td></tr>
<tr><td><code>c107 events</code></td><td>Show recorded runtime/operation events.</td></tr>
<tr><td><code>c107 diagnostics</code></td><td>Run the combined read-only diagnostic path.</td></tr>
<tr><td><code>c107 version</code></td><td>Show Cloud107 and CLI versions.</td></tr>
</table>

### Resource commands

<table>
<tr><th>Resource</th><th>List</th><th>Inspect</th><th>Logs</th></tr>
<tr><td>Node</td><td><code>c107 node ls</code></td><td><code>c107 node inspect &lt;node&gt;</code></td><td><code>c107 node logs &lt;node&gt;</code></td></tr>
<tr><td>Workload</td><td><code>c107 workload ls</code></td><td><code>c107 workload inspect &lt;workload&gt;</code></td><td><code>c107 workload logs &lt;workload&gt;</code></td></tr>
<tr><td>Application</td><td><code>c107 application ls</code></td><td><code>c107 application inspect &lt;application&gt;</code></td><td><code>c107 application logs &lt;application&gt;</code></td></tr>
<tr><td>Environment</td><td><code>c107 environment ls</code></td><td><code>c107 environment inspect &lt;environment&gt;</code></td><td>—</td></tr>
<tr><td>Operation</td><td><code>c107 operation ls</code></td><td><code>c107 operation inspect &lt;operation&gt;</code></td><td>—</td></tr>
</table>

### System diagnosis

Use read-only inspection first. Resource-specific commands should expose the state needed to diagnose a problem without requiring a repair operation.

```bash
c107 info
c107 status
c107 health

c107 node ls
c107 node inspect <node>
c107 node logs <node>

c107 workload ls
c107 workload inspect <workload>
c107 workload logs <workload>

c107 application ls
c107 application inspect <application>
c107 application logs <application>

c107 environment ls
c107 operation ls
c107 operation inspect <operation>

c107 logs
c107 events
c107 stats
c107 diagnostics
```

**Recommended diagnosis path**

<table>
<tr><th>Step</th><th>Command</th><th>Question answered</th></tr>
<tr><td>1</td><td><code>c107 status</code></td><td>Is Cloud107 responding?</td></tr>
<tr><td>2</td><td><code>c107 health</code></td><td>Is the API/runtime healthy?</td></tr>
<tr><td>3</td><td><code>c107 node ls</code></td><td>Which resources are connected?</td></tr>
<tr><td>4</td><td><code>c107 node inspect &lt;node&gt;</code></td><td>What is the selected node reporting?</td></tr>
<tr><td>5</td><td><code>c107 workload ls</code></td><td>Which workloads are running?</td></tr>
<tr><td>6</td><td><code>c107 workload inspect &lt;workload&gt;</code></td><td>What is the workload state and placement?</td></tr>
<tr><td>7</td><td><code>c107 operation ls</code></td><td>Is an operation running or failing?</td></tr>
<tr><td>8</td><td><code>c107 operation inspect &lt;operation&gt;</code></td><td>What is the operation reporting?</td></tr>
<tr><td>9</td><td><code>c107 logs</code></td><td>What evidence is recorded?</td></tr>
<tr><td>10</td><td><code>c107 diagnostics</code></td><td>What combined conditions require attention?</td></tr>
</table>

**Note:** This defines the intended Docker-style CLI surface. Commands should only be treated as implemented when they exist in the CLI source and pass their corresponding validation.

### Update Cloud107

<table><tr><td align="center"><strong>c107</strong></td><td>→</td><td align="center"><strong>Update pipeline</strong></td></tr><tr><td></td><td align="center">provenance · signature · hash · compatibility<br>checkpoint · health · activation · rollback</td></tr></table>

**Commands**

Installed CLI:

```bash
c107 update
```

Source checkout:

```bash
npm run c107:update
```

**Reference:** [The Update Framework (TUF)](https://theupdateframework.io/) · [Git documentation](https://git-scm.com/doc)

**Note:** Run the Cloud107 update workflow. The implementation verifies update metadata before activation and uses a checkpoint for rollback after a failure.

For implementation details, see [docs/updates/](docs/updates/).

## Development checks

<table><tr><td align="center"><strong>Source</strong></td><td>→</td><td align="center">test<br>lint<br>build</td></tr></table>

**Commands**

```bash
npm run test
npm run lint
npm run build
```

**Reference:** [Vitest documentation](https://vitest.dev/) · [ESLint documentation](https://eslint.org/docs/latest/)

**Note:** Run the automated tests, code checks, and production build.

## Documentation

| Section | Purpose |
|---|---|
| [Architecture](docs/architecture/) | System structure and boundaries |
| [Design](docs/design/) | Interface and interaction structure |
| [Development](docs/development/) | Source workflow and tooling |
| [Runtime](docs/runtime/) | Runtime behavior |
| [Deployment](docs/deployment/) | Docker and Kubernetes deployment |
| [Security](docs/security/) | Security boundaries and controls |
| [Updates](docs/updates/) | Update verification and activation |
| [APIs](docs/APIs/) | HTTP API |
| [CLI](docs/CLI/) | c107 interface |
| [Environments](docs/environments/) | Execution environments |
| [Nodes](docs/nodes/) | Nodes and capabilities |
| [Workloads](docs/workloads/) | Workload lifecycle |
| [AI](docs/AI/) | AI interfaces and control boundaries |
| [Operations](docs/operations/) | Health, logs, recovery and diagnostics |
| [Decisions](docs/decisions/) | Accepted technical constraints |
| [Research](docs/research/) | External technical references |
| [Phase 3](docs/phase-3/) | Cloud107 OS and device runtime |

## License

Cloud107 is licensed under the GNU Affero General Public License v3.0 or later.

See [LICENSE](LICENSE).

## Repository

[Cloud107 source repository](https://github.com/souravsviswajith/Cloud107)
