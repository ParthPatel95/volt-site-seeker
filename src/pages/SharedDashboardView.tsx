import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAESODashboardSharing } from '@/hooks/useAESODashboardSharing';
import { DashboardViewer } from '@/components/aeso/DashboardViewer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, AlertCircle } from 'lucide-react';

export default function SharedDashboardView() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { validateShareToken } = useAESODashboardSharing();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [token]);

  const checkAccess = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    const result = await validateShareToken(token);
    
    if (!result) {
      setError('Invalid or expired share link');
      setLoading(false);
      return;
    }

    if (result.requiresPassword && !password) {
      setRequiresPassword(true);
      setLoading(false);
      return;
    }

    if (result.dashboard) {
      setDashboardData(result.dashboard);
      setRequiresPassword(false);
    }
    
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    const result = await validateShareToken(token, password);
    
    if (!result || result.error) {
      setError('Invalid password');
      setLoading(false);
      return;
    }

    if (result.dashboard) {
      setDashboardData(result.dashboard);
      setRequiresPassword(false);
    }
    
    setLoading(false);
  };

  if (loading && !requiresPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Password Protected
            </CardTitle>
            <CardDescription>
              This dashboard requires a password to access
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardViewer
        dashboard={dashboardData}
        widgets={dashboardData.aeso_dashboard_widgets || []}
        market={dashboardData.market || 'aeso'}
        isPublicView
      />
    </div>
  );
}
