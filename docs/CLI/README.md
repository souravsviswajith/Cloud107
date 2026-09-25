# CLI

c107 commands, configuration, output, authentication, and update operations.

## CLI architecture

```text
                         c107
                          │
                 TypeScript / Node.js
                          │
          ┌───────────────┼────────────────┐
          ▼               ▼                ▼
       Commands        Config          Update
          │               │                │
          │          environment      verification
          │          / local state    / rollback
          │                                │
          └───────────────┬────────────────┘
                          ▼
                    Cloud107 API
                 HTTP / JSON / Express
                          │
                          ▼
                     Cloud107
```

**Note:** `c107` is the command-line control surface. It can operate against the Cloud107 application boundary and contains the update operation implemented under `src/cli/update/`.

## Current command surface

The repository package scripts expose the CLI through commands including:

```bash
npm run c107
npm run c107:update
```

The update command uses the source-first verification pipeline documented in `docs/updates/`.

## Development

Run the CLI from the source checkout:

```bash
npm run c107
```

Run the update operation:

```bash
npm run c107:update
```

**Note:** Use the repository scripts so the CLI runs with the versions and configuration defined by the project.

## CLI boundary

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

The CLI should report actual operation state returned by Cloud107 rather than inventing runtime, node, resource, billing, or health information.

## Interface references

| Part | Current technology | Interface |
|---|---|---|
| CLI | TypeScript / Node.js | Terminal / process |
| API control | Express / TypeScript | HTTP / JSON |
| Update source | Git / repository tooling | Source revision / metadata |
| Local scripts | Shell / npm | Process execution |

**Note:** Specific protocols, standards, and platform APIs should be added when the implementation explicitly depends on them.

## Validation

After CLI changes:

```bash
npm run lint
npm test
npm run build
```

**Note:** Validate the CLI and the API boundary together when a command changes the API interaction.

## Scope

This page documents the CLI surface currently present in the repository. Planned commands should remain marked as planned until implemented and verified.