import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisData {
  totalShutdowns: number;
  totalHours: number;
  totalSavings: number;
  totalAllInSavings: number;
  originalAverage: number;
  newAveragePrice: number;
  events: Array<{
    date: string;
    hour: number;
    price: number;
    allInPrice: number;
    duration: number;
    savings: number;
  }>;
}

interface ExportConfig {
  uptimePercentage: string;
  timePeriod: string;
  transmissionAdder: string;
  exchangeRate: number;
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
    console.log('Analysis events count:', analysisData?.events?.length || 0);

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
    const downtimePercentage = (100 - parseFloat(config.uptimePercentage)).toFixed(1);
    const totalHoursInPeriod = parseInt(config.timePeriod) * 24;
    const actualDowntimePercent = ((analysisData.totalHours / totalHoursInPeriod) * 100).toFixed(1);

    // Format currency helper
    const formatCAD = (value: number) => `$${value.toFixed(2)} CAD`;
    const formatUSD = (value: number) => `$${(value * config.exchangeRate).toFixed(2)} USD`;

    // Generate events table rows (limit to top 50 for PDF size)
    const topEvents = (analysisData.events || [])
      .sort((a, b) => b.price - a.price)
      .slice(0, 50);

    const eventsTableRows = topEvents.map((event, index) => `
      <tr style="${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${event.date}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${event.hour}:00</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #dc2626; font-weight: 600;">${formatCAD(event.price)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">${formatCAD(event.allInPrice)}/MWh</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${event.duration}h</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #16a34a; font-weight: 600;">${formatCAD(event.savings)}</td>
      </tr>
    `).join('');

    const htmlContent = `
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
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      display: grid;
      grid-template-columns: repeat(5, 1fr);
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
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      display: grid;
      grid-template-columns: repeat(2, 1fr);
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
      font-size: 12px;
    }
    
    th {
      background: #0A1628;
      color: white;
      padding: 12px 8px;
      text-align: left;
      font-weight: 600;
      font-size: 11px;
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
        <div class="metric-value">${config.exchangeRate?.toFixed(4) || 'N/A'}</div>
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
          <div class="savings-label">Energy-Only Savings</div>
        </div>
        <div class="savings-item">
          <div class="savings-value">${formatCAD(analysisData.totalAllInSavings || 0)}</div>
          <div class="savings-label">Total All-In Savings</div>
        </div>
      </div>
    </div>
    
    ${topEvents.length > 0 ? `
    <div class="section" style="page-break-before: auto;">
      <div class="section-title">Highest-Priced Hours Removed (Top ${topEvents.length})</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th style="text-align: center;">Hour</th>
            <th style="text-align: right;">Energy Price</th>
            <th style="text-align: right;">All-In Price</th>
            <th style="text-align: center;">Duration</th>
            <th style="text-align: right;">Savings</th>
          </tr>
        </thead>
        <tbody>
          ${eventsTableRows}
        </tbody>
      </table>
      ${analysisData.events.length > 50 ? `
      <p class="table-note">Showing top 50 of ${analysisData.events.length} total shutdown events. Full data available in platform.</p>
      ` : ''}
    </div>
    ` : ''}
    
    <footer class="footer">
      <div class="footer-brand">
        <div class="footer-logo">W</div>
        <span><strong>WattByte</strong> Energy Intelligence Platform</span>
      </div>
      <div class="confidential">
        CONFIDENTIAL - For authorized use only
      </div>
    </footer>
  </div>
</body>
</html>
    `;

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
