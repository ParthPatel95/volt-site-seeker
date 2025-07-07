import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useVoltMarketAnalytics } from '@/hooks/useVoltMarketAnalytics';
import { Eye, MessageSquare, Heart, TrendingUp, Users, Clock, DollarSign, Zap } from 'lucide-react';

interface VoltMarketListingAnalyticsProps {
  listingId: string;
  listingData: any;
}

export const VoltMarketListingAnalytics: React.FC<VoltMarketListingAnalyticsProps> = ({
  listingId,
  listingData
}) => {
  const { trackUserActivity } = useVoltMarketAnalytics();
  const [analytics, setAnalytics] = useState({
    views: 245,
    inquiries: 12,
    watchlist_adds: 8,
    avg_time_on_page: '3:45',
    conversion_rate: 4.9,
    interest_score: 85
  });

  const [marketComparison] = useState({
    price_percentile: 65,
    capacity_percentile: 80,
    location_demand: 'High',
    time_on_market: 14
  });

  useEffect(() => {
    // Track view of analytics
    trackUserActivity('analytics_view', { listingId });
  }, [listingId]);

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Listing Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{analytics.views}</div>
              <div className="text-sm text-gray-600">Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{analytics.inquiries}</div>
              <div className="text-sm text-gray-600">Inquiries</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{analytics.watchlist_adds}</div>
              <div className="text-sm text-gray-600">Saved</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">{analytics.interest_score}</div>
              <div className="text-sm text-gray-600">Interest Score</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Position */}
      <Card>
        <CardHeader>
          <CardTitle>Market Position</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Price Competitiveness</span>
              <Badge variant="secondary">{marketComparison.price_percentile}th percentile</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Capacity Rating</span>
              <Badge variant="default">{marketComparison.capacity_percentile}th percentile</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Location Demand</span>
              <Badge className="bg-green-500">{marketComparison.location_demand}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Time on Market</span>
              <span className="text-sm">{marketComparison.time_on_market} days</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Average Time on Page</span>
              </div>
              <span className="font-medium">{analytics.avg_time_on_page}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-600" />
                <span className="text-sm">Inquiry Conversion Rate</span>
              </div>
              <span className="font-medium">{analytics.conversion_rate}%</span>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Performance Insights</h4>
              <p className="text-sm text-blue-800">
                Your listing is performing above average with strong interest from verified buyers. 
                Consider responding quickly to inquiries to maintain momentum.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};