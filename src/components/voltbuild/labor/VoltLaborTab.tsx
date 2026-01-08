import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Plus, Users, Clock, HardHat, Trash2 } from 'lucide-react';
import { useLaborTracking, LaborEntry, TradeType, ShiftType, TRADE_TYPES } from './hooks/useLaborTracking';
import { VoltBuildProject } from '../types/voltbuild.types';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface VoltLaborTabProps {
  project: VoltBuildProject;
  phases: { id: string; name: string }[];
}

export function VoltLaborTab({ project, phases }: VoltLaborTabProps) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    trade_type: 'electrician' as TradeType,
    headcount: '',
    hours_worked: '',
    contractor: '',
    shift: 'day' as ShiftType,
    phase_id: '',
    notes: '',
  });

  const { 
    laborEntries,
    createLaborEntry, 
    deleteLaborEntry,
    getStats,
    getWeeklyData,
    getEntriesForDate,
    isCreating,
    isLoading 
  } = useLaborTracking(project.id);

  const stats = getStats();
  const weeklyData = getWeeklyData(weekOffset);
  const selectedDateEntries = getEntriesForDate(selectedDate);

  const handleCreate = () => {
    createLaborEntry({
      project_id: project.id,
      date: form.date,
      trade_type: form.trade_type,
      headcount: parseInt(form.headcount) || 0,
      hours_worked: form.hours_worked ? parseFloat(form.hours_worked) : null,
      contractor: form.contractor || null,
      shift: form.shift,
      phase_id: form.phase_id || null,
      notes: form.notes || null,
    });
    setDialogOpen(false);
    setForm({
      date: format(new Date(), 'yyyy-MM-dd'),
      trade_type: 'electrician',
      headcount: '',
      hours_worked: '',
      contractor: '',
      shift: 'day',
      phase_id: '',
      notes: '',
    });
  };

  // Prepare chart data with stacked trades
  const chartData = weeklyData.map(day => ({
    ...day,
    ...day.byTrade,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.todayHeadcount}</div>
                <p className="text-xs text-muted-foreground">On Site Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.todayHours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Hours Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <HardHat className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.weekHours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Hours This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <div className="text-2xl font-bold">{stats.totalManhours.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Total Manhours</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Weekly Labor</CardTitle>
            <CardDescription>Headcount by trade per day</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setWeekOffset(w => w + 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm">
              {format(new Date(weeklyData[0]?.date || new Date()), 'MMM d')} - {format(new Date(weeklyData[6]?.date || new Date()), 'MMM d')}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
              disabled={weekOffset === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="dayName" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                {TRADE_TYPES.map(trade => (
                  <Bar 
                    key={trade.value}
                    dataKey={trade.value}
                    stackId="a"
                    fill={trade.color}
                    name={trade.label}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Entry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Entry */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Labor Entry</CardTitle>
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trade</Label>
                <Select 
                  value={form.trade_type} 
                  onValueChange={(v) => setForm(f => ({ ...f, trade_type: v as TradeType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Headcount</Label>
                <Input 
                  type="number"
                  value={form.headcount}
                  onChange={(e) => setForm(f => ({ ...f, headcount: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Worked</Label>
                <Input 
                  type="number"
                  value={form.hours_worked}
                  onChange={(e) => setForm(f => ({ ...f, hours_worked: e.target.value }))}
                  placeholder="8"
                />
              </div>
              <div className="space-y-2">
                <Label>Contractor</Label>
                <Input 
                  value={form.contractor}
                  onChange={(e) => setForm(f => ({ ...f, contractor: e.target.value }))}
                  placeholder="Company name"
                />
              </div>
              <div className="space-y-2">
                <Label>Shift</Label>
                <Select 
                  value={form.shift} 
                  onValueChange={(v) => setForm(f => ({ ...f, shift: v as ShiftType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                    <SelectItem value="swing">Swing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {phases.length > 0 && (
                <div className="space-y-2">
                  <Label>Phase</Label>
                  <Select 
                    value={form.phase_id} 
                    onValueChange={(v) => setForm(f => ({ ...f, phase_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {phases.map(phase => (
                        <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="col-span-2">
                <Button
                  className="w-full" 
                  onClick={handleCreate}
                  disabled={!form.headcount || isCreating}
                >
                  Add Entry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Detail */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Daily Breakdown</CardTitle>
              <Input 
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <CardDescription>
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEntries.length > 0 ? (
              <div className="space-y-2">
                {selectedDateEntries.map(entry => {
                  const trade = TRADE_TYPES.find(t => t.value === entry.trade_type);
                  return (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: trade?.color }}
                        />
                        <div>
                          <p className="font-medium">{trade?.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.contractor || 'No contractor'} • {entry.shift} shift
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">{entry.headcount}</p>
                          <p className="text-xs text-muted-foreground">workers</p>
                        </div>
                        {entry.hours_worked && (
                          <div className="text-right">
                            <p className="font-bold">{entry.hours_worked}</p>
                            <p className="text-xs text-muted-foreground">hours</p>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteLaborEntry(entry.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No labor entries for this date
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Add Labor Entry</DialogTitle>
            <DialogDescription>Add multiple workers for a specific trade.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Trade</Label>
                <Select 
                  value={form.trade_type} 
                  onValueChange={(v) => setForm(f => ({ ...f, trade_type: v as TradeType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Headcount *</Label>
                <Input 
                  type="number"
                  value={form.headcount}
                  onChange={(e) => setForm(f => ({ ...f, headcount: e.target.value }))}
                  placeholder="Number of workers"
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Per Person</Label>
                <Input 
                  type="number"
                  value={form.hours_worked}
                  onChange={(e) => setForm(f => ({ ...f, hours_worked: e.target.value }))}
                  placeholder="8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Contractor</Label>
              <Input 
                value={form.contractor}
                onChange={(e) => setForm(f => ({ ...f, contractor: e.target.value }))}
                placeholder="Company name (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.headcount || isCreating}>
              Add Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
