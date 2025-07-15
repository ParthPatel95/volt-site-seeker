import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useVoltMarketDueDiligence } from '@/hooks/useVoltMarketDueDiligence';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  Upload,
  Eye,
  Shield,
  TrendingUp,
  DollarSign,
  Building,
  Zap,
  MapPin,
  Calendar
} from 'lucide-react';

export const VoltMarketDueDiligenceCenter: React.FC = () => {
  const { toast } = useToast();
  const { 
    loading, 
    getDueDiligenceReports, 
    getDueDiligenceTasks,
    createDueDiligenceReport,
    getListings 
  } = useVoltMarketDueDiligence();
  
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedListing, setSelectedListing] = useState('');
  const [selectedReportType, setSelectedReportType] = useState('');
  const [customRequirements, setCustomRequirements] = useState('');

  useEffect(() => {
    loadData();

    // Set up real-time subscription for due diligence reports
    const channel = supabase
      .channel('due-diligence-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'due_diligence_reports'
        },
        (payload) => {
          console.log('Report updated via realtime:', payload);
          
          // Update the specific report in the list
          setReports(prev => {
            const updated = prev.map(report => 
              report.id === payload.new.id ? { ...report, ...payload.new } : report
            );
            console.log('Updated reports:', updated);
            return updated;
          });
          
          // Show toast notification for completed reports
          if (payload.new.report_data?.status === 'completed' && payload.old.report_data?.status !== 'completed') {
            toast({
              title: "Report completed",
              description: "Your due diligence report has been completed and is ready for review."
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'due_diligence_reports'
        },
        (payload) => {
          console.log('New report created via realtime:', payload);
          setReports(prev => [payload.new, ...prev]);
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [toast]);

  const loadData = async () => {
    try {
      const [reportsData, listingsData] = await Promise.all([
        getDueDiligenceReports(),
        getListings()
      ]);
      setReports(reportsData);
      setListings(listingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!selectedListing || !selectedReportType) {
      toast({
        title: "Missing information",
        description: "Please select a listing and report type",
        variant: "destructive"
      });
      return;
    }

    try {
      await createDueDiligenceReport({
        listing_id: selectedListing,
        report_type: selectedReportType,
        executive_summary: customRequirements || undefined,
        recommendations: []
      });

      toast({
        title: "Report generation started",
        description: "Due diligence report generation is now in progress"
      });
      
      // Reload reports
      loadData();
      
      // Reset form
      setSelectedListing('');
      setSelectedReportType('');
      setCustomRequirements('');
      setActiveTab('reports');
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(report => {
    const title = report.listing?.title || report.executive_summary || 'Untitled Report';
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const reportStatus = report.report_data?.status || 'pending';
    const matchesStatus = filterStatus === 'all' || reportStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Clock className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-2 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">Due Diligence Center</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Comprehensive analysis and risk assessment for energy investments</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Upload Documents
            </Button>
            <Button size="sm" onClick={() => setActiveTab('generate')} className="text-xs sm:text-sm">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Total Reports</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Completed</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">
                    {reports.filter(r => r.report_data?.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">In Progress</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
                    {reports.filter(r => r.report_data?.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">Avg. Score</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600">87</p>
                </div>
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50 w-full sm:w-auto">
            <TabsTrigger value="reports" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Due Diligence </span>Reports
            </TabsTrigger>
            <TabsTrigger value="generate" className="text-xs sm:text-sm px-2 sm:px-3">
              <span className="hidden sm:inline">Generate New </span>Report
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs sm:text-sm px-2 sm:px-3">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="reports">
            {/* Search and Filter */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Reports List */}
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardContent className="pt-6">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                    <p className="text-gray-600 mb-4">Generate your first due diligence report to get started</p>
                    <Button onClick={() => setActiveTab('generate')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredReports.map((report) => {
                      const reportStatus = report.report_data?.status || 'pending';
                      const completionPercentage = report.report_data?.completion_percentage || 0;
                      const title = report.listing?.title || report.executive_summary || 'Untitled Report';
                      
                      return (
                        <div
                          key={report.id}
                          className="p-3 sm:p-4 md:p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                                <h3 className="font-semibold text-gray-900 text-sm sm:text-base lg:text-lg truncate">{title}</h3>
                                <div className="flex gap-2">
                                  <Badge className={`${getStatusColor(reportStatus)} text-xs w-fit`}>
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(reportStatus)}
                                      {reportStatus.replace('_', ' ')}
                                    </div>
                                  </Badge>
                                  <Badge variant="outline" className="text-xs w-fit">{report.report_type}</Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                                <div className="flex items-center gap-1 min-w-0">
                                  <Building className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">ID: {report.id.slice(0, 8)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span>Created: {new Date(report.created_at).toLocaleDateString()}</span>
                                </div>
                                {report.valuation_analysis && (
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span>Value: Est.</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="text-yellow-600">Risk: Assessment</span>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs sm:text-sm font-medium text-gray-700">Completion Progress</span>
                                  <span className="text-xs sm:text-sm text-gray-500">{completionPercentage}%</span>
                                </div>
                                <Progress value={completionPercentage} className="h-2" />
                              </div>

                              {/* Key Findings */}
                              {report.executive_summary && (
                                <div className="mb-4">
                                  <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Summary:</h4>
                                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 break-words">
                                    {report.executive_summary}
                                  </p>
                                </div>
                              )}

                              {/* Section Status */}
                              <div className="grid grid-cols-5 gap-1 sm:gap-2">
                                {['financial', 'technical', 'legal', 'environmental', 'market'].map((section) => (
                                  <div key={section} className="text-center">
                                    <div className={`p-1 sm:p-2 rounded-lg text-xs font-medium ${
                                      reportStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                      reportStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {section}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                <span className="hidden sm:inline">View</span>
                              </Button>
                              {reportStatus === 'completed' && (
                                <Button variant="outline" size="sm" className="text-xs sm:text-sm px-2 sm:px-3">
                                  <Download className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">Export</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Generate New Due Diligence Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <Label htmlFor="listing-select">Select Listing</Label>
                    <Select value={selectedListing} onValueChange={setSelectedListing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a listing to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {listings.map((listing) => (
                          <SelectItem key={listing.id} value={listing.id}>
                            {listing.title} - {listing.location}
                          </SelectItem>
                        ))}
                        {listings.length === 0 && (
                          <SelectItem value="no-listings" disabled>No listings available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                        <SelectItem value="financial">Financial Only</SelectItem>
                        <SelectItem value="technical">Technical Only</SelectItem>
                        <SelectItem value="legal">Legal & Regulatory</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="custom-requirements">Custom Requirements</Label>
                  <Textarea
                    id="custom-requirements"
                    placeholder="Specify any custom analysis requirements or focus areas..."
                    className="min-h-[80px] sm:min-h-[100px]"
                    value={customRequirements}
                    onChange={(e) => setCustomRequirements(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Financial Analysis</h3>
                    <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
                      <li>• Revenue projections</li>
                      <li>• Cost analysis</li>
                      <li>• ROI calculations</li>
                      <li>• Risk assessment</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">Technical Review</h3>
                    <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                      <li>• Equipment condition</li>
                      <li>• Performance metrics</li>
                      <li>• Maintenance records</li>
                      <li>• Upgrade potential</li>
                    </ul>
                  </div>
                  
                  <div className="p-3 sm:p-4 bg-purple-50 rounded-lg sm:col-span-2 lg:col-span-1">
                    <h3 className="font-semibold text-purple-800 mb-2 text-sm sm:text-base">Legal & Compliance</h3>
                    <ul className="text-xs sm:text-sm text-purple-700 space-y-1">
                      <li>• Permits & licenses</li>
                      <li>• Regulatory compliance</li>
                      <li>• Contract review</li>
                      <li>• Environmental clearance</li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-0">
                  <Button
                    onClick={handleGenerateReport}
                    className="bg-blue-600 hover:bg-blue-700 text-sm"
                    disabled={loading || !selectedListing || !selectedReportType}
                  >
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    {loading ? 'Generating...' : 'Generate Report'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="bg-white/70 backdrop-blur-sm border-white/50">
              <CardHeader>
                <CardTitle>Report Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {[
                    {
                      name: 'Solar Farm Analysis',
                      description: 'Comprehensive template for solar installations',
                      sections: ['Financial', 'Technical', 'Environmental', 'Market'],
                      icon: '☀️'
                    },
                    {
                      name: 'Wind Farm Assessment',
                      description: 'Specialized template for wind energy projects',
                      sections: ['Technical', 'Environmental', 'Grid Connection', 'Financial'],
                      icon: '💨'
                    },
                    {
                      name: 'Battery Storage Evaluation',
                      description: 'Template for energy storage facilities',
                      sections: ['Technical', 'Market Analysis', 'Safety', 'Financial'],
                      icon: '🔋'
                    },
                    {
                      name: 'Transmission Infrastructure',
                      description: 'Template for transmission line and substation assets',
                      sections: ['Technical', 'Regulatory', 'Maintenance', 'Capacity'],
                      icon: '⚡'
                    },
                    {
                      name: 'Data Center Power',
                      description: 'Template for data center power infrastructure',
                      sections: ['Power Capacity', 'Redundancy', 'Cooling', 'Financial'],
                      icon: '🏢'
                    },
                    {
                      name: 'Industrial Power Assets',
                      description: 'Template for industrial power generation',
                      sections: ['Equipment', 'Environmental', 'Operations', 'Market'],
                      icon: '🏭'
                    }
                  ].map((template, index) => (
                    <div key={index} className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                      <div className="text-center mb-3 sm:mb-4">
                        <div className="text-3xl sm:text-4xl mb-2">{template.icon}</div>
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{template.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      
                      <div className="mb-3 sm:mb-4">
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Includes:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.sections.map((section, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1 text-xs sm:text-sm">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};