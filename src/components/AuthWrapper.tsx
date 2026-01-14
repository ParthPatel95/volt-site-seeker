import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Auth } from '@/components/Auth';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSlowMessage(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (loading) setShowSlowMessage(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        {showSlowMessage && (
          <p className="text-muted-foreground text-sm">
            Taking longer than expected...
          </p>
        )}
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return <>{children}</>;
}
