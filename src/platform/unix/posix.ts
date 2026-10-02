/**
 * POSIX-facing process constants.
 *
 * OS-specific descriptor and resource enforcement belongs below this
 * platform-family boundary.
 */
export const unixSignals = {
  terminate: 'SIGTERM',
  kill: 'SIGKILL',
} as const;
