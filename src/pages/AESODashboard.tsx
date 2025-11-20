import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { DashboardViewer } from '@/components/aeso/DashboardViewer';

export default function AESODashboard() {
  const { id } = useParams();
  const { getDashboardById } = useAESODashboards();
  const [dashboard, setDashboard] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [id]);

  const loadDashboard = async () => {
    if (!id) return;
    setLoading(true);
    const data = await getDashboardById(id);
    if (data) {
      setDashboard(data);
      setWidgets(data.aeso_dashboard_widgets || []);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Dashboard not found</h2>
      </div>
    );
  }

  return (
    <DashboardViewer
      dashboard={dashboard}
      widgets={widgets}
      market="aeso"
    />
  );
}
