import { afterEach, describe, expect, it, vi } from 'vitest';
import { Career107LocalAdapter } from './career107-local-adapter';

describe('Career107LocalAdapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    'https://127.0.0.1:8080',
    'http://localhost:8080',
    'http://example.com',
    'http://127.0.0.1.evil.test',
    'http://user:pass@127.0.0.1:8080',
    'http://127.0.0.1:8080/proxy',
    'http://127.0.0.1:8080/?target=example.com',
  ])('rejects unsafe base URL %s', (baseUrl) => {
    expect(() => new Career107LocalAdapter(baseUrl)).toThrow();
  });

  it.each([
    'http://127.0.0.1:8080',
    'http://[::1]:8080',
  ])('accepts numeric loopback base URL %s', (baseUrl) => {
    expect(() => new Career107LocalAdapter(baseUrl)).not.toThrow();
  });

  it('reads and validates health using GET without following redirects', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 'ok', runtime: 'career107-test' }),
      { headers: { 'content-type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new Career107LocalAdapter('http://127.0.0.1:8080');
    await expect(adapter.health()).resolves.toEqual({
      status: 'ok',
      runtime: 'career107-test',
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0][0].toString()).toBe('http://127.0.0.1:8080/api/health');
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'GET',
      redirect: 'error',
    });
  });

  it('reads the public catalog without exposing session routes', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ items: [], vocabularyId: 'test-vocabulary' }),
      { headers: { 'content-type': 'application/json' } },
    ));
    vi.stubGlobal('fetch', fetchMock);

    const adapter = new Career107LocalAdapter('http://127.0.0.1:8080');
    await expect(adapter.catalog()).resolves.toMatchObject({
      vocabularyId: 'test-vocabulary',
    });

    expect(fetchMock.mock.calls[0][0].toString()).toBe('http://127.0.0.1:8080/api/catalog');
  });

  it('rejects non-JSON responses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', {
      headers: { 'content-type': 'text/plain' },
    })));

    const adapter = new Career107LocalAdapter('http://127.0.0.1:8080');
    await expect(adapter.health()).rejects.toThrow('non-JSON');
  });

  it('rejects oversized responses before parsing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', {
      headers: {
        'content-type': 'application/json',
        'content-length': String(256 * 1024 + 1),
      },
    })));

    const adapter = new Career107LocalAdapter('http://127.0.0.1:8080');
    await expect(adapter.catalog()).rejects.toThrow('exceeded 256 KiB');
  });
});
