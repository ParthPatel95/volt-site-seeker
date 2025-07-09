import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Briefcase, 
  Scale, 
  Shield, 
  Bell, 
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Calendar,
  MessageSquare,
  HandHeart,
  FileCheck
} from 'lucide-react';
import { useVoltMarketPortfolio } from '@/hooks/useVoltMarketPortfolio';
import { useVoltMarketDocuments } from '@/hooks/useVoltMarketDocuments';
import { useVoltMarketAuth } from '@/contexts/VoltMarketAuthContext';
import { supabase } from '@/integrations/supabase/client';

export const VoltMarketComprehensiveDashboard: React.FC = () => {
  const { portfolios } = useVoltMarketPortfolio();
  const { documents } = useVoltMarketDocuments();
  const { profile } = useVoltMarketAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingLOIs, setPendingLOIs] = useState(0);
  const [pendingDocumentRequests, setPendingDocumentRequests] = useState(0);
  const [receivedLOIs, setReceivedLOIs] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  // Fetch seller-specific data
  useEffect(() => {
    const fetchSellerData = async () => {
      if (!profile?.id || profile.role !== 'seller') return;

      try {
        // Get unread messages
        const { data: messages, count: messageCount } = await supabase
          .from('voltmarket_contact_messages')
          .select('*', { count: 'exact' })
          .eq('listing_owner_id', profile.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false });

        setUnreadMessages(messageCount || 0);
        setContactMessages(messages || []);

        // Get pending LOIs
        const { data: lois, count: loiCount } = await supabase
          .from('voltmarket_lois')
          .select(`
            *,
            voltmarket_listings(title),
            voltmarket_profiles!buyer_id(company_name)
          `)
          .eq('seller_id', profile.id)
          .eq('status', 'pending')
          .order('submitted_at', { ascending: false });

        setPendingLOIs(loiCount || 0);
        setReceivedLOIs(lois || []);

        // Get pending document requests
        const { count: docCount } = await supabase
          .from('voltmarket_document_permissions')
          .select('*', { count: 'exact', head: true })
          .eq('granted_by', profile.id)
          .is('granted_at', null);

        setPendingDocumentRequests(docCount || 0);
      } catch (error) {
        console.error('Error fetching seller data:', error);
      }
    };

    fetchSellerData();
  }, [profile]);

  // Calculate summary metrics
  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0);
  const totalDocuments = documents.length;

  const quickStats = [
    {
      title: 'Portfolio Value',
      value: `$${(totalPortfolioValue / 1000000).toFixed(1)}M`,
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Active Listings',
      value: '24',
      change: '+3',
      icon: MapPin,
      color: 'text-blue-600'
    },
    {
      title: 'Documents',
      value: totalDocuments.toString(),
      change: '+8',
      icon: FileText,
      color: 'text-purple-600'
    },
    {
      title: 'LOIs Pending',
      value: pendingLOIs.toString(),
      change: '+2',
      icon: Scale,
      color: 'text-orange-600'
    }
  ];

  const recentActivities = [
    ...contactMessages.slice(0, 2).map(msg => ({
      type: 'message_received',
      message: `New message from ${msg.sender_name}`,
      time: new Date(msg.created_at).toLocaleString()
    })),
    ...receivedLOIs.slice(0, 2).map(loi => ({
      type: 'loi_received',
      message: `New LOI received for ${loi.voltmarket_listings?.title || 'listing'}`,
      time: new Date(loi.submitted_at).toLocaleString()
    })),
    { type: 'verification_approved', message: 'Company verification approved', time: '1 day ago' }
  ];

  const upcomingTasks = [
    ...receivedLOIs.slice(0, 2).map(loi => ({
      task: `Review LOI for ${loi.voltmarket_listings?.title || 'listing'}`,
      due: 'Today',
      priority: 'high' as const
    })),
    { task: 'Upload due diligence documents', due: 'Tomorrow', priority: 'medium' as const },
    { task: 'Complete financial verification', due: 'This week', priority: 'high' as const }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">VoltMarket Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive marketplace overview</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Market
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-sm ${stat.color} mt-1`}>{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gray-100`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="lois">LOIs ({pendingLOIs})</TabsTrigger>
            {profile?.role === 'seller' && (
              <TabsTrigger value="messages">Messages ({unreadMessages})</TabsTrigger>
            )}
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingTasks.slice(0, 4).map((task, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.task}</p>
                          <p className="text-xs text-gray-500 mt-1">Due: {task.due}</p>
                        </div>
                        <Badge 
                          variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {profile?.role === 'seller' && (
            <TabsContent value="messages">
              <Card className="bg-white/70 backdrop-blur-sm border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Contact Messages
                    </div>
                    <Link to="/voltmarket/contact-messages">
                      <Button size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        View All Messages
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {contactMessages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No new messages</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contactMessages.slice(0, 5).map((message) => (
                        <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-gray-900">{message.sender_name}</p>
                              {!message.is_read && (
                                <Badge variant="secondary" className="text-xs">New</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="portfolios">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Portfolio Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="p-4 rounded-lg border border-gray-200 bg-white">
                      <h3 className="font-semibold text-gray-900">{portfolio.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{portfolio.description}</p>
                      <div className="mt-3">
                        <p className="text-lg font-bold text-green-600">
                          ${portfolio.total_value?.toLocaleString() || '0'}
                        </p>
                        {portfolio.metrics && (
                          <p className="text-sm text-gray-500">
                            {portfolio.metrics.totalItems} items • {portfolio.metrics.returnPercentage.toFixed(1)}% return
                          </p>
                        )}
                      </div>
                      <Badge className="mt-2" variant="outline">
                        {portfolio.portfolio_type}
                      </Badge>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                    <Button variant="ghost" className="h-full w-full">
                      <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-gray-600">Create Portfolio</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Document Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['Financial', 'Legal', 'Technical', 'Due Diligence'].map((type, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 bg-white text-center">
                      <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">{type}</h3>
                      <p className="text-2xl font-bold text-gray-900 mt-2">
                        {documents.filter(d => d.document_type === type.toLowerCase().replace(' ', '_')).length}
                      </p>
                      <p className="text-sm text-gray-500">Documents</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lois">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Letters of Intent
                </CardTitle>
              </CardHeader>
              <CardContent>
                {profile?.role === 'seller' ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Received LOIs</h3>
                      <Link to="/voltmarket/loi-center">
                        <Button size="sm">
                          <HandHeart className="w-4 h-4 mr-2" />
                          View All ({pendingLOIs})
                        </Button>
                      </Link>
                    </div>
                    
                    {receivedLOIs.length === 0 ? (
                      <div className="text-center py-8">
                        <Scale className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No pending LOIs</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {receivedLOIs.slice(0, 3).map((loi) => (
                          <div key={loi.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">
                                {loi.voltmarket_listings?.title || 'Listing'}
                              </p>
                              <p className="text-sm text-gray-600">
                                From: {loi.voltmarket_profiles?.company_name || 'Unknown'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Offer: ${loi.offered_price?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">LOI Management</h3>
                    <p className="text-gray-600 mb-4">Submit and track formal Letters of Intent</p>
                    <Link to="/voltmarket/loi-center">
                      <Button>View LOIs</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Verification Center
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { type: 'Identity', status: 'approved', icon: Users },
                    { type: 'Company', status: 'pending', icon: Users },
                    { type: 'Financial', status: 'not_started', icon: TrendingUp },
                    { type: 'Accredited', status: 'not_started', icon: Shield }
                  ].map((verification, index) => (
                    <div key={index} className="p-4 rounded-lg border border-gray-200 bg-white text-center">
                      <verification.icon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-semibold text-gray-900">{verification.type}</h3>
                      <Badge 
                        className="mt-2"
                        variant={
                          verification.status === 'approved' ? 'default' :
                          verification.status === 'pending' ? 'secondary' : 'outline'
                        }
                      >
                        {verification.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};