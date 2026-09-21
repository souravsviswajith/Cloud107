import { describe, it, expect } from 'vitest';
import { HyperVCommandBuilder } from '../HyperVCommandBuilder';

describe('HyperVCommandBuilder', () => {
  it('should build startVM command', () => {
    expect(HyperVCommandBuilder.startVM('123')).toBe('Start-VM -Name "123"');
  });

  it('should build stopVM command', () => {
    expect(HyperVCommandBuilder.stopVM('123')).toBe('Stop-VM -Name "123" -Force');
  });

  it('should build getVM command', () => {
    expect(HyperVCommandBuilder.getVM('123')).toBe(
      'Get-VM -Name "123" | Select-Object State, Name, Uptime | ConvertTo-Json',
    );
  });

  it('should build getVMMetrics command', () => {
    expect(HyperVCommandBuilder.getVMMetrics('123')).toBe(
      'Measure-VM -Name "123" | Select-Object AverageProcessorUsage, AverageMemoryUsage | ConvertTo-Json',
    );
  });
});
