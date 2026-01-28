import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarClock,
  Download,
  CheckCircle2,
  Clock,
  Thermometer,
  Calendar,
  AlertTriangle,
  Snowflake,
} from 'lucide-react';
import {
  ScheduledPeakEvent,
  downloadICSFile,
  downloadSingleEventICS,
} from '@/lib/calendarExport';
import { getPredictionSummary } from '@/lib/12cpPredictionEngine';

interface Upcoming12CPScheduleProps {
  events: ScheduledPeakEvent[];
}

const formatNumber = (value: number) => new Intl.NumberFormat('en-CA').format(value);

const getRiskVariant = (level: string): 'destructive' | 'secondary' | 'outline' => {
  switch (level) {
    case 'critical':
      return 'destructive';
    case 'high':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getRiskColor = (level: string): string => {
  switch (level) {
    case 'critical':
      return 'text-red-600 dark:text-red-400';
    case 'high':
      return 'text-orange-600 dark:text-orange-400';
    case 'moderate':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-muted-foreground';
  }
};

const getRiskBgColor = (level: string): string => {
  switch (level) {
    case 'critical':
      return 'bg-red-500';
    case 'high':
      return 'bg-orange-500';
    case 'moderate':
      return 'bg-yellow-500';
    default:
      return 'bg-muted';
  }
};

export function Upcoming12CPSchedule({ events }: Upcoming12CPScheduleProps) {
  const summary = getPredictionSummary(events);

  const decemberEvents = events.filter((e) => e.monthGroup === 'december');
  const januaryEvents = events.filter((e) => e.monthGroup === 'january');

  const handleDownloadAll = () => {
    downloadICSFile(events);
  };

  const handleDownloadSingle = (event: ScheduledPeakEvent) => {
    downloadSingleEventICS(event);
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Critical Peaks</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {summary.criticalCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Highest probability</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">December Events</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {summary.decemberCount}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Primary peak window</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-transparent dark:from-purple-950/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Expected Max</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatNumber(summary.expectedMaxDemand)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">MW projected</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/30">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">Avg Confidence</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.averageConfidence}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Prediction accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Download All Button */}
      <div className="flex justify-end">
        <Button onClick={handleDownloadAll} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Download All to Calendar
        </Button>
      </div>

      {/* December 2026 Events */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50">
              <Snowflake className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span>December 2026</span>
            <Badge variant="secondary" className="ml-2">
              {decemberEvents.length} events
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-4">
            {decemberEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                isLast={index === decemberEvents.length - 1}
                onDownload={handleDownloadSingle}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* January 2027 Events */}
      {januaryEvents.length > 0 && (
        <Card className="border-muted">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50">
                <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
              <span>January 2027</span>
              <Badge variant="outline" className="ml-2">
                {januaryEvents.length} events
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {januaryEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isLast={index === januaryEvents.length - 1}
                  onDownload={handleDownloadSingle}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="p-4 rounded-lg bg-muted/50 border">
        <h4 className="font-medium text-sm mb-3">Risk Level Legend</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Critical (85%+ confidence)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>High (70-84%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span>Moderate (55-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span>Low (&lt;55%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Event Card Component
function EventCard({
  event,
  isLast,
  onDownload,
}: {
  event: ScheduledPeakEvent;
  isLast: boolean;
  onDownload: (event: ScheduledPeakEvent) => void;
}) {
  return (
    <div className="flex items-start gap-4 relative">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-12 w-0.5 h-[calc(100%-24px)] bg-border" />
      )}

      {/* Event Marker */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm
          ${event.isPast
            ? 'bg-green-500 text-white'
            : event.riskLevel === 'critical'
            ? 'bg-red-500 text-white animate-pulse'
            : event.riskLevel === 'high'
            ? 'bg-orange-500 text-white'
            : event.riskLevel === 'moderate'
            ? 'bg-yellow-500 text-white'
            : 'bg-muted text-muted-foreground'
          }
        `}
      >
        {event.isPast ? <CheckCircle2 className="w-5 h-5" /> : `#${event.rank}`}
      </div>

      {/* Event Details */}
      <div className="flex-1 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h4 className="font-medium">{event.displayDate}</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
              <Clock className="w-3 h-3" />
              <span>
                {event.timeWindow.start} - {event.timeWindow.end} {event.timeWindow.timezone}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getRiskVariant(event.riskLevel)}>
              {event.riskLevel.toUpperCase()}
            </Badge>
            <span className={`text-sm font-medium ${getRiskColor(event.riskLevel)}`}>
              {event.confidenceScore}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <Progress
          value={event.confidenceScore}
          className={`h-1.5 mt-3 ${
            event.riskLevel === 'critical'
              ? '[&>div]:bg-red-500'
              : event.riskLevel === 'high'
              ? '[&>div]:bg-orange-500'
              : event.riskLevel === 'moderate'
              ? '[&>div]:bg-yellow-500'
              : ''
          }`}
        />

        {/* Details Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="text-muted-foreground">Expected: </span>
            <span className="font-bold">{formatNumber(event.expectedDemandMW.median)} MW</span>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="text-muted-foreground">Range: </span>
            <span className="font-medium">
              {formatNumber(event.expectedDemandMW.min)}-{formatNumber(event.expectedDemandMW.max)}
            </span>
          </div>
          <div className="p-2 rounded bg-muted/50 flex items-center gap-1">
            <Thermometer className="w-3 h-3 text-blue-500" />
            <span className="text-xs">{event.weatherCondition}</span>
          </div>
        </div>

        {/* Historical Reference */}
        <p className="text-xs text-muted-foreground mt-2">
          📊 Based on: {event.historicalReference}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-3">
          <Button
            onClick={() => onDownload(event)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <CalendarClock className="w-3 h-3" />
            Add to Calendar
          </Button>
          {event.daysUntilEvent > 0 && (
            <span className="text-xs text-muted-foreground">
              {event.daysUntilEvent} days away
            </span>
          )}
          {event.daysUntilEvent === 0 && (
            <Badge variant="destructive" className="animate-pulse">
              TODAY!
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
