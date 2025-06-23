
import { EnergyRateResults, EnergyRateInput } from './types.ts';

export async function exportCSV(results: EnergyRateResults, input: EnergyRateInput): Promise<Response> {
  console.log('Exporting CSV data...');
  
  let csvData = 'Month,Energy Price (¢/kWh),T&D (¢/kWh),Riders (¢/kWh),Tax (¢/kWh),Total (¢/kWh),Total ($/MWh)\n';
  
  for (const month of results.monthlyData) {
    csvData += `${month.month},${month.energyPrice},${month.transmissionDistribution},${month.riders},${month.tax},${month.total},${month.totalMWh}\n`;
  }
  
  csvData += `\nAnalysis Parameters:\n`;
  csvData += `Coordinates,"${input.latitude}, ${input.longitude}"\n`;
  csvData += `Contracted Load,${input.contractedLoadMW} MW\n`;
  csvData += `Customer Class,${input.customerClass}\n`;
  csvData += `Currency,${input.currency}\n`;
  csvData += `12-Month Average,${results.averageAllInPrice.centsPerKWh.toFixed(2)} ¢/kWh\n`;
  
  return new Response(JSON.stringify({
    success: true,
    csvData
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function exportPDF(results: EnergyRateResults, input: EnergyRateInput): Promise<Response> {
  console.log('Generating PDF report...');
  
  // In production, this would use a PDF generation service
  // For now, return a mock URL
  const pdfUrl = `data:text/html,<html><body><h1>Energy Rate Analysis Report</h1><p>Average All-In Price: ${results.averageAllInPrice.centsPerKWh.toFixed(2)} ¢/kWh (${results.currency})</p><p>Territory: ${results.territory.utility}</p><p>Load: ${input.contractedLoadMW} MW</p></body></html>`;
  
  return new Response(JSON.stringify({
    success: true,
    pdfUrl
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
