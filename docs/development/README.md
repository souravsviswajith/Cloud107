# Development

Development setup, testing, repository workflow, and contribution details.

This page describes the current source-development workflow for Cloud107.

## Guide

### 1. Development flow

<table><tr><td align="center"><strong>Source repository</strong></td><td>→</td><td align="center"><strong>Node.js / TypeScript project</strong></td></tr><tr><td></td><td>↓</td><td>Web: React · TypeScript · Vite<br>API: Express · TypeScript<br>CLI: c107 · TypeScript · Node.js<br>Database: PostgreSQL · Drizzle</td></tr><tr><td align="center"><strong>Checks</strong></td><td>→</td><td>lint · format · test · build</td></tr><tr><td colspan="3" align="center">↓</td></tr><tr><td colspan="3" align="center"><strong>Development artifact</strong></td></tr></table>

**Note:** The repository is developed as one application with separate web, API, CLI, and database boundaries. This diagram shows the current implementation.

**Reference:** [Architecture](../architecture/) · [Node.js](https://nodejs.org/docs/latest/api/) · [TypeScript](https://www.typescriptlang.org/docs/)

### 2. Install dependencies

<table><tr><td align="center"><strong>Cloud107 source</strong></td><td>→</td><td align="center"><strong>package-lock.json</strong></td><td>→</td><td align="center"><strong>npm ci</strong></td><td>→</td><td align="center"><strong>Installed dependencies</strong></td></tr></table>

**Command**

```bash
npm ci
```

**Note:** Install the versions recorded by the repository lockfile.

**Expected result:** Dependencies are installed without changing the lockfile.

**Reference:** [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci)

### 3. Start development mode

<table><tr><td align="center"><strong>Cloud107 source</strong></td><td>→</td><td align="center"><strong>npm run dev</strong></td><td>→</td><td>Web workspace<br>API server</td></tr></table>

**Command**

```bash
npm run dev
```

**Note:** Start the repository's development application using its configured development workflow.

**Expected result:** The development server starts and exposes the configured local workspace/API.

**Reference:** [Vite guide](https://vite.dev/guide/) · [Express documentation](https://expressjs.com/)

### 4. Run development checks

<table><tr><td align="center"><strong>Source change</strong></td><td>→</td><td>lint · format · test · build</td><td>→</td><td align="center"><strong>Checked change</strong></td></tr></table>

**Commands**

```bash
npm run lint
npm run format
npm test
npm run build
```

**Note:** Run the repository checks before treating a change as ready for integration.

**Expected result:** Each configured check completes successfully.

**Reference:** [Vitest](https://vitest.dev/) · [ESLint](https://eslint.org/docs/latest/) · [Vite](https://vite.dev/guide/)

### 5. Database migration

<table><tr><td align="center"><strong>Application</strong></td><td>→</td><td align="center"><strong>Drizzle</strong></td><td>→</td><td align="center"><strong>PostgreSQL</strong></td></tr><tr><td colspan="5" align="center">↑ npm run db:migrate</td></tr></table>

**Command**

```bash
npm run db:migrate
```

**Note:** Apply the repository database migrations before using features that require the current schema.

**Expected result:** PostgreSQL contains the schema required by the current source version.

**Reference:** [Drizzle Kit](https://orm.drizzle.team/docs/kit-overview) · [PostgreSQL documentation](https://www.postgresql.org/docs/)

### 6. Review a change

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

**Commands**

```bash
git status
git diff
git diff --check
```

**Note:** Keep changes scoped to the affected subsystem. Preserve the existing architecture unless an accepted architectural decision changes it.

**Expected result:** The diff contains only the intended changes and has no whitespace errors reported by `git diff --check`.

**Reference:** [Git documentation](https://git-scm.com/doc)

### 7. Languages and stack

| Area | Current implementation |
|---|---|
| Web | React, TypeScript, Vite, HTML/CSS |
| API | Node.js, Express, TypeScript |
| CLI | TypeScript, Node.js |
| Database | PostgreSQL, SQL, Drizzle |
| Core | C#, .NET |
| Scripts | Shell / repository tooling |

```text
Web ──────► React / TypeScript / Vite
API ──────► Node.js / Express / TypeScript
CLI ──────► Node.js / TypeScript
Database ─► PostgreSQL / SQL / Drizzle
Core ─────► C# / .NET
Scripts ──► Shell / repository tooling
```

**Note:** A subsystem can use another language or runtime when its requirements justify it. The project does not require one language across every layer.

**Reference:** [React](https://react.dev/learn) · [TypeScript](https://www.typescriptlang.org/docs/) · [Node.js](https://nodejs.org/docs/latest/api/) · [.NET](https://learn.microsoft.com/en-us/dotnet/) · [PostgreSQL](https://www.postgresql.org/docs/)

## Repository workflow

```text
Issue / task
    │
    ▼
Affected file / boundary
    │
    ▼
Smallest implementation
    │
    ▼
Checks
    │
    ▼
Diff review
    │
    ▼
Commit
```

**Note:** Keep implementation changes small enough to review and verify as one unit.

**Reference:** [GitHub documentation](https://docs.github.com/) · [Git documentation](https://git-scm.com/doc)

## Standards and external technology

```text
Development tool
      │
      ├── Language / runtime
      ├── Package manager
      ├── Database
      ├── Version control
      └── OS / shell interface
```

| Type | Current example |
|---|---|
| Language | TypeScript, C#, SQL, shell |
| Runtime | Node.js, .NET |
| Package manager | npm |
| Database | PostgreSQL |
| Version control | Git |
| Repository platform | GitHub |
| Shell interface | POSIX-compatible tooling where required |

**Note:** Vendor products are not presented as standards. Standards bodies and actual specifications should be named only where Cloud107 uses or depends on them.

**Reference:** [POSIX — The Open Group](https://pubs.opengroup.org/onlinepubs/9699919799/) · [Git](https://git-scm.com/doc) · [GitHub Docs](https://docs.github.com/)
