
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Download, Mail, Share2, Printer, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReportExporterProps {
  calculationData: any;
  networkData: any;
  mode: 'hosting' | 'self';
}

export const BTCROIReportExporter: React.FC<ReportExporterProps> = ({
  calculationData,
  networkData,
  mode
}) => {
  const [reportType, setReportType] = useState('executive');
  const [format, setFormat] = useState('pdf');
  const [includeSections, setIncludeSections] = useState({
    executiveSummary: true,
    calculations: true,
    assumptions: true,
    risks: true,
    recommendations: true,
    appendix: false
  });
  const [customization, setCustomization] = useState({
    companyName: '',
    reportTitle: '',
    notes: '',
    includeGraphs: true,
    includeBranding: true
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'executive', label: 'Executive Summary Report', description: 'High-level overview for stakeholders' },
    { value: 'detailed', label: 'Detailed Analysis Report', description: 'Comprehensive technical analysis' },
    { value: 'investor', label: 'Investor Presentation', description: 'Investment-focused presentation format' },
    { value: 'technical', label: 'Technical Specification', description: 'Detailed technical parameters and calculations' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF Document', icon: <FileText className="w-4 h-4" /> },
    { value: 'excel', label: 'Excel Spreadsheet', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { value: 'powerpoint', label: 'PowerPoint Presentation', icon: <Share2 className="w-4 h-4" /> }
  ];

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const reportData = {
        type: reportType,
        format,
        sections: includeSections,
        customization,
        data: calculationData,
        networkData,
        mode,
        generatedAt: new Date().toISOString()
      };

      // In a real implementation, this would call an API to generate the actual report
      console.log('Generated report data:', reportData);
      
      // Simulate file download
      const filename = `btc-roi-${reportType}-report.${format}`;
      
      toast({
        title: "Report Generated Successfully",
        description: `Your ${reportTypes.find(t => t.value === reportType)?.label} has been generated and downloaded.`,
        variant: "default"
      });

      // Trigger download (in real implementation, this would be an actual file)
      const element = document.createElement('a');
      element.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
      element.download = filename;
      element.click();
      
    } catch (error) {
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const sendByEmail = () => {
    toast({
      title: "Email Feature Coming Soon",
      description: "Direct email functionality will be available in the next update.",
      variant: "default"
    });
  };

  const printReport = () => {
    window.print();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Professional Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Report Type Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Report Type</Label>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Export Format</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {formats.map(fmt => (
              <Button
                key={fmt.value}
                variant={format === fmt.value ? 'default' : 'outline'}
                onClick={() => setFormat(fmt.value)}
                className="justify-start gap-2 h-auto p-4"
              >
                {fmt.icon}
                <span>{fmt.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Section Selection */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Report Sections</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(includeSections).map(([key, checked]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={checked}
                  onCheckedChange={(checked) => 
                    setIncludeSections(prev => ({ ...prev, [key]: checked as boolean }))
                  }
                />
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-4">
          <Label className="text-base font-medium">Customization</Label>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={customization.companyName}
                onChange={(e) => setCustomization(prev => ({ ...prev, companyName: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportTitle">Custom Report Title</Label>
              <Input
                id="reportTitle"
                value={customization.reportTitle}
                onChange={(e) => setCustomization(prev => ({ ...prev, reportTitle: e.target.value }))}
                placeholder="Bitcoin Mining ROI Analysis"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={customization.notes}
              onChange={(e) => setCustomization(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or context for the report..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeGraphs"
                checked={customization.includeGraphs}
                onCheckedChange={(checked) => 
                  setCustomization(prev => ({ ...prev, includeGraphs: checked as boolean }))
                }
              />
              <Label htmlFor="includeGraphs">Include Charts & Graphs</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeBranding"
                checked={customization.includeBranding}
                onCheckedChange={(checked) => 
                  setCustomization(prev => ({ ...prev, includeBranding: checked as boolean }))
                }
              />
              <Label htmlFor="includeBranding">Include Company Branding</Label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button 
            onClick={generateReport}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGenerating ? 'Generating...' : 'Generate & Download'}
          </Button>
          
          <Button variant="outline" onClick={sendByEmail} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Send by Email
          </Button>
          
          <Button variant="outline" onClick={printReport} className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </div>

        {/* Report Preview */}
        {reportType && (
          <div className="p-4 bg-muted rounded-lg border-2 border-dashed border-border">
            <h3 className="font-medium mb-2">Report Preview</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Type:</strong> {reportTypes.find(t => t.value === reportType)?.label}</p>
              <p><strong>Format:</strong> {formats.find(f => f.value === format)?.label}</p>
              <p><strong>Sections:</strong> {Object.entries(includeSections).filter(([_, included]) => included).length} of {Object.keys(includeSections).length}</p>
              <p><strong>Mode:</strong> {mode === 'hosting' ? 'Hosting Business' : 'Self-Mining'}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
