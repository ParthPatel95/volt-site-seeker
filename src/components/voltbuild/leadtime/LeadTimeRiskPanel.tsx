import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { AlertTriangle, Shield, ChevronRight } from 'lucide-react';
import { MilestoneWithRisk } from '../types/voltbuild-advanced.types';

interface LeadTimeRiskPanelProps {
  milestones: MilestoneWithRisk[];
}

export function LeadTimeRiskPanel({ milestones }: LeadTimeRiskPanelProps) {
  const highRiskMilestones = milestones.filter((m) => m.riskLevel === 'high');
  const mediumRiskMilestones = milestones.filter((m) => m.riskLevel === 'medium');

  // Get all unique risk factors across milestones
  const allRisks = milestones.flatMap((m) =>
    m.key_risk_factors.map((r) => ({ milestone: m.milestone, risk: r }))
  );

  const allMitigations = milestones.flatMap((m) =>
    m.mitigation_actions.map((a) => ({ milestone: m.milestone, action: a }))
  );

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Risk Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground text-sm">
            Calculate a forecast to see risk analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          Risk Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Risk Summary */}
        <div className="flex gap-4">
          {highRiskMilestones.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">{highRiskMilestones.length}</Badge>
              <span className="text-sm text-muted-foreground">High Risk</span>
            </div>
          )}
          {mediumRiskMilestones.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                {mediumRiskMilestones.length}
              </Badge>
              <span className="text-sm text-muted-foreground">Medium Risk</span>
            </div>
          )}
        </div>

        {/* High Risk Milestones */}
        {highRiskMilestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-600">Critical Risks</h4>
            {highRiskMilestones.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-lg border border-red-200 bg-red-50"
              >
                <div className="font-medium text-sm">{m.milestone}</div>
                <div className="text-xs text-red-600 mt-1">
                  Projected: {m.predicted_min_days} - {m.predicted_max_days} days
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Factors & Mitigations */}
        {(allRisks.length > 0 || allMitigations.length > 0) && (
          <Accordion type="multiple" className="w-full">
            {allRisks.length > 0 && (
              <AccordionItem value="risks">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    Key Risk Factors ({allRisks.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {allRisks.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground">
                            {r.milestone}:
                          </span>{' '}
                          {r.risk}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {allMitigations.length > 0 && (
              <AccordionItem value="mitigations">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Recommended Mitigations ({allMitigations.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2">
                    {allMitigations.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ChevronRight className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-muted-foreground">
                            {m.milestone}:
                          </span>{' '}
                          {m.action}
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
