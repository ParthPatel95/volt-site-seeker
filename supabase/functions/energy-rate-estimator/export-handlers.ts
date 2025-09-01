
import { EnergyRateResults, EnergyRateInput } from './types.ts';

export async function exportCSV(results: EnergyRateResults, input: EnergyRateInput): Promise<Response> {
  console.log('Exporting detailed CSV with real rate breakdown...');
  
  let csvData = 'Month,Energy Price (¢/kWh),Delivery (¢/kWh),Riders (¢/kWh),Tax (¢/kWh),Total (¢/kWh),Total ($/MWh)\n';
  
  for (const month of results.monthlyData) {
    csvData += `${month.month},${month.energyPrice},${month.transmissionDistribution},${month.riders},${month.tax},${month.total},${month.totalMWh}\n`;
  }
  
  csvData += `\nRate Analysis Parameters:\n`;
  csvData += `Territory,"${results.territory.utility} - ${results.territory.region}"\n`;
  csvData += `Coordinates,"${input.latitude}, ${input.longitude}"\n`;
  csvData += `Contracted Load,${input.contractedLoadMW} MW\n`;
  csvData += `Load Factor,98% (Data Center)\n`;
  csvData += `Customer Class,${input.customerClass} - Transmission Connected\n`;
  csvData += `Currency,${input.currency}\n`;
  csvData += `12-Month Average All-In Rate,${results.averageAllInPrice.centsPerKWh} ¢/kWh\n`;
  csvData += `Annual Energy Consumption,${(input.contractedLoadMW * 8760 * 0.98).toFixed(0)} MWh\n`;
  
  csvData += `\nRate Components (based on real utility tariffs):\n`;
  csvData += `Energy Market Price,AESO Pool Price or Hedged Block Rate\n`;
  csvData += `Delivery Charges,Utility Rate Schedule (e.g. FortisAlberta Rate 65)\n`;
  csvData += `Demand Charges,$/kW/month based on contracted capacity\n`;
  csvData += `Riders,Environmental and system access charges\n`;
  csvData += `Tax,GST/HST as applicable\n`;
  
  csvData += `\nData Sources:\n`;
  for (const url of results.dataSourceUrls) {
    csvData += `"${url}"\n`;
  }
  
  return new Response(JSON.stringify({
    success: true,
    csvData
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function exportPDF(results: EnergyRateResults, input: EnergyRateInput): Promise<Response> {
  console.log('Generating comprehensive PDF rate report...');
  
  // Calculate annual consumption with proper precision
  const annualConsumption = (input.contractedLoadMW * 8760 * 0.98).toFixed(0);
  const reportDate = new Date(results.calculationDate).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  // Create monthly breakdown table rows
  const monthlyDataRows = results.monthlyData.map(month => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${month.month}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${month.energyPrice.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${month.transmissionDistribution.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${month.riders.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${month.tax.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f5f5f5;">${month.total.toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold; background-color: #f5f5f5;">$${month.totalMWh.toFixed(0)}</td>
    </tr>
  `).join('');

  // Professional PDF content with enhanced styling
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Energy Rate Analysis Report</title>
      <style>
        @page {
          margin: 0.75in;
          @bottom-center {
            content: "Page " counter(page) " of " counter(pages);
            font-size: 10pt;
            color: #666;
          }
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.4;
          color: #333;
          margin: 0;
          padding: 0;
        }
        
        .header {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          color: white;
          padding: 30px 40px;
          margin: -20px -20px 30px -20px;
          border-radius: 0 0 10px 10px;
        }
        
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28pt;
          font-weight: 300;
        }
        
        .header .subtitle {
          font-size: 14pt;
          opacity: 0.9;
          margin: 0;
        }
        
        .summary-box {
          background-color: #f8fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 25px;
          margin: 25px 0;
        }
        
        .summary-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .metric {
          text-align: center;
          padding: 15px;
          background: white;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .metric-value {
          font-size: 24pt;
          font-weight: bold;
          color: #1e3a8a;
          margin: 0;
        }
        
        .metric-label {
          font-size: 11pt;
          color: #64748b;
          margin: 5px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section {
          margin: 30px 0;
        }
        
        .section h2 {
          color: #1e3a8a;
          font-size: 16pt;
          margin: 0 0 15px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 15px;
          background-color: #f8fafc;
          border-radius: 4px;
        }
        
        .info-label {
          font-weight: 600;
          color: #475569;
        }
        
        .info-value {
          color: #1e293b;
        }
        
        .monthly-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 10pt;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .monthly-table th {
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          color: white;
          padding: 12px 8px;
          text-align: center;
          font-weight: 600;
          font-size: 9pt;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .monthly-table td {
          padding: 10px 8px;
          border: 1px solid #e2e8f0;
          text-align: right;
        }
        
        .monthly-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        
        .monthly-table tr:hover {
          background-color: #f1f5f9;
        }
        
        .methodology {
          background-color: #fefce8;
          border-left: 4px solid #eab308;
          padding: 20px;
          margin: 25px 0;
          border-radius: 0 6px 6px 0;
        }
        
        .data-sources {
          background-color: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 6px;
          padding: 20px;
        }
        
        .data-sources ul {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .data-sources li {
          margin: 5px 0;
          font-size: 10pt;
        }
        
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          font-size: 10pt;
          color: #64748b;
        }
        
        @media print {
          .header { page-break-after: avoid; }
          .section { page-break-inside: avoid; }
          .monthly-table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Energy Rate Analysis Report</h1>
        <p class="subtitle">Comprehensive Industrial Electricity Cost Assessment</p>
      </div>

      <div class="summary-box">
        <div class="summary-grid">
          <div class="metric">
            <p class="metric-value">${results.averageAllInPrice.centsPerKWh.toFixed(2)}¢</p>
            <p class="metric-label">Average All-In Rate (¢/kWh)</p>
          </div>
          <div class="metric">
            <p class="metric-value">$${results.averageAllInPrice.dollarsPerMWh.toFixed(0)}</p>
            <p class="metric-label">Equivalent Rate (${results.currency}/MWh)</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Facility & Location Details</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Location:</span>
            <span class="info-value">${results.territory.region}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Utility Provider:</span>
            <span class="info-value">${results.territory.utility}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Market:</span>
            <span class="info-value">${results.territory.market}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Customer Class:</span>
            <span class="info-value">${input.customerClass}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Contracted Load:</span>
            <span class="info-value">${input.contractedLoadMW} MW</span>
          </div>
          <div class="info-item">
            <span class="info-label">Load Factor:</span>
            <span class="info-value">98% (Data Center)</span>
          </div>
          <div class="info-item">
            <span class="info-label">Annual Consumption:</span>
            <span class="info-value">${annualConsumption} MWh</span>
          </div>
          <div class="info-item">
            <span class="info-label">Currency:</span>
            <span class="info-value">${results.currency}</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Monthly Rate Breakdown (Past 12 Months)</h2>
        <table class="monthly-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Energy<br/>(¢/kWh)</th>
              <th>Delivery<br/>(¢/kWh)</th>
              <th>Riders<br/>(¢/kWh)</th>
              <th>Tax<br/>(¢/kWh)</th>
              <th>Total<br/>(¢/kWh)</th>
              <th>Total<br/>(${results.currency}/MWh)</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyDataRows}
          </tbody>
        </table>
      </div>

      <div class="methodology">
        <h3 style="margin-top: 0; color: #92400e;">Methodology & Data Sources</h3>
        <p>This analysis uses real utility tariff schedules and current market pricing data. For Alberta locations, FortisAlberta Rate 65 (Transmission Connected) methodology is applied with AESO pool prices. ERCOT locations use representative LMP pricing with applicable utility delivery charges.</p>
        <p><strong>Load Profile:</strong> Constant baseload operation (98% capacity factor) typical of data center facilities.</p>
        <p><strong>Rate Components:</strong> Energy charges include wholesale market price plus retail adder (${input.retailAdder || 0}¢/kWh). Delivery charges include transmission, distribution, and demand charges. Riders include environmental and system access charges. Taxes calculated as applicable GST/HST.</p>
      </div>

      <div class="data-sources">
        <h3 style="margin-top: 0; color: #0369a1;">Data Sources & References</h3>
        <ul>
          ${results.dataSourceUrls.map(url => `<li><a href="${url}" style="color: #0369a1; text-decoration: none;">${url}</a></li>`).join('')}
        </ul>
      </div>

      <div class="footer">
        <p>Report generated: ${reportDate}</p>
        <p>This analysis is provided for informational purposes. Actual rates may vary based on specific contract terms, load characteristics, and market conditions.</p>
      </div>
    </body>
    </html>
  `;
  
  // Create a proper blob URL for PDF viewing
  const blob = new Blob([pdfContent], { type: 'text/html' });
  const pdfUrl = `data:text/html;charset=utf-8,${encodeURIComponent(pdfContent)}`;
  
  return new Response(JSON.stringify({
    success: true,
    pdfUrl
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
