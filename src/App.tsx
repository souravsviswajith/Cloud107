import { WorkspaceShell } from './components/WorkspaceShell';
import { ShellProvider } from './contexts/ShellContext';
import { AuthProvider } from './components/AuthProvider';

export default function App() {
  return (
    <AuthProvider>
      <ShellProvider>
        <WorkspaceShell />
      </ShellProvider>
    </AuthProvider>
  );
}
