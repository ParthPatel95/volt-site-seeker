import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Plus, FileText, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths } from 'date-fns';
import { VoltBuildProject } from '../types/voltbuild.types';
import { DailyLogForm } from './DailyLogForm';
import { DailyLogDetail } from './DailyLogDetail';
import { useDailyLogs } from './hooks/useDailyLogs';
import { cn } from '@/lib/utils';

interface VoltDailyLogsTabProps {
  project: VoltBuildProject;
}

export function VoltDailyLogsTab({ project }: VoltDailyLogsTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { dailyLogs, isLoading, createDailyLog, updateDailyLog, deleteDailyLog, isCreating } = useDailyLogs(project.id);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get dates that have logs
  const datesWithLogs = new Set(dailyLogs.map(log => log.date));

  // Get log for selected date
  const selectedLog = selectedDate 
    ? dailyLogs.find(log => log.date === format(selectedDate, 'yyyy-MM-dd'))
    : null;

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const log = dailyLogs.find(l => l.date === format(date, 'yyyy-MM-dd'));
    if (log) {
      setSelectedLogId(log.id);
    } else {
      setSelectedLogId(null);
    }
  };

  const handleNewLog = () => {
    setSelectedDate(new Date());
    setSelectedLogId(null);
    setIsFormOpen(true);
  };

  const handleEditLog = () => {
    setIsFormOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Daily Logs</h1>
          <p className="text-muted-foreground mt-1">
            Construction journal with photos, work progress, and field notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleNewLog} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Daily Log
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-lg">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {daysInMonth.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const hasLog = datesWithLogs.has(dateStr);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDateClick(day)}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors relative",
                      "hover:bg-muted",
                      isToday(day) && "ring-2 ring-primary",
                      isSelected && "bg-primary text-primary-foreground hover:bg-primary/90",
                      !isSameMonth(day, currentMonth) && "text-muted-foreground opacity-50"
                    )}
                  >
                    <span>{format(day, 'd')}</span>
                    {hasLog && !isSelected && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Has log entry</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded ring-2 ring-primary" />
                <span>Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Content */}
        <div className="lg:col-span-2">
          {isFormOpen ? (
            <DailyLogForm
              projectId={project.id}
              date={selectedDate || new Date()}
              existingLog={selectedLog || undefined}
              onSubmit={async (data) => {
                if (selectedLog) {
                  await updateDailyLog({ id: selectedLog.id, ...data });
                } else {
                  await createDailyLog(data);
                }
                setIsFormOpen(false);
              }}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isCreating}
            />
          ) : selectedLog ? (
            <DailyLogDetail
              log={selectedLog}
              projectId={project.id}
              onEdit={handleEditLog}
              onDelete={async () => {
                await deleteDailyLog(selectedLog.id);
                setSelectedLogId(null);
                setSelectedDate(null);
              }}
            />
          ) : selectedDate ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CalendarDays className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">
                  No log for {format(selectedDate, 'MMMM d, yyyy')}
                </p>
                <p className="text-muted-foreground mb-4">
                  Create a daily log to track work progress, weather, and notes
                </p>
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Daily Log
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">Select a date</p>
                <p className="text-muted-foreground">
                  Click on a date in the calendar to view or create a daily log
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Recent Logs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Daily Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading logs...</div>
          ) : dailyLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No daily logs yet. Create your first log to track site progress.
            </div>
          ) : (
            <div className="space-y-3">
              {dailyLogs.slice(0, 5).map(log => (
                <button
                  key={log.id}
                  onClick={() => {
                    setSelectedDate(new Date(log.date));
                    setSelectedLogId(log.id);
                    setIsFormOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{format(new Date(log.date), 'EEEE, MMMM d, yyyy')}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {log.work_completed?.slice(0, 100) || 'No work description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.labor_count > 0 && (
                      <Badge variant="outline">{log.labor_count} workers</Badge>
                    )}
                    {log.weather_summary && (
                      <Badge variant="secondary">{log.weather_summary}</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
