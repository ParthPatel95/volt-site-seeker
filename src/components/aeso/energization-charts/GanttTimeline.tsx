import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Calendar } from 'lucide-react';
import { AESO_CONNECTION_STAGES } from '@/constants/energization-fees';
import { format, addWeeks, differenceInWeeks } from 'date-fns';

interface Props {
  targetDate?: Date;
}

export function GanttTimeline({ targetDate }: Props) {
  const data = useMemo(() => {
    const stages = AESO_CONNECTION_STAGES;
    // Estimate durations for variable stages
    const durations = stages.map(s => s.targetWeeks || (s.id === 4 ? 26 : s.id === 5 ? 26 : 8));

    if (targetDate) {
      // Work backward from target date
      const totalWeeks = durations.reduce((s, w) => s + w, 0);
      let startWeek = 0;
      const projectStart = addWeeks(targetDate, -totalWeeks);

      return stages.map((stage, i) => {
        const entry = {
          name: stage.name,
          start: startWeek,
          duration: durations[i],
          end: startWeek + durations[i],
          startDate: format(addWeeks(projectStart, startWeek), 'MMM yyyy'),
          endDate: format(addWeeks(projectStart, startWeek + durations[i]), 'MMM yyyy'),
        };
        startWeek += durations[i];
        return entry;
      });
    }

    // Relative mode
    let startWeek = 0;
    return stages.map((stage, i) => {
      const entry = {
        name: stage.name,
        start: startWeek,
        duration: durations[i],
        end: startWeek + durations[i],
        startDate: `Week ${startWeek}`,
        endDate: `Week ${startWeek + durations[i]}`,
      };
      startWeek += durations[i];
      return entry;
    });
  }, [targetDate]);

  const totalWeeks = data[data.length - 1]?.end || 0;

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--primary))',
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Connection Process Gantt Chart
        </CardTitle>
        <CardDescription>
          {targetDate
            ? `Timeline working backward from ${format(targetDate, 'MMM d, yyyy')}`
            : 'Relative week durations (set a target date for calendar positioning)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" barSize={24}>
              <XAxis
                type="number"
                domain={[0, totalWeeks]}
                tick={{ fontSize: 11 }}
                label={{ value: targetDate ? 'Timeline' : 'Weeks', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11 }}
                width={110}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                formatter={(value: number, name: string) => {
                  if (name === 'start') return [null, null];
                  return [`${value} weeks`, 'Duration'];
                }}
                labelFormatter={(_, payload) => {
                  if (payload?.[0]) {
                    const d = payload[0].payload;
                    return `${d.name}: ${d.startDate} → ${d.endDate}`;
                  }
                  return '';
                }}
              />
              <Bar dataKey="start" stackId="a" fill="transparent" />
              <Bar dataKey="duration" stackId="a" radius={[0, 4, 4, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Bar>
              {targetDate && <ReferenceLine x={totalWeeks} stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'ISD', position: 'top', fontSize: 11 }} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
