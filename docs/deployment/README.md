# Deployment

This page documents the deployment path currently present in the repository.

## Deployment architecture

```text
                         Cloud107
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
          Docker Compose          Phase 2 targets
                │             Windows / Linux / IoT
                │             Apple / Web / WSL
                ▼
          PostgreSQL 15
          SQL / PostgreSQL
                │
                ▼
        cloud107-migrate
        Node.js / npm
        Drizzle migrations
                │
                ▼
          cloud107 :3000
        Node.js 22 / Express
        TypeScript application
                │
                ▼
        HTTP / JSON API

Container boundary:
Docker / OCI-compatible container model

Host boundary:
OS → platform runtime → hardware architecture
```

**Note:** The current deployment path is Docker Compose. The Phase 2 targets below describe planned delivery targets and are not claims that every target is already built or validated.

### Deployment layers

| Layer | Current technology | Role |
|---|---|---|
| Application | Node.js 22, TypeScript, Express | Cloud107 server |
| Database | PostgreSQL 15, SQL, Drizzle | Persistent state |
| Migration | Node.js / npm | Schema migration |
| Container | Docker / Compose | Local deployment topology |
| Host | OS and target architecture | Execution environment |
| Network | HTTP / JSON | Application interface |

**Note:** Standards, specifications, and vendor technologies are documented separately when they are actually used or required by the implementation.

## Docker Compose

The repository includes a Docker Compose setup with three services:

```text
PostgreSQL
    │
    ▼
cloud107-migrate
    │
    ▼
cloud107
```

### PostgreSQL

The `postgres` service provides persistent database storage through the `cloud107-postgres` volume.

The database administrator values are supplied through:

```env
SQL_ADMIN_USER
SQL_ADMIN_PASSWORD
SQL_DB_NAME
```

`SQL_ADMIN_PASSWORD` is required by the Compose configuration.

### Migration service

`cloud107-migrate` uses the same Cloud107 image and runs:

```bash
npm run db:migrate
```

It waits for PostgreSQL to become healthy.

The application service waits for the migration service to complete successfully before starting.

### Application service

The `cloud107` service runs the production image and exposes port `3000`.

Its database and application settings include:

```env
SQL_HOST
SQL_USER
SQL_PASSWORD
SQL_DB_NAME
C107_AUTH_SECRET
GEMINI_API_KEY
APP_URL
```

## Docker image

The Dockerfile uses two stages.

### Build stage

```text
node:22-alpine
    │
    ├── npm ci
    ├── copy source
    └── npm run build
```

### Runtime stage

The runtime image uses `node:22-alpine`, installs production dependencies, copies the built application and database migration/configuration files, and runs as the non-root `node` user.

The application starts with:

```bash
node dist/server.cjs
```

## Local deployment

```text
.env
 │
 ▼
docker compose up -d
 │
 ├── PostgreSQL
 ├── migration
 └── Cloud107 :3000
```

### 1. Configure

**Command**

```bash
cp .env.example .env
```

**Note:** Create the local environment file and set the required database and application values.

### 2. Start

**Command**

```bash
docker compose up -d
```

**Note:** Start PostgreSQL, run the migration, and then start Cloud107.

### 3. Check the deployment

**Commands**

```bash
docker compose ps
docker compose logs -f cloud107
```

**Note:** Confirm that the containers are running and inspect the Cloud107 service log.

Check the services:

```bash
docker compose ps
docker compose logs -f cloud107
```

Stop the deployment:

```bash
docker compose down
```

The PostgreSQL volume is retained by default when using `docker compose down`.

## Deployment boundary

The current Compose deployment establishes the application and database services. Node coordination, additional deployment targets, and platform-specific packaging should be documented here only when the corresponding implementation is present and verified.

## Validation

Before treating a deployment change as complete, run:

```bash
npm run test
npm run lint
npm run build
```

For container changes, build and start the Compose deployment and verify that PostgreSQL becomes healthy, migrations complete successfully, Cloud107 starts afterward, port `3000` is reachable, and the health endpoint reports the actual service state.

Do not document a deployment target as supported solely because packaging files exist. Verify the target first.


## Phase 2 artifact targets

Phase 2 targets distributable artifacts and runtime packages across the supported hardware families. The target matrix is:

| Target | Artifact / delivery form | Architectures |
|---|---|---|
| Windows | `.msi`, `.exe` | x86_64, ARM64 |
| Linux | `.deb` | x86_64, ARM64 |
| IoT | device-specific image/package | ARM and x86 where the target supports them |
| Apple | native application/package | Apple Silicon ARM64 and Intel x86_64 |
| Web | GitHub Pages-hosted website | Browser architecture |
| WSL | Microsoft Store distribution | x86_64, ARM64 where the WSL distribution/runtime supports it |

These are **Phase 2 targets**, not claims that every artifact is already built or validated.

### Packaging rule

The same Cloud107 capability contract should be preserved across targets while the implementation may use the target's native packaging, runtime, installer, signing, and system integration mechanisms.

The architecture is therefore:

```text
Cloud107 capability contract
          │
   ┌──────┼───────────────┐
   ▼      ▼       ▼       ▼
Windows Linux    IoT    Apple
 .msi    .deb   device  package
 .exe            image
   │      │       │       │
 x86_64 ARM64  target   ARM64/x86_64
```

Artifact availability, signing, installer behavior, hardware compatibility, and runtime validation must be verified separately for each target. A package existing in the repository does not by itself establish support.


## User interface targets

Cloud107 does not require a graphical interface on every target.

### IoT and microcontrollers

IoT targets may run only the Cloud107 device/runtime components. Microcontrollers can operate without the Cloud107 graphical workspace.

A device may instead expose its capabilities through the Cloud107 control plane or another supported management interface, depending on the device and its connectivity.

The absence of a local UI is intentional for resource-constrained devices.

### Other supported targets

Windows, Linux, Apple, WSL, and the web experience use the same Cloud107 workspace model. The interface adapts to the platform while preserving the same core concepts and capabilities.

The universal UI should not imply identical rendering or input behavior on every device. Desktop, mobile, browser, and platform-native experiences may use platform-appropriate layouts and controls while remaining consistent at the capability level.
