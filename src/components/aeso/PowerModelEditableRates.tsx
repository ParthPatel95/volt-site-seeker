import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, RotateCcw } from 'lucide-react';
import { AESO_RATE_DTS_2025, FORTISALBERTA_RATE_65_2026 } from '@/constants/tariff-rates';
import type { TariffOverrides } from '@/hooks/usePowerModelCalculator';

interface Props {
  overrides: TariffOverrides;
  onChange: (overrides: TariffOverrides) => void;
}

function RateField({ label, unit, value, defaultValue, badge, onChange }: {
  label: string; unit: string; value: number | undefined; defaultValue: number;
  badge: 'Verified' | 'Estimate'; onChange: (v: number | undefined) => void;
}) {
  const isModified = value !== undefined && value !== defaultValue;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <Label className="text-xs flex items-center gap-1.5">
          {label}
          <Badge variant={badge === 'Verified' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0 h-3.5">
            {badge}
          </Badge>
        </Label>
        <div className="flex items-center gap-1 mt-0.5">
          <Input
            type="number"
            step="any"
            value={value ?? defaultValue}
            onChange={e => {
              const n = parseFloat(e.target.value);
              if (!isNaN(n)) onChange(n === defaultValue ? undefined : n);
            }}
            className={`h-7 text-xs ${isModified ? 'border-primary ring-1 ring-primary/30' : ''}`}
          />
          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{unit}</span>
          {isModified && (
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onChange(undefined)} title="Reset to default">
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PowerModelEditableRates({ overrides, onChange }: Props) {
  const update = (key: keyof TariffOverrides, val: number | undefined) => {
    onChange({ ...overrides, [key]: val });
  };

  const hasOverrides = Object.values(overrides).some(v => v !== undefined);

  return (
    <div className="space-y-3">
      {hasOverrides && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => onChange({})}>
            <RotateCcw className="w-3 h-3 mr-1" />Reset All to Defaults
          </Button>
        </div>
      )}

      {/* AESO Rate DTS */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">AESO Rate DTS Charges</CardTitle>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
              <RateField label="Bulk Coincident Demand" unit="$/MW/mo" value={overrides.bulkCoincidentDemand} defaultValue={AESO_RATE_DTS_2025.bulkSystem.coincidentDemand} badge="Verified" onChange={v => update('bulkCoincidentDemand', v)} />
              <RateField label="Bulk Metered Energy" unit="$/MWh" value={overrides.bulkMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.bulkSystem.meteredEnergy} badge="Verified" onChange={v => update('bulkMeteredEnergy', v)} />
              <RateField label="Regional Billing Capacity" unit="$/MW/mo" value={overrides.regionalBillingCapacity} defaultValue={AESO_RATE_DTS_2025.regionalSystem.billingCapacity} badge="Verified" onChange={v => update('regionalBillingCapacity', v)} />
              <RateField label="Regional Metered Energy" unit="$/MWh" value={overrides.regionalMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.regionalSystem.meteredEnergy} badge="Verified" onChange={v => update('regionalMeteredEnergy', v)} />
              <RateField label="POD Substation" unit="$/mo" value={overrides.podSubstation} defaultValue={AESO_RATE_DTS_2025.pointOfDelivery.substation} badge="Verified" onChange={v => update('podSubstation', v)} />
              <RateField label="Operating Reserve" unit="%" value={overrides.operatingReservePercent} defaultValue={AESO_RATE_DTS_2025.operatingReserve.ratePercent} badge="Estimate" onChange={v => update('operatingReservePercent', v)} />
              <RateField label="TCR" unit="$/MWh" value={overrides.tcrMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.tcr.meteredEnergy} badge="Estimate" onChange={v => update('tcrMeteredEnergy', v)} />
              <RateField label="Voltage Control" unit="$/MWh" value={overrides.voltageControlMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.voltageControl.meteredEnergy} badge="Verified" onChange={v => update('voltageControlMeteredEnergy', v)} />
              <RateField label="System Support" unit="$/MW/mo" value={overrides.systemSupportHighestDemand} defaultValue={AESO_RATE_DTS_2025.systemSupport.highestDemand} badge="Verified" onChange={v => update('systemSupportHighestDemand', v)} />
              <RateField label="Rider F" unit="$/MWh" value={overrides.riderFMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.riderF.meteredEnergy} badge="Verified" onChange={v => update('riderFMeteredEnergy', v)} />
              <RateField label="Retailer Fee" unit="$/MWh" value={overrides.retailerFeeMeteredEnergy} defaultValue={AESO_RATE_DTS_2025.retailerFee.meteredEnergy} badge="Verified" onChange={v => update('retailerFeeMeteredEnergy', v)} />
              <RateField label="GST" unit="%" value={overrides.gstRate !== undefined ? overrides.gstRate * 100 : undefined} defaultValue={AESO_RATE_DTS_2025.gst * 100} badge="Verified" onChange={v => update('gstRate', v !== undefined ? v / 100 : undefined)} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* FortisAlberta Rate 65 */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">FortisAlberta Rate 65</CardTitle>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0">
              <RateField label="Demand Charge" unit="$/kW/mo" value={overrides.fortisDemandChargeKwMonth} defaultValue={FORTISALBERTA_RATE_65_2026.DEMAND_CHARGE_KW_MONTH} badge="Verified" onChange={v => update('fortisDemandChargeKwMonth', v)} />
              <RateField label="Volumetric Delivery" unit="¢/kWh" value={overrides.fortisVolumetricCentsKwh} defaultValue={FORTISALBERTA_RATE_65_2026.VOLUMETRIC_DELIVERY_CENTS_KWH} badge="Verified" onChange={v => update('fortisVolumetricCentsKwh', v)} />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
