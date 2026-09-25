# Environments

Prepared environments, toolchains, dependencies, reproducibility, and validation.

This page documents the environment inputs currently present in the Cloud107 repository.

## Guide

### 1. Environment architecture

<table>
<tr>
<td colspan="4" align="center"><strong>CLOUD107 ENVIRONMENT</strong></td>
</tr>
<tr>
<td align="center"><strong>TOOLCHAIN</strong><br><sub>(TypeScript · C# · SQL · npm / build tools)</sub></td>
<td align="center"><strong>DEPENDENCIES</strong><br><sub>(package-lock · application packages)</sub></td>
<td align="center"><strong>RUNTIME</strong><br><sub>(Node.js · .NET · platform runtime)</sub></td>
<td align="center"><strong>CONFIGURATION</strong><br><sub>(Environment values · platform settings)</sub></td>
</tr>
<tr>
<td colspan="4" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>PREPARED ENVIRONMENT</strong><br><sub>(Validated toolchain + dependencies + runtime)</sub></td>
<td align="center"><strong>DATABASE</strong><br><sub>(PostgreSQL · SQL · Drizzle)</sub></td>
<td align="center"><strong>CONTAINERS</strong><br><sub>(Docker · Compose · OCI where applicable)</sub></td>
<td align="center"><strong>PLATFORM</strong><br><sub>(POSIX / OS APIs · x86-64 · ARM64)</sub></td>
</tr>
<tr>
<td colspan="4" align="center">↓</td>
</tr>
<tr>
<td colspan="4" align="center"><strong>WORKLOAD</strong><br><sub>(Application execution environment)</sub></td>
</tr>
</table>

**Note:** An environment combines the tools, dependencies, runtime, and configuration required by a workload.

**Reference:** [Workloads](../workloads/) · [Runtime](../runtime/)

### 2. Current environment inputs

```text
Repository source
      │
      ├── package.json / lockfile
      ├── TypeScript configuration
      ├── Vite configuration
      ├── Dockerfile
      ├── Compose configuration
      └── database migrations
      │
      ▼
Development / deployment environment
      │
      ▼
Cloud107 workload
```

| Area | Current technology | Role |
|---|---|---|
| Application runtime | Node.js 22 | Server and tooling runtime |
| Language | TypeScript | Main application language |
| Web tooling | Vite | Frontend development/build |
| Database | PostgreSQL / Drizzle | Persistent application state |
| Containers | Docker / Compose | Reproducible application environment |
| Database schema | Drizzle migrations | Schema state |

**Note:** This table describes the current repository environment. Additional toolchains should be added when they become part of an implemented workload.

**Reference:** [Node.js](https://nodejs.org/docs/latest/api/) · [TypeScript](https://www.typescriptlang.org/docs/) · [Vite](https://vite.dev/guide/) · [PostgreSQL](https://www.postgresql.org/docs/) · [Docker](https://docs.docker.com/)

### 3. Install the locked dependencies

```text
package.json
     │
     ▼
package-lock.json
     │
     ▼
npm ci
     │
     ▼
Installed environment
```

**Command**

```bash
npm ci
```

**Note:** Use `npm ci` to install the dependency versions recorded by the repository lockfile.

**Expected result:** The project dependencies are installed from the lockfile.

**Reference:** [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)

### 4. Validate the application environment

```text
Prepared environment
       │
       ├── lint
       ├── test
       └── build
       │
       ▼
Application validation
```

**Commands**

```bash
npm run lint
npm test
npm run build
```

**Note:** Run these checks when validating a source environment or an environment change.

**Expected result:** The configured lint, test, and production build steps complete successfully.

**Reference:** [Vitest](https://vitest.dev/) · [ESLint](https://eslint.org/docs/latest/) · [Vite build](https://vite.dev/guide/build.html)

### 5. Validate the container environment

```text
Docker / Compose
      │
      ├── PostgreSQL
      ├── migration
      └── Cloud107
            │
            ▼
       deployment state
```

**Commands**

```bash
docker compose up -d
docker compose ps
docker compose logs -f cloud107
```

**Note:** Use container validation when an environment change affects Docker, dependencies, database initialization, or runtime behavior.

**Expected result:** PostgreSQL becomes healthy, migration completes, and Cloud107 starts.

**Reference:** [Docker Compose](https://docs.docker.com/compose/) · [Deployment](../deployment/)

### 6. Database environment

```text
Cloud107
    │
    ▼
Drizzle
    │
    ▼
PostgreSQL 15
    ▲
    │
npm run db:migrate
```

**Command**

```bash
npm run db:migrate
```

**Note:** Apply the database migrations required by the current source version.

**Expected result:** PostgreSQL contains the schema required by the current application source.

**Reference:** [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) · [PostgreSQL](https://www.postgresql.org/docs/)

### 7. Reproducibility inputs

```text
Source revision
      │
      ├── package lockfile
      ├── configuration
      ├── migration state
      ├── container build definition
      └── target platform / architecture
      │
      ▼
Environment definition
      │
      ▼
Validation
```

| Input | Purpose |
|---|---|
| Repository source revision | Identifies source state |
| Package lockfile | Identifies dependency versions |
| Declared configuration | Defines required environment values |
| Database migration state | Defines database schema state |
| Dockerfile / Compose | Defines container environment |
| Target platform / architecture | Defines execution boundary |

**Note:** The repository should not claim reproducibility beyond the information and validation actually available.

**Reference:** [npm package-lock](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json) · [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

### 8. Environment boundaries

```text
Language
   │
   ▼
Runtime / framework
   │
   ▼
Package / build tooling
   │
   ▼
Container / OS interface
   │
   ▼
Platform / architecture
   │
   ▼
Workload
```

| Type | Example |
|---|---|
| Language | TypeScript, SQL, C# |
| Runtime / framework | Node.js, React, Vite, .NET |
| Package/build tooling | npm, Vite, Drizzle Kit |
| Container | Docker / Compose |
| Database | PostgreSQL |
| OS interface | POSIX / platform APIs where required |
| Hardware / ISA | x86-64, ARM64 where supported |

**Note:** A specific standard, platform API, or external technology should be listed only when the environment actually uses or depends on it.

**Reference:** [POSIX — The Open Group](https://pubs.opengroup.org/onlinepubs/9699919799/) · [Docker](https://docs.docker.com/)

## Scope

This page documents environment inputs currently present in the repository. A target toolchain or platform should remain marked as a target until it is implemented and validated.

**Reference:** [Architecture](../architecture/) · [Development](../development/)
