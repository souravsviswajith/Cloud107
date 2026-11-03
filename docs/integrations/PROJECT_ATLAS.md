# Project Atlas integration

Project Atlas Bootstrap is registered in Cloud107 as a **plan-only** integration.

## Contract

- Integration ID: `107.project-atlas`
- Contract version: `1`
- Source repository: `https://github.com/souravsviswajith/Project-Atlas-Bootstrap`
- Source revision: `d11f9f2d8893c0dc795a85d539fae760a34e9428`
- Capability: `workstation.plan.preview`
- Input: Atlas declarative configuration schema v1
- Output: Atlas deterministic preview plan
- Execution permission: none

## What is connected

Cloud107's registry exposes the integration descriptor and its provenance through
`GET /api/v1/107/ecosystem/integrations` and
`GET /api/v1/107/ecosystem/integrations/107.project-atlas`.

Atlas currently validates versioned declarative intent and produces a deterministic
dependency-first preview. It is a static frontend; there is no native installer,
host detector, provisioning API, or connected executor in the inspected source.
Consequently Cloud107 does not claim to invoke Atlas or install workstation tools.

## Next adapter boundary

A future executable adapter requires an explicit Atlas-owned machine interface
(CLI or local service), a shared versioned request/response schema, user-mediated
authorization, dry-run support, cancellation, and verifiable execution reports.
Do not infer execution capability from a preview plan or checklist state.

## Provenance

The source revision is pinned in the registry so that the contract can be
reconciled against a known upstream state. Update it only after reviewing the
Atlas changes and confirming compatibility.