/**
 * PDF Export Utility - Secure replacement for html2pdf.js
 * Uses jsPDF (v2.5.2+) and html2canvas directly to avoid CVE vulnerabilities
 */

import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  margin?: number | [number, number] | [number, number, number, number];
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter' | 'legal';
  imageQuality?: number;
  scale?: number;
  useCORS?: boolean;
  backgroundColor?: string;
  windowWidth?: number;
}

/**
 * Export an HTML element to PDF using jsPDF and html2canvas
 * This is a secure replacement for html2pdf.js which has CVE vulnerabilities
 */
export async function exportToPDF(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'document.pdf',
    margin = 10,
    orientation = 'portrait',
    format = 'a4',
    imageQuality = 0.95,
    scale = 2,
    useCORS = true,
    backgroundColor = '#ffffff',
    windowWidth,
  } = options;

  // Dynamic import jsPDF to keep bundle size small
  const { jsPDF } = await import('jspdf');

  // Convert element to canvas
  const canvas = await html2canvas(element, {
    scale,
    useCORS,
    logging: false,
    allowTaint: true,
    backgroundColor,
    windowWidth: windowWidth || element.scrollWidth,
    scrollX: 0,
    scrollY: 0,
  });

  const imgData = canvas.toDataURL('image/jpeg', imageQuality);

  // Page dimensions in mm
  const pageSizes: Record<string, [number, number]> = {
    a4: [210, 297],
    letter: [215.9, 279.4],
    legal: [215.9, 355.6],
  };

  const [pageWidth, pageHeight] = orientation === 'landscape' 
    ? [pageSizes[format][1], pageSizes[format][0]]
    : pageSizes[format];

  // Calculate margins
  const margins = Array.isArray(margin) 
    ? margin.length === 2 
      ? [margin[0], margin[1], margin[0], margin[1]] 
      : margin
    : [margin, margin, margin, margin];

  const [marginTop, marginRight, marginBottom, marginLeft] = margins;

  // Calculate image dimensions to fit within margins
  const contentWidth = pageWidth - marginLeft - marginRight;
  const contentHeight = pageHeight - marginTop - marginBottom;

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(contentWidth / imgWidth, contentHeight / imgHeight);

  const scaledWidth = imgWidth * ratio;
  const scaledHeight = imgHeight * ratio;

  // Create PDF
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
    compress: true,
  });

  // Calculate pages needed
  const pagesNeeded = Math.ceil((imgHeight * ratio) / contentHeight);

  for (let page = 0; page < pagesNeeded; page++) {
    if (page > 0) {
      pdf.addPage();
    }

    // Calculate source crop for this page
    const sourceY = (page * contentHeight / ratio);
    const sourceHeight = Math.min(contentHeight / ratio, imgHeight - sourceY);

    // Create a temporary canvas for this page's content
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = imgWidth;
    pageCanvas.height = sourceHeight;
    const ctx = pageCanvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(
        canvas,
        0, sourceY, imgWidth, sourceHeight,
        0, 0, imgWidth, sourceHeight
      );
      
      const pageImgData = pageCanvas.toDataURL('image/jpeg', imageQuality);
      const pageScaledHeight = sourceHeight * ratio;
      
      pdf.addImage(
        pageImgData,
        'JPEG',
        marginLeft,
        marginTop,
        scaledWidth,
        pageScaledHeight
      );
    }
  }

  pdf.save(filename);
}

/**
 * Export a container element (useful for off-screen rendering)
 */
export async function exportContainerToPDF(
  htmlContent: string,
  options: PDFExportOptions = {}
): Promise<void> {
  // Create temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = options.windowWidth ? `${options.windowWidth}px` : '1100px';
  container.style.backgroundColor = options.backgroundColor || '#ffffff';
  container.style.pointerEvents = 'none';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    // Wait for content to render
    container.getBoundingClientRect();
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => setTimeout(resolve, 300));

    await exportToPDF(container, options);
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
