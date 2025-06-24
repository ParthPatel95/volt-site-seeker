
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export function MarketParticipantsPanel({ marketParticipants, loading }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="w-5 h-5 mr-2 text-indigo-600" />
          Market Participants
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Market participants analysis coming soon...</p>
      </CardContent>
    </Card>
  );
}
