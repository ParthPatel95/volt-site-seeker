 /**
  * AcademyDataSourceFooter - Standardized footer listing official data sources
  * Used across all Academy modules to maintain transparency and credibility
  */
 
 import React from 'react';
 import { ExternalLink, CheckCircle2, Info } from 'lucide-react';
 
 interface DataSource {
   name: string;
   url?: string;
   description?: string;
   type: 'official' | 'industry' | 'calculated';
 }
 
 interface AcademyDataSourceFooterProps {
   sources: DataSource[];
   lastUpdated?: string;
   className?: string;
 }
 
 const typeConfig = {
   official: {
     label: 'Official Source',
     colorClass: 'text-watt-success',
     bgClass: 'bg-watt-success/10',
   },
   industry: {
     label: 'Industry Data',
     colorClass: 'text-watt-trust',
     bgClass: 'bg-watt-trust/10',
   },
   calculated: {
     label: 'Calculated/Derived',
     colorClass: 'text-amber-600',
     bgClass: 'bg-amber-500/10',
   },
 };
 
 export const AcademyDataSourceFooter: React.FC<AcademyDataSourceFooterProps> = ({
   sources,
   lastUpdated = 'February 2026',
   className = '',
 }) => {
   return (
     <div className={`mt-12 pt-8 border-t border-border ${className}`}>
       <div className="max-w-4xl mx-auto">
         <div className="flex items-center gap-2 mb-4">
           <Info className="w-4 h-4 text-muted-foreground" />
           <h4 className="text-sm font-semibold text-foreground">Data Sources & References</h4>
         </div>
         
         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
           {sources.map((source, index) => {
             const config = typeConfig[source.type];
             return (
               <div
                 key={index}
                 className={`p-3 rounded-lg border border-border ${config.bgClass}`}
               >
                 <div className="flex items-start gap-2">
                   <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.colorClass}`} />
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center gap-1.5">
                       {source.url ? (
                         <a
                           href={source.url}
                           target="_blank"
                           rel="noopener noreferrer"
                           className={`text-sm font-medium ${config.colorClass} hover:underline inline-flex items-center gap-1`}
                         >
                           {source.name}
                           <ExternalLink className="w-3 h-3" />
                         </a>
                       ) : (
                         <span className="text-sm font-medium text-foreground">{source.name}</span>
                       )}
                     </div>
                     {source.description && (
                       <p className="text-xs text-muted-foreground mt-0.5">{source.description}</p>
                     )}
                     <span className={`text-xs ${config.colorClass} opacity-75`}>{config.label}</span>
                   </div>
                 </div>
               </div>
             );
           })}
         </div>
         
         <p className="text-xs text-muted-foreground mt-4 text-center">
           Content last verified: {lastUpdated}. Data accuracy is maintained through regular reviews. 
           Report inaccuracies to <a href="mailto:academy@wattbyte.com" className="text-watt-bitcoin hover:underline">academy@wattbyte.com</a>.
         </p>
       </div>
     </div>
   );
 };
 
 // Pre-defined source collections for common Academy modules
 export const COMMON_SOURCES = {
   bitcoin: [
     { name: 'mempool.space', url: 'https://mempool.space', description: 'Network hashrate, difficulty, blocks', type: 'official' as const },
     { name: 'Coinbase API', url: 'https://api.coinbase.com', description: 'BTC/USD spot price', type: 'official' as const },
     { name: 'Bitcoin Protocol', url: 'https://bitcoin.org', description: 'Block rewards, halving schedule', type: 'official' as const },
   ],
   aeso: [
     { name: 'AESO CSD API', url: 'https://www.aeso.ca/market/market-data/', description: 'Real-time generation, load, reserves', type: 'official' as const },
     { name: 'AESO Rate DTS', url: 'https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/', description: 'Transmission tariffs ($12.94/MWh)', type: 'official' as const },
     { name: 'AESO Annual Reports', url: 'https://www.aeso.ca/aeso/annual-reports/', description: 'Historical generation mix data', type: 'official' as const },
   ],
   fortisalberta: [
     { name: 'FortisAlberta Rate 65', url: 'https://www.fortisalberta.com/customer-service/rates-and-billing', description: 'Distribution tariffs ($7.52/kW)', type: 'official' as const },
   ],
   mining: [
     { name: 'Bitmain', url: 'https://www.bitmain.com', description: 'ASIC specifications', type: 'industry' as const },
     { name: 'MicroBT', url: 'https://www.microbt.com', description: 'Whatsminer specifications', type: 'industry' as const },
     { name: 'ASHRAE TC 9.9', url: 'https://www.ashrae.org', description: 'Thermal guidelines', type: 'official' as const },
   ],
 };
 
 export default AcademyDataSourceFooter;