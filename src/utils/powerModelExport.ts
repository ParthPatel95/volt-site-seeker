import { type MonthlyResult, type AnnualSummary, type FacilityParams } from '@/hooks/usePowerModelCalculator';

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
 * Export Power Model results as a properly formatted multi-page PDF
 * using jsPDF + autoTable (structured text, not a screenshot).
 */
export async function exportPowerModelPDF(
  monthly: MonthlyResult[],
  annual: AnnualSummary | null,
  params: FacilityParams,
  capacityMW: number,
  breakeven?: number | null,
  chartOptions?: {
    /** DOM id of the results container to screenshot for chart pages. */
    resultsElementId?: string;
    /** Tab values to cycle through, capturing each. */
    tabValues?: string[];
    /** Setter that switches the active analytics tab. */
    setActiveTab?: (v: string) => void;
    /** Restore the original tab after capture. */
    originalTab?: string;
  },
): Promise<void> {
  if (!annual || monthly.length === 0) {
    console.warn('[PowerModelPDF] No data to export');
    return;
  }

  const { jsPDF } = await import('jspdf');
  const autoTableMod = await import('jspdf-autotable');
  const autoTable = (autoTableMod as any).default ?? (autoTableMod as any);

  const isFixed = params.fixedPriceCAD > 0;
  const fmtCAD = (n: number) =>
    `$${n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  const fmtNum = (n: number, d = 0) =>
    n.toLocaleString('en-CA', { minimumFractionDigits: d, maximumFractionDigits: d });

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 12;
  const generated = new Date().toLocaleString('en-CA');

  // ===== Header =====
  doc.setFillColor(10, 22, 40); // institutional navy
  doc.rect(0, 0, pageW, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('WattByte Power Model — Cost Analysis Report', margin, 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `${capacityMW} MW · ${params.targetUptimePercent}% target uptime · ${
      isFixed ? `Fixed $${params.fixedPriceCAD}/MWh` : 'Floating Pool'
    } · Strategy: ${params.curtailmentStrategy}`,
    margin,
    16,
  );
  doc.text(`Generated: ${generated}`, pageW - margin, 16, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // ===== Summary KPIs =====
  let y = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Annual Summary', margin, y);
  y += 4;

  const summaryRows: (string | number)[][] = [
    ['Total Hours (year)', fmtNum(annual.totalHours)],
    ['Running Hours', fmtNum(annual.totalRunningHours)],
    ['Average Uptime', `${annual.avgUptimePercent.toFixed(2)}%`],
    ['Energy Consumed (MWh)', fmtNum(annual.totalMWh, 0)],
    ['Avg Pool Price (running)', `$${annual.avgPoolPriceRunning.toFixed(2)}/MWh`],
    ['DTS Charges (CAD)', fmtCAD(annual.totalDTSCharges)],
    ['Energy Charges (CAD)', fmtCAD(annual.totalEnergyCharges)],
    ['FortisAlberta Charges (CAD)', fmtCAD(annual.totalFortisCharges)],
    ['GST (CAD)', fmtCAD(annual.totalGST)],
    ['Total Amount Due (CAD)', fmtCAD(annual.totalAmountDue)],
    ['All-in Rate', `${(annual.avgPerKwhCAD * 100).toFixed(3)} ¢/kWh CAD  ·  ${(annual.avgPerKwhUSD * 100).toFixed(3)} ¢/kWh USD`],
  ];
  if (isFixed && annual.totalOverContractCredits > 0) {
    summaryRows.push(
      ['Over-Contract Credits', `−${fmtCAD(annual.totalOverContractCredits)}`],
      [
        'Effective Rate (after credits)',
        `${(annual.effectivePerKwhCAD * 100).toFixed(3)} ¢/kWh CAD  ·  ${(annual.effectivePerKwhUSD * 100).toFixed(3)} ¢/kWh USD`,
      ],
    );
  }
  if (breakeven != null && isFinite(breakeven)) {
    summaryRows.push(['Break-even Pool Price', `$${breakeven.toFixed(2)}/MWh`]);
  }

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Metric', 'Value']],
    body: summaryRows,
    theme: 'grid',
    headStyles: { fillColor: [10, 22, 40], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { cellWidth: 80, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
  });

  // ===== Rate Breakdown =====
  const totalKWh = annual.totalKWh || 1;
  const components: [string, number][] = [
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
  ];
  const breakdownRows = components.map(([name, value]) => [
    name,
    fmtCAD(value),
    `${((value / totalKWh) * 100).toFixed(4)}`,
  ]);
  breakdownRows.push([
    'TOTAL',
    fmtCAD(annual.totalAmountDue),
    `${(annual.avgPerKwhCAD * 100).toFixed(4)}`,
  ]);
  if (isFixed && annual.totalOverContractCredits > 0) {
    breakdownRows.push([
      'Over-Contract Credit',
      `−${fmtCAD(annual.totalOverContractCredits)}`,
      `−${((annual.totalOverContractCredits / totalKWh) * 100).toFixed(4)}`,
    ]);
    breakdownRows.push([
      'Effective Rate',
      '',
      `${(annual.effectivePerKwhCAD * 100).toFixed(4)}`,
    ]);
  }

  const afterSummaryY = (doc as any).lastAutoTable.finalY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('All-in Rate Breakdown', margin, afterSummaryY);

  autoTable(doc, {
    startY: afterSummaryY + 2,
    margin: { left: margin, right: margin },
    head: [['Component', 'Annual Cost (CAD)', '¢/kWh CAD']],
    body: breakdownRows,
    theme: 'striped',
    headStyles: { fillColor: [247, 147, 26], textColor: 255, fontSize: 9 }, // Bitcoin orange
    bodyStyles: { fontSize: 8.5 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 45, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
    },
    didParseCell: (data: any) => {
      const label = String(data.row.raw?.[0] ?? '');
      if (label === 'TOTAL' || label === 'Effective Rate') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // ===== Monthly Detail Table (new page) =====
  doc.addPage();
  doc.setFillColor(10, 22, 40);
  doc.rect(0, 0, pageW, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Monthly Cost Detail', margin, 9);
  doc.setTextColor(0, 0, 0);

  const monthlyHead = [
    [
      'Month',
      'Uptime %',
      'Run Hrs',
      'Curtail Hrs',
      'MWh',
      'DTS (CAD)',
      'Energy (CAD)',
      'Fortis (CAD)',
      'Total (CAD)',
      '¢/kWh CAD',
      '¢/kWh USD',
    ],
  ];
  const monthlyBody = monthly.map((m) => [
    m.month.slice(0, 3),
    m.uptimePercent.toFixed(1),
    fmtNum(m.runningHours),
    fmtNum(m.curtailedHours),
    fmtNum(m.mwh, 0),
    fmtCAD(m.totalDTSCharges),
    fmtCAD(m.totalEnergyCharges),
    fmtCAD(m.totalFortisCharges),
    fmtCAD(m.totalAmountDue),
    (m.perKwhCAD * 100).toFixed(3),
    (m.perKwhUSD * 100).toFixed(3),
  ]);
  monthlyBody.push([
    'YEAR',
    annual.avgUptimePercent.toFixed(1),
    fmtNum(annual.totalRunningHours),
    fmtNum(annual.totalHours - annual.totalRunningHours),
    fmtNum(annual.totalMWh, 0),
    fmtCAD(annual.totalDTSCharges),
    fmtCAD(annual.totalEnergyCharges),
    fmtCAD(annual.totalFortisCharges),
    fmtCAD(annual.totalAmountDue),
    (annual.avgPerKwhCAD * 100).toFixed(3),
    (annual.avgPerKwhUSD * 100).toFixed(3),
  ]);

  autoTable(doc, {
    startY: 18,
    margin: { left: margin, right: margin },
    head: monthlyHead,
    body: monthlyBody,
    theme: 'grid',
    headStyles: { fillColor: [10, 22, 40], textColor: 255, fontSize: 8.5, halign: 'center' },
    bodyStyles: { fontSize: 8, halign: 'right' },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
    didParseCell: (data: any) => {
      if (data.row.index === monthlyBody.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [240, 240, 240];
      }
    },
  });

  // ===== Footer on every page =====
  // ===== Chart pages (screenshot capture) =====
  if (chartOptions?.resultsElementId) {
    try {
      const tabValues = chartOptions.tabValues
        ? chartOptions.tabValues.map((v) => ({
            value: v,
            label: v.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          }))
        : undefined;
      await appendPowerModelChartPages(doc, pageW, pageH, margin, {
        resultsElementId: chartOptions.resultsElementId,
        tabValues,
        setActiveTab: chartOptions.setActiveTab,
        originalTab: chartOptions.originalTab,
      });
    } catch (err) {
      console.warn('[PowerModelPDF] Chart capture failed:', err);
    }
  }

  // ===== Footer on every page (added LAST so chart pages are numbered too) =====
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 120, 120);
    doc.text(
      'WattByte Infrastructure · Power Model Report · Confidential',
      margin,
      pageH - 6,
    );
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, pageH - 6, { align: 'right' });
  }

  doc.save(`power-model-${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Internal helper: render an HTMLElement to a canvas (html2canvas),
 * then paginate the image across landscape A4 pages of the supplied doc.
 */
async function appendElementAsPages(
  doc: any,
  el: HTMLElement,
  sectionTitle: string,
  pageW: number,
  pageH: number,
  margin: number,
) {
  const html2canvasMod = await import('html2canvas');
  const html2canvas = (html2canvasMod as any).default ?? (html2canvasMod as any);

  // Render at 2x for sharpness; force white background so dark themes
  // don't bleed into the PDF.
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: el.scrollWidth,
  });

  const imgW = pageW - margin * 2;
  // Reserve room for section header (8mm) on first page only.
  const headerH = 10;
  const firstPageMaxH = pageH - margin - (margin + headerH);
  const fullPageMaxH = pageH - margin * 2;

  // Convert canvas px → mm based on imgW scaling.
  const pxPerMm = canvas.width / imgW;
  const firstPageSlicePx = Math.floor(firstPageMaxH * pxPerMm);
  const fullPageSlicePx = Math.floor(fullPageMaxH * pxPerMm);

  let yPx = 0;
  let isFirst = true;
  while (yPx < canvas.height) {
    const slicePx = isFirst ? firstPageSlicePx : fullPageSlicePx;
    const sliceH = Math.min(slicePx, canvas.height - yPx);
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceH;
    const ctx = sliceCanvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(canvas, 0, yPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    const dataUrl = sliceCanvas.toDataURL('image/jpeg', 0.92);

    doc.addPage();
    let yMm = margin;
    if (isFirst) {
      doc.setFillColor(10, 22, 40);
      doc.rect(0, 0, pageW, 14, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(sectionTitle, margin, 9);
      doc.setTextColor(0, 0, 0);
      yMm = margin + headerH;
    }
    const sliceHmm = sliceH / pxPerMm;
    doc.addImage(dataUrl, 'JPEG', margin, yMm, imgW, sliceHmm, undefined, 'FAST');
    yPx += sliceH;
    isFirst = false;
  }
}

/**
 * Wait helper for tab switches / chart re-render.
 */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Cycle through analytics tabs (if provided), capturing each pane and
 * appending the rendered charts/tables to the PDF. Falls back to a
 * single capture of the results element when tab options are absent.
 * Call AFTER all structured pages have been added to `doc`, and BEFORE
 * `doc.save(...)`.
 */
export async function appendPowerModelChartPages(
  doc: any,
  pageW: number,
  pageH: number,
  margin: number,
  options: {
    resultsElementId: string;
    tabValues?: { value: string; label: string }[];
    setActiveTab?: (v: string) => void;
    originalTab?: string;
  },
) {
  const root = document.getElementById(options.resultsElementId);
  if (!root) return;

  const tabs = options.tabValues ?? [];
  if (tabs.length === 0 || !options.setActiveTab) {
    await appendElementAsPages(doc, root, 'Charts & Analytics', pageW, pageH, margin);
    return;
  }

  for (const tab of tabs) {
    options.setActiveTab(tab.value);
    // Allow React to commit + Recharts to lay out.
    await sleep(550);
    const current = document.getElementById(options.resultsElementId);
    if (!current) continue;
    await appendElementAsPages(doc, current, `Charts — ${tab.label}`, pageW, pageH, margin);
  }

  if (options.originalTab) {
    options.setActiveTab(options.originalTab);
  }
}
