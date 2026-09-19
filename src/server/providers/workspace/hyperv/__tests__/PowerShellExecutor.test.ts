import { describe, it, expect, beforeEach } from 'vitest';
import { PowerShellExecutor } from '../PowerShellExecutor';

describe('PowerShellExecutor', () => {
  let executor: PowerShellExecutor;

  beforeEach(() => {
    executor = new PowerShellExecutor();
  });

  it('should use mock execute on non-Windows platforms', async () => {
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', {
      value: 'linux'
    });

    const output = await executor.execute('Get-VM');
    expect(output).toContain('MockVM');

    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    });
  });
});
