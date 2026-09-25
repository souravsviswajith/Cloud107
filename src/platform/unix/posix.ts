import { constants } from 'node:os';

export const unixSignals = {
  terminate: 'SIGTERM',
  kill: 'SIGKILL',
} as const;

export const unixFdFlags = {
  closeOnExec: constants.O_CLOEXEC,
} as const;
