import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAcademyAuth } from '@/contexts/AcademyAuthContext';

interface AcademyAuthGuardProps {
  children: React.ReactNode;
}

export const AcademyAuthGuard: React.FC<AcademyAuthGuardProps> = ({ children }) => {
  const { user, isLoading } = useAcademyAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with return URL
    const returnUrl = encodeURIComponent(location.pathname);
    return <Navigate to={`/academy/auth?returnUrl=${returnUrl}`} replace />;
  }

  return <>{children}</>;
};

export default AcademyAuthGuard;
