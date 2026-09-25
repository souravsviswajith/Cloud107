# Operations

Execution events, logs, health, recovery, monitoring, and troubleshooting.

## Operations architecture

<table>
<tr>
<td align="center"><strong>Cloud107</strong><br><sub>Cloud107 Core</sub></td>
<td>→</td>
<td align="center"><strong>Operation</strong><br><sub>Runtime action</sub></td>
</tr>
<tr><td colspan="3" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Logging</strong><br><sub>Request context · correlation IDs</sub></td>
<td align="center"><strong>Metrics</strong><br><sub>Recorded runtime measurements</sub></td>
<td align="center"><strong>Health</strong><br><sub>HTTP · JSON</sub></td>
</tr>
<tr><td colspan="3" align="center">↓</td></tr>
<tr><td colspan="3" align="center"><strong>Runtime observation</strong></td></tr>
<tr><td colspan="3" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Diagnose</strong></td>
<td align="center"><strong>Recover</strong></td>
<td align="center"><strong>Report</strong></td>
</tr>
<tr><td colspan="3" align="center">↓</td></tr>
<tr><td colspan="3" align="center"><strong>Actual state</strong></td></tr>
</table>

**Note:** Operations should describe what the runtime is actually doing. Logs, metrics, health results, and recovery actions should come from the implemented system.

## Implementation and interface map

<table>
<tr>
<th>Area</th>
<th>Technology</th>
<th>Implemented boundary</th>
</tr>
<tr>
<td>Application</td>
<td>Node.js · TypeScript · Express</td>
<td>HTTP request context · structured request logging · API health endpoint</td>
</tr>
<tr>
<td>State</td>
<td>PostgreSQL · Drizzle</td>
<td>Persistent application state</td>
</tr>
<tr>
<td>CLI</td>
<td>c107 · TypeScript · Node.js</td>
<td>Operational and update control</td>
</tr>
<tr>
<td>Update pipeline</td>
<td>TypeScript · Node.js</td>
<td>Ed25519 verification · SHA-256 verification · checkpoint / rollback</td>
</tr>
</table>

**Note:** The operational layer observes and reports implemented runtime state. It should not manufacture health, resource, billing, or recovery results.

### Interface references

| Boundary | Current technology | Interface / mechanism |
|---|---|---|
| Client → application | HTTP · Express | Request / response |
| Request → logs | TypeScript · request context | Correlation and request IDs |
| Application → database | Drizzle · PostgreSQL | SQL |
| Health → client | Express · TypeScript | HTTP / JSON |
| Update → verification | TypeScript · Node.js | Ed25519 / SHA-256 |

**Note:** Standards and external technologies should be named only where the implementation actually depends on them. Vendor products are not standards.

## Request and event flow

<table>
<tr>
<td align="center"><strong>HTTP / CLI operation</strong></td>
<td>→</td>
<td align="center"><strong>Request context</strong><br><sub>Correlation ID · request ID · timing</sub></td>
<td>→</td>
<td align="center"><strong>Application operation</strong></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Structured logging</strong></td>
<td>+</td>
<td align="center"><strong>Metrics</strong></td>
<td>+</td>
<td align="center"><strong>State change</strong></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr><td colspan="5" align="center"><strong>Observed result</strong></td></tr>
</table>

The request context and correlation identifiers allow related operational records to be connected.

## Health

The application exposes:

```text
GET /api/v1/health
```

**Note:** Health information should reflect the application and connected resources. A UI health indicator is not evidence of service health by itself.

## Logging

The application uses request logging and request context information to correlate operations.

Operational troubleshooting should use the recorded request/correlation identifiers when available.

## Recovery

Recovery behavior belongs to the implemented runtime/update boundaries.

For updates:

<table>
<tr>
<td align="center"><strong>Checkpoint</strong></td>
<td>→</td>
<td align="center"><strong>Activation</strong></td>
</tr>
<tr><td colspan="3" align="center">↙ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ↘</td></tr>
<tr>
<td align="center"><strong>Failure → rollback</strong></td>
<td></td>
<td align="center"><strong>Success → commit</strong></td>
</tr>
</table>

**Note:** Recovery should be tied to a defined checkpoint or runtime recovery mechanism. Do not describe an unimplemented automatic recovery path as available.

## Troubleshooting flow

<table>
<tr>
<td align="center"><strong>Observed problem</strong></td>
<td>→</td>
<td align="center"><strong>Check health</strong></td>
<td>→</td>
<td align="center"><strong>Inspect logs / correlation ID</strong></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Identify boundary</strong></td>
<td>→</td>
<td align="center"><strong>Reproduce / validate</strong></td>
<td>→</td>
<td align="center"><strong>Smallest corrective change</strong></td>
</tr>
<tr><td colspan="5" align="center">↓</td></tr>
<tr>
<td align="center"><strong>Run checks</strong></td>
<td>→</td>
<td colspan="3" align="center"><strong>Verify actual state</strong></td>
</tr>
</table>

## AI-assisted diagnosis

The same operational interface can be used by an AI agent without giving the agent direct authority over infrastructure state.

| Stage | Interface | Purpose |
|---|---|---|
| Inspect | c107 | Query current state |
| Diagnose | c107 + recorded results | Narrow the affected boundary |
| Act | c107 | Request a supported operation |
| Verify | c107 | Confirm actual resulting state |

**Note:** The AI agent interprets operational results and selects subsequent commands. Cloud107 remains authoritative for infrastructure state and execution.

## Current implementation map

| Area | Current technology | Role |
|---|---|---|
| Application | Node.js / TypeScript / Express | Runtime |
| Logging | Request logging / request context | Operational records |
| Database | PostgreSQL / Drizzle | Persistent state |
| Health | Express API | Service health endpoint |
| Updates | TypeScript / Node.js | Verification and recovery pipeline |
| CLI | c107 / TypeScript / Node.js | Operational control |

**Note:** Add a specific monitoring, observability, or vendor technology only when the implementation actually uses it.

## Scope

This page documents the operational boundaries currently present in the repository. New monitoring, recovery, or automation behavior should be documented after implementation and validation.
