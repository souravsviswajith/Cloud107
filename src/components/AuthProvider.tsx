import { useEffect, useState } from 'react';
import { auth, Cloud107User } from '../lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setUser] = useState<Cloud107User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // Automatically establish self-hosted operator session
        auth
          .signInAsLocalOperator()
          .then((op) => {
            setUser(op);
            setLoading(false);
          })
          .catch(() => {
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-neutral-400 font-medium">Connecting to Cloud107 Node...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
