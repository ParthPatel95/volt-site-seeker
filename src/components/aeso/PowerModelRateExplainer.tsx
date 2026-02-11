import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, CheckCircle2, AlertTriangle, Zap, Building2, Home, Store, Factory } from 'lucide-react';
import { AESO_RATE_DTS_2025, FORTISALBERTA_RATE_65_2026 } from '@/constants/tariff-rates';

const SourceLink = ({ href, label }: { href: string; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
    {label} <ExternalLink className="w-3 h-3" />
  </a>
);

const VerifiedBadge = () => (
  <Badge variant="outline" className="text-xs bg-data-positive/10 text-data-positive border-data-positive/30">
    <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
  </Badge>
);

const EstimateBadge = () => (
  <Badge variant="outline" className="text-xs bg-data-warning/10 text-data-warning border-data-warning/30">
    <AlertTriangle className="w-3 h-3 mr-1" /> Estimate
  </Badge>
);

const RateRow = ({ label, value, unit, verified = true }: { label: string; value: string; unit: string; verified?: boolean }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-foreground">{value} <span className="text-muted-foreground font-normal">{unit}</span></span>
      {verified ? <VerifiedBadge /> : <EstimateBadge />}
    </div>
  </div>
);

export function PowerModelRateExplainer() {
  const dts = AESO_RATE_DTS_2025;

  // POD tiered calculation for 45 MW
  const podTier1 = Math.min(45, 7.5) * dts.pointOfDelivery.tiers[0].rate;
  const podTier2 = Math.min(45 - 7.5, 9.5) * dts.pointOfDelivery.tiers[1].rate;
  const podTier3 = Math.min(45 - 17, 23) * dts.pointOfDelivery.tiers[2].rate;
  const podTier4 = (45 - 40) * dts.pointOfDelivery.tiers[3].rate;
  const podTotal = dts.pointOfDelivery.substation + podTier1 + podTier2 + podTier3 + podTier4;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Alberta Rate Class Guide
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Comprehensive breakdown of FortisAlberta rate classes and AESO Rate DTS tariff components with official source references.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['rate65']} className="space-y-2">

            {/* Rate 65 */}
            <AccordionItem value="rate65" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Factory className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <div className="font-semibold">Rate 65 — Transmission Connected Service</div>
                    <div className="text-xs text-muted-foreground">WattByte's rate class · Industrial loads connected to AESO transmission</div>
                  </div>
                  <Badge variant="info" className="ml-2">Recommended</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-2">
                <div className="text-sm text-muted-foreground">
                  For industrial loads connected directly to the Alberta transmission system, bypassing distribution infrastructure entirely.
                  Enables direct access to AESO pool pricing and full 12CP optimization.
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <h4 className="text-sm font-semibold mb-2">FortisAlberta Distribution Charges</h4>
                  <RateRow label="Demand Charge" value={`$${FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH.toFixed(2)}`} unit="/kW/month" />
                  <RateRow label="Volumetric Delivery" value={`${FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH}¢`} unit="/kWh" />
                  <RateRow label="Transmission Access" value={`${FORTISALBERTA_RATE_65_2026.TRANSMISSION_ACCESS_CENTS_KWH}¢`} unit="/kWh" />
                  <RateRow label="Riders (avg)" value={`${FORTISALBERTA_RATE_65_2026.RIDERS_CENTS_KWH}¢`} unit="/kWh" verified={false} />
                  <div className="pt-2 text-xs text-muted-foreground">
                    Effective: July 1, 2025 · <SourceLink href="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf" label="FortisAlberta Rate Schedule" />
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <h4 className="text-sm font-semibold mb-2">AESO Rate DTS — Full Component Breakdown</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    The ISO Tariff Rate DTS (Demand Transmission Service) is the charge from AESO for using Alberta's transmission system.
                    It comprises 15+ components settled monthly.
                  </p>

                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Bulk System</h5>
                  <RateRow label="Coincident Demand (12CP)" value={`$${dts.bulkSystem.coincidentDemand.toLocaleString()}`} unit="/MW/month" />
                  <RateRow label="Metered Energy" value={`$${dts.bulkSystem.meteredEnergy.toFixed(2)}`} unit="/MWh" />

                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Regional System</h5>
                  <RateRow label="Billing Capacity" value={`$${dts.regionalSystem.billingCapacity.toLocaleString()}`} unit="/MW/month" />
                  <RateRow label="Metered Energy" value={`$${dts.regionalSystem.meteredEnergy.toFixed(2)}`} unit="/MWh" />

                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Point of Delivery (POD)</h5>
                  <RateRow label="Substation (fixed)" value={`$${dts.pointOfDelivery.substation.toLocaleString()}`} unit="/month" />
                  {dts.pointOfDelivery.tiers.map((tier, i) => (
                    <RateRow key={i} label={`${tier.label}${tier.mw !== Infinity ? ` (${tier.mw} MW)` : ''}`} value={`$${tier.rate.toLocaleString()}`} unit="/MW/month" />
                  ))}

                  <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-3 mb-1">Other Components</h5>
                  <RateRow label="Operating Reserve" value={`${dts.operatingReserve.ratePercent}%`} unit="of pool price" verified={false} />
                  <RateRow label="TCR (Metered Energy)" value={`$${dts.tcr.meteredEnergy.toFixed(3)}`} unit="/MWh" verified={false} />
                  <RateRow label="Voltage Control" value={`$${dts.voltageControl.meteredEnergy.toFixed(2)}`} unit="/MWh" />
                  <RateRow label="System Support" value={`$${dts.systemSupport.highestDemand}`} unit="/MW/month" />
                  <RateRow label="Rider F (Balancing Pool)" value={`$${dts.riderF_2026.meteredEnergy.toFixed(2)}`} unit="/MWh" />
                  <RateRow label="Retailer Fee" value={`$${dts.retailerFee.meteredEnergy.toFixed(2)}`} unit="/MWh" />
                  <RateRow label="GST" value={`${(dts.gst * 100).toFixed(0)}%`} unit="on subtotal" />

                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <div>Source: {dts.sourceDecision} · Effective: {dts.effectiveDate}</div>
                    <div className="flex flex-wrap gap-3">
                      <SourceLink href="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/" label="AESO Rate DTS" />
                      <SourceLink href="https://prd-api-efiling20.auc.ab.ca/Anonymous/DownloadPublicDocumentAsync/847591" label="AUC Decision 30427-D01-2025 (2026 rates)" />
                    </div>
                  </div>
                </div>

                {/* 12CP Optimization */}
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    12CP Optimization — The Key Advantage
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    The Bulk System Coincident Demand charge of <strong className="text-foreground">${dts.bulkSystem.coincidentDemand.toLocaleString()}/MW/month</strong> is
                    based on metered demand during the monthly system coincident peak (CP). By curtailing load during the 12 annual peak intervals,
                    this entire charge can be eliminated — saving up to <strong className="text-foreground">${(dts.bulkSystem.coincidentDemand * 45).toLocaleString()}/month</strong> for a 45 MW facility.
                  </p>
                  <div className="text-xs text-muted-foreground bg-muted/50 rounded p-3 font-mono">
                    Annual 12CP Savings = 12 × Capacity × $11,164<br />
                    = 12 × 45 MW × $11,164 = <strong className="text-foreground">${(12 * 45 * dts.bulkSystem.coincidentDemand).toLocaleString()}/year</strong>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rate 63 */}
            <AccordionItem value="rate63" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-semibold">Rate 63 — Large General Service</div>
                    <div className="text-xs text-muted-foreground">Distribution connected · 150 kW to 5 MW industrial/commercial</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="text-sm text-muted-foreground">
                  For distribution-connected industrial and commercial loads typically between 150 kW and 5 MW.
                  Transmission charges are bundled into the distribution tariff — 12CP optimization is not directly available.
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <RateRow label="Demand Charge" value="$12.50" unit="/kW/month" verified={false} />
                  <RateRow label="System Usage Charge" value="~0.85¢" unit="/kWh" verified={false} />
                  <RateRow label="12CP Eligibility" value="Limited" unit="(bundled transmission)" verified={false} />
                  <div className="pt-2 text-xs text-muted-foreground">
                    Source: <SourceLink href="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf" label="FortisAlberta Rate Schedule, p.24-25" />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground bg-data-warning/5 border border-data-warning/20 rounded p-3">
                  <strong>Key difference from Rate 65:</strong> Transmission costs are averaged and passed through by the distribution utility.
                  The end-user cannot directly optimize against AESO's 12CP billing determinant, limiting potential savings.
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rate 61 */}
            <AccordionItem value="rate61" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-semibold">Rate 61 — General Service</div>
                    <div className="text-xs text-muted-foreground">Commercial / small industrial · Distribution connected</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="text-sm text-muted-foreground">
                  For commercial and small industrial premises with distribution-connected loads. Charges are primarily volumetric
                  with demand charges applying above certain consumption thresholds.
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <RateRow label="Distribution + Transmission" value="~4.5¢" unit="/kWh (combined)" verified={false} />
                  <RateRow label="Demand Charge" value="Varies" unit="above threshold" verified={false} />
                  <RateRow label="12CP Eligibility" value="None" unit="" verified={false} />
                  <div className="pt-2 text-xs text-muted-foreground">
                    Source: <SourceLink href="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf" label="FortisAlberta Rate Schedule" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Rate 11 */}
            <AccordionItem value="rate11" className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-muted-foreground" />
                  <div className="text-left">
                    <div className="font-semibold">Rate 11 — Residential Service</div>
                    <div className="text-xs text-muted-foreground">Residential premises · Fully volumetric</div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-3 pt-2">
                <div className="text-sm text-muted-foreground">
                  Standard residential service with no demand charges. All costs are volumetric (per kWh) plus a daily service charge.
                  Not applicable for 12CP optimization.
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                  <RateRow label="Transmission Variable" value="4.3968¢" unit="/kWh" />
                  <RateRow label="Distribution System Usage" value="3.2808¢" unit="/kWh" />
                  <RateRow label="Facilities & Service Charge" value="$1.013751" unit="/day" />
                  <RateRow label="Demand Charge" value="N/A" unit="" />
                  <RateRow label="12CP Eligibility" value="None" unit="" />
                  <div className="pt-2 text-xs text-muted-foreground">
                    Effective: January 2025 · <SourceLink href="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf" label="FortisAlberta Rate Schedule, p.2" />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Rate Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rate Class Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">Side-by-side comparison showing why Rate 65 is optimal for large datacenter loads</p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Feature</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rate 11</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rate 61</th>
                  <th className="text-center py-2 px-3 text-muted-foreground font-medium">Rate 63</th>
                  <th className="text-center py-2 px-3 font-medium text-primary">Rate 65 ★</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">Load Size</td>
                  <td className="text-center py-2 px-3">Residential</td>
                  <td className="text-center py-2 px-3">{'< 150 kW'}</td>
                  <td className="text-center py-2 px-3">150 kW – 5 MW</td>
                  <td className="text-center py-2 px-3 font-medium">&gt; 5 MW</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">Connection</td>
                  <td className="text-center py-2 px-3">Distribution</td>
                  <td className="text-center py-2 px-3">Distribution</td>
                  <td className="text-center py-2 px-3">Distribution</td>
                  <td className="text-center py-2 px-3 font-medium text-primary">Transmission</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">Demand Charge</td>
                  <td className="text-center py-2 px-3">None</td>
                  <td className="text-center py-2 px-3">Varies</td>
                  <td className="text-center py-2 px-3">$12.50/kW</td>
                  <td className="text-center py-2 px-3 font-medium">$7.52/kW</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">Transmission Access</td>
                  <td className="text-center py-2 px-3">Bundled</td>
                  <td className="text-center py-2 px-3">Bundled</td>
                  <td className="text-center py-2 px-3">Bundled</td>
                  <td className="text-center py-2 px-3 font-medium text-primary">Direct AESO</td>
                </tr>
                <tr className="border-b border-border/30">
                  <td className="py-2 pr-4 text-muted-foreground">12CP Optimization</td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="muted" className="text-xs">N/A</Badge>
                  </td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="muted" className="text-xs">N/A</Badge>
                  </td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="warning" className="text-xs">Limited</Badge>
                  </td>
                  <td className="text-center py-2 px-3">
                    <Badge variant="success" className="text-xs">Full (100%)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="py-2 pr-4 text-muted-foreground">Est. All-in Cost</td>
                  <td className="text-center py-2 px-3">~$120/MWh</td>
                  <td className="text-center py-2 px-3">~$100/MWh</td>
                  <td className="text-center py-2 px-3">~$85/MWh</td>
                  <td className="text-center py-2 px-3 font-bold text-primary">~$55–65/MWh</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All-in cost estimates are illustrative, assuming average 2025 pool prices and full 12CP avoidance for Rate 65. Actual costs vary by load profile and market conditions.
          </p>
        </CardContent>
      </Card>

      {/* DTS Formula Walkthrough */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AESO Rate DTS — 45 MW Facility Calculation Walkthrough</CardTitle>
          <p className="text-sm text-muted-foreground">Step-by-step monthly cost calculation using verified 2025 tariff rates</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">1. Bulk System — Coincident Demand</span>
                <span className="text-xs text-muted-foreground ml-2">(eliminated with 12CP avoidance)</span>
              </div>
              <div className="text-right">
                <span className="line-through text-muted-foreground">${(45 * dts.bulkSystem.coincidentDemand).toLocaleString()}/mo</span>
                <span className="ml-2 font-bold text-data-positive">$0</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">2. Bulk System — Metered Energy</span>
                <span className="text-xs text-muted-foreground ml-2">45 MW × 720h × $1.23/MWh</span>
              </div>
              <span className="font-medium">${(45 * 720 * dts.bulkSystem.meteredEnergy).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">3. Regional — Billing Capacity</span>
                <span className="text-xs text-muted-foreground ml-2">45 MW × $2,945</span>
              </div>
              <span className="font-medium">${(45 * dts.regionalSystem.billingCapacity).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">4. Regional — Metered Energy</span>
                <span className="text-xs text-muted-foreground ml-2">45 MW × 720h × $0.93/MWh</span>
              </div>
              <span className="font-medium">${(45 * 720 * dts.regionalSystem.meteredEnergy).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">5. POD Charges</span>
                <span className="text-xs text-muted-foreground ml-2">Substation + tiered billing capacity</span>
              </div>
              <span className="font-medium">${podTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">6. Operating Reserve</span>
                <span className="text-xs text-muted-foreground ml-2">~{dts.operatingReserve.ratePercent}% of pool energy cost</span>
              </div>
              <span className="font-medium text-muted-foreground">Variable</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <div>
                <span className="font-medium">7. Other</span>
                <span className="text-xs text-muted-foreground ml-2">TCR + Voltage + System Support + Rider F + Retailer Fee</span>
              </div>
              <span className="font-medium text-muted-foreground">~$100K combined</span>
            </div>
            <div className="flex justify-between items-center py-2 bg-muted/30 rounded px-3 font-semibold">
              <span>8. Total + 5% GST</span>
              <span>= Monthly Amount Due</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground font-mono">
            Total Monthly DTS = Bulk + Regional + POD + OR + TCR + Voltage + SystemSupport + RiderF + RetailerFee + GST
          </div>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <SourceLink href="https://www.aeso.ca/rules-standards-and-tariff/tariff/rate-dts-demand-transmission-service/" label="AESO ISO Tariff — Rate DTS" />
            <SourceLink href="https://prd-api-efiling20.auc.ab.ca/Anonymous/DownloadPublicDocumentAsync/847591" label="AUC Decision 30427-D01-2025" />
            <SourceLink href="https://www.fortisalberta.com/docs/default-source/default-document-library/jul-1-2025-fortisalberta-rates-options-and-riders-schedules.pdf" label="FortisAlberta Rate Schedule (Jul 2025)" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
