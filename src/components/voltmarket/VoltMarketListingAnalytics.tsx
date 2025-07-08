import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Activity,
  BarChart3,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

interface ListingAnalytics {
  listingId: string;
  title: string;
  totalViews: number;
  uniqueViews: number;
  watchlistAdds: number;
  inquiries: number;
  avgTimeOnPage: number;
  conversionRate: number;
  viewsData: Array<{ date: string; views: number; uniqueViews: number }>;
  geographicData: Array<{ location: string; views: number; percentage: number }>;
  trafficSources: Array<{ source: string; visits: number; percentage: number }>;
  interestedParties: Array<{
    id: string;
    name: string;
    company: string;
    viewCount: number;
    lastViewed: string;
    inquiryStatus: 'none' | 'inquiry' | 'loi' | 'due_diligence';
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const VoltMarketListingAnalytics: React.FC<{ listingId: string }> = ({ listingId }) => {
  const [analytics, setAnalytics] = useState<ListingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    // Mock data - in real implementation, this would fetch from analytics API
    const mockAnalytics: ListingAnalytics = {
      listingId,
      title: "Industrial Solar Farm - 50MW Capacity",
      totalViews: 1247,
      uniqueViews: 892,
      watchlistAdds: 45,
      inquiries: 12,
      avgTimeOnPage: 285, // seconds
      conversionRate: 3.6,
      viewsData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
        views: Math.floor(Math.random() * 50) + 20,
        uniqueViews: Math.floor(Math.random() * 35) + 15
      })),
      geographicData: [
        { location: 'Texas', views: 324, percentage: 26 },
        { location: 'California', views: 298, percentage: 24 },
        { location: 'New York', views: 187, percentage: 15 },
        { location: 'Florida', views: 149, percentage: 12 },
        { location: 'Others', views: 289, percentage: 23 }
      ],
      trafficSources: [
        { source: 'Direct', visits: 445, percentage: 36 },
        { source: 'Search', visits: 312, percentage: 25 },
        { source: 'Referral', visits: 223, percentage: 18 },
        { source: 'Social', visits: 156, percentage: 12 },
        { source: 'Email', visits: 111, percentage: 9 }
      ],
      interestedParties: [
        {
          id: '1',
          name: 'John Smith',
          company: 'Green Energy Investments',
          viewCount: 8,
          lastViewed: '2 hours ago',
          inquiryStatus: 'loi'
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          company: 'Solar Capital Partners',
          viewCount: 5,
          lastViewed: '1 day ago',
          inquiryStatus: 'inquiry'
        },
        {
          id: '3',
          name: 'Mike Davis',
          company: 'Renewable Assets Fund',
          viewCount: 12,
          lastViewed: '3 hours ago',
          inquiryStatus: 'due_diligence'
        }
      ]
    };

    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [listingId, timeRange]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getInquiryStatusColor = (status: string) => {
    switch (status) {
      case 'loi': return 'bg-blue-500';
      case 'inquiry': return 'bg-yellow-500';
      case 'due_diligence': return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>No analytics data available for this listing.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{analytics.title}</h2>
          <p className="text-muted-foreground">Analytics for the last {timeRange}</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Unique Visitors</p>
                <p className="text-2xl font-bold">{analytics.uniqueViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Inquiries</p>
                <p className="text-2xl font-bold">{analytics.inquiries}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">{analytics.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Views Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="views" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="uniqueViews" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Time on Page</span>
                    <span className="font-medium">{formatTime(analytics.avgTimeOnPage)}</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Watchlist Adds</span>
                    <span className="font-medium">{analytics.watchlistAdds}</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Inquiry Rate</span>
                    <span className="font-medium">{analytics.conversionRate}%</span>
                  </div>
                  <Progress value={analytics.conversionRate * 2.5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.geographicData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="views"
                      label={({ location, percentage }) => `${location} ${percentage}%`}
                    >
                      {analytics.geographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.geographicData.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{location.views} views</span>
                        <Badge variant="outline">{location.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.trafficSources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="visits" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Interested Parties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.interestedParties.map((party) => (
                  <div key={party.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{party.name}</p>
                      <p className="text-sm text-muted-foreground">{party.company}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Activity className="w-3 h-3" />
                        <span>{party.viewCount} views</span>
                        <span>•</span>
                        <span>Last viewed {party.lastViewed}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getInquiryStatusColor(party.inquiryStatus)}`}></div>
                      <Badge variant="outline" className="capitalize">
                        {party.inquiryStatus.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};