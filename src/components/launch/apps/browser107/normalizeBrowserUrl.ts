const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Normalize a user-entered web address. This validates syntax only; it does not
 * establish that a destination is trustworthy or reachable.
 */
export function normalizeBrowserUrl(input: string): string {
  const value = input.trim();
  if (!value) throw new Error('Enter a web address.');

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(value)
    ? value
    : `https://${value}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('Enter a valid web address.');
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS addresses are supported.');
  }
  if (!parsed.hostname) throw new Error('The web address must include a hostname.');

  return parsed.href;
}
