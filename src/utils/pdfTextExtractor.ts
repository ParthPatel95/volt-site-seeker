// Lazy-loaded pdfjs-dist for consistent dynamic imports
let pdfjsLibInstance: typeof import('pdfjs-dist') | null = null;

// Get or initialize the pdfjs-dist library with worker configuration
async function getPdfjsLib(): Promise<typeof import('pdfjs-dist')> {
  if (pdfjsLibInstance) {
    return pdfjsLibInstance;
  }
  
  const pdfjsLib = await import('pdfjs-dist');
  
  // Configure PDF.js worker with multiple fallback CDNs for pdfjs-dist 5.x compatibility
  if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
    const workerUrls = [
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.mjs`,
      // Legacy fallbacks for older environments
      `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
    ];
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
    console.log(`[pdfTextExtractor] Worker initialized with: ${workerUrls[0]}`);
  }
  
  pdfjsLibInstance = pdfjsLib;
  return pdfjsLib;
}

export interface ExtractedPage {
  pageNumber: number;
  text: string;
}

export interface ExtractionResult {
  pages: ExtractedPage[];
  totalPages: number;
}

/**
 * Extract text content from a PDF document
 * @param pdfUrl - URL of the PDF file
 * @param specificPage - Optional: extract only a specific page (1-indexed)
 * @returns Extracted text organized by page
 */
export async function extractPdfText(
  pdfUrl: string,
  specificPage?: number
): Promise<ExtractionResult> {
  console.log('[pdfTextExtractor] Starting extraction', { pdfUrl, specificPage });
  
  try {
    const pdfjsLib = await getPdfjsLib();
    
    console.log('[pdfTextExtractor] Loading PDF document...');
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      withCredentials: false,
      isEvalSupported: false
    });
    
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    
    console.log('[pdfTextExtractor] PDF loaded successfully', { 
      totalPages, 
      specificPage,
      workerSrc: pdfjsLib.GlobalWorkerOptions.workerSrc 
    });

    const pages: ExtractedPage[] = [];

    // Determine which pages to extract
    const pageNumbers = specificPage 
      ? [specificPage]
      : Array.from({ length: totalPages }, (_, i) => i + 1);

    // Extract text from each page
    for (const pageNum of pageNumbers) {
      if (pageNum < 1 || pageNum > totalPages) {
        console.warn(`[pdfTextExtractor] Page ${pageNum} out of range, skipping`);
        continue;
      }

      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Preserve paragraph structure by detecting line breaks based on y-coordinates
        interface TextItem {
          str: string;
          transform: number[];
        }
        
        const items = textContent.items as TextItem[];
        const lines: string[] = [];
        let currentLine: string[] = [];
        let lastY: number | null = null;
        
        items.forEach((item) => {
          if (!('str' in item)) return;
          
          const y = item.transform[5]; // Y-coordinate
          const text = item.str.trim();
          
          if (!text) return;
          
          // Detect line break: significant Y-coordinate change
          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.length > 0) {
              lines.push(currentLine.join(' '));
              currentLine = [];
            }
          }
          
          currentLine.push(text);
          lastY = y;
        });
        
        // Push final line
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }
        
        // Join lines with double newlines for paragraph separation
        const pageText = lines.join('\n\n').trim();

        pages.push({
          pageNumber: pageNum,
          text: pageText
        });

        console.log(`[pdfTextExtractor] Extracted page ${pageNum}: ${pageText.length} characters, ${lines.length} lines`);
      } catch (pageError) {
        console.error(`[pdfTextExtractor] Error extracting page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }
    
    // Clean up PDF document
    await pdf.destroy();

    console.log('[pdfTextExtractor] Extraction complete', { 
      pagesExtracted: pages.length, 
      totalPages 
    });
    
    return {
      pages,
      totalPages
    };
  } catch (error) {
    console.error('[pdfTextExtractor] Error loading or extracting PDF:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to extract text from PDF.';
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        errorMessage = 'CORS error - unable to access PDF from this URL.';
      } else if (error.message.includes('password')) {
        errorMessage = 'This PDF is password-protected.';
      } else if (error.message.includes('worker')) {
        errorMessage = 'PDF worker failed to load. Please refresh and try again.';
      } else {
        errorMessage += ` ${error.message}`;
      }
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Extract text from a single page of a PDF
 * @param pdfUrl - URL of the PDF file
 * @param pageNumber - Page number to extract (1-indexed)
 * @returns Extracted text from the specified page
 */
export async function extractPageText(
  pdfUrl: string,
  pageNumber: number
): Promise<string> {
  const result = await extractPdfText(pdfUrl, pageNumber);
  return result.pages[0]?.text || '';
}
