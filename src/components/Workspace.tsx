import { VmInstance } from '../types';
import { DesktopRenderer } from './DesktopRenderer';

interface WorkspaceProps {
  vm: VmInstance;
  onClose: () => void;
  onLaunchApps: () => void;
}

export function Workspace({ vm }: WorkspaceProps) {
  // Top Toolbar was removed as it's replaced by the FloatingWorkspaceBar
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans relative z-50">
      {/* Desktop Renderer Abstraction */}
      <DesktopRenderer vm={vm} />
    </div>
  );
}
