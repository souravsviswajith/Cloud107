# Updates

Cloud107 includes a source-first update path with provenance checks, cryptographic verification, compatibility checks, checkpoints, activation, health checks, and rollback.

## Update manifest

An update manifest contains:

- version
- source revision
- timestamp
- update channel
- minimum supported version
- schema version
- target platform
- target architecture
- canonical origin
- artifact hashes and sizes
- signing key ID
- signature

Supported channels are:

- `stable`
- `beta`
- `nightly`

## Verification

The update path checks:

1. Canonical source/artifact origin.
2. Manifest provenance.
3. Ed25519 manifest signature.
4. SHA-256 artifact hashes.
5. Version, platform, architecture, and schema compatibility.

The update manager fails closed when a required verification or compatibility step fails.

## Recovery

A checkpoint is created before activation.

Checkpoint states include:

```text
created
staged
activated
committed
rolled_back
```

If the update fails after a checkpoint has been created, the pipeline attempts to restore the previous state from that checkpoint.

## Update pipeline

The current implementation follows this sequence:

```text
identify origin
      ↓
fetch metadata
      ↓
verify provenance
      ↓
verify signature
      ↓
verify hashes
      ↓
check compatibility
      ↓
create checkpoint
      ↓
stage artifacts
      ↓
build
      ↓
validate
      ↓
stage activation
      ↓
health check
      ↓
atomic activation
      ↓
post-verify
      ↓
commit
```

The implementation is in `src/cli/update/`.

## Status API

Cloud107 exposes:

```text
GET /api/v1/updates/status
```

The endpoint reports the current version and runtime environment, checkpoint count and latest checkpoint, and the configured update-manager verification and rollback model.

## CLI

The repository exposes the update command through `c107`.

From the source checkout:

```bash
npm run c107:update
```

## Important implementation note

The current update pipeline contains built-in/default manifest behavior for development and testing. A release should only be treated as externally verified when its actual manifest, signature, artifacts, and canonical source have been produced and verified through the intended release process.

Do not describe placeholder release metadata as a real signed release.
