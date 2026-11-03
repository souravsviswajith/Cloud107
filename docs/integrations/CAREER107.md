# Career Assessment 107 integration

HyperCloud107 can discover a local Career Assessment 107 runtime and read its
health and public catalog metadata. This is intentionally a read-only bridge.

## Start Career107

From the `psychometric-assessment-107` repository:

```bash
(cd web && npm ci && npm run build)
go run ./cmd/career107 -addr 127.0.0.1:8080 -data ./data
```

The Go server defaults to loopback. Do not bind it to a public interface for
this integration.

## Configure HyperCloud107

Set the following server-side environment variable:

```bash
CAREER107_BASE_URL=http://127.0.0.1:8080
```

Restart HyperCloud107 after changing the environment.

## Read-only endpoints

The integration routes are mounted under `/api/v1/107/ecosystem`:

| Route | Behavior |
| --- | --- |
| `GET /integrations` | Lists registered 107 integrations and declared capabilities. |
| `GET /integrations/107.career-assessment` | Returns the Career107 integration contract. |
| `GET /career107/health` | Reads Career107 `/api/health`. |
| `GET /career107/catalog` | Reads Career107 `/api/catalog`. |

The adapter accepts numeric loopback targets only (`127.0.0.1` or `[::1]`),
uses GET requests only, rejects redirects, enforces a three-second timeout,
requires JSON, and caps metadata responses at 256 KiB.

## Data boundary

The bridge does not expose `/api/session`, capture, answer, review, reset, or
research mutation endpoints. Assessment answers and session journals remain
inside Career107. HyperCloud receives only health and static public catalog
metadata. This adapter does not authorize remote assessment execution.

## Current limitations

- Both runtimes must be reachable from the same network namespace and host.
- Career107 Android's in-process loopback server is not automatically reachable
  from a separate HyperCloud process; a future explicit device-pairing transport
  would be required for that deployment.
- This bridge does not transfer or synchronize assessment data.