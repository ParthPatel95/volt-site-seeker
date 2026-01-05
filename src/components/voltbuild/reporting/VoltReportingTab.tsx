import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Plus, FileText, Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, DollarSign, Calendar, Trash2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useProjectReports } from './hooks/useProjectReports';
import { 
  ProjectReport,
  ReportType,
  ReportKPIs,
} from '../types/voltbuild-phase2.types';
import { VoltBuildProject, VoltBuildTask } from '../types/voltbuild.types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface VoltReportingTabProps {
  project: VoltBuildProject;
  tasks: VoltBuildTask[];
  capexSummary?: { total_budget: number; total_spent: number };
  leadTimeData?: { daysToRfs: number };
  changeOrdersSummary?: { approved: number; costDelta: number; scheduleDelta: number };
}

export function VoltReportingTab({ 
  project, 
  tasks, 
  capexSummary,
  leadTimeData,
  changeOrdersSummary 
}: VoltReportingTabProps) {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProjectReport | null>(null);
  const [reportViewOpen, setReportViewOpen] = useState(false);
  
  const [form, setForm] = useState({
    report_type: 'weekly' as ReportType,
    period_start: format(startOfWeek(new Date()), 'yyyy-MM-dd'),
    period_end: format(endOfWeek(new Date()), 'yyyy-MM-dd'),
  });

  const { reports, generateReport, deleteReport, isGenerating } = useProjectReports(project.id);

  // Calculate current project data for report generation
  const projectData = useMemo(() => {
    const completedTasks = tasks.filter(t => t.status === 'complete').length;
    const blockerTasks = tasks.filter(t => t.status === 'blocked').length;
    
    return {
      project: {
        name: project.name,
        overall_progress: project.overall_progress || 0,
      },
      tasks: {
        total: tasks.length,
        completed: completedTasks,
        blockers: blockerTasks,
      },
      capex: {
        spent: capexSummary?.total_spent || 0,
        budget: capexSummary?.total_budget || 0,
      },
      leadTime: {
        daysToRfs: leadTimeData?.daysToRfs || 0,
      },
      changeOrders: {
        approved: changeOrdersSummary?.approved || 0,
        costDelta: changeOrdersSummary?.costDelta || 0,
        scheduleDelta: changeOrdersSummary?.scheduleDelta || 0,
      },
    };
  }, [project, tasks, capexSummary, leadTimeData, changeOrdersSummary]);

  const handleGenerateReport = () => {
    generateReport(
      form.report_type,
      form.period_start,
      form.period_end,
      projectData
    );
    setGenerateDialogOpen(false);
  };

  const handleReportTypeChange = (type: ReportType) => {
    const today = new Date();
    let start: Date, end: Date;
    
    if (type === 'weekly') {
      start = startOfWeek(today);
      end = endOfWeek(today);
    } else {
      start = startOfMonth(today);
      end = endOfMonth(today);
    }
    
    setForm({
      report_type: type,
      period_start: format(start, 'yyyy-MM-dd'),
      period_end: format(end, 'yyyy-MM-dd'),
    });
  };

  const exportToCsv = (report: ProjectReport) => {
    const kpis = report.kpis;
    const csvContent = `Metric,Value
Completion %,${kpis.completion_percentage}%
Tasks Completed,${kpis.tasks_completed}/${kpis.tasks_total}
Open Blockers,${kpis.open_blockers}
CAPEX Spent,$${kpis.capex_spent.toLocaleString()}
CAPEX Budget,$${kpis.capex_budget.toLocaleString()}
Days to RFS,${kpis.days_to_rfs}
Approved Change Orders,${kpis.change_orders_approved}
Cost Delta,$${kpis.total_cost_delta.toLocaleString()}
Schedule Delta,${kpis.total_schedule_delta} days`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${report.report_type}-${report.period_end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Mock chart data for CAPEX burn
  const capexChartData = useMemo(() => {
    const budget = capexSummary?.total_budget || 1000000;
    const spent = capexSummary?.total_spent || 0;
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i * 7);
      const weekSpent = spent * ((7 - i) / 7);
      data.push({
        week: format(date, 'MMM d'),
        spent: Math.round(weekSpent),
        budget: budget,
      });
    }
    return data;
  }, [capexSummary]);

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{projectData.project.overall_progress}%</div>
                <p className="text-xs text-muted-foreground">Completion</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
            </div>
            <Progress value={projectData.project.overall_progress} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{projectData.tasks.completed}/{projectData.tasks.total}</div>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-destructive">{projectData.tasks.blockers}</div>
                <p className="text-xs text-muted-foreground">Blockers</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{projectData.leadTime.daysToRfs}</div>
                <p className="text-xs text-muted-foreground">Days to RFS</p>
              </div>
              <Clock className="w-8 h-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CAPEX Burn Chart */}
      <Card>
        <CardHeader>
          <CardTitle>CAPEX Burn Rate</CardTitle>
          <CardDescription>
            Spent: ${projectData.capex.spent.toLocaleString()} of ${projectData.capex.budget.toLocaleString()} budget
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={capexChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="week" className="text-xs" />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  className="text-xs"
                />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="spent" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))" 
                  fillOpacity={0.3}
                  name="Spent"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Reports Section */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Generated Reports</h3>
        <Button onClick={() => setGenerateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <div className="space-y-4">
        {reports.map(report => (
          <Card key={report.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div 
                  className="flex-1"
                  onClick={() => {
                    setSelectedReport(report);
                    setReportViewOpen(true);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <CardTitle className="text-lg capitalize">
                      {report.report_type} Report
                    </CardTitle>
                  </div>
                  <CardDescription>
                    {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      exportToCsv(report);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteReport(report.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Progress</p>
                  <p className="font-bold">{report.kpis.completion_percentage}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="font-bold">{report.kpis.tasks_completed}/{report.kpis.tasks_total}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">CAPEX Spent</p>
                  <p className="font-bold">${report.kpis.capex_spent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Days to RFS</p>
                  <p className="font-bold">{report.kpis.days_to_rfs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {reports.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No reports generated yet. Generate a weekly or monthly report to share with stakeholders.
          </div>
        )}
      </div>

      {/* Generate Report Dialog */}
      <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Report</DialogTitle>
            <DialogDescription>Create a snapshot report of current project status.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select 
                value={form.report_type} 
                onValueChange={(v) => handleReportTypeChange(v as ReportType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly Report</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Period Start</Label>
                <Input 
                  type="date"
                  value={form.period_start}
                  onChange={(e) => setForm(f => ({ ...f, period_start: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Period End</Label>
                <Input 
                  type="date"
                  value={form.period_end}
                  onChange={(e) => setForm(f => ({ ...f, period_end: e.target.value }))}
                />
              </div>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground mb-2">Report will include:</p>
                <ul className="text-sm space-y-1">
                  <li>• Overall progress: {projectData.project.overall_progress}%</li>
                  <li>• Tasks: {projectData.tasks.completed}/{projectData.tasks.total} complete</li>
                  <li>• CAPEX: ${projectData.capex.spent.toLocaleString()} spent</li>
                  <li>• {projectData.tasks.blockers} open blockers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              Generate Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Viewer Dialog */}
      <Dialog open={reportViewOpen} onOpenChange={setReportViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="capitalize">
              {selectedReport?.report_type} Report
            </DialogTitle>
            <DialogDescription>
              {selectedReport && (
                <>
                  {format(new Date(selectedReport.period_start), 'MMM d')} - {format(new Date(selectedReport.period_end), 'MMM d, yyyy')}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedReport && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold">{selectedReport.kpis.completion_percentage}%</div>
                      <p className="text-sm text-muted-foreground">Completion</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold">{selectedReport.kpis.tasks_completed}</div>
                      <p className="text-sm text-muted-foreground">Tasks Done</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold text-destructive">{selectedReport.kpis.open_blockers}</div>
                      <p className="text-sm text-muted-foreground">Blockers</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold">${(selectedReport.kpis.capex_spent / 1000).toFixed(0)}k</div>
                      <p className="text-sm text-muted-foreground">CAPEX Spent</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold">{selectedReport.kpis.days_to_rfs}</div>
                      <p className="text-sm text-muted-foreground">Days to RFS</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold">{selectedReport.kpis.change_orders_approved}</div>
                      <p className="text-sm text-muted-foreground">Change Orders</p>
                    </CardContent>
                  </Card>
                </div>

                <Separator />

                {/* Executive Summary */}
                <div>
                  <h4 className="font-semibold mb-2">Executive Summary</h4>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-md">
                      {selectedReport.generated_summary}
                    </pre>
                  </div>
                </div>

                <Separator />

                {/* Change Order Impact */}
                {selectedReport.kpis.change_orders_approved > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Change Order Impact</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-4">
                          <div className={`text-xl font-bold ${selectedReport.kpis.total_cost_delta >= 0 ? 'text-destructive' : 'text-green-500'}`}>
                            {selectedReport.kpis.total_cost_delta >= 0 ? '+' : ''}${selectedReport.kpis.total_cost_delta.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Net Cost Impact</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-4">
                          <div className={`text-xl font-bold ${selectedReport.kpis.total_schedule_delta >= 0 ? 'text-destructive' : 'text-green-500'}`}>
                            {selectedReport.kpis.total_schedule_delta >= 0 ? '+' : ''}{selectedReport.kpis.total_schedule_delta} days
                          </div>
                          <p className="text-sm text-muted-foreground">Net Schedule Impact</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportViewOpen(false)}>Close</Button>
            {selectedReport && (
              <Button onClick={() => exportToCsv(selectedReport)}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
