import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export function EngagementChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['engagement-over-time'],
    queryFn: async () => {
      const sevenDaysAgo = subDays(new Date(), 7);
      
      const { data: activity, error } = await supabase
        .from('viewer_activity')
        .select('opened_at, engagement_score')
        .gte('opened_at', sevenDaysAgo.toISOString())
        .order('opened_at', { ascending: true });

      if (error) throw error;

      // Group by day
      const grouped = activity?.reduce((acc: any, curr) => {
        const day = format(new Date(curr.opened_at), 'MMM dd');
        if (!acc[day]) {
          acc[day] = { day, totalEngagement: 0, count: 0 };
        }
        acc[day].totalEngagement += curr.engagement_score || 0;
        acc[day].count += 1;
        return acc;
      }, {});

      return Object.values(grouped || {}).map((g: any) => ({
        day: g.day,
        engagement: Math.round(g.totalEngagement / g.count)
      }));
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
