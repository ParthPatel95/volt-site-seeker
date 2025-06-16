
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Zap, Calendar } from 'lucide-react';

interface FERCQueueItemsProps {
  interconnectionQueue: any;
}

export function FERCQueueItems({ interconnectionQueue }: FERCQueueItemsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2 text-purple-600" />
          Recent Queue Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {interconnectionQueue.queue_items && interconnectionQueue.queue_items.length > 0 ? (
          <div className="space-y-4">
            {interconnectionQueue.queue_items.slice(0, 3).map((item: any) => (
              <div key={item.queue_id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{item.project_name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.technology_type}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.county}, {item.state}
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-1" />
                    {item.capacity_mw} MW
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    Target: {new Date(item.interconnection_date).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <Badge variant={item.status === 'Under Review' ? 'default' : 'secondary'} className="text-xs">
                    {item.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Queue #{item.queue_position}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">No queue items available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
