import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { MilestoneWithRisk, RiskLevel } from '../types/voltbuild-advanced.types';
import { addDays, format } from 'date-fns';

interface LeadTimeTimelineProps {
  milestones: MilestoneWithRisk[];
  startDate: Date;
  targetRfsDate: string | null;
}

export function LeadTimeTimeline({
  milestones,
  startDate,
  targetRfsDate,
}: LeadTimeTimelineProps) {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-amber-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getRiskBadgeVariant = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Calculate total timeline span
  const maxDays = useMemo(() => {
    if (milestones.length === 0) return 365;
    return Math.max(...milestones.map((m) => m.endDay), 365);
  }, [milestones]);

  // Calculate position and width for each milestone
  const milestoneBars = useMemo(() => {
    return milestones.map((m) => ({
      ...m,
      leftPct: (m.startDay / maxDays) * 100,
      widthPct: ((m.endDay - m.startDay) / maxDays) * 100,
      startDateStr: format(addDays(startDate, m.startDay), 'MMM d, yyyy'),
      endDateStr: format(addDays(startDate, m.endDay), 'MMM d, yyyy'),
    }));
  }, [milestones, maxDays, startDate]);

  // Generate month markers
  const monthMarkers = useMemo(() => {
    const markers: { label: string; leftPct: number }[] = [];
    const monthsToShow = Math.ceil(maxDays / 30);

    for (let i = 0; i <= monthsToShow; i++) {
      const day = i * 30;
      if (day <= maxDays) {
        markers.push({
          label: format(addDays(startDate, day), 'MMM yyyy'),
          leftPct: (day / maxDays) * 100,
        });
      }
    }
    return markers;
  }, [maxDays, startDate]);

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Projected Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Calculate a forecast to see the projected timeline
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Projected Timeline</CardTitle>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>On Track</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>At Risk</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Delayed</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          All dates are estimated projections
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full">
          <div className="min-w-[800px] relative">
            {/* Month Headers */}
            <div className="h-8 relative border-b border-border mb-4">
              {monthMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute top-0 text-xs text-muted-foreground"
                  style={{ left: `${marker.leftPct}%` }}
                >
                  {marker.label}
                </div>
              ))}
            </div>

            {/* Milestone Bars */}
            <div className="space-y-3">
              {milestoneBars.map((m) => (
                <div key={m.id} className="relative">
                  <div className="flex items-center gap-4 mb-1">
                    <div className="w-48 text-sm font-medium truncate">
                      {m.milestone}
                    </div>
                    <Badge
                      className={`text-xs ${getRiskBadgeVariant(m.riskLevel)} border`}
                    >
                      {m.confidence_pct}% confidence
                    </Badge>
                  </div>
                  <div className="relative h-6 bg-muted/30 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full rounded-full ${getRiskColor(m.riskLevel)} opacity-80`}
                      style={{
                        left: `${m.leftPct}%`,
                        width: `${Math.max(m.widthPct, 2)}%`,
                      }}
                    />
                    <div
                      className="absolute h-full flex items-center px-2 text-xs text-white font-medium"
                      style={{
                        left: `${m.leftPct}%`,
                        width: `${Math.max(m.widthPct, 2)}%`,
                        minWidth: '100px',
                      }}
                    >
                      {m.predicted_min_days} - {m.predicted_max_days} days
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
                    <span>{m.startDateStr}</span>
                    <span>{m.endDateStr}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Target RFS Line */}
            {targetRfsDate && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                style={{
                  left: `${Math.min(100, (maxDays / maxDays) * 100)}%`,
                }}
              >
                <div className="absolute -top-6 left-1 text-xs text-primary font-medium whitespace-nowrap">
                  Target RFS
                </div>
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
