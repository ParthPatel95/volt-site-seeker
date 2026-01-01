import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Settings,
  PlayCircle,
  Clock,
  CheckCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Report {
  id: string;
  name: string;
  description: string;
  report_type: string;
  parameters: any;
  schedule: string;
  last_run: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed';
  created_at: string;
  data?: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  parameters: any[];
  sample_data: any;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'market-analysis',
    name: 'Market Analysis Report',
    description: 'Comprehensive market overview with trends and opportunities',
    type: 'market',
    parameters: [
      { name: 'region', label: 'Region', type: 'select', options: ['All', 'North America', 'Europe', 'Asia'] },
      { name: 'timeframe', label: 'Time Frame', type: 'select', options: ['Last 30 days', 'Last 90 days', 'Last year'] },
      { name: 'sectors', label: 'Sectors', type: 'multiselect', options: ['Industrial', 'Commercial', 'Residential'] }
    ],
    sample_data: [
      { month: 'Jan', value: 4000, growth: 20 },
      { month: 'Feb', value: 3000, growth: 15 },
      { month: 'Mar', value: 5000, growth: 25 },
      { month: 'Apr', value: 4500, growth: 22 },
      { month: 'May', value: 6000, growth: 30 },
      { month: 'Jun', value: 5500, growth: 28 }
    ]
  },
  {
    id: 'power-consumption',
    name: 'Power Consumption Analysis',
    description: 'Detailed analysis of power usage patterns and efficiency',
    type: 'power',
    parameters: [
      { name: 'facility_type', label: 'Facility Type', type: 'select', options: ['Data Center', 'Manufacturing', 'Mining'] },
      { name: 'comparison_period', label: 'Comparison Period', type: 'select', options: ['Month over Month', 'Year over Year'] }
    ],
    sample_data: [
      { category: 'High Efficiency', value: 400, percentage: 35 },
      { category: 'Medium Efficiency', value: 300, percentage: 26 },
      { category: 'Low Efficiency', value: 200, percentage: 18 },
      { category: 'Critical', value: 250, percentage: 21 }
    ]
  },
  {
    id: 'investment-performance',
    name: 'Investment Performance Report',
    description: 'Portfolio performance tracking and ROI analysis',
    type: 'investment',
    parameters: [
      { name: 'portfolio', label: 'Portfolio', type: 'select', options: ['All Portfolios', 'High Risk', 'Conservative', 'Balanced'] },
      { name: 'benchmark', label: 'Benchmark', type: 'select', options: ['S&P 500', 'NASDAQ', 'Custom'] }
    ],
    sample_data: [
      { period: 'Q1 2024', portfolio: 8.5, benchmark: 6.2, difference: 2.3 },
      { period: 'Q2 2024', portfolio: 12.1, benchmark: 9.8, difference: 2.3 },
      { period: 'Q3 2024', portfolio: 15.7, benchmark: 11.2, difference: 4.5 },
      { period: 'Q4 2024', portfolio: 18.9, benchmark: 14.1, difference: 4.8 }
    ]
  }
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export function AdvancedReportingEngine() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportForm, setReportForm] = useState({
    name: '',
    description: '',
    template_id: '',
    parameters: {} as any,
    schedule: 'manual'
  });
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    // Simulate fetching reports from database
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Market Analysis',
        description: 'Comprehensive market overview for Q4 2024',
        report_type: 'market',
        parameters: { region: 'North America', timeframe: 'Last 30 days' },
        schedule: 'monthly',
        last_run: '2024-01-15T10:00:00Z',
        status: 'completed',
        created_at: '2024-01-01T00:00:00Z',
        data: REPORT_TEMPLATES[0].sample_data
      },
      {
        id: '2',
        name: 'Power Efficiency Report',
        description: 'Analysis of power consumption patterns',
        report_type: 'power',
        parameters: { facility_type: 'Data Center' },
        schedule: 'weekly',
        last_run: '2024-01-20T14:30:00Z',
        status: 'completed',
        created_at: '2024-01-10T00:00:00Z',
        data: REPORT_TEMPLATES[1].sample_data
      },
      {
        id: '3',
        name: 'Investment Performance Q4',
        description: 'Quarterly investment performance analysis',
        report_type: 'investment',
        parameters: { portfolio: 'All Portfolios' },
        schedule: 'quarterly',
        last_run: '2024-01-25T09:15:00Z',
        status: 'running',
        created_at: '2024-01-20T00:00:00Z'
      }
    ];
    setReports(mockReports);
  };

  const createReport = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTemplate) return;

    setLoading(true);
    try {
      const newReport: Report = {
        id: Date.now().toString(),
        name: reportForm.name,
        description: reportForm.description,
        report_type: selectedTemplate.type,
        parameters: reportForm.parameters,
        schedule: reportForm.schedule,
        last_run: new Date().toISOString(),
        status: 'draft',
        created_at: new Date().toISOString()
      };

      setReports(prev => [...prev, newReport]);
      
      toast({
        title: "Report created",
        description: `Report "${reportForm.name}" has been created successfully`
      });

      // Reset form
      setReportForm({
        name: '',
        description: '',
        template_id: '',
        parameters: {},
        schedule: 'manual'
      });
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({
        title: "Error creating report",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runReport = async (reportId: string) => {
    setLoading(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: 'completed' as const, 
              last_run: new Date().toISOString(),
              data: REPORT_TEMPLATES.find(t => t.type === report.report_type)?.sample_data
            }
          : report
      ));

      toast({
        title: "Report generated",
        description: "Report has been successfully generated"
      });
    } catch (error: any) {
      toast({
        title: "Error generating report",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (report: Report, format: 'pdf' | 'excel' | 'csv') => {
    // Simulate export functionality
    toast({
      title: "Export started",
      description: `Exporting "${report.name}" as ${format.toUpperCase()}`
    });
  };

  const scheduleReport = async (reportId: string, schedule: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId ? { ...report, schedule } : report
    ));
    
    toast({
      title: "Schedule updated",
      description: `Report schedule has been updated to ${schedule}`
    });
  };

  const getStatusColor = (status: Report['status']) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'destructive';
      case 'scheduled': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: Report['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'running': return <Clock className="w-4 h-4" />;
      case 'scheduled': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const renderChart = (report: Report) => {
    if (!report.data) return null;

    switch (report.report_type) {
      case 'market':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={report.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} />
              <Line type="monotone" dataKey="growth" stroke={COLORS[1]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'power':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                dataKey="value"
                data={report.data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {report.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      
      case 'investment':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="portfolio" fill={COLORS[0]} />
              <Bar dataKey="benchmark" fill={COLORS[1]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-center py-8 text-muted-foreground">No chart available</div>;
    }
  };

  return (
    <div className="container mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-responsive-2xl font-bold">Advanced Reporting Engine</h1>
          <p className="text-muted-foreground text-responsive-sm">Create, schedule, and manage custom reports</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto">
          <FileText className="w-4 h-4" />
          <span>New Report</span>
        </Button>
      </div>

      <Tabs defaultValue="reports" className="w-full">
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 scrollbar-hide">
          <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4">
            <TabsTrigger value="reports" className="text-xs sm:text-sm px-3 sm:px-4">My Reports</TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm px-3 sm:px-4">Templates</TabsTrigger>
            <TabsTrigger value="create" className="text-xs sm:text-sm px-3 sm:px-4">Create</TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs sm:text-sm px-3 sm:px-4">Scheduling</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Badge variant={getStatusColor(report.status)} className="gap-1">
                      {getStatusIcon(report.status)}
                      {report.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <div>Type: {report.report_type}</div>
                    <div>Schedule: {report.schedule}</div>
                    <div>Last run: {new Date(report.last_run).toLocaleDateString()}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runReport(report.id)}
                      disabled={report.status === 'running'}
                      className="gap-1"
                    >
                      <PlayCircle className="w-3 h-3" />
                      Run
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveReport(report)}
                      className="gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => exportReport(report, 'pdf')}
                      className="gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {activeReport && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {activeReport.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart(activeReport)}
                <div className="mt-4 flex gap-2">
                  <Button onClick={() => exportReport(activeReport, 'pdf')} variant="outline">
                    Export PDF
                  </Button>
                  <Button onClick={() => exportReport(activeReport, 'excel')} variant="outline">
                    Export Excel
                  </Button>
                  <Button onClick={() => exportReport(activeReport, 'csv')} variant="outline">
                    Export CSV
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {REPORT_TEMPLATES.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="text-sm font-medium">Parameters:</div>
                    {template.parameters.map((param) => (
                      <div key={param.name} className="text-sm text-muted-foreground">
                        • {param.label}
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedTemplate(template);
                      setReportForm(prev => ({ ...prev, template_id: template.id }));
                    }}
                    className="w-full"
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createReport} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input
                      id="report-name"
                      value={reportForm.name}
                      onChange={(e) => setReportForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter report name..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="template-select">Template</Label>
                    <Select
                      value={reportForm.template_id}
                      onValueChange={(value) => {
                        const template = REPORT_TEMPLATES.find(t => t.id === value);
                        setSelectedTemplate(template || null);
                        setReportForm(prev => ({ ...prev, template_id: value }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {REPORT_TEMPLATES.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={reportForm.description}
                    onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter report description..."
                  />
                </div>

                {selectedTemplate && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Configure Parameters</h3>
                    {selectedTemplate.parameters.map((param) => (
                      <div key={param.name}>
                        <Label>{param.label}</Label>
                        <Select
                          value={reportForm.parameters[param.name] || ''}
                          onValueChange={(value) => setReportForm(prev => ({
                            ...prev,
                            parameters: { ...prev.parameters, [param.name]: value }
                          }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${param.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {param.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select
                    value={reportForm.schedule}
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, schedule: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading || !selectedTemplate} className="w-full">
                  {loading ? 'Creating...' : 'Create Report'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-4">
            {reports.filter(r => r.schedule !== 'manual').map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{report.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Current schedule: {report.schedule}
                      </p>
                    </div>
                    <Select
                      value={report.schedule}
                      onValueChange={(value) => scheduleReport(report.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}