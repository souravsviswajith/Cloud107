# Updates

Cloud107 includes a source-first update path with provenance checks, cryptographic verification, compatibility checks, checkpoints, activation, health checks, and rollback.

This page describes the current update implementation. Development/test manifest behavior must not be presented as a production signed release.

## Guide

### 1. Update architecture

<table>
<tr>
<td colspan="4" align="center"><strong>CLOUD107 UPDATE SYSTEM</strong></td>
</tr>
<tr>
<td colspan="4" align="center"><strong>UPDATE MANIFEST</strong><br><sub>(Version · revision · target · schema · hashes · key ID · signature · JSON)</sub></td>
</tr>
<tr>
<td align="center"><strong>PROVENANCE</strong><br><sub>(Git / source revision)</sub></td>
<td align="center"><strong>SIGNATURE</strong><br><sub>(Ed25519 · RFC 8032)</sub></td>
<td align="center"><strong>HASH</strong><br><sub>(SHA-256 · FIPS 180-4)</sub></td>
<td align="center"><strong>COMPATIBILITY</strong><br><sub>(Version · platform · architecture · schema)</sub></td>
</tr>
<tr>
<td colspan="4" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>CHECKPOINT</strong><br><sub>(Recovery state)</sub></td>
<td align="center"><strong>STAGE</strong><br><sub>(Artifact preparation)</sub></td>
<td align="center"><strong>BUILD</strong><br><sub>(Node.js / project build)</sub></td>
<td align="center"><strong>VALIDATE</strong><br><sub>(Configured checks)</sub></td>
</tr>
<tr>
<td colspan="4" align="center">↓</td>
</tr>
<tr>
<td align="center"><strong>HEALTH</strong><br><sub>(Runtime verification)</sub></td>
<td align="center"><strong>ACTIVATE</strong><br><sub>(Atomic activation)</sub></td>
<td align="center"><strong>COMMIT</strong><br><sub>(Accepted state)</sub></td>
<td align="center"><strong>ROLLBACK</strong><br><sub>(Previous checkpoint)</sub></td>
</tr>
</table>

**Note:** The update path verifies source and artifact information before activation, then uses a checkpoint so a failed update can return to the previous state.

**Reference:** [The Update Framework](https://theupdateframework.io/) · [Architecture](../architecture/)

### 2. Run the update pipeline

```text
c107
 │
 ▼
Update manager
 │
 ├── metadata
 ├── provenance
 ├── signature
 ├── hash
 ├── compatibility
 ├── checkpoint
 ├── stage
 ├── build
 ├── validate
 ├── health
 ├── activate
 └── rollback
```

**Command**

```bash
npm run c107:update
```

**Note:** Run the update operation from the source checkout.

**Expected result:** The configured update stages execute in sequence and stop when a required verification or compatibility check fails.

**Reference:** [CLI](../CLI/) · [The Update Framework](https://theupdateframework.io/)

### 3. Update manifest

```text
Update manifest
     │
     ├── version
     ├── source revision
     ├── timestamp
     ├── channel
     ├── minimum supported version
     ├── schema version
     ├── target platform
     ├── target architecture
     ├── canonical origin
     ├── artifact hashes / sizes
     ├── signing key ID
     └── signature
```

Supported channels:

| Channel | Meaning |
|---|---|
| `stable` | Stable release channel |
| `beta` | Beta release channel |
| `nightly` | Development/nightly channel |

**Note:** The manifest carries the information needed to identify the update and evaluate compatibility and verification requirements.

**Reference:** [The Update Framework](https://theupdateframework.io/) · [JSON Schema](https://json-schema.org/learn/getting-started-step-by-step)

### 4. Verify an update

```text
Update
  │
  ├── canonical origin
  ├── provenance
  ├── Ed25519 signature
  ├── SHA-256 hash
  └── compatibility
       │
       ▼
   Verification result
```

**Command**

```bash
npm run c107:update
```

The update path checks:

1. Canonical source/artifact origin.
2. Manifest provenance.
3. Ed25519 manifest signature.
4. SHA-256 artifact hashes.
5. Version, platform, architecture, and schema compatibility.

**Note:** The update manager fails closed when a required verification or compatibility step fails.

**Expected result:** An update that fails a required verification or compatibility check does not continue as a successful activation.

**Reference:** [Ed25519 — RFC 8032](https://www.rfc-editor.org/rfc/rfc8032) · [SHA-2 — FIPS 180-4](https://csrc.nist.gov/pubs/fips/180-4/upd1/final)

### 5. Recovery checkpoint

```text
Verified update
      │
      ▼
Checkpoint
      │
      ├── created
      ├── staged
      ├── activated
      ├── committed
      └── rolled_back
```

A checkpoint is created before activation.

**Note:** If the update fails after a checkpoint has been created, the pipeline attempts to restore the previous state from that checkpoint.

**Expected result:** The checkpoint state records the update recovery state.

**Reference:** [Updates](../updates/)

### 6. Update pipeline

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

**Note:** The implementation is in `src/cli/update/`.

**Expected result:** The pipeline either reaches the commit state or follows its failure/rollback path.

**Reference:** [c107 CLI](../CLI/) · [Git documentation](https://git-scm.com/doc)

### 7. Check update status

```text
Client
  │
  ▼
GET /api/v1/updates/status
  │
  ▼
Update status
```

**Command**

```bash
curl http://localhost:3000/api/v1/updates/status
```

**Note:** The endpoint reports the current version and runtime environment, checkpoint count and latest checkpoint, and the configured update-manager verification and rollback model.

**Expected result:** The running Cloud107 instance returns its current update status.

**Reference:** [APIs](../APIs/) · [HTTP overview — MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)

### 8. Implementation map

| Part | Current implementation | Purpose |
|---|---|---|
| Update manager | TypeScript / Node.js | Pipeline execution |
| Source metadata | Update manifest | Version and compatibility data |
| Signature | Ed25519 | Manifest authenticity check |
| Artifact integrity | SHA-256 | Artifact hash verification |
| Repository source | Git / GitHub workflow | Source revision and provenance |
| API | Express / TypeScript | Update status endpoint |
| CLI | c107 / TypeScript / Node.js | Update operation |

**Note:** Cryptographic algorithms and repository protocols are part of the verification boundary. Development/test manifests must not be presented as production release signatures.

**Reference:** [Node.js](https://nodejs.org/docs/latest/api/) · [Git](https://git-scm.com/doc) · [RFC Editor](https://www.rfc-editor.org/)

## Important implementation note

```text
Development / test manifest
          │
          ▼
Not automatically a production release
```

The current update pipeline contains built-in/default manifest behavior for development and testing.

**Note:** A release should only be treated as externally verified when its actual manifest, signature, artifacts, and canonical source have been produced and verified through the intended release process. Placeholder release metadata must not be described as a real signed release.

**Reference:** [The Update Framework](https://theupdateframework.io/)
