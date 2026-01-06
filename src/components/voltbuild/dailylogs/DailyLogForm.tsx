import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Cloud, Loader2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { DailyLog, DailyLogFormData } from '../types/voltbuild-phase3.types';

interface DailyLogFormProps {
  projectId: string;
  date: Date;
  existingLog?: DailyLog;
  onSubmit: (data: DailyLogFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const WEATHER_OPTIONS = [
  'Sunny',
  'Partly Cloudy',
  'Cloudy',
  'Overcast',
  'Light Rain',
  'Heavy Rain',
  'Snow',
  'Windy',
  'Extreme Cold',
  'Extreme Heat',
];

export function DailyLogForm({ projectId, date, existingLog, onSubmit, onCancel, isLoading }: DailyLogFormProps) {
  const [formData, setFormData] = useState<DailyLogFormData>({
    date: existingLog?.date || format(date, 'yyyy-MM-dd'),
    weather_summary: existingLog?.weather_summary || '',
    work_completed: existingLog?.work_completed || '',
    blockers: existingLog?.blockers || '',
    next_day_plan: existingLog?.next_day_plan || '',
    labor_count: existingLog?.labor_count || 0,
    equipment_on_site: existingLog?.equipment_on_site || '',
    hours_worked: existingLog?.hours_worked || 8,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const updateField = <K extends keyof DailyLogFormData>(field: K, value: DailyLogFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5" />
            {existingLog ? 'Edit Daily Log' : 'New Daily Log'}
            <span className="text-muted-foreground font-normal">
              - {format(date, 'MMMM d, yyyy')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Weather & Basic Info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weather">Weather Conditions</Label>
              <Select
                value={formData.weather_summary}
                onValueChange={(v) => updateField('weather_summary', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weather" />
                </SelectTrigger>
                <SelectContent>
                  {WEATHER_OPTIONS.map(weather => (
                    <SelectItem key={weather} value={weather}>
                      <span className="flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        {weather}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_count">Workers On Site</Label>
              <Input
                id="labor_count"
                type="number"
                min="0"
                value={formData.labor_count}
                onChange={(e) => updateField('labor_count', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours_worked">Hours Worked</Label>
              <Input
                id="hours_worked"
                type="number"
                min="0"
                step="0.5"
                value={formData.hours_worked}
                onChange={(e) => updateField('hours_worked', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment On Site</Label>
            <Input
              id="equipment"
              placeholder="e.g., Crane, Excavator, Forklifts..."
              value={formData.equipment_on_site}
              onChange={(e) => updateField('equipment_on_site', e.target.value)}
            />
          </div>

          {/* Work Completed */}
          <div className="space-y-2">
            <Label htmlFor="work_completed">Work Completed Today</Label>
            <Textarea
              id="work_completed"
              placeholder="Describe the work completed today..."
              rows={4}
              value={formData.work_completed}
              onChange={(e) => updateField('work_completed', e.target.value)}
            />
          </div>

          {/* Blockers */}
          <div className="space-y-2">
            <Label htmlFor="blockers">Blockers / Issues</Label>
            <Textarea
              id="blockers"
              placeholder="Any delays, issues, or blockers encountered..."
              rows={3}
              value={formData.blockers}
              onChange={(e) => updateField('blockers', e.target.value)}
            />
          </div>

          {/* Next Day Plan */}
          <div className="space-y-2">
            <Label htmlFor="next_day_plan">Plan for Tomorrow</Label>
            <Textarea
              id="next_day_plan"
              placeholder="What's planned for the next work day..."
              rows={3}
              value={formData.next_day_plan}
              onChange={(e) => updateField('next_day_plan', e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {existingLog ? 'Update Log' : 'Save Daily Log'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
