# Deployment

This page documents the deployment path currently present in the repository.

The current local deployment uses Docker Compose. Other delivery targets are listed separately as Phase 2 targets.

## Guide

### 1. Deployment architecture

<table>
<tr>
<td colspan="3" align="center"><strong>CLOUD107 DEPLOYMENT</strong></td>
</tr>
<tr>
<td align="center"><strong>POSTGRESQL</strong><br><sub>(PostgreSQL 15 · SQL · Drizzle)</sub></td>
<td align="center"><strong>MIGRATION</strong><br><sub>(Node.js · npm · Drizzle migrations)</sub></td>
<td align="center"><strong>CLOUD107</strong><br><sub>(Node.js 22 · TypeScript · Express · HTTP/JSON · RFC 9110)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td colspan="3" align="center"><strong>DOCKER COMPOSE</strong><br><sub>(Docker Engine · Compose · OCI container ecosystem)</sub></td>
</tr>
<tr>
<td colspan="3" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>HOST OS</strong><br><sub>(OS APIs · POSIX where applicable)</sub></td>
<td align="center"><strong>NETWORK</strong><br><sub>(HTTP · TCP/IP · IETF RFCs)</sub></td>
<td align="center"><strong>HARDWARE</strong><br><sub>(x86-64 · ARM64 · platform specifications)</sub></td>
</tr>
</table>

**Note:** Docker Compose is the current deployment path. Phase 2 targets are not claims that every target is already built or validated.

**Reference:** [Docker](https://docs.docker.com/) · [Docker Compose](https://docs.docker.com/compose/)

### 2. Configure the deployment

```text
.env.example
      │
      ▼
     .env
      │
      ▼
Docker Compose
```

**Command**

```bash
cp .env.example .env
```

Set the required values:

```env
SQL_ADMIN_USER
SQL_ADMIN_PASSWORD
SQL_DB_NAME
SQL_HOST
SQL_USER
SQL_PASSWORD
C107_AUTH_SECRET
APP_URL
```

**Note:** Use the values required by the current Compose configuration. Do not commit local secrets.

**Reference:** [Docker Compose environment variables](https://docs.docker.com/compose/how-tos/environment-variables/)

### 3. Start the deployment

```text
docker compose up -d
        │
        ├── PostgreSQL
        │
        ├── migration
        │
        └── Cloud107 :3000
```

**Command**

```bash
docker compose up -d
```

**Note:** PostgreSQL starts first. The migration service waits for database health, then Cloud107 starts after the migration completes successfully.

**Expected result:** The Cloud107 container is running on port `3000`.

**Reference:** [docker compose up](https://docs.docker.com/reference/cli/docker/compose/up/)

### 4. Check the deployment

```text
Docker Compose
      │
      ├── container status
      └── Cloud107 logs
              │
              ▼
        deployment state
```

**Commands**

```bash
docker compose ps
docker compose logs -f cloud107
```

**Note:** Use the container status and Cloud107 logs to verify startup.

**Expected result:** PostgreSQL is healthy, migration completes, and Cloud107 starts without a startup error.

**Reference:** [Docker Compose logs](https://docs.docker.com/reference/cli/docker/compose/logs/)

### 5. Stop the deployment

```text
Cloud107
   │
   ▼
docker compose down
   │
   ▼
Containers stopped
   │
   ▼
PostgreSQL volume retained
```

**Command**

```bash
docker compose down
```

**Note:** The PostgreSQL volume is retained by default. Do not use volume removal commands unless deleting the stored database is intended.

**Reference:** [docker compose down](https://docs.docker.com/reference/cli/docker/compose/down/)

### 6. Build the application image

```text
node:22-alpine
      │
      ▼
npm ci
      │
      ▼
npm run build
      │
      ▼
Cloud107 image
      │
      ▼
node:22-alpine runtime
      │
      ▼
non-root node user
```

**Commands**

```bash
docker compose build
docker compose up -d
```

**Note:** The Dockerfile uses separate build and runtime stages. The runtime image runs the application as the non-root `node` user.

**Expected result:** A production Cloud107 image is built and can be started through Compose.

**Reference:** [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/) · [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)

### 7. Validate a deployment change

```text
Source change
     │
     ├── test
     ├── lint
     └── build
     │
     ▼
Docker build
     │
     ▼
Compose deployment
     │
     ▼
health / logs / status
```

**Commands**

```bash
npm run test
npm run lint
npm run build

docker compose build
docker compose up -d
docker compose ps
```

**Note:** A deployment target is not considered supported only because packaging files exist. Verify the actual target.

**Expected result:** Tests, linting, build, container startup, migration, and application health complete as expected.

**Reference:** [Docker documentation](https://docs.docker.com/) · [Cloud107 runtime](../runtime/)

## Deployment layers

| Layer | Current technology | Role |
|---|---|---|
| Application | Node.js 22, TypeScript, Express | Cloud107 server |
| Database | PostgreSQL 15, SQL, Drizzle | Persistent state |
| Migration | Node.js / npm | Schema migration |
| Container | Docker / Compose | Local deployment topology |
| Host | OS and target architecture | Execution environment |
| Network | HTTP / JSON | Application interface |

**Note:** Standards, specifications, and vendor technologies are documented separately when they are actually used or required.

**Reference:** [Architecture](../architecture/)

## Phase 2 artifact targets

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

| Target | Artifact / delivery form | Architectures | State |
|---|---|---|---|
| Windows | `.msi`, `.exe` | x86_64, ARM64 | Phase 2 target |
| Linux | `.deb` | x86_64, ARM64 | Phase 2 target |
| IoT | Device-specific image/package | Target-dependent | Phase 2 target |
| Apple | Native application/package | ARM64, x86_64 | Phase 2 target |
| Web | GitHub Pages-hosted website | Browser | Phase 2 target |
| WSL | Microsoft Store distribution | Target-dependent | Phase 2 target |

**Note:** These are delivery targets, not verified support claims. Artifact availability, signing, installer behavior, hardware compatibility, and runtime behavior must be checked separately for each target.

**Reference:** [Docker](https://docs.docker.com/) · [GitHub Pages](https://docs.github.com/en/pages)

## User interface targets

```text
Cloud107 capability
        │
        ├── Web ────────► Browser workspace
        ├── Windows ────► Desktop/workspace target
        ├── Linux ──────► Desktop/workspace target
        ├── Apple ──────► Native/platform target
        ├── WSL ────────► Workspace + terminal target
        └── IoT / MCU ──► Runtime/control interface
```

**Note:** IoT and microcontroller targets do not require the graphical Cloud107 workspace. Resource-constrained devices can expose capabilities through the control/runtime interface.

**Reference:** [Design](../design/) · [Web APIs — MDN](https://developer.mozilla.org/en-US/docs/Web/API)

## Deployment boundary

```text
Cloud107 application
        │
        ▼
Container / package
        │
        ▼
Target OS / runtime
        │
        ▼
Hardware architecture
```

Node coordination, additional deployment targets, and platform-specific packaging should be documented here only when the corresponding implementation is present and verified.

**Note:** A package existing in the repository does not by itself establish platform support.

**Reference:** [Architecture](../architecture/) · [Environments](../environments/)
