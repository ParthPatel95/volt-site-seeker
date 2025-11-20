import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, LayoutDashboard, Edit, Share2, Copy, Trash2, Zap } from 'lucide-react';
import { DashboardCreationWizard, DashboardConfig } from '@/components/aeso/DashboardCreationWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phase4FeaturesPanel } from '@/components/aeso/Phase4FeaturesPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AESODashboards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { dashboards, loading, fetchDashboards, deleteDashboard, duplicateDashboard } = useAESODashboards();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const filteredDashboards = dashboards.filter(dashboard =>
    dashboard.dashboard_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDashboard = async (config: DashboardConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create dashboard
      const { data: dashboard, error: dashboardError } = await supabase
        .from('aeso_custom_dashboards')
        .insert({
          dashboard_name: config.name,
          description: config.description,
          created_by: user.id,
          layout_config: { lg: [], md: [], sm: [] },
        })
        .select()
        .single();

      if (dashboardError) throw dashboardError;

      // Create widgets
      if (config.widgets.length > 0) {
        const widgetInserts = config.widgets.map((widget, index) => ({
          dashboard_id: dashboard.id,
          widget_type: widget.widgetType,
          widget_config: { title: widget.title },
          data_source: widget.dataSource,
          data_filters: { timeRange: '24hours', aggregation: 'hourly' },
          position_x: (index % 3) * 4,
          position_y: Math.floor(index / 3) * 4,
          width: 4,
          height: 4,
        }));

        const { error: widgetsError } = await supabase
          .from('aeso_dashboard_widgets')
          .insert(widgetInserts);

        if (widgetsError) throw widgetsError;
      }

      toast({
        title: 'Success',
        description: 'Dashboard created successfully',
      });

      await fetchDashboards();
      navigate(`/app/aeso-dashboard/${dashboard.id}`);
    } catch (error) {
      console.error('Error creating dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to create dashboard',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await duplicateDashboard(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this dashboard?')) {
      await deleteDashboard(id);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Custom Dashboards
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage custom analytics dashboards
            </p>
          </div>
          <Button onClick={() => setShowWizard(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Dashboard
          </Button>
        </div>

        <Tabs defaultValue="dashboards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboards">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              My Dashboards
            </TabsTrigger>
            <TabsTrigger value="features">
              <Zap className="w-4 h-4 mr-2" />
              Phase 4 Features
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboards" className="space-y-6 mt-6">

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search dashboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredDashboards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <LayoutDashboard className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No dashboards yet</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Create your first custom dashboard to start analyzing AESO market data
              </p>
              <Button onClick={() => setShowWizard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map(dashboard => (
              <Card
                key={dashboard.id}
                className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                onClick={() => navigate(`/app/aeso-dashboard/${dashboard.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <LayoutDashboard className="w-8 h-8 text-primary" />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/aeso-dashboard/${dashboard.id}`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/app/aeso-dashboard-share/${dashboard.id}`);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDuplicate(dashboard.id, e)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleDelete(dashboard.id, e)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4">{dashboard.dashboard_name}</CardTitle>
                  <CardDescription>
                    {dashboard.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    Updated {new Date(dashboard.updated_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Phase4FeaturesPanel />
          </TabsContent>
        </Tabs>
      </div>

      <DashboardCreationWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onCreate={handleCreateDashboard}
      />
    </>
  );
}
