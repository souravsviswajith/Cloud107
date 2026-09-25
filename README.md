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

## Architecture

This is the quick-reference blueprint for Cloud107. The diagram keeps the structure compact; the bracketed line on each module identifies its implementation stack and relevant industry references.

<table>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 WORKSPACE</strong><br><sub>(Web workspace · CLI · runtime/control)</sub></td>
</tr>
<tr>
<td align="center"><strong>DASHBOARD</strong><br><sub>(React · TypeScript · Vite · HTML/CSS · Web Platform)</sub></td>
<td align="center"><strong>c107</strong><br><sub>(TypeScript · Node.js · Git · POSIX)</sub></td>
<td align="center"><strong>USER / AI AGENT</strong><br><sub>(Human or agent control)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>API / CONTROL LAYER</strong><br><sub>(TypeScript · Node.js · Express · HTTP · RFC 9110)</sub></td>
</tr>
<tr>
<td align="center"><strong>APPLICATIONS</strong><br><sub>(Lifecycle · HTTP/JSON)</sub></td>
<td align="center"><strong>ENVIRONMENTS</strong><br><sub>(Toolchains · dependencies · runtime · OCI)</sub></td>
<td align="center"><strong>NODES / WORKLOADS</strong><br><sub>(x86-64 · ARM64 · OS APIs · POSIX)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>OPERATIONS</strong><br><sub>(Health · logs · metrics)</sub></td>
<td align="center"><strong>POSTGRESQL</strong><br><sub>(SQL · Drizzle)</sub></td>
<td align="center"><strong>UPDATES</strong><br><sub>(Git · SHA-256 · Ed25519 · FIPS 180-4 · RFC 8032)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>RUNTIME</strong><br><sub>(C# · .NET · platform APIs)</sub></td>
<td align="center"><strong>CONTAINERS / ORCHESTRATION</strong><br><sub>(Docker · OCI · Kubernetes)</sub></td>
<td align="center"><strong>NETWORK</strong><br><sub>(Ethernet · Wi-Fi · IP · IEEE 802.3 · IEEE 802.11 · IETF RFCs)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>HOST / HARDWARE</strong><br><sub>(POSIX · OS APIs · x86-64 · ARM64)</sub></td>
</tr>
</table>

<details>
<summary><strong>Technology and standards</strong></summary>

| Module | Stack / reference |
|---|---|
| Dashboard | React · TypeScript · Vite · HTML/CSS · Web Platform |
| API | Node.js · Express · HTTP/JSON · RFC 9110 |
| CLI | TypeScript · Node.js · Git · POSIX |
| Applications | Cloud107 application layer · HTTP/JSON |
| Environments | Toolchains · dependencies · runtime · OCI where applicable |
| Nodes | x86-64 · ARM64 · OS APIs · POSIX where applicable |
| Workloads | Process · container · runtime · OCI where applicable |
| Operations | Health · logs · metrics; telemetry standards where implemented |
| Updates | Git · SHA-256 · FIPS 180-4 · Ed25519 · RFC 8032 |
| Database | PostgreSQL · SQL · Drizzle |
| Containers | Docker · OCI where applicable |
| Orchestration | Kubernetes · OCI where applicable |
| Runtime | C# · .NET · native/platform APIs |
| Networking | Ethernet · Wi-Fi · IP · IEEE 802.3 · IEEE 802.11 · IETF RFCs |
| Hardware | x86-64 · ARM64 · ISA/platform specifications |

</details>

**Note:** Standards and specifications are shown only where the documented architecture uses or explicitly depends on them. Vendor products are not presented as standards.

### Stack quick reference

| Layer | Language | Runtime / framework | Technology / interface | Status |
|---|---|---|---|---|
| Web | TypeScript, HTML, CSS | React 19, Vite 6 | Browser, HTTP | Current |
| API | TypeScript | Node.js 22, Express 4 | HTTP / JSON | Current |
| Validation | TypeScript | Zod | API input validation | Current |
| Database | SQL | PostgreSQL 15, Drizzle | SQL | Current |
| Core | C# | .NET | Core/application boundary | Current |
| CLI | TypeScript | Node.js | Terminal / HTTP | Current |
| Updates | TypeScript, shell | Node.js, Git | Provenance, Ed25519, SHA-256 | Current |
| Containers | — | Docker Engine / Compose | Container deployment | Current |
| Orchestration | — | Kubernetes | Deployment target | Current/Phase 2 |
| Native/runtime | C / C++ / Rust / Assembly | Platform-native | OS/platform interfaces | As required |
| Hardware | — | x86-64 / ARM64 | Hardware/ISA boundary | Supported/target-dependent |

### Standards and technology classification

| Type | Meaning | Examples used/referenced by Cloud107 |
|---|---|---|
| Language | Source code language | TypeScript, C#, SQL, C/C++, Rust, Assembly |
| Runtime/framework | Executes or structures code | Node.js, .NET, React, Vite, Express |
| Protocol | Communication/interface method | HTTP, HTTPS, TCP/IP, MQTT |
| Standards body | Publishes specifications | IETF, IEEE, ISO/IEC |
| Specification | Actual technical specification | RFCs, IEEE specifications, ISO/IEC specifications |
| Vendor technology | Product/vendor implementation | Cisco, Palo Alto Networks where explicitly used |
| Reference implementation | Software implementation used as reference/infrastructure | Kubernetes, LLVM, PostgreSQL |
| Platform API | Operating-system/device interface | POSIX, Win32, Android SDK, Apple APIs |
| Hardware / ISA | Processor or hardware execution boundary | x86-64, ARM64, RISC-V |

> **Note:** This map is intended to remove stack ambiguity for a quick search or AI-agent query. A technology is listed as **current** only where the repository documents or implements it. Target-only technologies remain marked as target/planned. Vendor names are not presented as standards.

**Reference:** [Architecture](docs/architecture/) · [Development](docs/development/) · [Runtime](docs/runtime/) · [Deployment](docs/deployment/) · [Security](docs/security/) · [Updates](docs/updates/)

## Quick start with Docker

### 1. Prepare Docker

```text
Docker
  │
  ├── Docker Engine
  └── Docker Compose
          │
          ▼
      Cloud107
```

**Requirements**

- Docker
- Docker Compose

**Reference:** [Docker Get Started](https://docs.docker.com/get-started/) · [Docker Compose documentation](https://docs.docker.com/compose/)

**Note:** Docker runs Cloud107 and its PostgreSQL dependency as containers.

### 2. Configure Cloud107

```text
.env.example
      │
      ▼
     .env
      │
      ▼
Cloud107 configuration
```

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

```text
docker compose up
      │
      ├── PostgreSQL
      │       │
      │       ▼
      │   migration
      │       │
      │       ▼
      └── Cloud107
```

**Command**

```bash
docker compose up -d
```

**Reference:** [Docker Compose](https://docs.docker.com/compose/)

**Note:** The database starts first, the migration runs, and Cloud107 starts afterward.

### 4. Open the workspace

```text
Cloud107 server
      │
      ▼
localhost:3000
      │
      ▼
Web browser
```

**Open**

```text
http://localhost:3000
```

**Reference:** [MDN HTTP overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

**Note:** Open the local Cloud107 workspace in your browser.

### 5. Stop Cloud107

```text
Cloud107
   │
   ▼
docker compose down
   │
   ▼
Containers stopped
```

**Command**

```bash
docker compose down
```

**Reference:** [docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/)

**Note:** The PostgreSQL volume remains unless it is explicitly removed.

## Run from source

### 1. Install prerequisites

```text
Git + Node.js 22+ + PostgreSQL 15+
                │
                ▼
          Cloud107 source
```

| Requirement | Reference |
|---|---|
| Git | [Git documentation](https://git-scm.com/doc) |
| Node.js | [Node.js documentation](https://nodejs.org/docs/latest/api/) |
| PostgreSQL | [PostgreSQL documentation](https://www.postgresql.org/docs/) |

**Note:** These provide source control, the application runtime, and the database environment.

### 2. Get the source and install dependencies

```text
Git repository
      │
      ▼
   npm ci
      │
      ▼
Project dependencies
```

**Commands**

```bash
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107
npm ci
```

**Reference:** [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci) · [Git clone](https://git-scm.com/docs/git-clone)

**Note:** Install the dependency versions recorded by the lockfile.

### 3. Configure the environment

```text
.env.example
      │
      ▼
     .env
      │
      ▼
Application configuration
```

**Command**

```bash
cp .env.example .env
```

**Reference:** [Node.js environment variables](https://nodejs.org/api/environment_variables.html)

**Note:** Set the local values required by Cloud107 before starting it.

### 4. Run database migrations

```text
PostgreSQL
    │
    ▼
db:migrate
    │
    ▼
Cloud107 database schema
```

**Command**

```bash
npm run db:migrate
```

**Reference:** [PostgreSQL documentation](https://www.postgresql.org/docs/) · [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview)

**Note:** Create or update the database structure required by the current source version.

### 5. Start development mode

```text
Cloud107 source
      │
      ▼
 npm run dev
      │
      ├── API
      └── Web workspace
```

**Command**

```bash
npm run dev
```

**Reference:** [Vite Guide](https://vite.dev/guide/) · [Express documentation](https://expressjs.com/)

**Note:** Start Cloud107 in development mode.

### 6. Build and run production mode

```text
Source
  │
  ▼
npm run build
  │
  ▼
dist/
  │
  ▼
npm start
```

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

```text
c107
 │
 ├── --help
 └── --version
```

**Commands**

```bash
npm run c107 -- --help
npm run c107 -- --version
```

**Reference:** [Node.js CLI documentation](https://nodejs.org/api/cli.html)

**Note:** Use these commands to see available CLI operations and the installed CLI version.

### Update Cloud107

```text
c107
 │
 ▼
Update pipeline
 │
 ├── provenance
 ├── signature
 ├── hash
 ├── compatibility
 ├── checkpoint
 ├── health
 ├── activation
 └── rollback
```

**Command**

```bash
npm run c107:update
```

**Reference:** [The Update Framework (TUF)](https://theupdateframework.io/) · [Git documentation](https://git-scm.com/doc)

**Note:** Run the Cloud107 update workflow. The implementation verifies update metadata before activation and uses a checkpoint for rollback after a failure.

For implementation details, see [docs/updates/](docs/updates/).

## Development checks

```text
Source
  │
  ├── test
  ├── lint
  └── build
```

**Commands**

```bash
npm run test
npm run lint
npm run build
```

**Reference:** [Vitest documentation](https://vitest.dev/) · [ESLint documentation](https://eslint.org/docs/latest/)

**Note:** Run the automated tests, code checks, and production build.

## Documentation

```text
docs/
├── architecture/
├── design/
├── development/
├── runtime/
├── deployment/
├── security/
├── updates/
├── APIs/
├── CLI/
├── environments/
├── nodes/
├── workloads/
├── AI/
├── operations/
├── decisions/
└── research/
```

| Start here | Then use |
|---|---|
| [docs/README.md](docs/README.md) | Documentation map |
| [docs/architecture/](docs/architecture/) | System structure |
| [docs/development/](docs/development/) | Development workflow |
| [docs/deployment/](docs/deployment/) | Deployment |
| [docs/runtime/](docs/runtime/) | Runtime behavior |
| [docs/security/](docs/security/) | Security boundaries |
| [docs/updates/](docs/updates/) | Update verification |
| [docs/research/](docs/research/) | External references |

### Guide format

Every operational guide should follow:

```text
Description
    ↓
Diagram
    ↓
Actual command / configuration
    ↓
Note
    ↓
Expected result / next step
    ↓
Relevant reference
```

> **Note:** Use upstream documentation for the technology itself. Use Cloud107 documentation for how Cloud107 uses that technology.

## License

Cloud107 is licensed under the GNU Affero General Public License v3.0 or later.

See [LICENSE](LICENSE).

## Repository

[Cloud107 source repository](https://github.com/souravsviswajith/Cloud107)
