import { Desktop } from './launch/Desktop';
import type { VmInstance } from '../types';

interface DesktopRendererProps {
  vm?: VmInstance;
}

export function DesktopRenderer({ vm }: DesktopRendererProps) {
  return <Desktop vm={vm} />;
}
