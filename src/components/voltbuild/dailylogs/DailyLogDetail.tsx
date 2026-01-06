import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CalendarDays, Cloud, Edit, Trash2, Users, Clock, Wrench, AlertTriangle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { DailyLog } from '../types/voltbuild-phase3.types';
import { DailyLogMediaGallery } from './DailyLogMediaGallery';

interface DailyLogDetailProps {
  log: DailyLog;
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function DailyLogDetail({ log, projectId, onEdit, onDelete }: DailyLogDetailProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {format(new Date(log.date), 'EEEE, MMMM d, yyyy')}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Created {format(new Date(log.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Daily Log</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this daily log? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {log.weather_summary && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Weather</p>
                <p className="font-medium">{log.weather_summary}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Workers</p>
              <p className="font-medium">{log.labor_count || 0}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours</p>
              <p className="font-medium">{log.hours_worked || 0}h</p>
            </div>
          </div>
          {log.equipment_on_site && (
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Equipment</p>
                <p className="font-medium text-sm truncate max-w-[120px]">{log.equipment_on_site}</p>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Work Completed */}
        {log.work_completed && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Work Completed
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{log.work_completed}</p>
          </div>
        )}

        {/* Blockers */}
        {log.blockers && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Blockers / Issues
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{log.blockers}</p>
          </div>
        )}

        {/* Next Day Plan */}
        {log.next_day_plan && (
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-500" />
              Plan for Tomorrow
            </h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{log.next_day_plan}</p>
          </div>
        )}

        <Separator />

        {/* Media Gallery */}
        <DailyLogMediaGallery dailyLogId={log.id} projectId={projectId} />
      </CardContent>
    </Card>
  );
}
