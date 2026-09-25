# Environments

Prepared environments, toolchains, dependencies, reproducibility, and validation.

## Environment architecture

```text
                         Cloud107
                            │
                            ▼
                    Environment definition
                            │
             ┌──────────────┼──────────────┐
             ▼              ▼              ▼
         Toolchain      Dependencies    Runtime
             │              │              │
             └──────────────┼──────────────┘
                            ▼
                     Prepared environment
                            │
                            ▼
                         Workload
                            │
                            ▼
                       Validation
```

**Note:** An environment combines the tools, dependencies, runtime, and configuration required by a workload. The repository should record enough information to reproduce and validate the environment where that information is implemented.

## Current implementation boundary

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

## Environment validation

```bash
npm ci
npm run lint
npm test
npm run build
```

For containerized validation:

```bash
docker compose up -d
docker compose ps
docker compose logs -f cloud107
```

**Note:** Validate both the application checks and the deployment environment when an environment change affects containers, dependencies, or runtime behavior.

## Reproducibility

Environment reproducibility depends on:

- repository source revision
- package lockfile
- declared configuration
- database migration state
- container build definition
- target platform and architecture

The repository should not claim reproducibility beyond the information and validation actually available.

## Standards and references

Environment documentation should distinguish:

- programming languages
- runtimes and frameworks
- package/build tooling
- container formats and runtimes
- operating-system interfaces
- standards and specifications
- vendor technologies

**Note:** Add a specific standard or external reference only when the environment actually uses or depends on it.
