import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, BellRing, AlertTriangle, TrendingUp, Zap, DollarSign, MapPin, Settings, Search, Filter, CheckCircle, X, Eye, Clock, Mail, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: 'alert' | 'update' | 'system' | 'market' | 'transaction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source: string;
  data?: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketAlerts: boolean;
  priceAlerts: boolean;
  systemUpdates: boolean;
  transactionUpdates: boolean;
  weeklyReports: boolean;
  priceThreshold: number;
  volumeThreshold: number;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sms: false,
    marketAlerts: true,
    priceAlerts: true,
    systemUpdates: true,
    transactionUpdates: true,
    weeklyReports: true,
    priceThreshold: 5.0,
    volumeThreshold: 1000000
  });
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    // Set up real-time notification polling
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    // Generate mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'alert',
        priority: 'critical',
        title: 'Critical Price Alert',
        message: 'ERCOT prices have exceeded $200/MWh in West Hub',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        read: false,
        source: 'Market Monitor'
      },
      {
        id: '2',
        type: 'market',
        priority: 'high',
        title: 'New High-Capacity Listing',
        message: '500MW solar facility listed in Texas for $1.2B',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        read: false,
        source: 'VoltMarket'
      },
      {
        id: '3',
        type: 'transaction',
        priority: 'medium',
        title: 'LOI Received',
        message: 'You received a Letter of Intent for Wind Farm Alpha',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        read: true,
        source: 'VoltMarket'
      },
      {
        id: '4',
        type: 'update',
        priority: 'low',
        title: 'Weekly Market Report',
        message: 'Your weekly market analysis report is ready',
        timestamp: new Date(Date.now() - 1000 * 60 * 1440),
        read: false,
        source: 'Analytics'
      },
      {
        id: '5',
        type: 'system',
        priority: 'medium',
        title: 'Platform Update',
        message: 'New features added to Industry Intelligence scanner',
        timestamp: new Date(Date.now() - 1000 * 60 * 2880),
        read: true,
        source: 'System'
      }
    ];

    setNotifications(mockNotifications);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read",
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings updated",
      description: "Your notification preferences have been saved",
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'high-priority' && ['high', 'critical'].includes(notification.priority)) ||
      notification.type === filter;
    
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <BellRing className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Bell className="w-4 h-4 text-blue-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'market': return <TrendingUp className="w-4 h-4" />;
      case 'transaction': return <DollarSign className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'update': return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="space-y-6 p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button onClick={markAllAsRead} disabled={unreadCount === 0}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search notifications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'unread', label: 'Unread' },
                    { value: 'high-priority', label: 'High Priority' },
                    { value: 'alert', label: 'Alerts' },
                    { value: 'market', label: 'Market' },
                    { value: 'transaction', label: 'Transactions' }
                  ].map((filterOption) => (
                    <Button
                      key={filterOption.value}
                      variant={filter === filterOption.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilter(filterOption.value)}
                    >
                      {filterOption.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try adjusting your search or filters' : 'All caught up! No new notifications.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${
                    !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2 mt-1">
                        {getPriorityIcon(notification.priority)}
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {notification.source}
                          </Badge>
                          <Badge variant={
                            notification.priority === 'critical' ? 'destructive' :
                            notification.priority === 'high' ? 'default' :
                            'secondary'
                          }>
                            {notification.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Delivery Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Delivery Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <Label htmlFor="email">Email Notifications</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={settings.email}
                    onCheckedChange={(checked) => updateSettings('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    <Label htmlFor="push">Push Notifications</Label>
                  </div>
                  <Switch
                    id="push"
                    checked={settings.push}
                    onCheckedChange={(checked) => updateSettings('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    <Label htmlFor="sms">SMS Notifications</Label>
                  </div>
                  <Switch
                    id="sms"
                    checked={settings.sms}
                    onCheckedChange={(checked) => updateSettings('sms', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="market-alerts">Market Alerts</Label>
                  <Switch
                    id="market-alerts"
                    checked={settings.marketAlerts}
                    onCheckedChange={(checked) => updateSettings('marketAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="price-alerts">Price Alerts</Label>
                  <Switch
                    id="price-alerts"
                    checked={settings.priceAlerts}
                    onCheckedChange={(checked) => updateSettings('priceAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="system-updates">System Updates</Label>
                  <Switch
                    id="system-updates"
                    checked={settings.systemUpdates}
                    onCheckedChange={(checked) => updateSettings('systemUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="transaction-updates">Transaction Updates</Label>
                  <Switch
                    id="transaction-updates"
                    checked={settings.transactionUpdates}
                    onCheckedChange={(checked) => updateSettings('transactionUpdates', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports">Weekly Reports</Label>
                  <Switch
                    id="weekly-reports"
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => updateSettings('weeklyReports', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Alert Thresholds */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price-threshold">Price Alert Threshold (%)</Label>
                    <Input
                      id="price-threshold"
                      type="number"
                      step="0.1"
                      value={settings.priceThreshold}
                      onChange={(e) => updateSettings('priceThreshold', parseFloat(e.target.value))}
                      placeholder="5.0"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when prices change by more than this percentage
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="volume-threshold">Volume Alert Threshold ($)</Label>
                    <Input
                      id="volume-threshold"
                      type="number"
                      value={settings.volumeThreshold}
                      onChange={(e) => updateSettings('volumeThreshold', parseInt(e.target.value))}
                      placeholder="1000000"
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when transaction volume exceeds this amount
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}