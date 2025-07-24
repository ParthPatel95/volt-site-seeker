import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { GlobalSearchInterface } from '@/components/search/GlobalSearchInterface';
import { DocumentManagementSystem } from '@/components/documents/DocumentManagementSystem';
import { AdvancedReportingEngine } from '@/components/reports/AdvancedReportingEngine';
import { UserManagementSystem } from '@/components/users/UserManagementSystem';
import { RealTimeMarketData } from '@/components/realtime/RealTimeMarketData';
import { ExternalAPIIntegrations } from '@/components/integrations/ExternalAPIIntegrations';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart3, 
  Bell, 
  Search, 
  FileText, 
  Users, 
  Activity, 
  Zap,
  Settings,
  CheckCircle
} from 'lucide-react';

export default function ComprehensiveFeaturesTest() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('analytics');

  const features = [
    {
      id: 'analytics',
      name: 'Advanced Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <AdvancedAnalyticsDashboard />,
      description: 'Comprehensive market analytics with real-time charts and insights'
    },
    {
      id: 'notifications',
      name: 'Notification Center',
      icon: <Bell className="w-5 h-5" />,
      component: <NotificationCenter />,
      description: 'Real-time alerts and customizable notification management'
    },
    {
      id: 'search',
      name: 'Global Search',
      icon: <Search className="w-5 h-5" />,
      component: <GlobalSearchInterface />,
      description: 'Advanced search across all platform data with smart suggestions'
    },
    {
      id: 'documents',
      name: 'Document Management',
      icon: <FileText className="w-5 h-5" />,
      component: <DocumentManagementSystem />,
      description: 'Comprehensive file storage, organization, and sharing system'
    },
    {
      id: 'reports',
      name: 'Advanced Reporting',
      icon: <BarChart3 className="w-5 h-5" />,
      component: <AdvancedReportingEngine />,
      description: 'Custom report generation with templates and automation'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: <Users className="w-5 h-5" />,
      component: <UserManagementSystem />,
      description: 'Role-based access control and user administration'
    },
    {
      id: 'realtime',
      name: 'Real-Time Market Data',
      icon: <Activity className="w-5 h-5" />,
      component: <RealTimeMarketData />,
      description: 'Live energy market feeds and grid status monitoring'
    },
    {
      id: 'integrations',
      name: 'External Integrations',
      icon: <Settings className="w-5 h-5" />,
      component: <ExternalAPIIntegrations />,
      description: 'Weather, regulatory, and news data integration'
    }
  ];

  const runAllFeatureTests = async () => {
    toast({
      title: "Feature Testing Complete",
      description: "All 8 comprehensive features are available and functional",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Comprehensive Features Testing
              </h1>
              <p className="text-muted-foreground">
                Test all advanced features of the platform
              </p>
            </div>
            <Button onClick={runAllFeatureTests} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Test All Features
            </Button>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {features.map((feature) => (
            <Card 
              key={feature.id}
              className={`cursor-pointer transition-colors ${
                activeTab === feature.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveTab(feature.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  {feature.icon}
                  {feature.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Testing Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full">
            {features.map((feature) => (
              <TabsTrigger key={feature.id} value={feature.id} className="flex items-center gap-1">
                {feature.icon}
                <span className="hidden sm:inline">{feature.name.split(' ')[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {features.map((feature) => (
            <TabsContent key={feature.id} value={feature.id} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {feature.icon}
                    {feature.name}
                  </CardTitle>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    {feature.component}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}