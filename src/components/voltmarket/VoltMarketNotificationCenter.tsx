
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { 
  Bell, 
  MessageSquare, 
  DollarSign, 
  User, 
  Shield, 
  TrendingUp,
  Settings,
  Check,
  X,
  Clock
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'transaction' | 'verification' | 'listing' | 'review';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

export const VoltMarketNotificationCenter: React.FC = () => {
  const { profile } = useVoltMarketAuth();
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'message',
      title: 'New Message',
      message: 'John from Solar Corp sent you a message about your Texas listing',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: '2',
      type: 'verification',
      title: 'Verification Approved',
      message: 'Your business license verification has been approved',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: '3',
      type: 'listing',
      title: 'Listing Interest',
      message: '3 users have viewed your Arizona hosting listing in the last 24 hours',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]);

  const [settings, setSettings] = useState({
    new_messages: true,
    listing_interest: true,
    price_alerts: true,
    verification_updates: true,
    marketing_emails: false,
    weekly_digest: true
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'transaction': return DollarSign;
      case 'verification': return Shield;
      case 'listing': return TrendingUp;
      case 'review': return User;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return 'text-blue-600 bg-blue-50';
      case 'transaction': return 'text-green-600 bg-green-50';
      case 'verification': return 'text-purple-600 bg-purple-50';
      case 'listing': return 'text-orange-600 bg-orange-50';
      case 'review': return 'text-pink-600 bg-pink-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
      description: "Your notification list has been cleared"
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!profile) {
    return (
      <div className="min-h-screen bg-muted py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground mt-2">Please sign in to view notifications.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Notification Center</h1>
            <p className="text-muted-foreground">Stay updated with your GridBazaar activity</p>
          </div>
          
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <Badge variant="default" className="px-3 py-1">
                {unreadCount} unread
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Notifications List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>No notifications yet</p>
                    <p className="text-sm">You'll see updates about your GridBazaar activity here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border ${
                            notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className={`font-medium ${
                                    notification.read ? 'text-gray-700' : 'text-gray-900'
                                  }`}>
                                    {notification.title}
                                  </h4>
                                  <p className={`text-sm mt-1 ${
                                    notification.read ? 'text-gray-500' : 'text-gray-600'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                                      {formatTimeAgo(notification.created_at)}
                                    </span>
                                    {!notification.read && (
                                      <Badge variant="secondary" className="text-xs">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => markAsRead(notification.id)}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {notification.action_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="mt-3"
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Notification Settings */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">New Messages</h4>
                      <p className="text-xs text-gray-500">Get notified of new messages</p>
                    </div>
                    <Switch
                      checked={settings.new_messages}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, new_messages: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Listing Interest</h4>
                      <p className="text-xs text-gray-500">Views and inquiries on your listings</p>
                    </div>
                    <Switch
                      checked={settings.listing_interest}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, listing_interest: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Price Alerts</h4>
                      <p className="text-xs text-gray-500">Similar listings and market changes</p>
                    </div>
                    <Switch
                      checked={settings.price_alerts}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, price_alerts: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Verification Updates</h4>
                      <p className="text-xs text-gray-500">Status changes for verifications</p>
                    </div>
                    <Switch
                      checked={settings.verification_updates}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, verification_updates: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Marketing Emails</h4>
                      <p className="text-xs text-gray-500">Tips and platform updates</p>
                    </div>
                    <Switch
                      checked={settings.marketing_emails}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, marketing_emails: checked }))
                      }
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Weekly Digest</h4>
                      <p className="text-xs text-gray-500">Summary of your activity</p>
                    </div>
                    <Switch
                      checked={settings.weekly_digest}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, weekly_digest: checked }))
                      }
                    />
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => {
                    toast({
                      title: "Settings Saved",
                      description: "Your notification preferences have been updated"
                    });
                  }}
                >
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Unread Messages</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Listing Views</span>
                    <Badge variant="secondary">23</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile Views</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saved Searches</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
