import { HourlyDataPoint } from '@/services/historicalDataService';
import { AnalyticsFilters } from '@/components/historical/AdvancedAnalyticsControls';

/**
 * Export filtered data to CSV
 */
export function exportToCSV(
  data: HourlyDataPoint[],
  filters: AnalyticsFilters,
  filename: string = 'aeso-historical-data.csv'
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  if (data.length > 200000) {
    const proceed = confirm(
      `This export contains ${data.length.toLocaleString()} rows. Large exports may take time. Continue?`
    );
    if (!proceed) return;
  }

  // Build header with settings
  const unitLabel = filters.unit === 'kwh' ? '¢/kWh' : '$/MWh';
  const header = [
    `# AESO Historical Pricing Export`,
    `# Date Range: ${filters.startDate} to ${filters.endDate}`,
    `# Uptime Filter: ${filters.uptimePercentage}%`,
    `# Unit: ${unitLabel}`,
    `# Peak Hours: ${filters.onPeakStart}:00 - ${filters.onPeakEnd}:00`,
    `# Exported: ${new Date().toISOString()}`,
    ``,
    `Timestamp (MT),Price (${unitLabel}),AIL (MW),Generation (MW)`,
  ].join('\n');

  // Build data rows
  const rows = data.map(point => {
    const price = filters.unit === 'kwh' ? (point.price * 0.1).toFixed(4) : point.price.toFixed(2);
    const timestamp = new Date(point.ts).toLocaleString('en-US', { timeZone: 'America/Edmonton' });
    return `${timestamp},${price},${point.ail.toFixed(2)},${point.generation.toFixed(2)}`;
  });

  const csv = header + '\n' + rows.join('\n');

  // Download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Export chart as PNG
 */
export function exportChartAsPNG(chartId: string, filename: string = 'chart.png'): void {
  const chartElement = document.getElementById(chartId);
  if (!chartElement) {
    alert('Chart not found');
    return;
  }

  // Find the SVG element
  const svgElement = chartElement.querySelector('svg');
  if (!svgElement) {
    alert('Chart SVG not found');
    return;
  }

  try {
    // Get SVG data
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      alert('Canvas context not available');
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = filename;
          link.click();
          URL.revokeObjectURL(link.href);
        }
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  } catch (error) {
    console.error('Error exporting chart:', error);
    alert('Failed to export chart. Please try again.');
  }
}

/**
 * Trigger print dialog for report
 */
export function printReport(): void {
  window.print();
}
