import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { BTCNetworkData } from '../types/btc_roi_types';
import { FinancialMetrics, CashFlowMonth, TornadoItem, ScenarioResult } from '../services/financialAnalysisService';
import { ASICMiner } from '../hooks/useASICDatabase';
import { calculatePaybackWithLabel } from '../services/btcRoiMath';

interface PDFGeneratorProps {
  networkData: BTCNetworkData;
  financialMetrics: FinancialMetrics;
  results: {
    dailyBTC: number;
    dailyRevenue: number;
    dailyPowerCost: number;
    dailyPoolFees: number;
    dailyNetProfit: number;
    monthlyNetProfit: number;
    yearlyNetProfit: number;
    totalInvestment: number;
    breakEvenDays: number;
    roi12Month: number;
    efficiency: number;
    totalPowerKW: number;
    dailyPowerKWh: number;
    profitMargin: number;
    monthlyMaintenance: number;
    monthlyDepreciation: number;
  };
  parameters: {
    hashrate: number;
    powerDraw: number;
    units: number;
    electricityRate: number;
    hardwareCost: number;
    poolFee: number;
    maintenancePercent: number;
    mode: 'self' | 'hosting';
    hostingRate?: number;
  };
  selectedASIC: ASICMiner | null;
  isOpen: boolean;
  onClose: () => void;
}

interface PDFOptions {
  companyName: string;
  reportTitle: string;
  preparedFor: string;
  notes: string;
  includeSections: {
    coverPage: boolean;
    executiveSummary: boolean;
    hardwareSpecs: boolean;
    financialAnalysis: boolean;
    cashFlowProjections: boolean;
    sensitivityAnalysis: boolean;
    riskAssessment: boolean;
    appendix: boolean;
  };
}

export const BTCROIPDFGenerator: React.FC<PDFGeneratorProps> = ({
  networkData,
  financialMetrics,
  results,
  parameters,
  selectedASIC,
  isOpen,
  onClose
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<PDFOptions>({
    companyName: '',
    reportTitle: 'Bitcoin Mining Profitability Analysis',
    preparedFor: '',
    notes: '',
    includeSections: {
      coverPage: true,
      executiveSummary: true,
      hardwareSpecs: true,
      financialAnalysis: true,
      cashFlowProjections: true,
      sensitivityAnalysis: true,
      riskAssessment: true,
      appendix: true
    }
  });

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Create a container for the PDF content
      const container = document.createElement('div');
      container.innerHTML = generateReportHTML();
      document.body.appendChild(container);

      const { exportToPDF } = await import('@/utils/pdfExport');
      
      await exportToPDF(container, {
        filename: `btc-mining-roi-report-${new Date().toISOString().split('T')[0]}.pdf`,
        margin: 10,
        orientation: 'portrait',
        format: 'a4',
        imageQuality: 0.98,
        scale: 2,
        useCORS: true,
      });
      
      document.body.removeChild(container);
      toast.success('PDF report generated successfully!');
      onClose();
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateReportHTML = () => {
    const reportDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    const isProfitable = results.dailyNetProfit > 0;
    const effectiveRate = parameters.mode === 'hosting' ? parameters.hostingRate || parameters.electricityRate : parameters.electricityRate;

    let html = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; line-height: 1.6; }
        .page { width: 210mm; min-height: 297mm; padding: 20mm; background: white; page-break-after: always; }
        .page:last-child { page-break-after: auto; }
        .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; min-height: 257mm; }
        .logo { width: 80px; height: 80px; background: linear-gradient(135deg, #f7931a, #e67e22); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; }
        .logo svg { width: 48px; height: 48px; color: white; }
        .cover-title { font-size: 32px; font-weight: 700; color: #1a1a1a; margin-bottom: 10px; }
        .cover-subtitle { font-size: 18px; color: #666; margin-bottom: 60px; }
        .cover-info { font-size: 14px; color: #888; }
        .cover-info p { margin: 8px 0; }
        .section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #f7931a; }
        .subsection-title { font-size: 16px; font-weight: 600; color: #333; margin: 20px 0 12px; }
        .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
        .metric-box { background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; text-align: center; }
        .metric-label { font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .metric-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
        .metric-value.positive { color: #10b981; }
        .metric-value.negative { color: #ef4444; }
        .metric-subvalue { font-size: 12px; color: #888; margin-top: 4px; }
        .table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        .table th, .table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e9ecef; }
        .table th { background: #f8f9fa; font-weight: 600; color: #333; }
        .table tr:last-child td { border-bottom: none; }
        .table .right { text-align: right; }
        .table .bold { font-weight: 600; }
        .table .positive { color: #10b981; }
        .table .negative { color: #ef4444; }
        .highlight-box { background: linear-gradient(135deg, #f7931a15, #f7931a05); border: 1px solid #f7931a40; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .recommendation { background: #10b98115; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .recommendation.warning { background: #f59e0b15; border-left-color: #f59e0b; }
        .recommendation.danger { background: #ef444415; border-left-color: #ef4444; }
        .recommendation-title { font-weight: 600; margin-bottom: 8px; }
        .two-col { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .progress-bar { height: 8px; background: #e9ecef; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #f7931a, #e67e22); border-radius: 4px; }
        .risk-indicator { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .risk-low { background: #10b98120; color: #10b981; }
        .risk-medium { background: #f59e0b20; color: #f59e0b; }
        .risk-high { background: #ef444420; color: #ef4444; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e9ecef; font-size: 11px; color: #888; text-align: center; }
        .page-number { position: absolute; bottom: 15mm; right: 20mm; font-size: 10px; color: #888; }
        .cash-flow-chart { margin: 20px 0; }
        .bar-row { display: flex; align-items: center; margin: 8px 0; }
        .bar-label { width: 60px; font-size: 11px; color: #666; }
        .bar-container { flex: 1; height: 24px; background: #f0f0f0; border-radius: 4px; overflow: hidden; position: relative; }
        .bar-positive { height: 100%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 4px; }
        .bar-negative { height: 100%; background: linear-gradient(90deg, #ef4444, #dc2626); border-radius: 4px; }
        .bar-value { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font-size: 11px; font-weight: 600; }
        .scenario-card { background: #f8f9fa; border-radius: 8px; padding: 16px; margin: 12px 0; }
        .scenario-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .scenario-name { font-weight: 600; color: #1a1a1a; }
        .scenario-probability { font-size: 12px; color: #666; }
        .disclaimer { font-size: 10px; color: #888; margin-top: 20px; padding: 12px; background: #f8f9fa; border-radius: 8px; }
      </style>
    `;

    // Cover Page
    if (options.includeSections.coverPage) {
      html += `
        <div class="page">
          <div class="cover-page">
            <div class="logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div class="cover-title">${options.reportTitle}</div>
            <div class="cover-subtitle">${options.companyName || 'Professional Mining Investment Analysis'}</div>
            <div class="cover-info">
              ${options.preparedFor ? `<p><strong>Prepared for:</strong> ${options.preparedFor}</p>` : ''}
              <p><strong>Report Date:</strong> ${reportDate}</p>
              <p><strong>Analysis Type:</strong> ${parameters.mode === 'hosting' ? 'Hosted Mining' : 'Self-Mining'} Configuration</p>
              <p><strong>Hardware:</strong> ${selectedASIC?.model || 'Custom Configuration'}</p>
            </div>
          </div>
        </div>
      `;
    }

    // Executive Summary
    if (options.includeSections.executiveSummary) {
      html += `
        <div class="page">
          <div class="section-title">Executive Summary</div>
          
          <div class="highlight-box">
            <div style="font-size: 14px; color: #666; margin-bottom: 8px;">Investment Verdict</div>
            <div style="font-size: 28px; font-weight: 700; color: ${isProfitable ? '#10b981' : '#ef4444'};">
              ${isProfitable ? '✓ PROFITABLE INVESTMENT' : '✗ UNPROFITABLE AT CURRENT CONDITIONS'}
            </div>
            <div style="font-size: 14px; color: #666; margin-top: 8px;">
              Based on current BTC price of $${networkData.price.toLocaleString()} and network conditions
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric-box">
              <div class="metric-label">Daily Net Profit</div>
              <div class="metric-value ${results.dailyNetProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(results.dailyNetProfit)}</div>
              <div class="metric-subvalue">${(results.dailyBTC * 100000000).toFixed(0)} sats/day</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Monthly Net Profit</div>
              <div class="metric-value ${results.monthlyNetProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(results.monthlyNetProfit)}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Annual Net Profit</div>
              <div class="metric-value ${results.yearlyNetProfit >= 0 ? 'positive' : 'negative'}">${formatCurrency(results.yearlyNetProfit)}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">12-Month ROI</div>
              <div class="metric-value ${results.roi12Month >= 0 ? 'positive' : 'negative'}">${formatPercent(results.roi12Month)}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Payback Period</div>
              <div class="metric-value">${(() => {
                const paybackResult = calculatePaybackWithLabel(financialMetrics.cashFlowProjections, 36);
                return paybackResult.label;
              })()}</div>
              <div class="metric-subvalue">${results.breakEvenDays !== Infinity && results.breakEvenDays <= 365 * 3 ? (results.breakEvenDays / 30).toFixed(1) + ' months' : ''}</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Total Investment</div>
              <div class="metric-value">${formatCurrency(results.totalInvestment)}</div>
              <div class="metric-subvalue">${parameters.units} unit${parameters.units > 1 ? 's' : ''}</div>
            </div>
          </div>

          <div class="subsection-title">Key Findings</div>
          <div class="${isProfitable ? 'recommendation' : 'recommendation danger'}">
            <div class="recommendation-title">${isProfitable ? 'Investment Opportunity' : 'Investment Caution'}</div>
            <ul style="margin-left: 20px; margin-top: 8px;">
              <li>Net Present Value (NPV) at 10% discount: <strong>${formatCurrency(financialMetrics.npv)}</strong></li>
              <li>Internal Rate of Return (IRR): <strong>${formatPercent(financialMetrics.irr)}</strong></li>
              <li>Profitability Index: <strong>${financialMetrics.profitabilityIndex.toFixed(2)}x</strong></li>
              <li>Break-even BTC price: <strong>$${financialMetrics.breakEvenBTCPrice.toLocaleString()}</strong> (${formatPercent(financialMetrics.safetyMargin)} safety margin)</li>
            </ul>
          </div>

          <div class="subsection-title">Financial Metrics Summary</div>
          <table class="table">
            <tr><th>Metric</th><th class="right">Value</th><th class="right">Assessment</th></tr>
            <tr><td>Gross Margin</td><td class="right">${formatPercent(financialMetrics.grossMargin)}</td><td class="right">${financialMetrics.grossMargin > 50 ? '✓ Strong' : financialMetrics.grossMargin > 30 ? '○ Adequate' : '✗ Weak'}</td></tr>
            <tr><td>Operating Margin</td><td class="right">${formatPercent(financialMetrics.operatingMargin)}</td><td class="right">${financialMetrics.operatingMargin > 40 ? '✓ Strong' : financialMetrics.operatingMargin > 20 ? '○ Adequate' : '✗ Weak'}</td></tr>
            <tr><td>Cash-on-Cash Return</td><td class="right">${formatPercent(financialMetrics.cashOnCashReturn)}</td><td class="right">${financialMetrics.cashOnCashReturn > 50 ? '✓ Excellent' : financialMetrics.cashOnCashReturn > 25 ? '○ Good' : '✗ Low'}</td></tr>
            <tr><td>EBITDA (Annual)</td><td class="right">${formatCurrency(financialMetrics.ebitda)}</td><td class="right">${financialMetrics.ebitda > 0 ? '✓ Positive' : '✗ Negative'}</td></tr>
          </table>
        </div>
      `;
    }

    // Hardware Specifications
    if (options.includeSections.hardwareSpecs) {
      html += `
        <div class="page">
          <div class="section-title">Hardware Specification</div>
          
          <div class="two-col">
            <div>
              <div class="subsection-title">Mining Equipment</div>
              <table class="table">
                <tr><td>Model</td><td class="right bold">${selectedASIC?.model || 'Custom Configuration'}</td></tr>
                ${selectedASIC ? `<tr><td>Manufacturer</td><td class="right">${selectedASIC.manufacturer}</td></tr>` : ''}
                <tr><td>Hashrate (per unit)</td><td class="right bold">${parameters.hashrate} TH/s</td></tr>
                <tr><td>Power Consumption</td><td class="right">${parameters.powerDraw} W</td></tr>
                <tr><td>Efficiency</td><td class="right">${results.efficiency.toFixed(1)} J/TH</td></tr>
                <tr><td>Quantity</td><td class="right bold">${parameters.units} unit${parameters.units > 1 ? 's' : ''}</td></tr>
                ${selectedASIC?.cooling_type ? `<tr><td>Cooling Type</td><td class="right">${selectedASIC.cooling_type}</td></tr>` : ''}
              </table>
            </div>
            <div>
              <div class="subsection-title">Investment & Costs</div>
              <table class="table">
                <tr><td>Hardware Cost (per unit)</td><td class="right">${formatCurrency(parameters.hardwareCost)}</td></tr>
                <tr><td>Total Hardware Investment</td><td class="right bold">${formatCurrency(results.totalInvestment)}</td></tr>
                <tr><td>Electricity Rate</td><td class="right">$${effectiveRate.toFixed(3)}/kWh</td></tr>
                <tr><td>Pool Fee</td><td class="right">${parameters.poolFee}%</td></tr>
                <tr><td>Maintenance Reserve</td><td class="right">${parameters.maintenancePercent}%</td></tr>
                <tr><td>Monthly Maintenance</td><td class="right">${formatCurrency(results.monthlyMaintenance)}</td></tr>
              </table>
            </div>
          </div>

          <div class="subsection-title">Operational Summary</div>
          <div class="metric-grid">
            <div class="metric-box">
              <div class="metric-label">Total Hashrate</div>
              <div class="metric-value">${(parameters.hashrate * parameters.units).toLocaleString()}</div>
              <div class="metric-subvalue">TH/s</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Total Power Draw</div>
              <div class="metric-value">${results.totalPowerKW.toFixed(1)}</div>
              <div class="metric-subvalue">kW</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Daily Energy Usage</div>
              <div class="metric-value">${results.dailyPowerKWh.toFixed(0)}</div>
              <div class="metric-subvalue">kWh</div>
            </div>
          </div>

          <div class="subsection-title">Network Conditions at Time of Analysis</div>
          <table class="table">
            <tr><td>BTC Price</td><td class="right bold">$${networkData.price.toLocaleString()}</td></tr>
            <tr><td>Network Hashrate</td><td class="right">${(networkData.hashrate / 1e18).toFixed(2)} EH/s</td></tr>
            <tr><td>Difficulty</td><td class="right">${(networkData.difficulty / 1e12).toFixed(2)} T</td></tr>
            <tr><td>Block Reward</td><td class="right">${networkData.blockReward} BTC</td></tr>
            <tr><td>Days to Next Halving</td><td class="right">${networkData.nextHalvingDays.toLocaleString()} days</td></tr>
          </table>

          <div class="subsection-title">Depreciation Schedule (3-Year Straight Line)</div>
          <table class="table">
            <tr><th>Year</th><th class="right">Depreciation</th><th class="right">Accumulated</th><th class="right">Book Value</th></tr>
            <tr><td>Year 1</td><td class="right">${formatCurrency(financialMetrics.annualDepreciation)}</td><td class="right">${formatCurrency(financialMetrics.annualDepreciation)}</td><td class="right">${formatCurrency(financialMetrics.bookValueYear1)}</td></tr>
            <tr><td>Year 2</td><td class="right">${formatCurrency(financialMetrics.annualDepreciation)}</td><td class="right">${formatCurrency(financialMetrics.annualDepreciation * 2)}</td><td class="right">${formatCurrency(financialMetrics.bookValueYear2)}</td></tr>
            <tr><td>Year 3</td><td class="right">${formatCurrency(financialMetrics.annualDepreciation)}</td><td class="right">${formatCurrency(results.totalInvestment)}</td><td class="right">$0</td></tr>
          </table>
        </div>
      `;
    }

    // Financial Analysis
    if (options.includeSections.financialAnalysis) {
      const monthlyRevenue = results.dailyRevenue * 30;
      const monthlyPowerCost = results.dailyPowerCost * 30;
      const monthlyPoolFees = results.dailyPoolFees * 30;
      const yearlyRevenue = results.dailyRevenue * 365;
      const yearlyPowerCost = results.dailyPowerCost * 365;
      const yearlyPoolFees = results.dailyPoolFees * 365;
      const yearlyMaintenance = results.monthlyMaintenance * 12;

      html += `
        <div class="page">
          <div class="section-title">Financial Analysis</div>
          
          <div class="subsection-title">Profit & Loss Statement</div>
          <table class="table">
            <tr><th>Item</th><th class="right">Daily</th><th class="right">Monthly</th><th class="right">Annual</th></tr>
            <tr><td class="bold">Revenue (BTC Mining)</td><td class="right">${formatCurrency(results.dailyRevenue)}</td><td class="right">${formatCurrency(monthlyRevenue)}</td><td class="right">${formatCurrency(yearlyRevenue)}</td></tr>
            <tr><td>Less: Power Costs</td><td class="right negative">(${formatCurrency(results.dailyPowerCost)})</td><td class="right negative">(${formatCurrency(monthlyPowerCost)})</td><td class="right negative">(${formatCurrency(yearlyPowerCost)})</td></tr>
            <tr><td>Less: Pool Fees</td><td class="right negative">(${formatCurrency(results.dailyPoolFees)})</td><td class="right negative">(${formatCurrency(monthlyPoolFees)})</td><td class="right negative">(${formatCurrency(yearlyPoolFees)})</td></tr>
            <tr style="background: #f8f9fa;"><td class="bold">Gross Profit</td><td class="right bold">${formatCurrency(results.dailyRevenue - results.dailyPowerCost - results.dailyPoolFees)}</td><td class="right bold">${formatCurrency(monthlyRevenue - monthlyPowerCost - monthlyPoolFees)}</td><td class="right bold">${formatCurrency(yearlyRevenue - yearlyPowerCost - yearlyPoolFees)}</td></tr>
            <tr><td>Less: Maintenance</td><td class="right negative">—</td><td class="right negative">(${formatCurrency(results.monthlyMaintenance)})</td><td class="right negative">(${formatCurrency(yearlyMaintenance)})</td></tr>
            <tr style="background: ${financialMetrics.ebitda >= 0 ? '#10b98120' : '#ef444420'};"><td class="bold">Net Cash Profit (EBITDA)</td><td class="right bold">—</td><td class="right bold ${financialMetrics.ebitda >= 0 ? 'positive' : 'negative'}">${formatCurrency(financialMetrics.ebitda / 12)}</td><td class="right bold ${financialMetrics.ebitda >= 0 ? 'positive' : 'negative'}">${formatCurrency(financialMetrics.ebitda)}</td></tr>
            <tr><td style="color: #888;">Depreciation (non-cash, reference only)</td><td class="right" style="color: #888;">—</td><td class="right" style="color: #888;">(${formatCurrency(results.monthlyDepreciation)})</td><td class="right" style="color: #888;">(${formatCurrency(financialMetrics.annualDepreciation)})</td></tr>
          </table>
          <div style="font-size: 11px; color: #888; margin-top: 8px; font-style: italic;">
            * Depreciation is shown for book value tracking only and is not deducted from cash profit.
          </div>

          <div class="two-col" style="margin-top: 24px;">
            <div>
              <div class="subsection-title">Investment Metrics</div>
              <table class="table">
                <tr><td>Net Present Value (NPV)</td><td class="right bold ${financialMetrics.npv >= 0 ? 'positive' : 'negative'}">${formatCurrency(financialMetrics.npv)}</td></tr>
                <tr><td>Internal Rate of Return (IRR)</td><td class="right bold">${formatPercent(financialMetrics.irr)}</td></tr>
                <tr><td>Modified IRR (MIRR)</td><td class="right">${formatPercent(financialMetrics.mirr)}</td></tr>
                <tr><td>Profitability Index</td><td class="right">${financialMetrics.profitabilityIndex.toFixed(2)}x</td></tr>
                <tr><td>Payback Period</td><td class="right">${calculatePaybackWithLabel(financialMetrics.cashFlowProjections, 36).label}</td></tr>
                <tr><td>Discounted Payback</td><td class="right">${financialMetrics.discountedPaybackMonths === Infinity ? '> 36 mo' : financialMetrics.discountedPaybackMonths.toFixed(1) + ' months'}</td></tr>
              </table>
            </div>
            <div>
              <div class="subsection-title">Operating Margins</div>
              <table class="table">
                <tr><td>Gross Margin</td><td class="right">${formatPercent(financialMetrics.grossMargin)}</td></tr>
                <tr><td>Operating Margin</td><td class="right">${formatPercent(financialMetrics.operatingMargin)}</td></tr>
                <tr><td>Net Margin</td><td class="right">${formatPercent(financialMetrics.netMargin)}</td></tr>
                <tr><td>Cash-on-Cash Return</td><td class="right">${formatPercent(financialMetrics.cashOnCashReturn)}</td></tr>
                <tr><td>Profit Margin</td><td class="right">${formatPercent(results.profitMargin)}</td></tr>
              </table>
            </div>
          </div>
        </div>
      `;
    }

    // Cash Flow Projections
    if (options.includeSections.cashFlowProjections) {
      const projections = financialMetrics.cashFlowProjections.slice(0, 24);
      const breakEvenMonth = projections.findIndex(p => p.cumulativeCashFlow >= 0);
      
      html += `
        <div class="page">
          <div class="section-title">Cash Flow Projections</div>
          
          <div class="highlight-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; color: #666;">Break-Even Point</div>
                <div style="font-size: 24px; font-weight: 700;">${breakEvenMonth >= 0 ? `Month ${breakEvenMonth + 1}` : 'Beyond 24 months'}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; color: #666;">36-Month Cumulative Cash Flow</div>
                <div style="font-size: 24px; font-weight: 700; color: ${financialMetrics.cumulativeCashFlow[35] >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(financialMetrics.cumulativeCashFlow[35] || 0)}</div>
              </div>
            </div>
          </div>

          <div class="subsection-title">Monthly Cash Flow (First 12 Months)</div>
          <table class="table">
            <tr><th>Month</th><th class="right">Revenue</th><th class="right">Costs</th><th class="right">Net CF</th><th class="right">Cumulative</th></tr>
            ${projections.slice(0, 12).map(p => `
              <tr>
                <td>Month ${p.month}</td>
                <td class="right">${formatCurrency(p.revenue)}</td>
                <td class="right negative">${formatCurrency(p.powerCost + p.poolFees + p.maintenance)}</td>
                <td class="right ${p.netCashFlow >= 0 ? 'positive' : 'negative'}">${formatCurrency(p.netCashFlow)}</td>
                <td class="right ${p.cumulativeCashFlow >= 0 ? 'positive' : 'negative'} bold">${formatCurrency(p.cumulativeCashFlow)}</td>
              </tr>
            `).join('')}
          </table>

          <div class="subsection-title">Cumulative Cash Flow Progression</div>
          <div class="cash-flow-chart">
            ${projections.slice(0, 12).map(p => {
              const maxAbs = Math.max(...projections.slice(0, 12).map(x => Math.abs(x.cumulativeCashFlow)));
              const width = Math.abs(p.cumulativeCashFlow) / maxAbs * 100;
              return `
                <div class="bar-row">
                  <div class="bar-label">M${p.month}</div>
                  <div class="bar-container">
                    <div class="${p.cumulativeCashFlow >= 0 ? 'bar-positive' : 'bar-negative'}" style="width: ${width}%;"></div>
                    <div class="bar-value" style="color: ${p.cumulativeCashFlow >= 0 ? '#10b981' : '#ef4444'}">${formatCurrency(p.cumulativeCashFlow)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="subsection-title">Assumptions</div>
          <div style="font-size: 12px; color: #666;">
            <ul style="margin-left: 20px;">
              <li>Projection model: Static (current conditions held constant)</li>
              <li>Network hashrate/difficulty: Held constant at current levels</li>
              <li>BTC price: Held constant at current price</li>
              <li>Discount rate for NPV: 10% annual</li>
              <li>Reinvestment rate for MIRR: 8% annual</li>
              <li>Depreciation: 3-year straight-line (non-cash, reference only)</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Sensitivity Analysis
    if (options.includeSections.sensitivityAnalysis) {
      const tornadoData = financialMetrics.tornadoData;
      
      html += `
        <div class="page">
          <div class="section-title">Sensitivity Analysis</div>
          
          <div class="subsection-title">Variable Impact Analysis (Tornado Chart)</div>
          <p style="font-size: 12px; color: #666; margin-bottom: 16px;">
            Shows the impact of ±20% change in each variable on annual profit
          </p>
          
          <table class="table">
            <tr><th>Variable</th><th class="right">-20% Change</th><th class="right">Base Case</th><th class="right">+20% Change</th><th class="right">Impact</th></tr>
            ${tornadoData.map(t => `
              <tr>
                <td>${t.variable}</td>
                <td class="right ${t.lowCase >= 0 ? 'positive' : 'negative'}">${formatCurrency(t.lowCase)}</td>
                <td class="right">${formatCurrency(t.baseCase)}</td>
                <td class="right ${t.highCase >= 0 ? 'positive' : 'negative'}">${formatCurrency(t.highCase)}</td>
                <td class="right bold">${formatCurrency(Math.abs(t.impact))}</td>
              </tr>
            `).join('')}
          </table>

          <div class="subsection-title">Scenario Analysis</div>
          ${financialMetrics.scenarios.map(s => `
            <div class="scenario-card">
              <div class="scenario-header">
                <div class="scenario-name">${s.name}</div>
                <div class="scenario-probability">${s.probability}</div>
              </div>
              <div style="font-size: 12px; color: #666; margin-bottom: 12px;">${s.description}</div>
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; font-size: 12px;">
                <div>
                  <div style="color: #666;">Year 1</div>
                  <div style="font-weight: 600; color: ${s.year1Profit >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(s.year1Profit)}</div>
                </div>
                <div>
                  <div style="color: #666;">Year 2</div>
                  <div style="font-weight: 600; color: ${s.year2Profit >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(s.year2Profit)}</div>
                </div>
                <div>
                  <div style="color: #666;">Year 3</div>
                  <div style="font-weight: 600; color: ${s.year3Profit >= 0 ? '#10b981' : '#ef4444'};">${formatCurrency(s.year3Profit)}</div>
                </div>
                <div>
                  <div style="color: #666;">Total ROI</div>
                  <div style="font-weight: 600; color: ${s.roi >= 0 ? '#10b981' : '#ef4444'};">${formatPercent(s.roi)}</div>
                </div>
              </div>
            </div>
          `).join('')}

          <div class="subsection-title">Break-Even Sensitivity</div>
          <div class="two-col">
            <div class="metric-box">
              <div class="metric-label">Break-Even BTC Price</div>
              <div class="metric-value">$${financialMetrics.breakEvenBTCPrice.toLocaleString()}</div>
              <div class="metric-subvalue">${formatPercent(financialMetrics.safetyMargin)} below current price</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Break-Even Electricity</div>
              <div class="metric-value">$${financialMetrics.breakEvenElectricityRate.toFixed(3)}/kWh</div>
              <div class="metric-subvalue">${formatPercent(((financialMetrics.breakEvenElectricityRate - effectiveRate) / effectiveRate) * 100)} above current rate</div>
            </div>
          </div>
        </div>
      `;
    }

    // Risk Assessment
    if (options.includeSections.riskAssessment) {
      const getRiskLevel = (score: number) => score > 70 ? 'high' : score > 40 ? 'medium' : 'low';
      const getRiskLabel = (score: number) => score > 70 ? 'High' : score > 40 ? 'Medium' : 'Low';
      
      html += `
        <div class="page">
          <div class="section-title">Risk Assessment</div>
          
          <div class="highlight-box">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 14px; color: #666;">Overall Risk Score</div>
                <div style="font-size: 32px; font-weight: 700;">${financialMetrics.overallRiskScore.toFixed(0)}/100</div>
              </div>
              <div class="risk-indicator risk-${getRiskLevel(financialMetrics.overallRiskScore)}">${getRiskLabel(financialMetrics.overallRiskScore)} Risk</div>
            </div>
          </div>

          <div class="subsection-title">Risk Breakdown</div>
          <div class="metric-grid">
            <div class="metric-box">
              <div class="metric-label">Price Volatility Risk</div>
              <div class="metric-value">${financialMetrics.priceRiskScore.toFixed(0)}/100</div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${financialMetrics.priceRiskScore}%; background: ${financialMetrics.priceRiskScore > 70 ? '#ef4444' : financialMetrics.priceRiskScore > 40 ? '#f59e0b' : '#10b981'};"></div></div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Difficulty Risk</div>
              <div class="metric-value">${financialMetrics.difficultyRiskScore.toFixed(0)}/100</div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${financialMetrics.difficultyRiskScore}%; background: ${financialMetrics.difficultyRiskScore > 70 ? '#ef4444' : financialMetrics.difficultyRiskScore > 40 ? '#f59e0b' : '#10b981'};"></div></div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Operational Risk</div>
              <div class="metric-value">${financialMetrics.operationalRiskScore.toFixed(0)}/100</div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${financialMetrics.operationalRiskScore}%; background: ${financialMetrics.operationalRiskScore > 70 ? '#ef4444' : financialMetrics.operationalRiskScore > 40 ? '#f59e0b' : '#10b981'};"></div></div>
            </div>
          </div>

          <div class="subsection-title">Safety Margins</div>
          <table class="table">
            <tr><th>Threshold</th><th class="right">Break-Even</th><th class="right">Current</th><th class="right">Safety Margin</th></tr>
            <tr>
              <td>BTC Price</td>
              <td class="right">$${financialMetrics.breakEvenBTCPrice.toLocaleString()}</td>
              <td class="right">$${networkData.price.toLocaleString()}</td>
              <td class="right ${financialMetrics.safetyMargin > 0 ? 'positive' : 'negative'}">${formatPercent(financialMetrics.safetyMargin)}</td>
            </tr>
            <tr>
              <td>Electricity Rate</td>
              <td class="right">$${financialMetrics.breakEvenElectricityRate.toFixed(3)}/kWh</td>
              <td class="right">$${effectiveRate.toFixed(3)}/kWh</td>
              <td class="right positive">${formatPercent(((financialMetrics.breakEvenElectricityRate - effectiveRate) / effectiveRate) * 100)}</td>
            </tr>
          </table>

          <div class="subsection-title">Key Risk Factors</div>
          <div class="recommendation warning">
            <div class="recommendation-title">Bitcoin Price Volatility</div>
            <p style="font-size: 13px;">BTC has historically exhibited 60-80% annual volatility. A price drop below $${financialMetrics.breakEvenBTCPrice.toLocaleString()} would make this operation unprofitable.</p>
          </div>
          
          <div class="recommendation warning">
            <div class="recommendation-title">Network Difficulty Growth</div>
            <p style="font-size: 13px;">Mining difficulty typically increases 3-5% monthly. This reduces mining rewards over time and impacts long-term profitability projections.</p>
          </div>
          
          <div class="recommendation">
            <div class="recommendation-title">Halving Event</div>
            <p style="font-size: 13px;">The next Bitcoin halving is approximately ${networkData.nextHalvingDays.toLocaleString()} days away. Block rewards will reduce from ${networkData.blockReward} to ${networkData.blockReward / 2} BTC.</p>
          </div>
        </div>
      `;
    }

    // Appendix
    if (options.includeSections.appendix) {
      html += `
        <div class="page">
          <div class="section-title">Appendix</div>
          
          <div class="subsection-title">Methodology</div>
          <div style="font-size: 12px; color: #666;">
            <p style="margin-bottom: 12px;">This analysis uses the following methodologies:</p>
            <ul style="margin-left: 20px;">
              <li><strong>Revenue Calculation:</strong> Based on current network hashrate share and block rewards</li>
              <li><strong>NPV:</strong> Discounted cash flow analysis at 10% annual discount rate</li>
              <li><strong>IRR:</strong> Newton-Raphson iterative method for internal rate of return</li>
              <li><strong>Break-Even:</strong> Solved by setting net profit equation to zero</li>
              <li><strong>Sensitivity:</strong> ±20% variations on key input parameters</li>
            </ul>
          </div>

          <div class="subsection-title">Data Sources</div>
          <table class="table">
            <tr><td>Bitcoin Price</td><td class="right">Real-time market data</td></tr>
            <tr><td>Network Hashrate</td><td class="right">Blockchain network statistics</td></tr>
            <tr><td>Difficulty</td><td class="right">Current Bitcoin difficulty target</td></tr>
            <tr><td>Block Reward</td><td class="right">Current subsidy (${networkData.blockReward} BTC)</td></tr>
          </table>

          ${options.notes ? `
            <div class="subsection-title">Additional Notes</div>
            <div style="font-size: 13px; color: #333; white-space: pre-wrap; background: #f8f9fa; padding: 12px; border-radius: 8px;">${options.notes}</div>
          ` : ''}

          <div class="disclaimer">
            <strong>Disclaimer:</strong> This report is for informational purposes only and does not constitute financial advice. 
            Cryptocurrency mining involves significant risks including but not limited to: price volatility, regulatory changes, 
            hardware obsolescence, and operational risks. Past performance does not guarantee future results. 
            All projections are based on current conditions and assumptions which may change. 
            Consult with a qualified financial advisor before making investment decisions.
          </div>

          <div class="footer">
            <p>Report generated on ${reportDate}</p>
            <p>BTC Mining Profitability Analysis Tool</p>
          </div>
        </div>
      `;
    }

    return html;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-watt-bitcoin" />
            Generate PDF Report
          </DialogTitle>
          <DialogDescription>
            Customize and export a professional multi-page PDF report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Report Customization */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Report Details</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-xs text-muted-foreground">Company Name</Label>
                <Input
                  id="companyName"
                  value={options.companyName}
                  onChange={(e) => setOptions(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Your Company"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preparedFor" className="text-xs text-muted-foreground">Prepared For</Label>
                <Input
                  id="preparedFor"
                  value={options.preparedFor}
                  onChange={(e) => setOptions(prev => ({ ...prev, preparedFor: e.target.value }))}
                  placeholder="Client Name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportTitle" className="text-xs text-muted-foreground">Report Title</Label>
              <Input
                id="reportTitle"
                value={options.reportTitle}
                onChange={(e) => setOptions(prev => ({ ...prev, reportTitle: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs text-muted-foreground">Additional Notes</Label>
              <textarea
                id="notes"
                value={options.notes}
                onChange={(e) => setOptions(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any additional notes to include in the appendix..."
                className="w-full h-20 px-3 py-2 text-sm rounded-md border border-input bg-background resize-none"
              />
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Sections</Label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(options.includeSections).map(([key, checked]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={checked}
                    onCheckedChange={(val) => 
                      setOptions(prev => ({
                        ...prev,
                        includeSections: { ...prev.includeSections, [key]: val as boolean }
                      }))
                    }
                  />
                  <Label htmlFor={key} className="text-sm capitalize cursor-pointer">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="text-sm font-medium">Report Preview</div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Pages: ~{Object.values(options.includeSections).filter(Boolean).length + 1}</div>
              <div>Format: A4 PDF</div>
              <div>Hardware: {selectedASIC?.model || 'Custom'}</div>
              <div>Mode: {parameters.mode === 'hosting' ? 'Hosted' : 'Self-Mining'}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating} className="flex-1 bg-watt-bitcoin hover:bg-watt-bitcoin/90">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
