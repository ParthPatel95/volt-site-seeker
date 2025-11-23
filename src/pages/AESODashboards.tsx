import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, LayoutDashboard, Lock, Tag as TagIcon } from 'lucide-react';
import { DashboardCreationWizard, DashboardConfig } from '@/components/aeso/DashboardCreationWizard';
import { DashboardGalleryCard } from '@/components/aeso/DashboardGalleryCard';
import { DashboardFilters } from '@/components/aeso/DashboardFilters';
import { DashboardTagEditor } from '@/components/aeso/DashboardTagEditor';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AESODashboards() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasPermission, loading: permissionsLoading } = usePermissions();
  const { dashboards, loading, fetchDashboards, deleteDashboard, duplicateDashboard, toggleStar, trackView, updateTags } = useAESODashboards();
  const [searchQuery, setSearchQuery] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'starred' | 'recent'>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [editingTagsFor, setEditingTagsFor] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboards();
  }, []);

  // Check permission after hooks
  if (!permissionsLoading && !hasPermission('feature.energy-dashboards')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p className="text-muted-foreground text-center">
              You don't have permission to access Energy Dashboards. Please contact admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get all unique tags from dashboards
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    dashboards.forEach(d => {
      d.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [dashboards]);

  // Apply filters
  const filteredDashboards = useMemo(() => {
    let filtered = dashboards;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(dashboard =>
        dashboard.dashboard_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (filterType === 'starred') {
      filtered = filtered.filter(d => d.is_starred);
    } else if (filterType === 'recent') {
      // Sort by view count for "recent" (you could also track actual recent views)
      filtered = [...filtered].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(d =>
        selectedTags.some(tag => d.tags?.includes(tag))
      );
    }

    return filtered;
  }, [dashboards, searchQuery, filterType, selectedTags]);

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

  const handleToggleStar = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStar(id);
  };

  const handleView = (id: string) => {
    trackView(id);
    navigate(`/app/aeso-dashboard/${id}`);
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveTags = async (dashboardId: string, tags: string[]) => {
    await updateTags(dashboardId, tags);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Energy Dashboards
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

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search dashboards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <DashboardFilters
            selectedFilter={filterType}
            selectedTags={selectedTags}
            availableTags={availableTags}
            onFilterChange={setFilterType}
            onTagToggle={handleTagToggle}
            onClearTags={() => setSelectedTags([])}
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
                Create your first energy dashboard to start analyzing AESO market data
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
              <DashboardGalleryCard
                key={dashboard.id}
                dashboard={dashboard}
                onView={() => handleView(dashboard.id)}
                onEdit={() => navigate(`/app/aeso-dashboard-builder/${dashboard.id}`)}
                onShare={() => navigate(`/app/aeso-dashboard-share/${dashboard.id}`)}
                onDuplicate={(e) => handleDuplicate(dashboard.id, e)}
                onDelete={(e) => handleDelete(dashboard.id, e)}
                onToggleStar={(e) => handleToggleStar(dashboard.id, e)}
              />
            ))}
          </div>
        )}
      </div>

      <DashboardCreationWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onCreate={handleCreateDashboard}
      />

      {editingTagsFor && (
        <DashboardTagEditor
          open={!!editingTagsFor}
          onOpenChange={(open) => !open && setEditingTagsFor(null)}
          currentTags={dashboards.find(d => d.id === editingTagsFor)?.tags || []}
          onSave={(tags) => handleSaveTags(editingTagsFor, tags)}
        />
      )}
    </>
  );
}
