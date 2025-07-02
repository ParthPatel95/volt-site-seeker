
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVoltMarketAuth } from '@/hooks/useVoltMarketAuth';
import { 
  Plus, 
  MessageSquare, 
  FileText, 
  TrendingUp,
  Eye,
  Heart,
  DollarSign,
  Users,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const VoltMarketDashboard: React.FC = () => {
  const { profile } = useVoltMarketAuth();

  const stats = {
    listings: 0,
    messages: 0,
    views: 0,
    lois: 0,
    ndas: 0,
    saved: 0
  };

  const recentActivity = [
    {
      type: 'message',
      title: 'New message from John Smith',
      time: '2 hours ago',
      icon: MessageSquare
    },
    {
      type: 'view',
      title: 'Your listing "150MW Data Center" was viewed',
      time: '4 hours ago',
      icon: Eye
    },
    {
      type: 'loi',
      title: 'LOI received for "Texas Facility"',
      time: '1 day ago',
      icon: FileText
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.company_name || 'User'}!
          </h1>
          <div className="flex items-center gap-2">
            <Badge variant={profile?.role === 'seller' ? 'default' : 'secondary'}>
              {profile?.role === 'seller' ? 'Seller' : 'Buyer'}
            </Badge>
            {profile?.seller_type && (
              <Badge variant="outline" className="capitalize">
                {profile.seller_type.replace('_', ' ')}
              </Badge>
            )}
            {profile?.is_id_verified && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Verified
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {profile?.role === 'seller' ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Listings</p>
                      <p className="text-3xl font-bold">{stats.listings}</p>
                    </div>
                    <Plus className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-3xl font-bold">{stats.views}</p>
                    </div>
                    <Eye className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">LOIs Received</p>
                      <p className="text-3xl font-bold">{stats.lois}</p>
                    </div>
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">NDA Requests</p>
                      <p className="text-3xl font-bold">{stats.ndas}</p>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Saved Listings</p>
                      <p className="text-3xl font-bold">{stats.saved}</p>
                    </div>
                    <Heart className="w-8 h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">LOIs Submitted</p>
                      <p className="text-3xl font-bold">{stats.lois}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">DD Accessed</p>
                      <p className="text-3xl font-bold">{stats.ndas}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Messages</p>
                      <p className="text-3xl font-bold">{stats.messages}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile?.role === 'seller' && (
                  <Link to="/voltmarket/create-listing">
                    <Button className="w-full justify-start">
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Listing
                    </Button>
                  </Link>
                )}
                
                <Link to="/voltmarket/messages">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Messages
                  </Button>
                </Link>
                
                <Link to="/voltmarket/listings">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Browse Listings
                  </Button>
                </Link>
                
                <Link to="/voltmarket/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {profile?.role === 'seller' 
                        ? 'Create your first listing to get started!'
                        : 'Start browsing listings to see activity here.'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                          <activity.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
