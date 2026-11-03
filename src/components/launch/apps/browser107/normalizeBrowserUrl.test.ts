import { describe, expect, it } from 'vitest';
import { normalizeBrowserUrl } from './normalizeBrowserUrl';

describe('normalizeBrowserUrl', () => {
  it('adds HTTPS when the scheme is omitted', () => {
    expect(normalizeBrowserUrl('example.com')).toBe('https://example.com/');
  });

  it('preserves HTTPS and paths', () => {
    expect(normalizeBrowserUrl('https://example.com/docs?q=1')).toBe(
      'https://example.com/docs?q=1',
    );
  });

  it('supports explicit HTTP for local development and user intent', () => {
    expect(normalizeBrowserUrl('http://localhost:3000')).toBe('http://localhost:3000/');
  });

  it.each(['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,hi', 'ftp://example.com'])(
    'rejects unsupported scheme: %s',
    (url) => {
      expect(() => normalizeBrowserUrl(url)).toThrow('Only HTTP and HTTPS');
    },
  );

  it('rejects empty input and malformed addresses', () => {
    expect(() => normalizeBrowserUrl('  ')).toThrow('Enter a web address.');
    expect(() => normalizeBrowserUrl('https://')).toThrow('valid web address');
  });
});
