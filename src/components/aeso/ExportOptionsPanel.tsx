import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileText, FileSpreadsheet, Presentation, Download, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ExportConfig {
  format: 'pdf' | 'excel' | 'powerpoint' | 'csv';
  includeBranding: boolean;
  companyName: string;
  companyLogo?: string;
  includeCharts: boolean;
  includeRawData: boolean;
  dateRange: string;
}

export function ExportOptionsPanel() {
  const { toast } = useToast();
  const [config, setConfig] = useState<ExportConfig>({
    format: 'pdf',
    includeBranding: true,
    companyName: '',
    includeCharts: true,
    includeRawData: false,
    dateRange: '7days'
  });

  const handleExport = (format: ExportConfig['format']) => {
    toast({
      title: "Export Started",
      description: `Generating ${format.toUpperCase()} export. This may take a moment...`,
    });

    // Simulate export process
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `Your ${format.toUpperCase()} file is ready for download`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Export Dashboard Data</h3>
        <p className="text-sm text-muted-foreground">
          Download your dashboard in various formats with custom branding
        </p>
      </div>

      <Tabs defaultValue="pdf" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pdf">
            <FileText className="w-4 h-4 mr-2" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="excel">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Excel
          </TabsTrigger>
          <TabsTrigger value="powerpoint">
            <Presentation className="w-4 h-4 mr-2" />
            PowerPoint
          </TabsTrigger>
          <TabsTrigger value="csv">
            <Download className="w-4 h-4 mr-2" />
            CSV
          </TabsTrigger>
        </TabsList>

        {/* PDF Export */}
        <TabsContent value="pdf" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PDF Export Options</CardTitle>
              <CardDescription>
                Generate a professional PDF report with charts and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Branding Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Custom Branding</Label>
                    <p className="text-xs text-muted-foreground">Add your company logo and name</p>
                  </div>
                  <Switch
                    checked={config.includeBranding}
                    onCheckedChange={(checked) => setConfig({ ...config, includeBranding: checked })}
                  />
                </div>

                {config.includeBranding && (
                  <>
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input
                        value={config.companyName}
                        onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                        placeholder="Your Company Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex gap-2">
                        <Input type="file" accept="image/*" />
                        <Button variant="outline" size="icon">
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Include Charts</Label>
                    <p className="text-xs text-muted-foreground">Add visual charts and graphs</p>
                  </div>
                  <Switch
                    checked={config.includeCharts}
                    onCheckedChange={(checked) => setConfig({ ...config, includeCharts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <Label>Include Raw Data</Label>
                    <p className="text-xs text-muted-foreground">Append data tables</p>
                  </div>
                  <Switch
                    checked={config.includeRawData}
                    onCheckedChange={(checked) => setConfig({ ...config, includeRawData: checked })}
                  />
                </div>
              </div>

              <Button onClick={() => handleExport('pdf')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Excel Export */}
        <TabsContent value="excel" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Excel Export Options</CardTitle>
              <CardDescription>
                Download data in Excel format with multiple sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Export Includes:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Raw data tables for all widgets
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Formatted summary sheets
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Pivot tables for analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Charts and visualizations
                    </li>
                  </ul>
                </div>
              </div>

              <Button onClick={() => handleExport('excel')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PowerPoint Export */}
        <TabsContent value="powerpoint" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>PowerPoint Export Options</CardTitle>
              <CardDescription>
                Generate presentation slides with charts and commentary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Presentation Title</Label>
                  <Input placeholder="AESO Market Analysis" />
                </div>

                <div className="space-y-2">
                  <Label>Presenter Notes</Label>
                  <Textarea
                    placeholder="Add notes that will appear in presenter view..."
                    rows={4}
                  />
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-3">Slide Structure:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Title slide with company branding
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Executive summary
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      One slide per widget with chart
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      Key insights and recommendations
                    </li>
                  </ul>
                </div>
              </div>

              <Button onClick={() => handleExport('powerpoint')} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export PowerPoint
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CSV Export */}
        <TabsContent value="csv" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>CSV Export Options</CardTitle>
              <CardDescription>
                Download raw data in CSV format for further analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Widgets to Export</Label>
                  <div className="space-y-2">
                    {['Pool Price Widget', 'Demand Tracker', 'Generation Mix', 'Renewable Forecast'].map((widget) => (
                      <div key={widget} className="flex items-center justify-between rounded-lg border p-3">
                        <Label className="font-normal">{widget}</Label>
                        <Switch defaultChecked />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-xs text-muted-foreground">
                    CSV exports include raw timestamp data and can be opened in Excel, Google Sheets, or any data analysis tool.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleExport('csv')} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export All as CSV
                </Button>
                <Button variant="outline" className="flex-1">
                  Export Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
