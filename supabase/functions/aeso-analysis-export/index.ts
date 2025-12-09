import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisEvent {
  date: string;
  time?: string;
  hour?: number;
  price: number;
  allInPrice: number;
  duration: number;
  savings: number;
  allInSavings?: number;
}

interface AnalysisData {
  totalShutdowns: number;
  totalHours: number;
  totalSavings: number;
  totalAllInSavings: number;
  originalAverage: number;
  newAveragePrice: number;
  events: AnalysisEvent[];
}

interface ScenarioData {
  uptimePercentage: number;
  analysis: AnalysisData;
}

interface ExportConfig {
  uptimePercentage: string;
  timePeriod: string;
  transmissionAdder: string;
  exchangeRate: number;
  exportType?: 'single' | 'comprehensive';
  scenarios?: ScenarioData[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisData, config } = await req.json() as { 
      analysisData: AnalysisData; 
      config: ExportConfig 
    };

    console.log('Generating PDF export for AESO analysis');
    console.log('Config:', config);
    console.log('Export type:', config.exportType || 'single');
    console.log('Scenarios count:', config.scenarios?.length || 0);

    const generatedDate = new Date().toLocaleString('en-US', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const timePeriodLabels: Record<string, string> = {
      '30': 'Last 30 Days',
      '90': 'Last 90 Days',
      '180': 'Last 180 Days',
      '365': 'Last 1 Year',
      '730': 'Last 2 Years',
      '1095': 'Last 3 Years',
      '1460': 'Last 4 Years'
    };

    const timePeriodLabel = timePeriodLabels[config.timePeriod] || `Last ${config.timePeriod} Days`;
    const exchangeRate = config.exchangeRate || 0.73;

    // Format currency helpers
    const formatCAD = (value: number) => `$${value.toFixed(2)} CAD`;
    const formatUSD = (value: number) => `$${(value * exchangeRate).toFixed(2)} USD`;

    let htmlContent: string;

    if (config.exportType === 'comprehensive' && config.scenarios && config.scenarios.length > 0) {
      // Generate comprehensive multi-scenario report
      htmlContent = generateComprehensiveReport(config.scenarios, config, timePeriodLabel, generatedDate, formatCAD, formatUSD);
    } else {
      // Generate single scenario report (original behavior, but enhanced)
      htmlContent = generateSingleScenarioReport(analysisData, config, timePeriodLabel, generatedDate, formatCAD, formatUSD);
    }

    // Base64 encode the HTML content
    const base64Content = btoa(unescape(encodeURIComponent(htmlContent)));

    return new Response(JSON.stringify({ 
      success: true,
      htmlContent: base64Content 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating PDF export:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateComprehensiveReport(
  scenarios: ScenarioData[], 
  config: ExportConfig, 
  timePeriodLabel: string, 
  generatedDate: string,
  formatCAD: (v: number) => string,
  formatUSD: (v: number) => string
): string {
  const exchangeRate = config.exchangeRate || 0.73;
  const transmissionAdder = parseFloat(config.transmissionAdder) || 11.73; // Updated default to $11.73/MWh
  const totalHoursInPeriod = parseInt(config.timePeriod) * 24;

  // Sort scenarios by uptime (highest first for comparison)
  const sortedScenarios = [...scenarios].sort((a, b) => b.uptimePercentage - a.uptimePercentage);

  // Generate comparison table rows
  const comparisonRows = sortedScenarios.map((scenario, index) => {
    const analysis = scenario.analysis;
    const downtimePercent = (100 - scenario.uptimePercentage).toFixed(1);
    const allInOriginal = (analysis.originalAverage || 0) + transmissionAdder;
    const allInOptimized = (analysis.newAveragePrice || 0) + transmissionAdder;
    const savings = allInOriginal - allInOptimized;
    const savingsPercent = allInOriginal > 0 ? ((savings / allInOriginal) * 100).toFixed(1) : '0.0';
    
    return `
      <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600; text-align: center;">${scenario.uptimePercentage}%</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;">${downtimePercent}%</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCAD(analysis.originalAverage || 0)}/MWh</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600;">${formatCAD(analysis.newAveragePrice || 0)}/MWh</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0052FF;">${formatUSD(analysis.newAveragePrice || 0)}/MWh</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600;">${formatCAD(allInOptimized)}/MWh</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #0052FF; font-weight: 600;">$${(allInOptimized * exchangeRate).toFixed(2)}/MWh</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${analysis.totalHours || 0}h</td>
        <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600;">${savingsPercent}%</td>
      </tr>
    `;
  }).join('');

  // Generate individual scenario sections
  const scenarioSections = sortedScenarios.map((scenario, scenarioIndex) => {
    const analysis = scenario.analysis;
    const downtimePercent = (100 - scenario.uptimePercentage).toFixed(1);
    const actualDowntimePercent = ((analysis.totalHours / totalHoursInPeriod) * 100).toFixed(1);
    
    // Generate ALL events (no limit) with pagination via page breaks
    const allEvents = (analysis.events || []).sort((a, b) => b.price - a.price);
    
    // Create event rows - show ALL hours
    const eventRows = allEvents.map((event, index) => {
      const hourDisplay = event.time || `${String(event.hour ?? 0).padStart(2, '0')}:00`;
      return `
        <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; font-size: 11px;">${event.date}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 11px;">${hourDisplay}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626; font-weight: 600; font-size: 11px;">${formatCAD(event.price)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: #64748b;">${formatUSD(event.price)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px;">${formatCAD(event.allInPrice)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: #64748b;">${formatUSD(event.allInPrice)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600; font-size: 11px;">${formatCAD(event.savings)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 11px; color: #16a34a;">${formatUSD(event.savings)}</td>
        </tr>
      `;
    }).join('');

    return `
      <div style="page-break-before: always;">
        <div style="background: linear-gradient(135deg, #0A1628, #1e3a5f); color: white; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px;">Scenario: ${scenario.uptimePercentage}% Uptime</h2>
          <p style="margin: 4px 0 0 0; opacity: 0.8; font-size: 13px;">Strategic shutdown during ${downtimePercent}% highest-priced hours</p>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px;">
          <div style="flex: 1 1 22%; min-width: 140px; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: 700; color: #dc2626;">${analysis.totalShutdowns || 0}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Shutdown Events</div>
          </div>
          <div style="flex: 1 1 22%; min-width: 140px; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 24px; font-weight: 700; color: #F7931A;">${analysis.totalHours || 0}h</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Total Downtime</div>
          </div>
          <div style="flex: 1 1 22%; min-width: 140px; background: #dcfce7; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #86efac;">
            <div style="font-size: 20px; font-weight: 700; color: #16a34a;">${formatCAD(analysis.totalSavings || 0)}</div>
            <div style="font-size: 12px; color: #15803d;">${formatUSD(analysis.totalSavings || 0)}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Energy Savings</div>
          </div>
          <div style="flex: 1 1 22%; min-width: 140px; background: #dcfce7; padding: 16px; border-radius: 8px; text-align: center; border: 1px solid #86efac;">
            <div style="font-size: 20px; font-weight: 700; color: #16a34a;">${formatCAD(analysis.totalAllInSavings || 0)}</div>
            <div style="font-size: 12px; color: #15803d;">${formatUSD(analysis.totalAllInSavings || 0)}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">All-In Savings</div>
          </div>
        </div>
        
        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
          <div style="flex: 1 1 45%; min-width: 200px; padding: 20px; border-radius: 8px; text-align: center; background: #f1f5f9; border: 2px solid #cbd5e1;">
            <div style="font-size: 22px; font-weight: 700; color: #64748b;">${formatCAD((analysis.originalAverage || 0) + parseFloat(config.transmissionAdder))}/MWh</div>
            <div style="font-size: 14px; color: #94a3b8; margin-top: 4px;">${formatUSD((analysis.originalAverage || 0) + parseFloat(config.transmissionAdder))}/MWh</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Original All-In Price (100% Uptime)</div>
          </div>
          <div style="flex: 1 1 45%; min-width: 200px; padding: 20px; border-radius: 8px; text-align: center; background: #dcfce7; border: 2px solid #86efac;">
            <div style="font-size: 22px; font-weight: 700; color: #16a34a;">${formatCAD((analysis.newAveragePrice || 0) + parseFloat(config.transmissionAdder))}/MWh</div>
            <div style="font-size: 14px; color: #15803d; margin-top: 4px;">${formatUSD((analysis.newAveragePrice || 0) + parseFloat(config.transmissionAdder))}/MWh</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 8px;">Optimized All-In Price (${scenario.uptimePercentage}% Uptime)</div>
          </div>
        </div>
        
        ${allEvents.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <h3 style="font-size: 14px; font-weight: 700; color: #0A1628; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0;">
            Complete Shutdown Hours (${allEvents.length} total hours)
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #0A1628; color: white;">
                <th style="padding: 10px 8px; text-align: left; font-weight: 600; font-size: 10px; text-transform: uppercase; border-radius: 6px 0 0 0;">Date</th>
                <th style="padding: 10px 8px; text-align: center; font-weight: 600; font-size: 10px; text-transform: uppercase;">Hour</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">Energy CAD</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">Energy USD</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">All-In CAD</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">All-In USD</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase;">Savings CAD</th>
                <th style="padding: 10px 8px; text-align: right; font-weight: 600; font-size: 10px; text-transform: uppercase; border-radius: 0 6px 0 0;">Savings USD</th>
              </tr>
            </thead>
            <tbody>
              ${eventRows}
            </tbody>
          </table>
        </div>
        ` : ''}
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AESO Comprehensive Uptime Analysis - WattByte</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 15mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0A1628;
      line-height: 1.5;
      background: #ffffff;
      position: relative;
      font-size: 12px;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 100px;
      font-weight: 800;
      color: rgba(10, 22, 40, 0.03);
      letter-spacing: 20px;
      z-index: -1;
      pointer-events: none;
      white-space: nowrap;
    }
    
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 20px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 3px solid #F7931A;
      margin-bottom: 24px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #F7931A, #0A1628);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 18px;
    }
    
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      color: #0A1628;
      letter-spacing: -0.5px;
    }
    
    .logo-text span {
      color: #F7931A;
    }
    
    .report-meta {
      text-align: right;
      color: #64748b;
      font-size: 11px;
    }
    
    .report-meta strong {
      color: #0A1628;
      display: block;
      font-size: 13px;
    }
    
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #0A1628;
      margin-bottom: 6px;
    }
    
    .subtitle {
      color: #64748b;
      font-size: 13px;
      margin-bottom: 20px;
    }
    
    .executive-summary {
      background: linear-gradient(135deg, #f0f9ff, #fef3c7);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .summary-title {
      font-size: 15px;
      font-weight: 700;
      color: #0A1628;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    th {
      background: #0A1628;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    th:first-child {
      border-radius: 6px 0 0 0;
    }
    
    th:last-child {
      border-radius: 0 6px 0 0;
    }
    
    .footer {
      margin-top: 30px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .footer-logo {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #F7931A, #0A1628);
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 9px;
    }
    
    .confidential {
      color: #94a3b8;
      font-size: 9px;
    }
    
    @media print {
      .container {
        padding: 0;
      }
      
      .watermark {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      th, .executive-summary, .logo-icon, .footer-logo {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">WATTBYTE</div>
  
  <div class="container">
    <header class="header">
      <div class="logo">
        <div class="logo-icon">W</div>
        <div class="logo-text">Watt<span>Byte</span></div>
      </div>
      <div class="report-meta">
        <strong>Comprehensive Uptime Analysis Report</strong>
        Generated: ${generatedDate} MT
      </div>
    </header>
    
    <h1>Multi-Scenario Uptime Optimization Analysis</h1>
    <p class="subtitle">Comprehensive comparison of ${sortedScenarios.length} uptime scenarios for ${timePeriodLabel} (${totalHoursInPeriod.toLocaleString()} hours)</p>
    
    <div class="executive-summary">
      <div class="summary-title">📊 Executive Summary - All Scenarios Comparison</div>
      
      <!-- Cost Components Section - Prominent Adder Display -->
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Energy Price</div>
            <div style="font-size: 18px; font-weight: 700; color: #0A1628;">Variable</div>
            <div style="font-size: 10px; color: #64748b;">Based on AESO Pool Price</div>
          </div>
          <div style="font-size: 24px; color: #f59e0b; font-weight: bold;">+</div>
          <div style="text-align: center; flex: 1; min-width: 150px; background: #fff; border-radius: 6px; padding: 12px; border: 2px dashed #f59e0b;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Transmission Adder</div>
            <div style="font-size: 22px; font-weight: 800; color: #dc2626;">$${transmissionAdder.toFixed(2)}/MWh CAD</div>
            <div style="font-size: 12px; color: #0052FF; font-weight: 600;">$${(transmissionAdder * exchangeRate).toFixed(2)}/MWh USD</div>
          </div>
          <div style="font-size: 24px; color: #f59e0b; font-weight: bold;">=</div>
          <div style="text-align: center; flex: 1; min-width: 150px;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">All-In Rate</div>
            <div style="font-size: 18px; font-weight: 700; color: #16a34a;">Energy + $${transmissionAdder.toFixed(2)}</div>
            <div style="font-size: 10px; color: #64748b;">Total delivered cost</div>
          </div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th style="text-align: center;">Uptime Target</th>
            <th style="text-align: center;">Downtime</th>
            <th style="text-align: right;">Original Avg (CAD)</th>
            <th style="text-align: right;">Optimized Avg (CAD)</th>
            <th style="text-align: right;">Optimized Avg (USD)</th>
            <th style="text-align: right;">All-In (CAD)</th>
            <th style="text-align: right;">All-In (USD)</th>
            <th style="text-align: center;">Shutdown Hours</th>
            <th style="text-align: right;">Savings %</th>
          </tr>
        </thead>
        <tbody>
          ${comparisonRows}
        </tbody>
      </table>
      <p style="margin-top: 12px; font-size: 11px; color: #64748b;">
        <strong>Note:</strong> All-In calculations include transmission adder of <strong style="color: #dc2626;">$${transmissionAdder.toFixed(2)}/MWh CAD</strong>. Exchange rate: 1 CAD = ${exchangeRate.toFixed(4)} USD.
      </p>
    </div>
    
    ${scenarioSections}
    
    <div style="page-break-before: always;">
      <h2 style="font-size: 18px; font-weight: 700; margin-bottom: 16px;">Appendix: Methodology & Data Sources</h2>
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Calculation Methodology</h3>
        <ul style="list-style-type: disc; padding-left: 20px; font-size: 12px; line-height: 1.8;">
          <li><strong>Strategic Shutdown:</strong> Analysis identifies the highest-priced hours in the period and calculates savings from avoiding operations during those times.</li>
          <li><strong>Uptime Target:</strong> Each scenario maintains the specified uptime percentage by shutting down only during the costliest (100 - uptime)% of hours.</li>
          <li><strong>Energy-Only Savings:</strong> Calculated as the sum of energy prices during shutdown hours.</li>
          <li><strong>All-In Savings:</strong> Includes transmission adder ($${config.transmissionAdder}/MWh) in cost calculations.</li>
          <li><strong>Currency Conversion:</strong> CAD to USD at rate of ${exchangeRate.toFixed(4)} (live rate at time of generation).</li>
        </ul>
        
        <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 12px 0;">Data Sources</h3>
        <ul style="list-style-type: disc; padding-left: 20px; font-size: 12px; line-height: 1.8;">
          <li><strong>AESO Pool Price:</strong> Real-time and historical pool prices from Alberta Electric System Operator (AESO) public reports.</li>
          <li><strong>Time Period:</strong> ${timePeriodLabel} (${parseInt(config.timePeriod)} days × 24 hours = ${totalHoursInPeriod.toLocaleString()} hourly data points).</li>
          <li><strong>Transmission Adder:</strong> $${config.transmissionAdder}/MWh standard rate-class transmission charge.</li>
        </ul>
        
        <h3 style="font-size: 14px; font-weight: 600; margin: 16px 0 12px 0;">Disclaimer</h3>
        <p style="font-size: 11px; color: #64748b; line-height: 1.6;">
          This analysis is provided for informational purposes only and does not constitute financial or operational advice. 
          Actual savings may vary based on operational constraints, equipment limitations, and market conditions. 
          Past performance is not indicative of future results. WattByte makes no guarantees regarding the accuracy or completeness of this data.
        </p>
      </div>
    </div>
    
    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">W</div>
        <span><strong>WattByte</strong> Energy Intelligence Platform</span>
      </div>
      <div class="confidential">
        https://www.wattbyte.com
      </div>
    </footer>
  </div>
</body>
</html>
  `;
}

function generateSingleScenarioReport(
  analysisData: AnalysisData,
  config: ExportConfig,
  timePeriodLabel: string,
  generatedDate: string,
  formatCAD: (v: number) => string,
  formatUSD: (v: number) => string
): string {
  const downtimePercentage = (100 - parseFloat(config.uptimePercentage)).toFixed(1);
  const totalHoursInPeriod = parseInt(config.timePeriod) * 24;
  const actualDowntimePercent = ((analysisData.totalHours / totalHoursInPeriod) * 100).toFixed(1);
  const exchangeRate = config.exchangeRate || 0.73;

  // Generate ALL events (no limit)
  const allEvents = (analysisData.events || []).sort((a, b) => b.price - a.price);

  const eventsTableRows = allEvents.map((event, index) => {
    const hourDisplay = event.time || `${String(event.hour ?? 0).padStart(2, '0')}:00`;
    return `
      <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${event.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${hourDisplay}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626; font-weight: 600;">${formatCAD(event.price)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #64748b;">${formatUSD(event.price)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCAD(event.allInPrice)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #64748b;">${formatUSD(event.allInPrice)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${event.duration}h</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600;">${formatCAD(event.savings)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a;">${formatUSD(event.savings)}</td>
      </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AESO Uptime Optimization Analysis - WattByte</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #0A1628;
      line-height: 1.6;
      background: #ffffff;
      position: relative;
    }
    
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 120px;
      font-weight: 800;
      color: rgba(10, 22, 40, 0.03);
      letter-spacing: 20px;
      z-index: -1;
      pointer-events: none;
      white-space: nowrap;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 24px;
      border-bottom: 3px solid #F7931A;
      margin-bottom: 32px;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #F7931A, #0A1628);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 20px;
    }
    
    .logo-text {
      font-size: 28px;
      font-weight: 800;
      color: #0A1628;
      letter-spacing: -0.5px;
    }
    
    .logo-text span {
      color: #F7931A;
    }
    
    .report-meta {
      text-align: right;
      color: #64748b;
      font-size: 12px;
    }
    
    .report-meta strong {
      color: #0A1628;
      display: block;
      font-size: 14px;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      color: #0A1628;
      margin-bottom: 8px;
    }
    
    .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 24px;
    }
    
    .executive-summary {
      background: linear-gradient(135deg, #f0f9ff, #fef3c7);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
    }
    
    .summary-title {
      font-size: 16px;
      font-weight: 700;
      color: #0A1628;
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .summary-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .summary-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .summary-label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .summary-value {
      font-size: 20px;
      font-weight: 700;
    }
    
    .summary-value.green { color: #16a34a; }
    .summary-value.blue { color: #0052FF; }
    .summary-value.orange { color: #F7931A; }
    .summary-value.red { color: #dc2626; }
    
    .summary-sub {
      font-size: 12px;
      color: #64748b;
      margin-top: 2px;
    }
    
    .metrics-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 24px;
    }
    
    .metric-card {
      background: #f8fafc;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    
    .metric-value {
      font-size: 24px;
      font-weight: 700;
      color: #0A1628;
    }
    
    .metric-label {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #0A1628;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .comparison-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .comparison-card {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .comparison-card.original {
      background: #f1f5f9;
      border: 2px solid #cbd5e1;
    }
    
    .comparison-card.optimized {
      background: #dcfce7;
      border: 2px solid #86efac;
    }
    
    .comparison-value {
      font-size: 24px;
      font-weight: 700;
    }
    
    .comparison-usd {
      font-size: 14px;
      color: #64748b;
      margin-top: 4px;
    }
    
    .comparison-label {
      font-size: 12px;
      color: #64748b;
      margin-top: 8px;
    }
    
    .savings-highlight {
      background: linear-gradient(135deg, #0A1628, #1e3a5f);
      color: white;
      padding: 20px;
      border-radius: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
    
    .savings-item {
      text-align: center;
    }
    
    .savings-value {
      font-size: 28px;
      font-weight: 800;
      color: #4ade80;
    }
    
    .savings-label {
      font-size: 12px;
      color: rgba(255,255,255,0.7);
      margin-top: 4px;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    
    th {
      background: #0A1628;
      color: white;
      padding: 10px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    th:first-child {
      border-radius: 8px 0 0 0;
    }
    
    th:last-child {
      border-radius: 0 8px 0 0;
    }
    
    .table-note {
      font-size: 11px;
      color: #64748b;
      font-style: italic;
      margin-top: 8px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #64748b;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .footer-logo {
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #F7931A, #0A1628);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 10px;
    }
    
    .confidential {
      color: #94a3b8;
      font-size: 10px;
    }
    
    @media print {
      .container {
        padding: 0;
      }
      
      .watermark {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .executive-summary,
      .metric-card,
      .comparison-card,
      .savings-highlight,
      th {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="watermark">WATTBYTE</div>
  
  <div class="container">
    <header class="header">
      <div class="logo">
        <div class="logo-icon">W</div>
        <div class="logo-text">Watt<span>Byte</span></div>
      </div>
      <div class="report-meta">
        <strong>AESO Analysis Report</strong>
        Generated: ${generatedDate} MT
      </div>
    </header>
    
    <h1>Uptime Optimization Analysis</h1>
    <p class="subtitle">Strategic shutdown analysis for ${timePeriodLabel} with ${config.uptimePercentage}% target uptime</p>
    
    <div class="executive-summary">
      <div class="summary-title">
        📊 Executive Summary
      </div>
      
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; text-align: center;">
          <div style="flex: 1 1 120px; min-width: 100px;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Energy Price</div>
            <div style="font-size: 18px; font-weight: 700; color: #0A1628;">${formatCAD(analysisData.newAveragePrice || 0)}/MWh</div>
            <div style="font-size: 10px; color: #64748b;">Optimized Pool Price</div>
          </div>
          <div style="font-size: 24px; color: #f59e0b; font-weight: bold;">+</div>
          <div style="flex: 1 1 150px; min-width: 130px; background: #fff; border-radius: 6px; padding: 12px; border: 2px dashed #f59e0b;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">Transmission Adder</div>
            <div style="font-size: 22px; font-weight: 800; color: #dc2626;">$${parseFloat(config.transmissionAdder).toFixed(2)}/MWh CAD</div>
            <div style="font-size: 12px; color: #0052FF; font-weight: 600;">$${(parseFloat(config.transmissionAdder) * exchangeRate).toFixed(2)}/MWh USD</div>
          </div>
          <div style="font-size: 24px; color: #f59e0b; font-weight: bold;">=</div>
          <div style="flex: 1 1 120px; min-width: 100px;">
            <div style="font-size: 11px; color: #92400e; text-transform: uppercase; font-weight: 600;">All-In Rate</div>
            <div style="font-size: 18px; font-weight: 700; color: #16a34a;">${formatCAD((analysisData.newAveragePrice || 0) + parseFloat(config.transmissionAdder))}/MWh</div>
            <div style="font-size: 10px; color: #64748b;">Total delivered cost</div>
          </div>
        </div>
      </div>
      
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Target Uptime</div>
          <div class="summary-value blue">${config.uptimePercentage}%</div>
          <div class="summary-sub">Shutdown during ${downtimePercentage}% highest-priced hours</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Analysis Period</div>
          <div class="summary-value orange">${timePeriodLabel}</div>
          <div class="summary-sub">${totalHoursInPeriod.toLocaleString()} total hours</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Energy-Only Savings</div>
          <div class="summary-value green">${formatCAD(analysisData.totalSavings || 0)}</div>
          <div class="summary-sub">${formatUSD(analysisData.totalSavings || 0)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">All-In Savings</div>
          <div class="summary-value green">${formatCAD(analysisData.totalAllInSavings || 0)}</div>
          <div class="summary-sub">Including $${config.transmissionAdder}/MWh transmission</div>
        </div>
      </div>
    </div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value" style="color: #dc2626;">${analysisData.totalShutdowns}</div>
        <div class="metric-label">Shutdown Events</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #F7931A;">${analysisData.totalHours}</div>
        <div class="metric-label">Total Hours</div>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #0052FF;">${actualDowntimePercent}%</div>
        <div class="metric-label">Actual Downtime</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${formatCAD(parseFloat(config.transmissionAdder))}</div>
        <div class="metric-label">Transmission Adder</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${exchangeRate.toFixed(4)}</div>
        <div class="metric-label">CAD → USD Rate</div>
      </div>
    </div>
    
    <div class="section">
      <div class="section-title">All-In Energy Cost Comparison</div>
      <div class="comparison-grid">
        <div class="comparison-card original">
          <div class="comparison-value" style="color: #64748b;">
            ${formatCAD((analysisData.originalAverage || 0) + parseFloat(config.transmissionAdder))}/MWh
          </div>
          <div class="comparison-usd">
            ${formatUSD((analysisData.originalAverage || 0) + parseFloat(config.transmissionAdder))}/MWh
          </div>
          <div class="comparison-label">Original All-In Price (100% Uptime)</div>
        </div>
        <div class="comparison-card optimized">
          <div class="comparison-value" style="color: #16a34a;">
            ${formatCAD((analysisData.newAveragePrice || 0) + parseFloat(config.transmissionAdder))}/MWh
          </div>
          <div class="comparison-usd">
            ${formatUSD((analysisData.newAveragePrice || 0) + parseFloat(config.transmissionAdder))}/MWh
          </div>
          <div class="comparison-label">Optimized All-In Price (${config.uptimePercentage}% Uptime)</div>
        </div>
      </div>
      
      <div class="savings-highlight">
        <div class="savings-item">
          <div class="savings-value">${formatCAD(analysisData.totalSavings || 0)}</div>
          <div class="savings-label">Energy-Only Savings (${formatUSD(analysisData.totalSavings || 0)})</div>
        </div>
        <div class="savings-item">
          <div class="savings-value">${formatCAD(analysisData.totalAllInSavings || 0)}</div>
          <div class="savings-label">Total All-In Savings (${formatUSD(analysisData.totalAllInSavings || 0)})</div>
        </div>
      </div>
    </div>
    
    ${allEvents.length > 0 ? `
    <div class="section" style="page-break-before: auto;">
      <div class="section-title">Complete Shutdown Hours (${allEvents.length} total hours)</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th style="text-align: center;">Hour</th>
            <th style="text-align: right;">Energy (CAD)</th>
            <th style="text-align: right;">Energy (USD)</th>
            <th style="text-align: right;">All-In (CAD)</th>
            <th style="text-align: right;">All-In (USD)</th>
            <th style="text-align: center;">Duration</th>
            <th style="text-align: right;">Savings (CAD)</th>
            <th style="text-align: right;">Savings (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${eventsTableRows}
        </tbody>
      </table>
    </div>
    ` : ''}
    
    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">W</div>
        <span><strong>WattByte</strong> Energy Intelligence Platform</span>
      </div>
      <div class="confidential">
        https://www.wattbyte.com
      </div>
    </footer>
  </div>
</body>
</html>
  `;
}
