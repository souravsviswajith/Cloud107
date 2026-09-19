import { useState } from 'react';
import { LandingPage } from './pages/LandingPage';
import { WorkspaceShell } from './components/WorkspaceShell';
import { ShellProvider } from './contexts/ShellContext';
import { AuthProvider } from './components/AuthProvider';

export default function App() {
  const [isApproved, setIsApproved] = useState(false);

  if (!isApproved) {
    return <LandingPage onLaunch={() => setIsApproved(true)} />;
  }

  return (
    <AuthProvider>
      <ShellProvider>
        <WorkspaceShell />
      </ShellProvider>
    </AuthProvider>
  );
}
