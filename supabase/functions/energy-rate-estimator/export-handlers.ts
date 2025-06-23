
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
  
  // Enhanced PDF content with real rate analysis
  const pdfContent = `
    <html>
    <body style="font-family: Arial, sans-serif; margin: 20px;">
      <h1>Industrial Energy Rate Analysis Report</h1>
      <h2>Executive Summary</h2>
      <p><strong>All-In Energy Rate:</strong> ${results.averageAllInPrice.centsPerKWh} ¢/kWh (${results.currency})</p>
      <p><strong>Equivalent Rate:</strong> $${results.averageAllInPrice.dollarsPerMWh}/MWh (${results.currency})</p>
      
      <h2>Facility Details</h2>
      <p><strong>Location:</strong> ${results.territory.region}</p>
      <p><strong>Utility:</strong> ${results.territory.utility}</p>
      <p><strong>Market:</strong> ${results.territory.market}</p>
      <p><strong>Contracted Load:</strong> ${input.contractedLoadMW} MW</p>
      <p><strong>Load Factor:</strong> 98% (Data Center)</p>
      <p><strong>Annual Consumption:</strong> ${(input.contractedLoadMW * 8760 * 0.98).toFixed(0)} MWh</p>
      
      <h2>Rate Breakdown</h2>
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Component</th><th>Rate</th><th>Notes</th></tr>
        <tr><td>Energy</td><td>${results.monthlyData[0]?.energyPrice.toFixed(2)} ¢/kWh</td><td>Market price + retail adder</td></tr>
        <tr><td>Delivery</td><td>${results.monthlyData[0]?.transmissionDistribution.toFixed(2)} ¢/kWh</td><td>T&D charges + demand charges</td></tr>
        <tr><td>Riders</td><td>${results.monthlyData[0]?.riders.toFixed(2)} ¢/kWh</td><td>Environmental & system charges</td></tr>
        <tr><td>Tax</td><td>${results.monthlyData[0]?.tax.toFixed(2)} ¢/kWh</td><td>GST/HST as applicable</td></tr>
      </table>
      
      <h2>Methodology</h2>
      <p>This analysis uses real utility tariff schedules and market pricing data. For Alberta locations, 
      FortisAlberta Rate 65 (Transmission Connected) methodology is applied with AESO pool prices.</p>
      
      <h2>Data Sources</h2>
      <ul>
        ${results.dataSourceUrls.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}
      </ul>
      
      <p><small>Report generated: ${new Date(results.calculationDate).toLocaleString()}</small></p>
    </body>
    </html>
  `;
  
  const pdfUrl = `data:text/html;charset=utf-8,${encodeURIComponent(pdfContent)}`;
  
  return new Response(JSON.stringify({
    success: true,
    pdfUrl
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
