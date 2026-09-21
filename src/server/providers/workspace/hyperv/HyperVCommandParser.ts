import { WorkspaceState } from '../../../../types';
import { HyperVMapper } from './HyperVMapper';
import { WorkspaceMetrics } from '../WorkspaceProvider';
import { logger } from '../../../utils/logger';

export class HyperVCommandParser {
  static parseVMStatus(output: string): WorkspaceState {
    try {
      if (!output) return WorkspaceState.Offline;
      const parsed = JSON.parse(output);
      // Hyper-V typically returns an array or single object
      const stateStr = Array.isArray(parsed) ? parsed[0]?.State : parsed?.State;
      if (typeof stateStr !== 'string' && typeof stateStr !== 'number') {
        return WorkspaceState.Offline; // or handle numerical states if ConvertTo-Json preserves enum
      }
      return HyperVMapper.mapState(String(stateStr));
    } catch (error) {
      logger.error('Failed to parse VM status output', { error, output });
      return WorkspaceState.Error;
    }
  }

  static parseVMMetrics(output: string): Partial<WorkspaceMetrics> {
    try {
      if (!output) return { cpuUsage: 0, memoryUsage: 0 };
      const parsed = JSON.parse(output);
      const metricsObj = Array.isArray(parsed) ? parsed[0] : parsed;

      return {
        cpuUsage: Number(metricsObj?.AverageProcessorUsage) || 0,
        memoryUsage: Number(metricsObj?.AverageMemoryUsage) || 0,
      };
    } catch (error) {
      logger.error('Failed to parse VM metrics output', { error, output });
      return { cpuUsage: 0, memoryUsage: 0 };
    }
  }
}
