# HyperCloud first deployment slice

## Goal

Prove one end-to-end workload path before migrating the wider 107 ecosystem:

`HyperCloud workload contract → local runtime adapter → Docker Compose → PostgreSQL → migration → Cloud107 web/API → local endpoint`

This slice reuses the repository's current Compose deployment rather than replacing the application architecture or claiming that every ecosystem project is already deployable.

## Workload contract

The reference contract is `hypercloud/workloads/cloud107.json`.

- HyperCloud is the intended lifecycle owner.
- Docker Compose is the first runtime adapter, not a mandatory runtime for all future workloads.
- PostgreSQL remains private to the Compose network and its named volume persists across ordinary `docker compose down`.
- Database migration must complete successfully before Cloud107 starts.
- Local secrets are generated only when `.env` does not exist. Existing configuration is never overwritten.
- Remote nodes and cloud providers are extension points only; they are not implemented by this slice.

## Prerequisites

- Docker Engine with the Compose v2 plugin, or Docker Desktop on Windows.
- Node.js 22 or newer to run the launcher.
- The repository checked out locally.

## Start

From the repository root:

```bash
node scripts/hypercloud-up.mjs
```

The launcher validates the workload contract, creates a private `.env` with random secrets if one does not exist, validates Compose configuration, builds and starts the workload, and waits for the local HTTP endpoint.

If an existing `.env` contains placeholder or missing required secrets, the launcher stops and asks the operator to correct it. It does not overwrite existing secrets.

Open <http://localhost:3000/>.

## Inspect and stop

```bash
docker compose ps
docker compose logs --tail=200 cloud107
docker compose logs --tail=200 cloud107-migrate
docker compose down
```

The ordinary stop command retains the database volume. Do not use `docker compose down --volumes` unless database deletion is intended and a verified backup exists.

## Validation boundary

A successful launcher confirms that Compose configuration is accepted, the containers can be started, and the web root returns a successful HTTP response. It does **not** prove that every API path, auth flow, migration rollback, backup restore, remote node, cloud deployment, or production security control is verified.

Before public exposure, add TLS termination, explicit access control, secret management, backup/restore drills, resource limits, and deployment rollback validation. Do not expose PostgreSQL publicly.

## Next integration stages

1. Add a HyperCloud runtime interface and a real workload state store; do not treat the manifest alone as an orchestrator.
2. Add conformance tests for start, health, stop, failure, restart, and cleanup.
3. Register existing ecosystem projects as separate workload contracts, preserving their repositories and service boundaries.
4. Add remote-node and cloud adapters only after identity, trust, transport security, authorization, and artifact provenance are specified.
5. Keep optional cloud services opt-in and avoid cloud-specific dependencies in the portable local core.
