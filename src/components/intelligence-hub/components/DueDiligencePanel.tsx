
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  FileText, 
  Shield, 
  Building2, 
  Users, 
  Scale,
  Loader2,
  Download
} from 'lucide-react';

interface DueDiligencePanelProps {
  analysisResult: any;
}

const defaultChecklist = [
  { category: 'Legal', items: ['Corporate Structure Review', 'Pending Litigation Check', 'Regulatory Compliance', 'IP/Patent Analysis'] },
  { category: 'Financial', items: ['Audit Review', 'Tax Compliance', 'Debt Analysis', 'Working Capital Assessment'] },
  { category: 'Operational', items: ['Asset Verification', 'Key Personnel Review', 'Customer/Contract Analysis', 'Technology Assessment'] },
  { category: 'Environmental', items: ['Environmental Permits', 'Contamination Assessment', 'Remediation Requirements', 'ESG Compliance'] },
];

export function DueDiligencePanel({ analysisResult }: DueDiligencePanelProps) {
  const dueDiligence = analysisResult?.dueDiligence || {};
  const checklist = dueDiligence.checklist || [];
  const findings = dueDiligence.findings || dueDiligence.keyFindings || [];
  const riskLevel = dueDiligence.riskLevel || dueDiligence.overallRisk;
  const completionRate = dueDiligence.completionRate || 0;

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'legal': return Scale;
      case 'financial': return FileText;
      case 'operational': return Building2;
      case 'environmental': return Shield;
      default: return Circle;
    }
  };

  const getRiskColor = (risk: string | undefined) => {
    if (!risk) return 'bg-gray-500/10 text-gray-600';
    const riskLower = risk.toLowerCase();
    if (riskLower === 'low' || riskLower === 'minimal') return 'bg-green-500/10 text-green-600 border-green-500/30';
    if (riskLower === 'medium' || riskLower === 'moderate') return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
    return 'bg-red-500/10 text-red-600 border-red-500/30';
  };

  return (
    <div className="space-y-4">
      {/* Overview */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Due Diligence Status</p>
              <p className="text-xs text-muted-foreground">
                {completionRate > 0 ? `${completionRate}% complete` : 'Not started'}
              </p>
            </div>
            {riskLevel && (
              <Badge variant="outline" className={getRiskColor(riskLevel)}>
                {riskLevel} Risk
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          <Button className="w-full" variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Generate DD Report
          </Button>
        </CardContent>
      </Card>

      {/* Key Findings */}
      {findings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Key Findings</span>
            </div>
            <div className="space-y-2">
              {findings.map((finding: any, i: number) => {
                const severity = finding.severity || 'info';
                return (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg text-sm ${
                      severity === 'critical' ? 'bg-red-500/10 border border-red-500/30' :
                      severity === 'warning' ? 'bg-yellow-500/10 border border-yellow-500/30' :
                      'bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {severity === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
                      {severity === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />}
                      {severity === 'info' && <Circle className="w-4 h-4 text-blue-500 mt-0.5" />}
                      <div>
                        <p className="font-medium">{finding.title || finding.category}</p>
                        <p className="text-xs text-muted-foreground mt-1">{finding.description || finding.detail}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checklist */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Due Diligence Checklist</span>
            <Badge variant="secondary" className="text-xs">
              {checklist.length > 0 ? checklist.filter((c: any) => c.completed).length : 0} / {checklist.length || defaultChecklist.reduce((sum, c) => sum + c.items.length, 0)} items
            </Badge>
          </div>

          {checklist.length > 0 ? (
            <div className="space-y-3">
              {checklist.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : item.inProgress ? (
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'text-muted-foreground line-through' : ''}`}>
                      {item.name || item.title}
                    </p>
                    {item.category && (
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    )}
                  </div>
                  {item.status && (
                    <Badge variant="outline" className="text-[10px]">{item.status}</Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {defaultChecklist.map((category, i) => {
                const Icon = getCategoryIcon(category.category);
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {category.category}
                      </span>
                    </div>
                    <div className="space-y-1 ml-6">
                      {category.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <Circle className="w-4 h-4 text-muted-foreground/50" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
