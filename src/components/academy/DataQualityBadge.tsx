 /**
  * DataQualityBadge - Indicates data source and quality level
  * Used across Academy modules to maintain transparency about data sources
  */
 
 import React from 'react';
 import { Info, ExternalLink, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
 import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
 } from '@/components/ui/tooltip';
 import { Badge } from '@/components/ui/badge';
 
 type DataQualityLevel = 'live' | 'verified' | 'estimate' | 'illustrative' | 'historical';
 
 interface DataQualityBadgeProps {
   level: DataQualityLevel;
   source?: string;
   sourceUrl?: string;
   lastUpdated?: string;
   className?: string;
 }
 
 const levelConfig: Record<DataQualityLevel, {
   label: string;
   description: string;
   icon: typeof CheckCircle2;
   variant: 'default' | 'secondary' | 'outline' | 'destructive';
   colorClass: string;
 }> = {
   live: {
     label: 'Live Data',
     description: 'Real-time data from official API sources',
     icon: CheckCircle2,
     variant: 'default',
     colorClass: 'bg-watt-success/10 text-watt-success border-watt-success/30',
   },
   verified: {
     label: 'Verified',
     description: 'Data verified from official documentation or standards',
     icon: CheckCircle2,
     variant: 'secondary',
     colorClass: 'bg-watt-trust/10 text-watt-trust border-watt-trust/30',
   },
   estimate: {
     label: 'Industry Estimate',
     description: 'Aggregated from multiple industry sources; actual values may vary',
     icon: Info,
     variant: 'outline',
     colorClass: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
   },
   illustrative: {
     label: 'Illustrative Example',
     description: 'Simplified for educational purposes; not for actual design decisions',
     icon: FileText,
     variant: 'outline',
     colorClass: 'bg-watt-purple/10 text-watt-purple border-watt-purple/30',
   },
   historical: {
     label: 'Historical Data',
     description: 'Based on historical records; may not reflect current conditions',
     icon: AlertTriangle,
     variant: 'outline',
     colorClass: 'bg-muted text-muted-foreground border-border',
   },
 };
 
 export const DataQualityBadge: React.FC<DataQualityBadgeProps> = ({
   level,
   source,
   sourceUrl,
   lastUpdated,
   className = '',
 }) => {
   const config = levelConfig[level];
   const Icon = config.icon;
 
   return (
     <TooltipProvider>
       <Tooltip delayDuration={200}>
         <TooltipTrigger asChild>
           <Badge
             variant={config.variant}
             className={`inline-flex items-center gap-1.5 cursor-help ${config.colorClass} ${className}`}
           >
             <Icon className="w-3 h-3" />
             {config.label}
           </Badge>
         </TooltipTrigger>
         <TooltipContent
           side="top"
           className="max-w-xs bg-card border border-border shadow-lg"
         >
           <div className="space-y-1.5">
             <p className="text-sm text-foreground">{config.description}</p>
             {source && (
               <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                 <span>Source:</span>
                 {sourceUrl ? (
                   <a
                     href={sourceUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-watt-bitcoin hover:underline inline-flex items-center gap-0.5"
                   >
                     {source}
                     <ExternalLink className="w-2.5 h-2.5" />
                   </a>
                 ) : (
                   <span className="text-foreground">{source}</span>
                 )}
               </div>
             )}
             {lastUpdated && (
               <p className="text-xs text-muted-foreground/70">
                 Last verified: {lastUpdated}
               </p>
             )}
           </div>
         </TooltipContent>
       </Tooltip>
     </TooltipProvider>
   );
 };
 
 export default DataQualityBadge;