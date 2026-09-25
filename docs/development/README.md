# Development

Development setup, testing, repository workflow, and contribution details.

## Development flow

```text
Source repository
      │
      ▼
Node.js / TypeScript project
      │
      ├── Web workspace
      │    React / TypeScript / Vite
      │
      ├── API server
      │    Express / TypeScript
      │
      ├── c107 CLI
      │    TypeScript / Node.js
      │
      └── Database
           PostgreSQL / Drizzle
      │
      ▼
Checks
 ├── lint
 ├── format
 ├── test
 └── build
      │
      ▼
Development artifact
```

**Note:** The repository is developed as one application with separate web, API, CLI, and database boundaries. The diagram shows the current implementation rather than a target stack.

## Languages and stack

| Area | Current implementation |
|---|---|
| Web | React, TypeScript, Vite, HTML/CSS |
| API | Node.js, Express, TypeScript |
| CLI | TypeScript, Node.js |
| Database | PostgreSQL, SQL, Drizzle |
| Core | C#, .NET |
| Scripts | Shell / repository tooling |

**Note:** Subsystems can use another language or runtime when their requirements justify it. The project does not require one language across every layer.

## Development commands

### Install dependencies

```bash
npm ci
```

**Note:** Installs the versions recorded by the repository lockfile.

### Start development mode

```bash
npm run dev
```

**Note:** Starts the development application with the repository's development configuration.

### Run checks

```bash
npm run lint
npm run format
npm test
npm run build
```

**Note:** Run the checks before treating a change as ready for integration.

## Database

```text
Application
    │
    ▼
Drizzle
    │
    ▼
PostgreSQL
    ▲
    │
npm run db:migrate
```

```bash
npm run db:migrate
```

**Note:** Apply the repository database migrations before using features that require the current schema.

## Repository workflow

```text
Change
  ↓
Inspect affected boundary
  ↓
Implement smallest required change
  ↓
Run checks
  ↓
Review diff
  ↓
Commit
```

**Note:** Keep changes scoped to the affected subsystem and preserve the existing architecture unless an architectural decision explicitly changes it.

## Standards and references

Development tooling uses the repository's language, runtime, package, database, version-control, and operating-system interfaces. Specific external standards or vendor technologies should be documented only when the implementation actually depends on them.

- Git/GitHub: source and version-control workflow.
- PostgreSQL: database implementation.
- Node.js/npm: JavaScript runtime and package workflow.
- POSIX-compatible shell tooling: where repository scripts require it.

**Note:** Vendor products are not presented as standards. Standards bodies and actual specifications should be named only at the point where Cloud107 uses or depends on them.
