
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DueDiligenceReport {
  id: string;
  company_id: string;
  report_type: string;
  executive_summary: string;
  financial_analysis: any;
  power_infrastructure_assessment: any;
  risk_assessment: any;
  valuation_analysis: any;
  recommendations: string[];
  report_data: any;
  created_at: string;
  companies?: {
    name: string;
    industry: string;
  };
}

export function DueDiligencePanel() {
  const [reports, setReports] = useState<DueDiligenceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [reportType, setReportType] = useState('comprehensive');
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('due_diligence_reports')
        .select(`
          *,
          companies(name, industry)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading due diligence reports:', error);
      toast({
        title: "Error",
        description: "Failed to load due diligence reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!companyName.trim()) {
      toast({
        title: "Company name required",
        description: "Please enter a company name to generate due diligence report",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-intelligence', {
        body: { 
          action: 'generate_due_diligence',
          company_name: companyName.trim(),
          report_type: reportType
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Due Diligence Complete",
          description: `Generated ${reportType} due diligence report for ${companyName}`,
        });
        loadReports();
        setCompanyName('');
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate due diligence report",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'comprehensive': return 'default';
      case 'financial': return 'secondary';
      case 'technical': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Due Diligence Reports
          </h2>
          <p className="text-muted-foreground">
            Automated comprehensive due diligence analysis and reporting
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate Due Diligence Report</CardTitle>
          <CardDescription>
            Create comprehensive due diligence reports with AI-powered analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company Name</label>
              <Input
                placeholder="Enter company name..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && generateReport()}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="comprehensive">Comprehensive</option>
                <option value="financial">Financial Only</option>
                <option value="technical">Technical Only</option>
                <option value="power_infrastructure">Power Infrastructure</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} disabled={generating} className="w-full">
                {generating ? 'Generating...' : 'Generate Report'}
                <FileText className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading due diligence reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium text-muted-foreground mb-2">
              No Due Diligence Reports
            </h3>
            <p className="text-muted-foreground">
              Generate your first due diligence report to see comprehensive analysis
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.slice(0, 10).map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {report.companies?.name || 'Unknown Company'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getReportTypeColor(report.report_type)}>
                        {report.report_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(report.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {report.executive_summary && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Executive Summary</h4>
                    <p className="text-sm text-muted-foreground">
                      {report.executive_summary.substring(0, 200)}...
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  {report.financial_analysis && (
                    <div>
                      <h4 className="font-medium mb-2">Financial Analysis</h4>
                      <div className="space-y-1">
                        {Object.entries(report.financial_analysis).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.risk_assessment && (
                    <div>
                      <h4 className="font-medium mb-2">Risk Assessment</h4>
                      <div className="space-y-1">
                        {Object.entries(report.risk_assessment).slice(0, 3).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="capitalize">{key.replace('_', ' ')}:</span>
                            <span className="text-muted-foreground">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {report.recommendations && report.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Key Recommendations
                    </h4>
                    <div className="space-y-1">
                      {report.recommendations.slice(0, 3).map((recommendation, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {recommendation}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
