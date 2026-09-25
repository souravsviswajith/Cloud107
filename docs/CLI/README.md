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

```text
Terminal
   │
   ▼
npm run c107
   │
   ▼
c107 process
```

**Command**

```bash
npm run c107
```

**Note:** Run the CLI from the Cloud107 source checkout so it uses the repository's configured runtime and dependencies.

**Expected result:** The configured `c107` CLI starts and displays its available command behavior.

**Reference:** [npm scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) · [Node.js CLI](https://nodejs.org/api/cli.html)

### 3. Inspect CLI commands

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

**Note:** These commands expose the CLI help and version information through the repository script.

**Expected result:** The CLI prints the configured help or version output.

**Reference:** [Node.js command-line options](https://nodejs.org/api/cli.html)

### 4. Run the update operation

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
 ├── validation
 ├── health
 ├── activation
 └── rollback
```

**Command**

```bash
npm run c107:update
```

**Note:** The update operation uses the source-first verification pipeline documented in `docs/updates/`.

**Expected result:** The configured verification and update stages execute and a failed required check stops successful activation.

**Reference:** [Updates](../updates/) · [The Update Framework](https://theupdateframework.io/)

### 5. CLI boundary

```text
Terminal
   │
   ▼
c107 process
   │
   ├── command parsing
   ├── configuration
   ├── operation
   └── update pipeline
   │
   ▼
Cloud107 API / runtime
```

**Note:** The CLI should report operation state returned by Cloud107 rather than inventing runtime, node, resource, billing, or health information.

**Reference:** [APIs](../APIs/) · [Operations](../operations/)

### 6. Interface map

| Part | Current technology | Interface |
|---|---|---|
| CLI | TypeScript / Node.js | Terminal / process |
| API control | Express / TypeScript | HTTP / JSON |
| Update source | Git / repository tooling | Source revision / metadata |
| Local scripts | Shell / npm | Process execution |

```text
Terminal
   │
   ▼
TypeScript / Node.js
   │
   ├── process / terminal
   ├── HTTP / JSON
   └── Git / update metadata
```

**Note:** Protocols, standards, and platform APIs should be listed only when the implementation explicitly depends on them.

**Reference:** [TypeScript](https://www.typescriptlang.org/docs/) · [Node.js](https://nodejs.org/docs/latest/api/) · [Git](https://git-scm.com/doc)

### 7. Validate CLI changes

```text
CLI change
    │
    ├── lint
    ├── test
    └── build
    │
    ▼
Validated CLI
```

**Commands**

```bash
npm run lint
npm test
npm run build
```

**Note:** Validate the CLI and API boundary together when a command changes API interaction.

**Expected result:** The configured checks complete successfully.

**Reference:** [Vitest](https://vitest.dev/) · [ESLint](https://eslint.org/docs/latest/)

## Current command surface

| Command | Purpose |
|---|---|
| `npm run c107` | Start the CLI |
| `npm run c107 -- --help` | Display CLI help |
| `npm run c107 -- --version` | Display CLI version |
| `npm run c107:update` | Run the update operation |

**Note:** This table describes the currently documented command surface. Planned commands should remain marked as planned until implemented and verified.

**Reference:** [Cloud107 updates](../updates/)
