import { z } from 'zod';

const healthSchema = z.object({
  status: z.literal('ok'),
  runtime: z.string().min(1),
}).passthrough();

const catalogSchema = z.record(z.string(), z.unknown());

export class Career107AdapterError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'Career107AdapterError';
  }
}

/**
 * Read-only bridge to a Career107 runtime on the same machine.
 * Only /api/health and /api/catalog are exposed. Session and answer data
 * are never proxied and no mutation request is sent.
 */
export class Career107LocalAdapter {
  private readonly baseUrl: URL;

  constructor(baseUrl: string) {
    let parsed: URL;
    try {
      parsed = new URL(baseUrl);
    } catch (error) {
      throw new Career107AdapterError('Career107 base URL must be a valid URL', { cause: error });
    }

    // Numeric loopback literals avoid DNS-based SSRF and rebinding concerns.
    const loopbackHosts = new Set(['127.0.0.1', '[::1]']);
    if (
      parsed.protocol !== 'http:' ||
      !loopbackHosts.has(parsed.hostname) ||
      parsed.username !== '' ||
      parsed.password !== '' ||
      parsed.search !== '' ||
      parsed.hash !== '' ||
      (parsed.pathname !== '' && parsed.pathname !== '/')
    ) {
      throw new Career107AdapterError('Career107 adapter only permits an HTTP numeric loopback base URL');
    }

    this.baseUrl = parsed;
  }

  async health(): Promise<z.infer<typeof healthSchema>> {
    return healthSchema.parse(await this.get('/api/health'));
  }

  async catalog(): Promise<Record<string, unknown>> {
    return catalogSchema.parse(await this.get('/api/catalog'));
  }

  private async get(path: '/api/health' | '/api/catalog'): Promise<unknown> {
    const url = new URL(path, this.baseUrl);
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'GET',
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal: AbortSignal.timeout(3000),
      });
    } catch (error) {
      throw new Career107AdapterError('Career107 local runtime is unavailable', { cause: error });
    }

    if (!response.ok) {
      throw new Career107AdapterError(`Career107 returned HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Career107AdapterError('Career107 returned a non-JSON response');
    }

    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > 256 * 1024) {
      throw new Career107AdapterError('Career107 metadata response exceeded 256 KiB');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Career107AdapterError('Career107 returned an empty response stream');
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 256 * 1024) {
        await reader.cancel();
        throw new Career107AdapterError('Career107 metadata response exceeded 256 KiB');
      }
      chunks.push(value);
    }
    const body = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }

    try {
      return JSON.parse(new TextDecoder().decode(body)) as unknown;
    } catch (error) {
      throw new Career107AdapterError('Career107 returned invalid JSON', { cause: error });
    }
  }
}
