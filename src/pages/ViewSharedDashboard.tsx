import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import { StatCard } from '@/components/aeso/dashboard-widgets/StatCard';
import { ChartWidget } from '@/components/aeso/dashboard-widgets/ChartWidget';
import { GaugeWidget } from '@/components/aeso/dashboard-widgets/GaugeWidget';
import { useAESODashboardSharing } from '@/hooks/useAESODashboardSharing';

export default function ViewSharedDashboard() {
  const { token } = useParams();
  const { validateShareToken } = useAESODashboardSharing();
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [shareConfig, setShareConfig] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      tryValidate();
    }
  }, [token]);

  const tryValidate = async (pwd?: string) => {
    if (!token) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await validateShareToken(token, pwd);
      
      if (result?.success) {
        setAuthenticated(true);
        setDashboard(result.dashboard);
        setShareConfig(result.shareLink);
      } else {
        setError(result?.error || 'Invalid or expired link');
      }
    } catch (err) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    tryValidate(password);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Access Protected Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || !password}>
                {loading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4" />
          <div className="h-4 bg-muted rounded w-32 mx-auto" />
        </div>
      </div>
    );
  }

  const renderWidget = (widget: any) => {
    const config = {
      title: widget.widget_config.title || 'Widget',
      dataSource: widget.data_source,
      dataFilters: widget.data_filters,
      widgetType: widget.widget_type,
    };

    switch (widget.widget_type) {
      case 'stat_card':
        return <StatCard key={widget.id} config={config} />;
      case 'gauge':
        return <GaugeWidget key={widget.id} config={config} />;
      case 'line_chart':
      case 'bar_chart':
      case 'area_chart':
        return <ChartWidget key={widget.id} config={config} />;
      default:
        return (
          <Card key={widget.id} className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">{config.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Widget type not supported</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold">{dashboard.dashboard_name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground mt-2">{dashboard.description}</p>
          )}
          {shareConfig?.access_level === 'view_only' && (
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              View Only Access
            </div>
          )}
        </div>

        {dashboard.aeso_dashboard_widgets?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboard.aeso_dashboard_widgets.map((widget: any) => renderWidget(widget))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">This dashboard has no widgets yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
