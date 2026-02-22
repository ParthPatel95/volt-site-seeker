import { type MonthlyResult, type AnnualSummary, type FacilityParams } from '@/hooks/usePowerModelCalculator';
import { exportToPDF } from '@/utils/pdfExport';

/**
 * Export Power Model results as CSV
 */
export function exportPowerModelCSV(
  monthly: MonthlyResult[],
  annual: AnnualSummary | null,
  params: FacilityParams,
  cadUsdRate: number,
  capacityMW: number
): void {
  if (!annual || monthly.length === 0) return;

  const isFixed = params.fixedPriceCAD > 0;
  const lines: string[] = [];

  // Header metadata
  lines.push('# Power Model Export');
  lines.push(`# Exported: ${new Date().toISOString()}`);
  lines.push(`# Capacity: ${capacityMW} MW`);
  lines.push(`# Uptime Target: ${params.targetUptimePercent}%`);
  lines.push(`# Curtailment Strategy: ${params.curtailmentStrategy}`);
  lines.push(`# Pricing: ${isFixed ? `Fixed @ $${params.fixedPriceCAD}/MWh` : 'Floating Pool'}`);
  lines.push(`# CAD/USD Rate: ${cadUsdRate}`);
  lines.push(`# Hosting Rate: $${params.hostingRateUSD} USD/kWh`);
  lines.push('');

  // Column headers
  const headers = [
    'Month', 'Total Hours', 'Running Hours', 'Uptime %', 'Curtailed Hours',
    'MWh (Actual)', 'MWh (Full Capacity)',
    'DTS Charges (CAD)', 'Energy Charges (CAD)', 'Fortis Charges (CAD)', 'Total (CAD)',
    'All-in Rate (¢/kWh CAD)', 'All-in Rate (¢/kWh USD)',
  ];
  if (isFixed) {
    headers.push('Curtailment Savings (CAD)', 'Over-Contract Credits (CAD)');
  }
  lines.push(headers.join(','));

  // Monthly rows
  for (const m of monthly) {
    const fullCapMWh = m.runningHours * capacityMW;
    const row = [
      m.month,
      m.totalHours,
      m.runningHours,
      m.uptimePercent.toFixed(1),
      m.curtailedHours,
      m.mwh.toFixed(2),
      fullCapMWh.toFixed(2),
      m.totalDTSCharges.toFixed(2),
      m.totalEnergyCharges.toFixed(2),
      m.totalFortisCharges.toFixed(2),
      m.totalAmountDue.toFixed(2),
      (m.perKwhCAD * 100).toFixed(3),
      (m.perKwhUSD * 100).toFixed(3),
    ];
    if (isFixed) {
      row.push(m.curtailmentSavings.toFixed(2), m.overContractCredits.toFixed(2));
    }
    lines.push(row.join(','));
  }

  // Annual summary
  const annualFullCapMWh = annual.totalRunningHours * capacityMW;
  const annualRow = [
    'ANNUAL TOTAL',
    annual.totalHours,
    annual.totalRunningHours,
    annual.avgUptimePercent.toFixed(1),
    annual.totalHours - annual.totalRunningHours,
    annual.totalMWh.toFixed(2),
    annualFullCapMWh.toFixed(2),
    annual.totalDTSCharges.toFixed(2),
    annual.totalEnergyCharges.toFixed(2),
    annual.totalFortisCharges.toFixed(2),
    annual.totalAmountDue.toFixed(2),
    (annual.avgPerKwhCAD * 100).toFixed(3),
    (annual.avgPerKwhUSD * 100).toFixed(3),
  ];
  if (isFixed) {
    annualRow.push(annual.curtailmentSavings.toFixed(2), annual.totalOverContractCredits.toFixed(2));
  }
  lines.push(annualRow.join(','));

  // Effective rate (fixed-price only)
  if (isFixed && annual.totalOverContractCredits > 0) {
    lines.push('');
    lines.push(`# Effective Rate (after credits): ${(annual.effectivePerKwhCAD * 100).toFixed(3)} ¢/kWh CAD / ${(annual.effectivePerKwhUSD * 100).toFixed(3)} ¢/kWh USD`);
  }

  // Rate breakdown
  lines.push('');
  lines.push('# All-in Rate Breakdown (cents/kWh)');
  lines.push('Component,¢/kWh CAD');
  const totalKWh = annual.totalKWh || 1;
  const components = [
    ['Pool Energy', annual.totalPoolEnergy],
    ['Operating Reserve', annual.totalOperatingReserve],
    ['Bulk Metered Energy', annual.totalBulkMeteredEnergy],
    ['Regional Billing Capacity', annual.totalRegionalBillingCapacity],
    ['Regional Metered Energy', annual.totalRegionalMeteredEnergy],
    ['POD Charges', annual.totalPodCharges],
    ['TCR', annual.totalTCR],
    ['Voltage Control', annual.totalVoltageControl],
    ['System Support', annual.totalSystemSupport],
    ['FortisAlberta Demand', annual.totalFortisDemand],
    ['FortisAlberta Distribution', annual.totalFortisDistribution],
    ['Retailer Fee', annual.totalRetailerFee],
    ['Rider F', annual.totalRiderF],
  ] as const;

  for (const [name, value] of components) {
    lines.push(`${name},${((value / totalKWh) * 100).toFixed(4)}`);
  }
  lines.push(`TOTAL,${(annual.avgPerKwhCAD * 100).toFixed(4)}`);

  if (isFixed && annual.totalOverContractCredits > 0) {
    lines.push(`Over-Contract Credit,-${((annual.totalOverContractCredits / totalKWh) * 100).toFixed(4)}`);
    lines.push(`Effective Rate,${(annual.effectivePerKwhCAD * 100).toFixed(4)}`);
  }

  // Download
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `power-model-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export Power Model results as PDF by capturing the results container
 */
export async function exportPowerModelPDF(): Promise<void> {
  const element = document.getElementById('power-model-results');
  if (!element) {
    console.error('Power model results element not found');
    return;
  }

  await exportToPDF(element, {
    filename: `power-model-${new Date().toISOString().slice(0, 10)}.pdf`,
    orientation: 'landscape',
    format: 'a4',
    margin: 8,
    scale: 1.5,
    windowWidth: 1400,
  });
}
