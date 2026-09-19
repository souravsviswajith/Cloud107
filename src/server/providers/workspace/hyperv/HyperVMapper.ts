import { WorkspaceState } from '../../../../types';

export class HyperVMapper {
  static mapState(hypervState: string): WorkspaceState {
    const stateStr = hypervState.toString().toLowerCase();
    
    // ConvertTo-Json might output the string or integer values of the Hyper-V State enum
    // 2: Running, 3: Off, etc.
    switch (stateStr) {
      case 'running':
      case '2':
        return WorkspaceState.Running;
      case 'off':
      case '3':
        return WorkspaceState.Offline;
      case 'saved':
      case '6':
        return WorkspaceState.Stopped;
      case 'starting':
      case '1':
        return WorkspaceState.Starting;
      default:
        return WorkspaceState.Error;
    }
  }
}
