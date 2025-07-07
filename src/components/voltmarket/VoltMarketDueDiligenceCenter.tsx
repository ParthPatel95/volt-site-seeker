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

// Mock data for demonstration
const mockDueDiligenceReports = [
  {
    id: '1',
    listingId: 'listing-123',
    listingTitle: 'Dallas Solar Farm - 50MW',
    reportType: 'comprehensive',
    status: 'completed',
    completionPercentage: 100,
    createdAt: '2024-01-15',
    summary: {
      overallRisk: 'medium',
      valuation: 12500000,
      recommendation: 'proceed',
      keyFindings: [
        'Strong revenue projections',
        'Excellent grid connectivity',
        'Minor environmental concerns',
        'Regulatory compliance verified'
      ]
    },
    sections: {
      financial: { status: 'completed', score: 85 },
      technical: { status: 'completed', score: 92 },
      legal: { status: 'completed', score: 78 },
      environmental: { status: 'completed', score: 88 },
      market: { status: 'completed', score: 90 }
    }
  },
  {
    id: '2',
    listingId: 'listing-456',
    listingTitle: 'Houston Battery Storage - 25MW/100MWh',
    reportType: 'financial',
    status: 'in_progress',
    completionPercentage: 65,
    createdAt: '2024-01-20',
    summary: {
      overallRisk: 'low',
      valuation: 8750000,
      recommendation: 'pending',
      keyFindings: [
        'Analysis in progress',
        'Initial financials look strong',
        'Technical review ongoing'
      ]
    },
    sections: {
      financial: { status: 'completed', score: 88 },
      technical: { status: 'in_progress', score: null },
      legal: { status: 'pending', score: null },
      environmental: { status: 'pending', score: null },
      market: { status: 'completed', score: 85 }
    }
  }
];

export const VoltMarketDueDiligenceCenter: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState(mockDueDiligenceReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleGenerateReport = async (listingId: string, reportType: string) => {
    toast({
      title: "Report generation started",
      description: "Due diligence report generation is now in progress"
    });
    
    // Mock report generation
    const newReport = {
      id: Date.now().toString(),
      listingId,
      listingTitle: `Property ${listingId}`,
      reportType,
      status: 'in_progress',
      completionPercentage: 0,
      createdAt: new Date().toISOString().split('T')[0],
      summary: {
        overallRisk: 'pending',
        valuation: 0,
        recommendation: 'pending',
        keyFindings: ['Analysis starting...']
      },
      sections: {
        financial: { status: 'pending', score: null },
        technical: { status: 'pending', score: null },
        legal: { status: 'pending', score: null },
        environmental: { status: 'pending', score: null },
        market: { status: 'pending', score: null }
      }
    };
    
    setReports(prev => [newReport, ...prev]);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.listingId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Due Diligence Center</h1>
            <p className="text-gray-600 mt-1">Comprehensive analysis and risk assessment for energy investments</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reports.filter(r => r.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {reports.filter(r => r.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Score</p>
                  <p className="text-2xl font-bold text-purple-600">87</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/70 backdrop-blur-sm border border-white/50">
            <TabsTrigger value="reports">Due Diligence Reports</TabsTrigger>
            <TabsTrigger value="generate">Generate New Report</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
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
                    {filteredReports.map((report) => (
                      <div
                        key={report.id}
                        className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedReport(report)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900 text-lg">{report.listingTitle}</h3>
                              <Badge className={getStatusColor(report.status)}>
                                <div className="flex items-center gap-1">
                                  {getStatusIcon(report.status)}
                                  {report.status.replace('_', ' ')}
                                </div>
                              </Badge>
                              <Badge variant="outline">{report.reportType}</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                              <div className="flex items-center gap-1">
                                <Building className="w-4 h-4" />
                                <span>ID: {report.listingId}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                              </div>
                              {report.summary.valuation > 0 && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  <span>Valuation: {formatCurrency(report.summary.valuation)}</span>
                                </div>
                              )}
                              {report.summary.overallRisk !== 'pending' && (
                                <div className="flex items-center gap-1">
                                  <Shield className="w-4 h-4" />
                                  <span className={getRiskColor(report.summary.overallRisk)}>
                                    Risk: {report.summary.overallRisk}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Completion Progress</span>
                                <span className="text-sm text-gray-500">{report.completionPercentage}%</span>
                              </div>
                              <Progress value={report.completionPercentage} className="h-2" />
                            </div>

                            {/* Key Findings */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-700 mb-2">Key Findings:</h4>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {report.summary.keyFindings.slice(0, 3).map((finding, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                    {finding}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Section Status */}
                            <div className="grid grid-cols-5 gap-2">
                              {Object.entries(report.sections).map(([section, data]) => (
                                <div key={section} className="text-center">
                                  <div className={`p-2 rounded-lg text-xs font-medium ${
                                    data.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    data.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {section}
                                  </div>
                                  {data.score && (
                                    <div className="text-xs text-gray-500 mt-1">{data.score}/100</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {report.status === 'completed' && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-1" />
                                Export
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="listing-select">Select Listing</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a listing to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listing-1">Dallas Solar Farm - 50MW</SelectItem>
                        <SelectItem value="listing-2">Houston Battery Storage - 25MW</SelectItem>
                        <SelectItem value="listing-3">Austin Wind Farm - 100MW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="report-type">Report Type</Label>
                    <Select>
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
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Financial Analysis</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Revenue projections</li>
                      <li>• Cost analysis</li>
                      <li>• ROI calculations</li>
                      <li>• Risk assessment</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-2">Technical Review</h3>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Equipment condition</li>
                      <li>• Performance metrics</li>
                      <li>• Maintenance records</li>
                      <li>• Upgrade potential</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Legal & Compliance</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Permits & licenses</li>
                      <li>• Regulatory compliance</li>
                      <li>• Contract review</li>
                      <li>• Environmental clearance</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleGenerateReport('listing-123', 'comprehensive')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <div key={index} className="p-6 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                      <div className="text-center mb-4">
                        <div className="text-4xl mb-2">{template.icon}</div>
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Includes:</h4>
                        <div className="flex flex-wrap gap-1">
                          {template.sections.map((section, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm" className="flex-1">
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