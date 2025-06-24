
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingDown, Eye, ExternalLink } from 'lucide-react';

interface IndustryIntelDashboardProps {
  opportunities: any[];
  watchlist: any[];
  onWatchlistUpdate: (watchlist: any[]) => void;
}

export function IndustryIntelDashboard({ 
  opportunities, 
  watchlist, 
  onWatchlistUpdate 
}: IndustryIntelDashboardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Top Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {opportunities.length === 0 ? (
            <div className="text-center py-8">
              <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No opportunities found</h3>
              <p className="text-gray-500">Run an intelligence scan to discover opportunities</p>
            </div>
          ) : (
            <div className="space-y-4">
              {opportunities.slice(0, 10).map((opportunity, index) => (
                <div key={opportunity.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{opportunity.name}</h4>
                        <Badge variant={opportunity.type === 'distressed' ? 'destructive' : 'secondary'}>
                          {opportunity.type}
                        </Badge>
                        <Badge variant="outline">
                          {opportunity.estimatedPowerMW}MW
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{opportunity.location}</p>
                      <p className="text-sm text-gray-700">{opportunity.aiInsights}</p>
                      <div className="flex gap-2 mt-2">
                        {opportunity.sources?.map((source: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Eye className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
