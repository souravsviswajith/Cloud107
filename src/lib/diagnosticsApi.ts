/**
 * Diagnostics API layer.
 *
 * Typed client for the control-plane health contract:
 *   GET /api/v1/health -> 200 { status: 'ok', database: 'connected' }
 *                      -> 503 { error: 'Database connection failed' }
 *
 * This module intentionally uses its own fetch instead of the shared apiClient:
 * diagnostics needs transport-level facts the envelope client abstracts away
 * (HTTP status code, correlation headers, client-observed timing). Every such
 * fact is labelled as client-observed at the presentation layer and is never
 * relabelled as subsystem latency.
 */

export interface ControlPlaneHealthOk {
  kind: 'ok';
  /** Raw `status` field from the response body (interpreted by the presentation layer). */
  status: unknown;
  /** Raw `database` field from the response body (interpreted by the presentation layer). */
  database: unknown;
  /** Client-observed round-trip time in milliseconds (NOT subsystem latency). */
  requestMs: number;
  /** Correlation/request id echoed by the control plane, when present. */
  correlationId: string | null;
  /** Raw response body, for the raw-payload inspector. */
  raw: unknown;
}

export interface ControlPlaneHealthHttpError {
  kind: 'http-error';
  statusCode: number;
  message: string;
  requestMs: number;
  correlationId: string | null;
  raw: unknown;
}

export interface ControlPlaneHealthUnreachable {
  kind: 'unreachable';
  message: string;
}

export type ControlPlaneHealthSnapshot =
  ControlPlaneHealthOk | ControlPlaneHealthHttpError | ControlPlaneHealthUnreachable;

const HEALTH_TIMEOUT_MS = 15000;

function readCorrelationId(headers: Headers): string | null {
  return headers.get('x-correlation-id') ?? headers.get('x-request-id');
}

export async function fetchControlPlaneHealth(): Promise<ControlPlaneHealthSnapshot> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  const startedAt = performance.now();
  try {
    const response = await fetch('/api/v1/health', { signal: controller.signal });
    const requestMs = Math.round(performance.now() - startedAt);
    const correlationId = readCorrelationId(response.headers);
    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    if (!response.ok) {
      const message =
        typeof body === 'object' &&
        body !== null &&
        'error' in body &&
        typeof (body as { error?: unknown }).error === 'object' &&
        (body as { error?: unknown }).error !== null &&
        typeof (body as { error: { message?: unknown } }).error.message === 'string'
          ? ((body as { error: { message: string } }).error.message as string)
          : `Control plane responded with HTTP ${response.status}`;
      return {
        kind: 'http-error',
        statusCode: response.status,
        message,
        requestMs,
        correlationId,
        raw: body,
      };
    }
    const data =
      typeof body === 'object' && body !== null && 'data' in body
        ? (body as { data?: unknown }).data
        : null;
    const record =
      typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : null;
    return {
      kind: 'ok',
      status: record?.status,
      database: record?.database,
      requestMs,
      correlationId,
      raw: body,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { kind: 'unreachable', message: 'Control plane did not respond within 15 seconds.' };
    }
    return { kind: 'unreachable', message: 'Control plane is unreachable from this browser.' };
  } finally {
    clearTimeout(timeout);
  }
}
