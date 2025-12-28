import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Cell
} from 'recharts';
import { Calendar, Clock, Power, TrendingDown } from 'lucide-react';
import { format, subDays, differenceInMinutes } from 'date-fns';
import { cn } from '@/lib/utils';
import { AutomationLog } from '@/hooks/useDatacenterAutomation';

interface ShutdownTimelineProps {
  logs: AutomationLog[];
  periodDays?: number;
}

export function ShutdownTimeline({ logs, periodDays = 7 }: ShutdownTimelineProps) {
  // Group logs by day for the chart
  const dailyData = useMemo(() => {
    const days: { date: string; shutdowns: number; resumes: number; totalDuration: number }[] = [];
    
    for (let i = periodDays - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayLabel = format(date, 'EEE');
      
      const dayLogs = logs.filter(log => {
        const logDate = format(new Date(log.executed_at), 'yyyy-MM-dd');
        return logDate === dateStr;
      });
      
      const shutdowns = dayLogs.filter(l => l.action_type === 'shutdown').length;
      const resumes = dayLogs.filter(l => l.action_type === 'resume').length;
      
      // Calculate total shutdown duration (in hours)
      let totalDuration = 0;
      const shutdownLogs = dayLogs.filter(l => l.action_type === 'shutdown' && l.executed_at);
      shutdownLogs.forEach(shutdown => {
        const resumeLog = dayLogs.find(l => 
          l.action_type === 'resume' && 
          l.executed_at && 
          new Date(l.executed_at) > new Date(shutdown.executed_at)
        );
        if (resumeLog && resumeLog.executed_at && shutdown.executed_at) {
          totalDuration += differenceInMinutes(
            new Date(resumeLog.executed_at), 
            new Date(shutdown.executed_at)
          ) / 60;
        }
      });
      
      days.push({
        date: dayLabel,
        shutdowns,
        resumes,
        totalDuration: Math.round(totalDuration * 10) / 10
      });
    }
    
    return days;
  }, [logs, periodDays]);

  // Recent events for timeline
  const recentEvents = useMemo(() => {
    return logs
      .slice(0, 10)
      .map(log => ({
        ...log,
        formattedTime: format(new Date(log.executed_at), 'MMM d, HH:mm'),
        isShutdown: log.action_type === 'shutdown'
      }));
  }, [logs]);

  const totalShutdowns = logs.filter(l => l.action_type === 'shutdown').length;
  const totalResumes = logs.filter(l => l.action_type === 'resume').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Shutdown Timeline
          </CardTitle>
          <Badge variant="outline">Last {periodDays} days</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-2xl font-bold text-destructive">{totalShutdowns}</p>
            <p className="text-xs text-muted-foreground">Total Shutdowns</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-2xl font-bold text-green-500">{totalResumes}</p>
            <p className="text-xs text-muted-foreground">Total Resumes</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted border">
            <p className="text-2xl font-bold">
              {dailyData.reduce((sum, d) => sum + d.totalDuration, 0).toFixed(1)}h
            </p>
            <p className="text-xs text-muted-foreground">Total Downtime</p>
          </div>
        </div>

        {/* Daily Chart */}
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number, name: string) => [
                  value, 
                  name === 'shutdowns' ? 'Shutdowns' : name === 'resumes' ? 'Resumes' : 'Duration (h)'
                ]}
              />
              <Bar dataKey="shutdowns" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="resumes" fill="hsl(142 76% 36%)" radius={[4, 4, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Events Timeline */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Recent Events</p>
          {recentEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No events recorded</p>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-border" />
              <div className="space-y-3">
                {recentEvents.map((event, idx) => (
                  <div key={event.id} className="relative flex items-start gap-4 pl-8">
                    <div className={cn(
                      "absolute left-2.5 w-3 h-3 rounded-full border-2 bg-background",
                      event.isShutdown ? "border-destructive" : "border-green-500"
                    )} />
                    <div className="flex-1 flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        {event.isShutdown ? (
                          <Power className="w-4 h-4 text-destructive" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium capitalize">
                          {event.action_type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          at CA${event.trigger_price?.toFixed(2) ?? 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{event.total_load_affected_kw} kW</span>
                        <Clock className="w-3 h-3" />
                        <span>{event.formattedTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
