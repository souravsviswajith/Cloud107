# Cloud107

Cloud107 runs and manages applications, environments, nodes, and workloads from infrastructure under the operator's control, with minimal operational cost.

## Interfaces

| Interface | Responsibility |
|---|---|
| Web workspace | Workspace and operational control |
| `c107` | Terminal control |
| Chrome / Chromium | Browser workspace |
| Firefox | Browser workspace |

## Architecture

<table>
<tr><th colspan="3">CLOUD107 WORKSPACE</th></tr>
<tr><td>Web workspace<br><sub>React · TypeScript · Vite · HTML/CSS</sub></td><td>c107<br><sub>TypeScript · Node.js</sub></td><td>Human / AI agent<br><sub>Cloud107 control interfaces</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">API / Control Layer<br><sub>Node.js · Express · HTTP · JSON</sub></td></tr>
<tr><td>Applications<br><sub>Lifecycle · HTTP/JSON</sub></td><td>Environments<br><sub>Toolchains · dependencies · runtimes · OCI</sub></td><td>Nodes / Workloads<br><sub>x86-64 · ARM64 · OS/platform APIs</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">Operations<br><sub>Health · logs · metrics</sub></td><td>PostgreSQL<br><sub>SQL · Drizzle</sub></td><td>Updates<br><sub>Git · SHA-256 · Ed25519</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">Cloud107 Core<br><sub>C# · .NET · native/platform APIs</sub></td><td>Containers / orchestration<br><sub>Docker · OCI · Kubernetes</sub></td><td>Network<br><sub>Ethernet · Wi‑Fi · IP routing</sub></td></tr>
<tr><td colspan="3">↓</td></tr>
<tr><td colspan="3">Host / Hardware<br><sub>x86-64 · ARM64 · OS APIs · POSIX where applicable</sub></td></tr>
</table>

## Distribution

**Source → Build → Validation → Package → Pre-configuration → Verification → Release artifact**

| Distribution | Function |
|---|---|
| Source | Inspect, modify, test and build |
| Development build | Validate source changes |
| Release artifact | Install and operate a validated package |

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
| Orchestration | — | Kubernetes | Container orchestration | Current / Planned |
| Native/runtime | C · C++ · Rust · Assembly | Platform-native | OS/platform interfaces | As required |
| Hardware | — | x86-64 · ARM64 | ISA/platform boundary | Supported / target-dependent |

Language selection is responsibility-driven. A subsystem or file uses the language most suitable for its performance, safety, portability, native API, deployment, and ecosystem requirements.

## Standards and interfaces

| Type | Examples |
|---|---|
| Language | C · C++ · C# · Rust · Go · Java · JavaScript · TypeScript · Python · SQL · Assembly |
| Runtime / framework | Node.js · .NET · React · Vite · Express |
| Protocol | HTTP(S) · TCP/IP · WebSocket · MQTT · AMQP · gRPC |
| Configuration / serialization | JSON · YAML · TOML · XML · HCL · Protocol Buffers |
| Platform API | POSIX · Win32 · Android SDK · Apple APIs |
| Hardware / ISA | x86-64 · ARM64 · RISC-V |
| Reference implementation | Kubernetes · LLVM · PostgreSQL |

## Local development

### Docker

```bash
cp .env.example .env
docker compose up -d
```

Required local configuration:

```env
SQL_ADMIN_PASSWORD=change-this
SQL_PASSWORD=change-this
C107_AUTH_SECRET=change-this
```

Stop:

```bash
docker compose down
```

### Source

Requirements: Git, Node.js 22+, PostgreSQL 15+.

```bash
git clone https://github.com/souravsviswajith/Cloud107.git
cd Cloud107
npm ci
cp .env.example .env
npm run db:migrate
npm run dev
```

Production build:

```bash
npm run build
npm start
```

## c107

The CLI exposes Cloud107 state and operations through a resource-oriented command model.

```bash
c107 info
c107 status
c107 health
c107 stats
c107 logs
c107 events
c107 diagnostics
c107 version

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
```

Operational diagnosis should use authoritative read-only state before mutation.

### Updates

```text
provenance → signature → hash → compatibility
→ checkpoint → health → activation → rollback
```

Installed CLI:

```bash
c107 update
```

Source checkout:

```bash
npm run c107:update
```

## Development checks

```bash
npm run test
npm run lint
npm run build
```

## Documentation

| Section | Purpose |
|---|---|
| [Architecture](docs/architecture/) | System structure and boundaries |
| [Design](docs/design/) | Interface and interaction structure |
| [Development](docs/development/) | Source workflow and tooling |
| [Runtime](docs/runtime/) | Runtime behavior and execution boundaries |
| [Deployment](docs/deployment/) | Docker and Kubernetes deployment |
| [Security](docs/security/) | Trust boundaries and security controls |
| [Updates](docs/updates/) | Update verification, activation and rollback |
| [APIs](docs/APIs/) | HTTP API interfaces |
| [CLI](docs/CLI/) | c107 interface |
| [Environments](docs/environments/) | Toolchains, dependencies and reproducible environments |
| [Nodes](docs/nodes/) | Node registration, capabilities and connectivity |
| [Workloads](docs/workloads/) | Workload execution and lifecycle |
| [AI](docs/AI/) | AI interfaces and control boundaries |
| [Operations](docs/operations/) | Health, logging, recovery and diagnostics |
| [Decisions](docs/decisions/) | Accepted technical constraints |
| [Research](docs/research/) | External technical references and prior art |
| [OS / Device Runtime](docs/os/) | Cloud107 OS, modular images and device runtime |

## License

Cloud107 is licensed under the GNU Affero General Public License v3.0 or later.

See [LICENSE](LICENSE).

## Development and Contribution Note

Every open source project I've forked gave years of experience and helped shape the way I build and operate Cloud107.

---

Cloud107 is a self-hosted, source-first infrastructure control plane designed for organizations that need full sovereignty over their computing infrastructure. It provides unified management of nodes, workloads, runtimes, applications, resources, and observed state.

### Key capabilities

- Frontend: React 19, Vite, Tailwind CSS, sovereign workspace shell
- Backend: Cloud107 modular control-plane architecture
- Database: PostgreSQL via Drizzle ORM, with local relational session persistence
- Auth: self-hosted Cloud107 identity with WebAuthn/FIDO2 and sovereign local operator credentials
- CLI: `c107` supporting cryptographically verified source-first updates (`c107 update`)

### Getting started

1. Set up your `.env` file using `.env.example` as a template.
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

The dev server runs on port `3000`.

### Scripts

- `npm run dev` — starts the development server
- `npm run build` — builds the frontend and backend for production
- `npm run start` — starts the built production server
- `npm run lint` — lints the codebase using ESLint Flat Config
- `npm run format` — formats code using Prettier
- `npm run test` — runs Vitest tests
- `npm run c107` — runs the Cloud107 CLI
- `npm run c107:update` — runs the cryptographically verified source-first updater

### Architecture reference

See `docs/backend-architecture.md` for a detailed breakdown of the backend structure and architectural decisions.
