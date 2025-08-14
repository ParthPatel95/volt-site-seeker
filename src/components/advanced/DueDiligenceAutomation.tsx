import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Brain, Download, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';

interface DueDiligenceReport {
  id: string;
  property_id?: string;
  report_type: 'comprehensive' | 'financial' | 'technical' | 'legal';
  status: 'generating' | 'completed' | 'error';
  executive_summary: string;
  key_findings: string[];
  risk_assessment: {
    overall_score: number;
    risk_factors: string[];
    mitigation_strategies: string[];
  };
  financial_analysis: {
    valuation_range: { min: number; max: number };
    cash_flow_projection: number[];
    roi_estimate: number;
  };
  technical_assessment: {
    infrastructure_grade: string;
    maintenance_issues: string[];
    upgrade_requirements: string[];
  };
  legal_compliance: {
    permit_status: string;
    regulatory_issues: string[];
    environmental_concerns: string[];
  };
  created_at: string;
}

interface DueDiligenceAutomationProps {
  propertyId?: string;
  onReportGenerated?: (report: DueDiligenceReport) => void;
}

export const DueDiligenceAutomation: React.FC<DueDiligenceAutomationProps> = ({ 
  propertyId, 
  onReportGenerated 
}) => {
  const [reports, setReports] = useState<DueDiligenceReport[]>([]);
  const [generating, setGenerating] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>('comprehensive');
  const { toast } = useToast();

  const generateReport = async () => {
    if (!propertyId && !selectedReportType) {
      toast({
        title: "Missing Information",
        description: "Please select a report type",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('due-diligence-automation', {
        body: {
          property_id: propertyId,
          report_type: selectedReportType,
          action: 'generate_report'
        }
      });

      if (error) throw error;

      const newReport = data.report;
      setReports(prev => [newReport, ...prev]);
      
      if (onReportGenerated) {
        onReportGenerated(newReport);
      }
      
      toast({
        title: "Report Generated",
        description: `${selectedReportType} due diligence report completed`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate due diligence report",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // Simulate PDF generation and download
      toast({
        title: "Download Started",
        description: "Due diligence report PDF is being prepared",
      });
    } catch (error) {
      console.error('Error downloading report:', error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-600';
    if (score >= 6) return 'text-orange-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Mock data for demonstration
  const mockReport: DueDiligenceReport = {
    id: '1',
    property_id: propertyId,
    report_type: 'comprehensive',
    status: 'completed',
    executive_summary: 'This 50MW solar facility presents a moderate-risk investment opportunity with strong fundamentals. The property benefits from excellent solar irradiance, proximity to transmission infrastructure, and favorable regulatory environment. Key concerns include aging inverter equipment and potential grid interconnection delays.',
    key_findings: [
      'Property has valid permits and clean title',
      'Solar resource assessment confirms 1,650 kWh/m²/year irradiance',
      'Transmission capacity available within 2 miles',
      'Inverter equipment requires replacement within 3 years',
      'Power purchase agreement expires in 15 years with extension options'
    ],
    risk_assessment: {
      overall_score: 6.2,
      risk_factors: [
        'Equipment replacement costs ($2.5M estimated)',
        'PPA renewal uncertainty',
        'Potential transmission upgrade requirements',
        'Environmental review pending for expansion'
      ],
      mitigation_strategies: [
        'Negotiate equipment replacement credits',
        'Secure PPA extension before acquisition',
        'Obtain transmission cost estimates',
        'Complete environmental assessment pre-closing'
      ]
    },
    financial_analysis: {
      valuation_range: { min: 35000000, max: 42000000 },
      cash_flow_projection: [3200000, 3350000, 3180000, 2950000, 3100000],
      roi_estimate: 8.7
    },
    technical_assessment: {
      infrastructure_grade: 'B+',
      maintenance_issues: [
        'Inverter cooling system inefficiency',
        'Panel cleaning schedule optimization needed',
        'Monitoring system software updates required'
      ],
      upgrade_requirements: [
        'Inverter replacement (Year 3)',
        'Enhanced monitoring system',
        'Grid connection equipment upgrade'
      ]
    },
    legal_compliance: {
      permit_status: 'Current and valid',
      regulatory_issues: [
        'Interconnection agreement modification pending',
        'Environmental impact review in progress'
      ],
      environmental_concerns: [
        'Minimal wildlife impact based on initial assessment',
        'Soil contamination testing required for expansion area'
      ]
    },
    created_at: new Date().toISOString()
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Automated Due Diligence</h2>
          <p className="text-muted-foreground">AI-powered comprehensive property analysis and reporting</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="comprehensive">Comprehensive</SelectItem>
              <SelectItem value="financial">Financial Only</SelectItem>
              <SelectItem value="technical">Technical Only</SelectItem>
              <SelectItem value="legal">Legal Only</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateReport} disabled={generating} className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            {generating ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
      </div>

      {/* Report Display */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Report</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Executive Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Executive Summary
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(mockReport.status)}>
                    {mockReport.status}
                  </Badge>
                  <Button size="sm" onClick={() => downloadReport(mockReport.id)} className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{mockReport.executive_summary}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Overall Risk Score</span>
                    <span className={`text-2xl font-bold ${getRiskColor(mockReport.risk_assessment.overall_score)}`}>
                      {mockReport.risk_assessment.overall_score}/10
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Key Risk Factors</h4>
                    <div className="space-y-1">
                      {mockReport.risk_assessment.risk_factors.map((factor, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{factor}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Mitigation Strategies</h4>
                    <div className="space-y-1">
                      {mockReport.risk_assessment.mitigation_strategies.map((strategy, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-3 h-3 text-green-500 mt-1 flex-shrink-0" />
                          <span>{strategy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Financial Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Valuation Range</div>
                    <div className="font-semibold">
                      {formatCurrency(mockReport.financial_analysis.valuation_range.min)} - {formatCurrency(mockReport.financial_analysis.valuation_range.max)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground">Expected ROI</div>
                    <div className="text-2xl font-bold text-green-600">
                      {mockReport.financial_analysis.roi_estimate}%
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-2">5-Year Cash Flow Projection</div>
                    <div className="space-y-1">
                      {mockReport.financial_analysis.cash_flow_projection.map((cashFlow, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>Year {index + 1}</span>
                          <span className="font-semibold">{formatCurrency(cashFlow)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Assessment */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Infrastructure Grade</span>
                    <Badge variant="secondary">{mockReport.technical_assessment.infrastructure_grade}</Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Maintenance Issues</div>
                    <div className="text-xs space-y-1">
                      {mockReport.technical_assessment.maintenance_issues.map((issue, index) => (
                        <div key={index}>• {issue}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Upgrade Requirements</div>
                    <div className="text-xs space-y-1">
                      {mockReport.technical_assessment.upgrade_requirements.map((requirement, index) => (
                        <div key={index}>• {requirement}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Legal Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Legal & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Permit Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {mockReport.legal_compliance.permit_status}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Regulatory Issues</div>
                    <div className="text-xs space-y-1">
                      {mockReport.legal_compliance.regulatory_issues.map((issue, index) => (
                        <div key={index}>• {issue}</div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-medium mb-1">Environmental Concerns</div>
                    <div className="text-xs space-y-1">
                      {mockReport.legal_compliance.environmental_concerns.map((concern, index) => (
                        <div key={index}>• {concern}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle>Key Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockReport.key_findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{finding}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No previous reports available</p>
                <p className="text-sm">Generate your first report using the controls above</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};