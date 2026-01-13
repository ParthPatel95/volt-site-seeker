import type { PDFDocumentProxy } from 'pdfjs-dist';

// Lazy-loaded pdfjs-dist for consistent dynamic imports
let pdfjsLibInstance: typeof import('pdfjs-dist') | null = null;

// Get or initialize the pdfjs-dist library with worker configuration
async function getPdfjsLib(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsLibInstance) {
    return pdfjsLibInstance;
  }
  
  const pdfjsLib = await import('pdfjs-dist');
  
  // Configure PDF.js worker with fallback CDNs
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const workerUrls = [
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
    ];
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
    console.log('[pdfToImage] PDF.js worker initialized:', workerUrls[0]);
  }
  
  pdfjsLibInstance = pdfjsLib;
  return pdfjsLib;
}

// Export the getPdfjsLib function for use by other modules
export { getPdfjsLib };

export interface PdfToImageOptions {
  scale?: number; // Higher scale = better OCR quality but larger file
  format?: 'png' | 'jpeg';
  quality?: number; // JPEG quality (0-1)
}

/**
 * Render a PDF page to a base64-encoded image for OCR processing
 * @param pdfDocument - PDFDocumentProxy from pdfjs-dist
 * @param pageNumber - Page number (1-indexed)
 * @param options - Rendering options
 * @returns Base64-encoded image data (without data: prefix)
 */
export async function renderPdfPageToImage(
  pdfDocument: PDFDocumentProxy,
  pageNumber: number,
  options: PdfToImageOptions = {}
): Promise<string> {
  const { scale = 2.0, format = 'png', quality = 0.95 } = options;

  console.log('[pdfToImage] Rendering page to image', { pageNumber, scale, format });

  try {
    // Get the page
    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale });

    // Create canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas 2D context');
    }

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    // Convert canvas to base64
    const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = format === 'jpeg' 
      ? canvas.toDataURL(mimeType, quality)
      : canvas.toDataURL(mimeType);

    // Extract base64 part (remove "data:image/png;base64," prefix)
    const base64Data = dataUrl.split(',')[1];

    console.log('[pdfToImage] Page rendered successfully', {
      pageNumber,
      imageSize: base64Data.length,
      dimensions: { width: canvas.width, height: canvas.height }
    });

    return base64Data;
  } catch (error) {
    console.error('[pdfToImage] Failed to render page:', error);
    throw error;
  }
}

/**
 * Convert image element to base64 for OCR processing
 * @param imageElement - HTMLImageElement
 * @returns Base64-encoded image data (without data: prefix)
 */
export function imageElementToBase64(imageElement: HTMLImageElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Failed to get canvas 2D context');
  }
  
  context.drawImage(imageElement, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  
  return dataUrl.split(',')[1];
}

/**
 * Convert image URL to base64 for OCR processing
 * @param imageUrl - URL of the image
 * @returns Base64-encoded image data (without data: prefix)
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const base64 = imageElementToBase64(img);
        resolve(base64);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = imageUrl;
  });
}
