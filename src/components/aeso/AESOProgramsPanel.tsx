import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, CheckCircle2, XCircle, DollarSign, Zap, Shield, FileText } from 'lucide-react';

interface Program {
  name: string;
  icon: React.ReactNode;
  description: string;
  qualification: string;
  minCapacity: number;
  estimatedRevenue: string;
  responseWindow: string;
  docUrl: string;
  details: string[];
}

const PROGRAMS: Program[] = [
  {
    name: 'Operating Reserve (OR)',
    icon: <Shield className="w-5 h-5 text-emerald-500" />,
    description: 'Provide standby capacity to maintain grid reliability. Generators and loads that can respond within 10 minutes.',
    qualification: 'Must be dispatchable or curtailable within 10 minutes',
    minCapacity: 5,
    estimatedRevenue: '$3,000–$8,000/MW/year',
    responseWindow: '10 minutes',
    docUrl: 'https://www.aeso.ca/market/ancillary-services/operating-reserves/',
    details: [
      'Active Reserve: Respond in 10 min to frequency deviations',
      'Standby Reserve: Available within 10 min on dispatch',
      'Supplemental Reserve: 10-min response, non-spinning',
      'Revenue based on activation frequency and availability',
    ],
  },
  {
    name: 'Demand Response (DR)',
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    description: 'Reduce load during grid emergencies or high-price events. Industrial loads earn payments for curtailment availability.',
    qualification: 'Minimum 5 MW curtailable load with telemetry',
    minCapacity: 5,
    estimatedRevenue: '$5,000–$15,000/MW/year',
    responseWindow: '10–30 minutes',
    docUrl: 'https://www.aeso.ca/market/ancillary-services/',
    details: [
      'Load shed within 10-30 min of dispatch signal',
      'Availability payments for being on standby',
      'Activation payments when actually dispatched',
      'Typical commitment: 100-200 hours/year availability',
    ],
  },
  {
    name: 'Rate DTS Rider F (Interruptible)',
    icon: <FileText className="w-5 h-5 text-blue-500" />,
    description: 'Interruptible service rate providing transmission cost savings in exchange for load curtailment during system emergencies.',
    qualification: 'Must be on Rate DTS with interruptible agreement',
    minCapacity: 25,
    estimatedRevenue: '$50,000–$200,000/year savings',
    responseWindow: '15 minutes',
    docUrl: 'https://www.aeso.ca/grid/connecting-to-the-grid/',
    details: [
      'Reduced transmission charges vs firm service',
      'Must curtail when AESO issues EEA Level 2+',
      'Savings scale with contracted interruptible capacity',
      'Penalties for failure to curtail when dispatched',
    ],
  },
  {
    name: 'Ancillary Services Market',
    icon: <DollarSign className="w-5 h-5 text-purple-500" />,
    description: 'Participate directly in spinning and supplemental reserve markets. Competitive bidding for reliability services.',
    qualification: 'Registered market participant with SCADA telemetry',
    minCapacity: 15,
    estimatedRevenue: '$2,000–$10,000/MW/year',
    responseWindow: 'Varies by product',
    docUrl: 'https://www.aeso.ca/market/ancillary-services/',
    details: [
      'Spinning Reserve: Synchronized, auto-response to frequency',
      'Supplemental Reserve: Non-spinning, 10-min dispatch',
      'Competitive auction pricing (hourly or block)',
      'Requires AGC or SCADA integration with AESO',
    ],
  },
];

interface Props {
  facilityCapacityMW?: number;
}

export function AESOProgramsPanel({ facilityCapacityMW = 50 }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">AESO Grid Programs</h3>
          <p className="text-xs text-muted-foreground">Revenue opportunities for industrial loads · Facility: {facilityCapacityMW} MW</p>
        </div>
        <Badge variant="outline" className="text-xs">
          {PROGRAMS.filter(p => facilityCapacityMW >= p.minCapacity).length}/{PROGRAMS.length} Eligible
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {PROGRAMS.map((program) => {
          const eligible = facilityCapacityMW >= program.minCapacity;
          return (
            <Card key={program.name} className={!eligible ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {program.icon}
                    <CardTitle className="text-sm">{program.name}</CardTitle>
                  </div>
                  <Badge variant={eligible ? 'default' : 'secondary'} className="text-xs shrink-0 gap-1">
                    {eligible ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {eligible ? 'Eligible' : `Need ${program.minCapacity}+ MW`}
                  </Badge>
                </div>
                <CardDescription className="text-xs">{program.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded bg-muted/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Est. Revenue</p>
                    <p className="text-xs font-bold text-foreground">{program.estimatedRevenue}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase">Response Window</p>
                    <p className="text-xs font-bold text-foreground">{program.responseWindow}</p>
                  </div>
                </div>

                <ul className="space-y-1">
                  {program.details.map((detail, i) => (
                    <li key={i} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {detail}
                    </li>
                  ))}
                </ul>

                <Button variant="outline" size="sm" className="w-full text-xs gap-1" asChild>
                  <a href={program.docUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-3 h-3" />
                    Official AESO Documentation
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground text-center">
        Revenue estimates are approximate based on historical AESO market data. Actual values depend on market conditions and participation terms.
      </p>
    </div>
  );
}
