
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Zap,
  DollarSign,
  Clock,
  Settings,
  Mail
} from 'lucide-react';

const mockAlerts = [
  {
    id: 1,
    type: "High Value Discovery",
    title: "32MW Industrial Site Under Market Value",
    description: "Houston Energy Hub - $6.1M for 32MW capacity ($191K/MW vs $250K/MW market avg)",
    location: "Houston, TX",
    severity: "high",
    timestamp: "2 hours ago",
    voltScore: 91,
    action: "Review Property"
  },
  {
    id: 2,
    type: "Power Infrastructure Update",
    title: "New Substation Construction Completed",
    description: "ERCOT substation now operational 0.2mi from tracked Austin property",
    location: "Austin, TX",
    severity: "medium",
    timestamp: "1 day ago",
    voltScore: 78,
    action: "Update Analysis"
  },
  {
    id: 3,
    type: "Market Alert",
    title: "Crypto Mining Facility Available",
    description: "Keywords matched: 'bitcoin mining', 'crypto data center' - 15MW existing infrastructure",
    location: "Dallas, TX",
    severity: "high",
    timestamp: "3 hours ago",
    voltScore: 88,
    action: "Investigate"
  },
  {
    id: 4,
    type: "Price Drop",
    title: "Target Property Reduced Price",
    description: "Manufacturing facility reduced from $3.2M to $2.8M (12.5% reduction)",
    location: "Austin, TX",
    severity: "medium",
    timestamp: "5 hours ago",
    voltScore: 72,
    action: "Contact Broker"
  }
];

const alertSettings = [
  { id: 1, name: "High VoltScore Properties (80+)", enabled: true, description: "Notify when properties score above 80" },
  { id: 2, name: "Price Drops", enabled: true, description: "Alert when tracked properties reduce price by 10%+" },
  { id: 3, name: "New Crypto/Data Center Keywords", enabled: true, description: "Properties mentioning crypto, mining, or data centers" },
  { id: 4, name: "Infrastructure Updates", enabled: false, description: "New substations or power infrastructure near properties" },
  { id: 5, name: "Market Opportunities", enabled: true, description: "Below-market pricing alerts" },
];

export function AlertsPanel() {
  const [activeTab, setActiveTab] = useState('alerts');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge className="bg-red-500">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alert System</h1>
          <p className="text-muted-foreground">Real-time notifications for high-value opportunities</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('alerts')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Active Alerts
          </Button>
          <Button 
            variant={activeTab === 'settings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('settings')}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {activeTab === 'alerts' ? (
        <div className="space-y-4">
          {/* Alert Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">4</div>
                    <div className="text-sm text-red-100">High Priority</div>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-yellow-100">Medium Priority</div>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">$127M</div>
                    <div className="text-sm text-green-100">Alert Value</div>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert List */}
          <div className="space-y-3">
            {mockAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${getSeverityColor(alert.severity)} transition-all hover:shadow-md`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(alert.severity)}
                        <span className="text-sm text-muted-foreground">{alert.type}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{alert.timestamp}</span>
                      </div>
                      
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 text-gray-500" />
                          {alert.location}
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-blue-500" />
                          VoltScore: {alert.voltScore}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 space-y-2">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-700">
                        {alert.action}
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        Dismiss
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Email Alerts to Parth@BFarm365.com</div>
                  <div className="text-sm text-muted-foreground">Send real-time alerts to your email</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Daily Summary Report</div>
                  <div className="text-sm text-muted-foreground">Daily digest of all discoveries and updates</div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Alert Type Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alertSettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{setting.name}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch defaultChecked={setting.enabled} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Threshold Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Thresholds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Minimum VoltScore</label>
                  <input 
                    type="number" 
                    defaultValue="75" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Distance to Substation (miles)</label>
                  <input 
                    type="number" 
                    defaultValue="1.0" 
                    step="0.1"
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Minimum Power Capacity (MW)</label>
                  <input 
                    type="number" 
                    defaultValue="10" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Price ($M)</label>
                  <input 
                    type="number" 
                    defaultValue="10" 
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
