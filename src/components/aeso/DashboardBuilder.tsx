import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, HelpCircle, Sparkles } from 'lucide-react';
import { WidgetConfigPanel } from './WidgetConfigPanel';
import { DashboardLayoutEditor } from './DashboardLayoutEditor';
import { DashboardSettingsPanel } from './DashboardSettingsPanel';
import { OnboardingTour } from './OnboardingTour';
import { useAESODashboards } from '@/hooks/useAESODashboards';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function DashboardBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getDashboardById, updateDashboard } = useAESODashboards();
  
  const [dashboard, setDashboard] = useState<any>(null);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('widgets');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    loadDashboard();
    // Check if user has seen onboarding
    const seen = localStorage.getItem('dashboard-builder-onboarding-seen');
    if (!seen) {
      setShowOnboarding(true);
    }
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

  const handleSave = async () => {
    if (!dashboard) return;
    
    const success = await updateDashboard(dashboard.id, {
      dashboard_name: dashboard.dashboard_name,
      description: dashboard.description,
      layout_config: dashboard.layout_config,
    });

    if (success) {
      toast({
        title: 'Success',
        description: 'Dashboard saved successfully',
      });
    }
  };

  const handlePreview = () => {
    navigate(`/app/aeso-dashboard/${id}`);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('dashboard-builder-onboarding-seen', 'true');
    setHasSeenOnboarding(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <p className="text-muted-foreground">Dashboard not found</p>
          <Button onClick={() => navigate('/app/aeso-dashboards')} className="mt-4">
            Back to Dashboards
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/app/aeso-dashboards')}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{dashboard.dashboard_name}</h1>
                  <p className="text-sm text-muted-foreground">Dashboard Builder</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowOnboarding(true)}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Show tutorial</TooltipContent>
                </Tooltip>

                <Button variant="outline" onClick={handlePreview}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>

                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="widgets" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Sparkles className="w-4 h-4 mr-2" />
                Widgets
              </TabsTrigger>
              <TabsTrigger value="layout">
                Layout
              </TabsTrigger>
              <TabsTrigger value="settings">
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="widgets" className="space-y-4">
              <WidgetConfigPanel
                dashboardId={dashboard.id}
                widgets={widgets}
                onWidgetsUpdate={(updatedWidgets) => setWidgets(updatedWidgets)}
              />
            </TabsContent>

            <TabsContent value="layout">
              <DashboardLayoutEditor
                dashboard={dashboard}
                widgets={widgets}
                onLayoutUpdate={(layoutConfig) => {
                  setDashboard({ ...dashboard, layout_config: layoutConfig });
                }}
              />
            </TabsContent>

            <TabsContent value="settings">
              <DashboardSettingsPanel
                dashboard={dashboard}
                onUpdate={(updates) => setDashboard({ ...dashboard, ...updates })}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Onboarding Tour */}
        {showOnboarding && (
          <OnboardingTour onComplete={handleOnboardingComplete} />
        )}
      </div>
    </TooltipProvider>
  );
}
