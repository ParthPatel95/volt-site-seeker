import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Mail, Plus, Settings, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScheduledReport {
  id: string;
  name: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  time: string;
  recipients: string[];
  format: 'pdf' | 'excel' | 'html';
  includeCharts: boolean;
  includeCommentary: boolean;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
}

export function ScheduledReportsPanel() {
  const { toast } = useToast();
  const [reports, setReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      name: 'Daily Market Summary',
      description: 'Key metrics and price trends',
      frequency: 'daily',
      time: '08:00',
      recipients: ['team@example.com'],
      format: 'pdf',
      includeCharts: true,
      includeCommentary: true,
      enabled: true,
      lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextRun: new Date(Date.now() + 1000)
    }
  ]);

  const [newReport, setNewReport] = useState<Partial<ScheduledReport>>({
    name: '',
    description: '',
    frequency: 'daily',
    time: '09:00',
    recipients: [],
    format: 'pdf',
    includeCharts: true,
    includeCommentary: false,
    enabled: true
  });

  const [recipientInput, setRecipientInput] = useState('');

  const addRecipient = () => {
    if (recipientInput && recipientInput.includes('@')) {
      setNewReport({
        ...newReport,
        recipients: [...(newReport.recipients || []), recipientInput]
      });
      setRecipientInput('');
    } else {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
    }
  };

  const removeRecipient = (email: string) => {
    setNewReport({
      ...newReport,
      recipients: (newReport.recipients || []).filter(r => r !== email)
    });
  };

  const createReport = () => {
    if (!newReport.name || !newReport.recipients?.length) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and at least one recipient",
        variant: "destructive"
      });
      return;
    }

    const report: ScheduledReport = {
      id: Math.random().toString(36).substr(2, 9),
      name: newReport.name,
      description: newReport.description || '',
      frequency: newReport.frequency as 'daily' | 'weekly' | 'monthly',
      time: newReport.time || '09:00',
      recipients: newReport.recipients,
      format: newReport.format as 'pdf' | 'excel' | 'html',
      includeCharts: newReport.includeCharts ?? true,
      includeCommentary: newReport.includeCommentary ?? false,
      enabled: newReport.enabled ?? true,
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    setReports([...reports, report]);
    setNewReport({
      name: '',
      description: '',
      frequency: 'daily',
      time: '09:00',
      recipients: [],
      format: 'pdf',
      includeCharts: true,
      includeCommentary: false,
      enabled: true
    });

    toast({
      title: "Report Scheduled",
      description: `${report.name} has been created successfully`,
    });
  };

  const deleteReport = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
    toast({
      title: "Report Deleted",
      description: "Scheduled report has been removed",
    });
  };

  const toggleReport = (id: string) => {
    setReports(reports.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const runReportNow = (report: ScheduledReport) => {
    toast({
      title: "Generating Report",
      description: `${report.name} is being generated and will be sent shortly`,
    });
  };

  return (
    <Tabs defaultValue="list" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="list">
          <FileText className="w-4 h-4 mr-2" />
          Scheduled Reports
        </TabsTrigger>
        <TabsTrigger value="create">
          <Plus className="w-4 h-4 mr-2" />
          Create Report
        </TabsTrigger>
      </TabsList>

      {/* Existing Reports */}
      <TabsContent value="list" className="space-y-4">
        {reports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Scheduled Reports</h3>
              <p className="text-muted-foreground mb-4 text-center">
                Create automated reports to receive market insights on a regular schedule
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map(report => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {report.name}
                      <Badge variant={report.enabled ? "default" : "secondary"}>
                        {report.enabled ? "Active" : "Paused"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{report.description}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => toggleReport(report.id)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => runReportNow(report)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Frequency:</span>
                    <span className="ml-2 font-medium capitalize">{report.frequency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2 font-medium">{report.time}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <span className="ml-2 font-medium uppercase">{report.format}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recipients:</span>
                    <span className="ml-2 font-medium">{report.recipients.length}</span>
                  </div>
                  {report.lastRun && (
                    <div>
                      <span className="text-muted-foreground">Last Run:</span>
                      <span className="ml-2 font-medium">
                        {report.lastRun.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {report.nextRun && (
                    <div>
                      <span className="text-muted-foreground">Next Run:</span>
                      <span className="ml-2 font-medium">
                        {report.nextRun.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {report.recipients.map(email => (
                    <Badge key={email} variant="outline">
                      <Mail className="w-3 h-3 mr-1" />
                      {email}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </TabsContent>

      {/* Create New Report */}
      <TabsContent value="create">
        <Card>
          <CardHeader>
            <CardTitle>Create Scheduled Report</CardTitle>
            <CardDescription>
              Set up automated delivery of market insights and analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  placeholder="e.g., Weekly Market Analysis"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="report-desc">Description</Label>
                <Textarea
                  id="report-desc"
                  value={newReport.description}
                  onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                  placeholder="Brief description of the report content"
                  rows={3}
                />
              </div>
            </div>

            {/* Schedule */}
            <div className="space-y-4">
              <Label>Schedule</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select
                    value={newReport.frequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                      setNewReport({ ...newReport, frequency: value })
                    }
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newReport.time}
                    onChange={(e) => setNewReport({ ...newReport, time: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <Label>Recipients</Label>
              <div className="flex gap-2">
                <Input
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  placeholder="email@example.com"
                  onKeyPress={(e) => e.key === 'Enter' && addRecipient()}
                />
                <Button onClick={addRecipient}>Add</Button>
              </div>
              {newReport.recipients && newReport.recipients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newReport.recipients.map(email => (
                    <Badge key={email} variant="secondary" className="gap-1">
                      {email}
                      <button
                        onClick={() => removeRecipient(email)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Format & Options */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select
                  value={newReport.format}
                  onValueChange={(value: 'pdf' | 'excel' | 'html') =>
                    setNewReport({ ...newReport, format: value })
                  }
                >
                  <SelectTrigger id="format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                    <SelectItem value="html">HTML Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="include-charts">Include Charts</Label>
                  <Switch
                    id="include-charts"
                    checked={newReport.includeCharts}
                    onCheckedChange={(checked) =>
                      setNewReport({ ...newReport, includeCharts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="include-commentary">Include AI Commentary</Label>
                  <Switch
                    id="include-commentary"
                    checked={newReport.includeCommentary}
                    onCheckedChange={(checked) =>
                      setNewReport({ ...newReport, includeCommentary: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={createReport} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Scheduled Report
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
