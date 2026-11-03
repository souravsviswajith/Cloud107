# Browser107

Browser107 is the browser-facing product surface in the 107 ecosystem. It must remain a distinct subsystem and integrate with Cloud107 through explicit interfaces; it must not become a second workload scheduler or execution-environment manager.

## Current repository baseline

The existing workspace includes `src/components/launch/apps/BrowserApp.tsx`, a React iframe-based browser-like workspace. An iframe is **not** a full browser engine: it cannot reliably render sites that prohibit framing, does not expose browser-grade navigation/history, and inherits the embedding application's security constraints. The current component also contains hard-coded domain blocking and simulated refresh behavior. These limitations must not be represented as production browser capabilities.

## Target architecture

- **Browser shell (React / TypeScript):** tabs, address bar, navigation controls, downloads UI, settings and accessibility.
- **Browser host (desktop runtime, separately packaged):** Chromium Embedded Framework (CEF) or another explicitly selected supported engine. The engine choice is an architecture decision to validate against target OSes, update cadence, licensing, binary size and security support.
- **Content isolation:** each page runs in the engine's site-isolation/sandbox model. Renderer content must not receive privileged host APIs.
- **Privileged bridge:** a narrow, typed IPC interface with schema validation, origin-aware authorization and least privilege. No arbitrary shell execution or unrestricted filesystem access from page content.
- **Profile services:** cookies, cache, history, bookmarks and permissions are owned by the browser host/profile layer, not by arbitrary React state.
- **Cloud107 integration:** optional control and telemetry use existing authenticated APIs and capability contracts. Browser107 does not own global scheduling, node placement, or environment provisioning.
- **Update path:** signed, provenance-checked artifacts; staged activation and rollback follow the established update verification pipeline.

## Delivery phases

1. **Foundation (current):** define subsystem boundary, identify the existing iframe prototype and establish URL normalization tests.
2. **Usable shell:** real back/forward history, navigation state, tab model, loading/error states and accessible controls.
3. **Native engine integration:** select and package the engine; replace iframe navigation for production use.
4. **Security and profiles:** sandbox/permissions, origin policy, cookie/storage partitioning, download handling, safe external protocol handling and secure IPC.
5. **Quality and release:** unit/integration tests, cross-platform build matrix, dependency and license checks, signed artifacts and rollback verification.

## Non-goals

- Reimplementing the web platform, JavaScript engine, TLS stack, or HTML/CSS standards from scratch.
- Treating an iframe as equivalent to Chromium or Firefox.
- Bypassing websites' framing policies or weakening their security headers.
- Exposing Cloud107 credentials or privileged host operations to page JavaScript.

## Acceptance criteria

- URL input accepts only explicit `http:` and `https:` destinations; unsupported schemes are rejected.
- Back/forward operate on an explicit navigation history model.
- Web content has no direct Node.js, filesystem, process, or Cloud107 credential access.
- IPC validates message shape and authorization at the host boundary.
- Browser engine and third-party notices are shipped with release artifacts.
- CI runs lint, type-check, unit tests, build, dependency auditing and license review.
- Documentation distinguishes verified implementation from planned capability.

## Status

Architecture foundation documented. Native engine selection, packaging, runtime isolation, full navigation and release validation remain implementation work; this document does not claim they are complete.
