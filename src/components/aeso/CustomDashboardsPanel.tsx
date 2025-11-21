import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Plus, ArrowRight } from 'lucide-react';

export function CustomDashboardsPanel() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card className="border-dashed border-2 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                Energy Dashboards
              </CardTitle>
              <CardDescription className="mt-2">
                Create personalized analytics dashboards with AESO market data
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => navigate('/app/aeso-dashboards')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Dashboard
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <LayoutDashboard className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">Build Custom Views</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop widgets to create custom analytics views with historical pricing, predictions, and market data
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Share Securely</h3>
              <p className="text-sm text-muted-foreground">
                Share dashboards with stakeholders using password protection, expiry dates, and access controls
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Export & Analyze</h3>
              <p className="text-sm text-muted-foreground">
                Export dashboards as PDF or images, and analyze trends with customizable time ranges and filters
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">Quick Start Templates</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" onClick={() => navigate('/app/aeso-dashboards')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Executive Summary
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/app/aeso-dashboards')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Operations Dashboard
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/app/aeso-dashboards')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Analytics Dashboard
              </Button>
              <Button variant="outline" className="justify-start" onClick={() => navigate('/app/aeso-dashboards')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Forecasting Dashboard
              </Button>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="link" onClick={() => navigate('/app/aeso-dashboards')}>
              View All Dashboards
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
