import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { UserCheck, LogIn, LogOut, Clock, MapPin, Download, Users } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, differenceInMinutes } from 'date-fns';
import { VoltBuildProject } from '../types/voltbuild.types';
import { useFieldCheckins } from './hooks/useFieldCheckins';
import { cn } from '@/lib/utils';

interface VoltFieldCheckInsTabProps {
  project: VoltBuildProject;
}

export function VoltFieldCheckInsTab({ project }: VoltFieldCheckInsTabProps) {
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [userName, setUserName] = useState('');
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);

  const { checkins, isLoading, activeCheckin, checkIn, checkOut, isCheckingIn } = useFieldCheckins(project.id);

  // Get today's check-ins
  const todayCheckins = checkins.filter(c => 
    isSameDay(new Date(c.checkin_time), new Date())
  );

  // Get this week's days
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group check-ins by user for weekly view
  const checkInsByUser = checkins.reduce((acc, checkin) => {
    const name = checkin.user_name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(checkin);
    return acc;
  }, {} as Record<string, typeof checkins>);

  const handleCheckIn = async () => {
    let location = undefined;
    if (useDeviceLocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        // Convert to coarse location (just "Current Location" for now - in production would reverse geocode)
        location = 'Current Area';
      } catch {
        location = 'Location unavailable';
      }
    }

    await checkIn({
      user_name: userName || undefined,
      coarse_location: location,
      method: useDeviceLocation ? 'device' : 'manual',
      notes: checkInNotes || undefined,
    });

    setCheckInNotes('');
    setIsCheckInDialogOpen(false);
  };

  const handleCheckOut = async () => {
    if (activeCheckin) {
      await checkOut(activeCheckin.id);
    }
  };

  const calculateHours = (checkin: typeof checkins[0]) => {
    if (!checkin.checkout_time) return '-';
    const minutes = differenceInMinutes(new Date(checkin.checkout_time), new Date(checkin.checkin_time));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Field Check-Ins</h1>
          <p className="text-muted-foreground mt-1">
            Track attendance and time on site for field workers
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Check In/Out Actions */}
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                activeCheckin ? "bg-emerald-500/20" : "bg-muted"
              )}>
                <UserCheck className={cn(
                  "w-8 h-8",
                  activeCheckin ? "text-emerald-600" : "text-muted-foreground"
                )} />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {activeCheckin ? 'You are checked in' : 'Not checked in'}
                </p>
                {activeCheckin && (
                  <p className="text-muted-foreground">
                    Since {format(new Date(activeCheckin.checkin_time), 'h:mm a')}
                    {activeCheckin.coarse_location && ` • ${activeCheckin.coarse_location}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {activeCheckin ? (
                <Button 
                  onClick={handleCheckOut} 
                  variant="outline"
                  size="lg"
                  className="min-w-[140px]"
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Check Out
                </Button>
              ) : (
                <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="min-w-[140px]">
                      <LogIn className="w-5 h-5 mr-2" />
                      Check In
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Check In to Site</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Your Name (optional)</Label>
                        <Input
                          placeholder="Enter your name..."
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Use Device Location</Label>
                          <p className="text-xs text-muted-foreground">
                            Only stores coarse area (e.g., "Edmonton Area")
                          </p>
                        </div>
                        <Switch
                          checked={useDeviceLocation}
                          onCheckedChange={setUseDeviceLocation}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notes (optional)</Label>
                        <Textarea
                          placeholder="Any notes for this check-in..."
                          value={checkInNotes}
                          onChange={(e) => setCheckInNotes(e.target.value)}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCheckIn} disabled={isCheckingIn}>
                          <LogIn className="w-4 h-4 mr-2" />
                          Check In Now
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Check-Ins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Today's Check-Ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayCheckins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No check-ins today
              </div>
            ) : (
              <div className="space-y-3">
                {todayCheckins.map(checkin => (
                  <div 
                    key={checkin.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        checkin.checkout_time ? "bg-muted" : "bg-emerald-500/20"
                      )}>
                        <UserCheck className={cn(
                          "w-5 h-5",
                          checkin.checkout_time ? "text-muted-foreground" : "text-emerald-600"
                        )} />
                      </div>
                      <div>
                        <p className="font-medium">{checkin.user_name || 'Anonymous'}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(checkin.checkin_time), 'h:mm a')}
                          {checkin.checkout_time && ` - ${format(new Date(checkin.checkout_time), 'h:mm a')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkin.coarse_location && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {checkin.coarse_location}
                        </Badge>
                      )}
                      <Badge variant={checkin.checkout_time ? "secondary" : "default"}>
                        {checkin.checkout_time ? calculateHours(checkin) : 'Active'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Weekly Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(checkInsByUser).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No check-ins this week
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    {weekDays.map(day => (
                      <TableHead key={day.toISOString()} className="text-center w-12">
                        {format(day, 'EEE')}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(checkInsByUser).slice(0, 10).map(([name, userCheckins]) => {
                    let totalMinutes = 0;
                    
                    return (
                      <TableRow key={name}>
                        <TableCell className="font-medium">{name}</TableCell>
                        {weekDays.map(day => {
                          const dayCheckin = userCheckins.find(c => 
                            isSameDay(new Date(c.checkin_time), day)
                          );
                          if (dayCheckin?.checkout_time) {
                            const mins = differenceInMinutes(
                              new Date(dayCheckin.checkout_time), 
                              new Date(dayCheckin.checkin_time)
                            );
                            totalMinutes += mins;
                          }
                          return (
                            <TableCell key={day.toISOString()} className="text-center">
                              {dayCheckin ? (
                                <div className={cn(
                                  "w-6 h-6 rounded-full mx-auto flex items-center justify-center",
                                  dayCheckin.checkout_time 
                                    ? "bg-emerald-500/20 text-emerald-600" 
                                    : "bg-blue-500/20 text-blue-600"
                                )}>
                                  ✓
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full mx-auto bg-muted" />
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {Math.round(totalMinutes / 60)}h
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
