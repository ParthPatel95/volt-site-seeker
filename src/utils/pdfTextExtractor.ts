import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
  try {
    console.log('[pdfTextExtractor] Loading PDF from:', pdfUrl);
    
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const totalPages = pdf.numPages;
    
    console.log('[pdfTextExtractor] PDF loaded, total pages:', totalPages);

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
        
        // Combine text items with proper spacing and line breaks
        const pageText = textContent.items
          .map((item: any) => {
            if ('str' in item) {
              return item.str;
            }
            return '';
          })
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();

        pages.push({
          pageNumber: pageNum,
          text: pageText
        });

        console.log(`[pdfTextExtractor] Extracted page ${pageNum}: ${pageText.length} characters`);
      } catch (pageError) {
        console.error(`[pdfTextExtractor] Error extracting page ${pageNum}:`, pageError);
        // Continue with other pages
      }
    }

    return {
      pages,
      totalPages
    };
  } catch (error) {
    console.error('[pdfTextExtractor] Error loading or extracting PDF:', error);
    throw new Error('Failed to extract text from PDF');
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
