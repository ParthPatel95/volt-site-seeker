import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

// Comprehensive glossary of datacenter and mining terms
const glossaryTerms: Record<string, { definition: string; category: string }> = {
  // Power & Electrical
  'PUE': {
    definition: 'Power Usage Effectiveness - ratio of total facility power to IT equipment power. Lower is better (1.0 = perfect efficiency).',
    category: 'Efficiency'
  },
  'kW': {
    definition: 'Kilowatt - unit of power equal to 1,000 watts. A typical ASIC miner uses 3-5 kW.',
    category: 'Power'
  },
  'MW': {
    definition: 'Megawatt - unit of power equal to 1,000 kilowatts. Large mining facilities operate at 50-200 MW.',
    category: 'Power'
  },
  'kVA': {
    definition: 'Kilovolt-Ampere - unit of apparent power in electrical systems. Transformers are rated in kVA.',
    category: 'Power'
  },
  'PDU': {
    definition: 'Power Distribution Unit - equipment that distributes electrical power to IT equipment.',
    category: 'Electrical'
  },
  'UPS': {
    definition: 'Uninterruptible Power Supply - provides backup power during outages.',
    category: 'Electrical'
  },
  
  // Cooling
  'CFM': {
    definition: 'Cubic Feet per Minute - measurement of airflow volume. Each miner needs 200-350 CFM.',
    category: 'Cooling'
  },
  'RDHX': {
    definition: 'Rear Door Heat Exchanger - water-cooled door attached to rack backs to remove heat.',
    category: 'Cooling'
  },
  'HAC': {
    definition: 'Hot Aisle Containment - strategy where hot exhaust air is contained and directed to returns.',
    category: 'Cooling'
  },
  'CAC': {
    definition: 'Cold Aisle Containment - strategy where cold supply air is contained for equipment intakes.',
    category: 'Cooling'
  },
  'WUE': {
    definition: 'Water Usage Effectiveness - liters of water used per kWh of IT energy. Lower is better.',
    category: 'Efficiency'
  },
  'ΔT': {
    definition: 'Delta T (Temperature Difference) - the change in temperature, typically across cooling equipment.',
    category: 'Cooling'
  },
  
  // Mining Hardware
  'ASIC': {
    definition: 'Application-Specific Integrated Circuit - specialized hardware designed solely for Bitcoin mining.',
    category: 'Hardware'
  },
  'TH/s': {
    definition: 'Terahashes per second - measurement of mining hashrate (trillion hashes per second).',
    category: 'Mining'
  },
  'EH/s': {
    definition: 'Exahashes per second - measurement of network hashrate (quintillion hashes per second).',
    category: 'Mining'
  },
  'J/TH': {
    definition: 'Joules per Terahash - energy efficiency metric. Lower is more efficient.',
    category: 'Efficiency'
  },
  
  // Operations
  'DCIM': {
    definition: 'Data Center Infrastructure Management - software for monitoring and managing datacenter resources.',
    category: 'Operations'
  },
  'NOC': {
    definition: 'Network Operations Center - centralized monitoring facility for 24/7 operations.',
    category: 'Operations'
  },
  'SLA': {
    definition: 'Service Level Agreement - contractual guarantee of uptime and service quality.',
    category: 'Operations'
  },
  
  // Economics
  'CapEx': {
    definition: 'Capital Expenditure - upfront investment costs for equipment and infrastructure.',
    category: 'Economics'
  },
  'OpEx': {
    definition: 'Operating Expenditure - ongoing costs like electricity, labor, and maintenance.',
    category: 'Economics'
  },
  'TCO': {
    definition: 'Total Cost of Ownership - complete cost including CapEx, OpEx, and depreciation.',
    category: 'Economics'
  },
  'ROI': {
    definition: 'Return on Investment - measure of profitability as percentage of initial investment.',
    category: 'Economics'
  },
  'PPA': {
    definition: 'Power Purchase Agreement - long-term contract for electricity at fixed or indexed rates.',
    category: 'Economics'
  },
  
  // Facility
  'BTM': {
    definition: 'Behind-the-Meter - power consumption co-located with generation, avoiding grid fees.',
    category: 'Facility'
  },
  'N+1': {
    definition: 'Redundancy configuration with one extra backup unit (e.g., 3 units where 2 are needed).',
    category: 'Facility'
  },
  '2N': {
    definition: 'Full redundancy configuration with completely duplicate systems.',
    category: 'Facility'
  },
};

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
  showIcon?: boolean;
}

const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({ term, children, showIcon = true }) => {
  const glossaryEntry = glossaryTerms[term.toUpperCase()] || glossaryTerms[term];
  
  if (!glossaryEntry) {
    return <>{children || term}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-help border-b border-dotted border-muted-foreground/50 inline-flex items-center gap-0.5">
            {children || term}
            {showIcon && <HelpCircle className="w-3 h-3 text-muted-foreground/70" />}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground">{term}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">
                {glossaryEntry.category}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{glossaryEntry.definition}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Utility to get all terms for a glossary listing
export const getAllGlossaryTerms = () => {
  return Object.entries(glossaryTerms).map(([term, data]) => ({
    term,
    ...data
  })).sort((a, b) => a.term.localeCompare(b.term));
};

// Get terms by category
export const getTermsByCategory = (category: string) => {
  return Object.entries(glossaryTerms)
    .filter(([_, data]) => data.category === category)
    .map(([term, data]) => ({ term, ...data }))
    .sort((a, b) => a.term.localeCompare(b.term));
};

export default GlossaryTooltip;
