import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

interface AcademyAuthGuardProps {
  children: React.ReactNode;
}

export const AcademyAuthGuard: React.FC<AcademyAuthGuardProps> = ({ children }) => {
  const { user, academyUser, isLoading } = useAcademyAuth();
  const location = useLocation();
  const [showSlowMessage, setShowSlowMessage] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowSlowMessage(false);
      return;
    }
    
    const timer = setTimeout(() => {
      if (isLoading) setShowSlowMessage(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {showSlowMessage ? 'Still loading, please wait...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Must have both Supabase auth AND an academy_users profile
  // This prevents VoltScout users from accessing Academy without signing up for Academy
  if (!user || !academyUser) {
    const returnUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/academy/auth?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};

export default AcademyAuthGuard;
