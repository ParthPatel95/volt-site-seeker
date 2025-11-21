import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LayoutTemplate, Plus, Trash2, GripVertical, Type, Image as ImageIcon, BarChart3, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportBlock {
  id: string;
  type: 'text' | 'image' | 'chart' | 'widget';
  content: string;
  position: number;
}

const REPORT_TEMPLATES = [
  {
    id: 'executive',
    name: 'Executive Summary',
    description: 'High-level overview for stakeholders',
    blocks: ['text', 'chart', 'text', 'chart']
  },
  {
    id: 'technical',
    name: 'Technical Analysis',
    description: 'Detailed metrics and trends',
    blocks: ['text', 'chart', 'widget', 'chart', 'text']
  },
  {
    id: 'presentation',
    name: 'Board Presentation',
    description: 'Professional slides with commentary',
    blocks: ['text', 'image', 'chart', 'text', 'chart']
  }
];

export function ReportBuilderPanel() {
  const { toast } = useToast();
  const [reportName, setReportName] = useState('');
  const [blocks, setBlocks] = useState<ReportBlock[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const addBlock = (type: ReportBlock['type']) => {
    const newBlock: ReportBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      position: blocks.length
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const applyTemplate = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const templateBlocks: ReportBlock[] = template.blocks.map((type, index) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: type as ReportBlock['type'],
      content: '',
      position: index
    }));

    setBlocks(templateBlocks);
    setSelectedTemplate(templateId);
    toast({
      title: "Template Applied",
      description: `${template.name} template has been loaded`,
    });
  };

  const saveReport = () => {
    if (!reportName) {
      toast({
        title: "Name Required",
        description: "Please enter a report name",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Saved",
      description: `${reportName} has been saved successfully`,
    });
  };

  const getBlockIcon = (type: ReportBlock['type']) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'chart': return <BarChart3 className="h-4 w-4" />;
      case 'widget': return <LayoutTemplate className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Visual Report Builder</h3>
        <p className="text-sm text-muted-foreground">
          Create custom reports with drag-and-drop blocks
        </p>
      </div>

      {/* Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Start with a Template</CardTitle>
          <CardDescription>Choose a pre-built layout or start from scratch</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {REPORT_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-colors ${
                  selectedTemplate === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => applyTemplate(template.id)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-1">
                    {template.blocks.map((block, idx) => (
                      <div key={idx} className="h-8 flex-1 bg-muted rounded" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Report Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Report Name</Label>
            <Input
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Q4 Market Analysis"
            />
          </div>
        </CardContent>
      </Card>

      {/* Add Blocks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add Content Blocks</CardTitle>
          <CardDescription>Build your report by adding different types of content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => addBlock('text')}>
              <Type className="h-4 w-4 mr-2" />
              Text Block
            </Button>
            <Button variant="outline" onClick={() => addBlock('image')}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button variant="outline" onClick={() => addBlock('chart')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Chart
            </Button>
            <Button variant="outline" onClick={() => addBlock('widget')}>
              <LayoutTemplate className="h-4 w-4 mr-2" />
              Dashboard Widget
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Canvas */}
      {blocks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Report Canvas</CardTitle>
              <Badge variant="outline">{blocks.length} blocks</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {blocks.map((block, index) => (
              <Card key={block.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="cursor-move">
                      <GripVertical className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getBlockIcon(block.type)}
                          <span className="font-medium capitalize">{block.type} Block</span>
                          <Badge variant="secondary">{index + 1}</Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removeBlock(block.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      {block.type === 'text' && (
                        <Textarea
                          value={block.content}
                          onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          placeholder="Enter your text content..."
                          rows={4}
                        />
                      )}

                      {block.type === 'image' && (
                        <div className="space-y-2">
                          <Input type="file" accept="image/*" />
                          <Input
                            placeholder="Image caption (optional)"
                            value={block.content}
                            onChange={(e) => updateBlockContent(block.id, e.target.value)}
                          />
                        </div>
                      )}

                      {block.type === 'chart' && (
                        <Select
                          value={block.content}
                          onValueChange={(value) => updateBlockContent(block.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select chart type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      {block.type === 'widget' && (
                        <Select
                          value={block.content}
                          onValueChange={(value) => updateBlockContent(block.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select dashboard widget" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="price">Pool Price Widget</SelectItem>
                            <SelectItem value="demand">Demand Tracker</SelectItem>
                            <SelectItem value="generation">Generation Mix</SelectItem>
                            <SelectItem value="renewable">Renewable Forecast</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {blocks.length > 0 && (
        <div className="flex gap-2">
          <Button onClick={saveReport} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
          <Button variant="outline" className="flex-1">
            Preview
          </Button>
        </div>
      )}
    </div>
  );
}
