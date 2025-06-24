
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Zap, Building2, BarChart3, TrendingUp, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function Dashboard() {
  const navigate = useNavigate();

  const quickStats = [
    { label: 'Active Markets', value: '4', icon: BarChart3, color: 'text-blue-500' },
    { label: 'Power Assets', value: '1,247', icon: Zap, color: 'text-yellow-500' },
    { label: 'Companies', value: '856', icon: Building2, color: 'text-green-500' },
    { label: 'Data Points', value: '45.2K', icon: Database, color: 'text-purple-500' },
  ];

  const quickActions = [
    { title: 'AESO Market Data', description: 'Real-time Alberta electricity market', path: '/app/aeso-market', color: 'border-yellow-200' },
    { title: 'Energy Rates', description: 'Rate analysis and estimation', path: '/app/energy-rates', color: 'border-blue-200' },
    { title: 'Corporate Intelligence', description: 'AI-powered business analytics', path: '/app/corporate-intelligence', color: 'border-green-200' },
    { title: 'Power Infrastructure', description: 'Infrastructure analysis tools', path: '/app/power-infrastructure', color: 'border-purple-200' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <LayoutDashboard className="w-8 h-8 mr-3 text-blue-600" />
                <div>
                  <CardTitle className="text-2xl">VoltScout Dashboard</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Your comprehensive energy market intelligence platform
                  </p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                All Systems Operational
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className={`border-l-4 ${action.color} cursor-pointer hover:shadow-md transition-shadow`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold mb-1">{action.title}</h4>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(action.path)}
                      >
                        Open
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">AESO market data synchronized</span>
                </div>
                <span className="text-xs text-muted-foreground">2 minutes ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Corporate intelligence analysis completed</span>
                </div>
                <span className="text-xs text-muted-foreground">5 minutes ago</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">Power infrastructure scan initiated</span>
                </div>
                <span className="text-xs text-muted-foreground">12 minutes ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
