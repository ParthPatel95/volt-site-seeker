import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Share2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AESODashboardBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getDashboardById, updateDashboard } = useAESODashboards();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardName, setDashboardName] = useState('');

  useEffect(() => {
    loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getDashboardById(id);
    if (data) {
      setDashboard(data);
      setDashboardName(data.dashboard_name);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!id) return;
    await updateDashboard(id, { dashboard_name: dashboardName });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded w-1/3" />
            <div className="h-96 bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Dashboard not found</h2>
          <Button onClick={() => navigate('/app/aeso-dashboards')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboards
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/aeso-dashboards')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Input
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="text-2xl font-bold border-none bg-transparent focus-visible:ring-0 px-0"
              placeholder="Dashboard Name"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/app/aeso-dashboard-share/${id}`)}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
          <div className="col-span-2 bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Widgets</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Line Chart
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Bar Chart
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Stat Card
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Gauge
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Table
              </Button>
            </div>
          </div>

          <div className="col-span-8 bg-card rounded-lg border p-6">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Plus className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Drag widgets here to build your dashboard</p>
                <p className="text-sm mt-2">Select a widget from the left panel to get started</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-card rounded-lg border p-4">
            <h3 className="font-semibold mb-4">Properties</h3>
            <p className="text-sm text-muted-foreground">
              Select a widget to configure its properties
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
