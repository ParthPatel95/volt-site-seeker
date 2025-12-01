import Tesseract from 'tesseract.js';

export type OcrLanguage = 'eng' | 'chi_sim' | 'chi_tra' | 'jpn' | 'kor' | 'spa' | 'fra' | 'deu' | 'por' | 'rus' | 'ara';

export interface BrowserOcrOptions {
  language?: OcrLanguage;
  onProgress?: (progress: number) => void;
}

export interface BrowserOcrResult {
  text: string;
  confidence: number;
  method: 'browser_ocr';
}

/**
 * Perform OCR on an image using Tesseract.js (browser-based, no server required)
 * @param imageSource - HTMLImageElement, Canvas, or base64 data URL
 * @param options - OCR options including language and progress callback
 * @returns Extracted text and confidence score
 */
export async function performBrowserOcr(
  imageSource: HTMLImageElement | HTMLCanvasElement | string,
  options: BrowserOcrOptions = {}
): Promise<BrowserOcrResult> {
  const { language = 'eng', onProgress } = options;

  console.log('[BrowserOCR] Starting OCR with Tesseract.js', { language });

  try {
    const worker = await Tesseract.createWorker(language, undefined, {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(m.progress * 100);
        }
        console.log('[BrowserOCR]', m.status, m.progress ? `${Math.round(m.progress * 100)}%` : '');
      },
    });

    const result = await worker.recognize(imageSource);
    
    await worker.terminate();

    const text = result.data.text.trim();
    const confidence = result.data.confidence;

    console.log('[BrowserOCR] OCR complete', {
      textLength: text.length,
      confidence: confidence.toFixed(2),
    });

    return {
      text,
      confidence,
      method: 'browser_ocr',
    };
  } catch (error) {
    console.error('[BrowserOCR] OCR failed:', error);
    throw error;
  }
}

/**
 * Detect the best OCR language based on target translation language
 * @param targetLanguage - Target translation language code
 * @returns Tesseract.js language code
 */
export function detectOcrLanguage(targetLanguage: string): OcrLanguage {
  const languageMap: Record<string, OcrLanguage> = {
    'zh-CN': 'chi_sim',
    'zh-TW': 'chi_tra',
    'ja': 'jpn',
    'ko': 'kor',
    'es': 'spa',
    'fr': 'fra',
    'de': 'deu',
    'pt': 'por',
    'ru': 'rus',
    'ar': 'ara',
  };

  return languageMap[targetLanguage] || 'eng';
}

/**
 * Perform OCR on a PDF page rendered to canvas
 * @param canvas - Canvas element with rendered PDF page
 * @param options - OCR options
 * @returns Extracted text and confidence
 */
export async function performPdfPageOcr(
  canvas: HTMLCanvasElement,
  options: BrowserOcrOptions = {}
): Promise<BrowserOcrResult> {
  console.log('[BrowserOCR] Performing OCR on PDF page canvas');
  return performBrowserOcr(canvas, options);
}

/**
 * Perform OCR on an image element
 * @param image - HTMLImageElement to process
 * @param options - OCR options
 * @returns Extracted text and confidence
 */
export async function performImageOcr(
  image: HTMLImageElement,
  options: BrowserOcrOptions = {}
): Promise<BrowserOcrResult> {
  console.log('[BrowserOCR] Performing OCR on image element');
  return performBrowserOcr(image, options);
}
