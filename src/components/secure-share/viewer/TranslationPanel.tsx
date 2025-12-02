import { useState, useEffect, useRef, useCallback } from 'react';
import { Globe, X, Loader2, Copy, Check, ChevronDown, Download, Columns2, FileText, CheckCircle2, RefreshCw, Scan, Edit, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { OcrStatusBadge } from './OcrStatusBadge';
import { EditTextDialog } from './EditTextDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  currentPage: number;
  totalPages?: number;
  extractedText: string;
  isExtracting: boolean;
  onPageChange?: (page: number) => void;
  pdfDocument?: any; // PDFDocumentProxy for multi-page text extraction
  documentUrl?: string; // URL to fetch PDF if pdfDocument is not available
  documentType?: string; // MIME type to detect images
}

const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳' },
];

export function TranslationPanel({
  isOpen,
  onClose,
  documentId,
  currentPage,
  totalPages = 1,
  extractedText,
  isExtracting,
  onPageChange,
  pdfDocument,
  documentUrl,
  documentType
}: TranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>('zh-CN');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'translation' | 'sideBySide'>('translation');
  const [isTranslatingAll, setIsTranslatingAll] = useState(false);
  const [translateAllProgress, setTranslateAllProgress] = useState(0);
  const [isScannedPdf, setIsScannedPdf] = useState(false);
  const [allTranslations, setAllTranslations] = useState<Map<number, string>>(new Map());
  const [extractionStatus, setExtractionStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [ocrExtractedText, setOcrExtractedText] = useState<string>(''); // OCR-extracted text overrides prop
  const [ocrMethod, setOcrMethod] = useState<'ai' | 'browser'>('ai'); // OCR method preference
  const [browserOcrProgress, setBrowserOcrProgress] = useState(0);
  const [ocrConfidence, setOcrConfidence] = useState<number | undefined>();
  const [ocrStatus, setOcrStatus] = useState<'text-layer' | 'ai-ocr' | 'browser-ocr' | 'scanned-warning'>('text-layer');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editableText, setEditableText] = useState<string>('');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // In-memory translation cache: Map<"pageNumber-languageCode", translatedText>
  const translationCache = useRef<Map<string, string>>(new Map());
  
  // Track last translated page/language to avoid duplicate translations
  const lastTranslatedRef = useRef<{ page: number; language: string } | null>(null);
  
  // Refs for synced scrolling
  const originalScrollRef = useRef<HTMLDivElement>(null);
  const translatedScrollRef = useRef<HTMLDivElement>(null);
  
  // Check if current page is translated
  const isPageTranslated = (page: number) => {
    const cacheKey = `${page}-${targetLanguage}`;
    return translationCache.current.has(cacheKey);
  };
  
  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
  
  // Use OCR text if available, otherwise use prop text
  const currentText = ocrExtractedText || extractedText;

  // Detect if PDF is scanned (image-based with little to no text)
  useEffect(() => {
    // Check if this is an Office document first
    const isOffice = documentType?.includes('word') || documentType?.includes('document') || 
                    documentType?.includes('sheet') || documentType?.includes('presentation') ||
                    /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl || '');
    
    // Don't run scanned PDF detection for Office documents
    if (isOffice) {
      setIsScannedPdf(false);
      setOcrStatus('text-layer');
      setError(null); // Clear any existing errors
      return;
    }
    
    if (currentText && !isExtracting) {
      const textLength = currentText.trim().length;
      const avgCharsPerPage = textLength / totalPages;
      
      // If less than 50 chars per page on average, likely scanned
      if (avgCharsPerPage < 50) {
        setIsScannedPdf(true);
        setOcrStatus('scanned-warning');
      } else {
        setIsScannedPdf(false);
        setOcrStatus(ocrEnabled ? (ocrMethod === 'ai' ? 'ai-ocr' : 'browser-ocr') : 'text-layer');
      }
    }
  }, [currentText, isExtracting, totalPages, ocrEnabled, ocrMethod, documentType, documentUrl]);

  // Extract text from a specific page
  const extractTextFromPage = useCallback(async (pageNumber: number): Promise<string> => {
    // If we have a PDF document proxy, use it
    if (pdfDocument) {
      try {
        const page = await pdfDocument.getPage(pageNumber);
        const textContent = await page.getTextContent();
        
        let lastY = 0;
        let text = '';
        
        for (const item of textContent.items) {
          if ('str' in item) {
            const currentY = item.transform[5];
            
            if (lastY !== 0 && Math.abs(currentY - lastY) > 5) {
              text += '\n';
            }
            
            text += item.str;
            lastY = currentY;
          }
        }
        
        return text;
      } catch (error) {
        console.error(`[TranslationPanel] Failed to extract text from page ${pageNumber}:`, error);
        toast({
          title: 'Extraction Warning',
          description: `Could not extract text from page ${pageNumber}`,
          variant: 'default'
        });
        return '';
      }
    }
    
    // If no PDF document proxy but we have a URL, load and extract
    if (documentUrl) {
      console.log(`[TranslationPanel] Loading PDF from URL to extract page ${pageNumber}`);
      try {
        // Dynamically import PDF.js to extract text
        const pdfjsLib = await import('pdfjs-dist');
        
        // Configure worker with fallback CDNs (use .mjs for pdfjs-dist 5.x)
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          const workerUrls = [
            `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
            `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`,
            `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`,
            `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js` // Legacy fallback
          ];
          pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrls[0];
          console.log(`[TranslationPanel] Configured PDF.js worker: ${workerUrls[0]}`);
        }
        
        const loadingTask = pdfjsLib.getDocument({
          url: documentUrl,
          withCredentials: false,
          isEvalSupported: false
        });
        
          const pdf = await loadingTask.promise;
        
        try {
          const page = await pdf.getPage(pageNumber);
          const textContent = await page.getTextContent();
          
          let lastY = 0;
          let text = '';
          
          for (const item of textContent.items) {
            if ('str' in item) {
              const currentY = item.transform[5];
              
              if (lastY !== 0 && Math.abs(currentY - lastY) > 5) {
                text += '\n';
              }
              
              text += item.str;
              lastY = currentY;
            }
          }
          
          return text;
        } finally {
          // Always clean up to prevent memory leaks
          await pdf.destroy();
          console.log('[TranslationPanel] PDF document destroyed after extraction');
        }
      } catch (error) {
        console.error(`[TranslationPanel] Failed to load and extract text from page ${pageNumber}:`, error);
        toast({
          title: 'Extraction Error',
          description: `Failed to extract text from page ${pageNumber}. The PDF may be scanned or image-based.`,
          variant: 'destructive'
        });
        return '';
      }
    }
    
    // Fallback to current page's extracted text
    console.warn('[TranslationPanel] No PDF document or URL available, using current extracted text');
    return pageNumber === currentPage ? extractedText : '';
  }, [pdfDocument, documentUrl, extractedText, currentPage, toast]);

  const handleTranslate = useCallback(async (useCache = true, pageText?: string, pageNum?: number) => {
    const page = pageNum || currentPage;
    const cacheKey = `${page}-${targetLanguage}`;
    
    // Check in-memory cache first
    if (useCache && translationCache.current.has(cacheKey)) {
      const cachedTranslation = translationCache.current.get(cacheKey)!;
      if (!pageText) {
        setTranslatedText(cachedTranslation);
        setIsCached(true);
        setViewMode('sideBySide');
        lastTranslatedRef.current = { page, language: targetLanguage };
        console.log(`[TranslationPanel] Loaded from in-memory cache: ${cacheKey}`);
      }
      return cachedTranslation;
    }

    if (!pageText) {
      setIsTranslating(true);
      setTranslatedText('');
      setIsCached(false);
      setError(null);
      setExtractionStatus('Loading PDF...');
    }

    try {
      // Extract text if not provided
      let textToTranslate = pageText;
      if (!textToTranslate) {
        console.log('[TranslationPanel] Starting text extraction', { page, documentUrl });
        
        // Try multiple extraction strategies
        let extractionMethod = '';
        
        // Strategy 1: Use provided pdfDocument proxy if available
        if (pdfDocument) {
          console.log('[TranslationPanel] Attempting extraction with provided pdfDocument proxy');
          setExtractionStatus('Extracting text from PDF...');
          try {
            textToTranslate = await extractTextFromPage(page);
            extractionMethod = 'pdfDocument proxy';
            console.log('[TranslationPanel] Extraction successful via pdfDocument proxy', { textLength: textToTranslate.length });
          } catch (proxyError) {
            console.warn('[TranslationPanel] pdfDocument proxy extraction failed', proxyError);
          }
        }
        
        // Strategy 2: Use current page extracted text if available
        if (!textToTranslate && page === currentPage && currentText) {
          textToTranslate = currentText;
          extractionMethod = 'current page extractedText';
          console.log('[TranslationPanel] Using current page extracted text', { textLength: textToTranslate.length });
        }
        
        if (!textToTranslate || textToTranslate.trim().length === 0) {
          console.warn('[TranslationPanel] No text extracted from page', { page });
          throw new Error('No text found on this page. This might be a scanned PDF or image-based document.');
        }

        console.log('[TranslationPanel] Text extraction complete', { 
          method: extractionMethod, 
          textLength: textToTranslate.length,
          preview: textToTranslate.substring(0, 100) 
        });
        setExtractionStatus('');
      }
      
      if (!textToTranslate || !targetLanguage) {
        throw new Error('No text available to translate');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          text: textToTranslate,
          targetLanguage,
          documentId,
          pageNumber: page,
          stream: !pageText
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Translation credits exhausted. Please add credits to continue.');
        }
        throw new Error('Translation failed');
      }

      const contentType = response.headers.get('Content-Type') || '';
      const isJsonResponse = contentType.includes('application/json');

      // Handle streaming response when using SSE
      if (!pageText && response.body && !isJsonResponse) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullTranslation = '';
        let buffer = '';
        let hasReceivedContent = false;
        
        // Add 60-second timeout for streaming translations
        const streamTimeout = setTimeout(() => {
          reader.cancel();
          console.error('[TranslationPanel] Streaming timeout after 60 seconds');
          if (!hasReceivedContent) {
            throw new Error('Translation timeout - stream took too long to complete');
          }
        }, 60000);

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            let newlineIndex: number;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
              const line = buffer.slice(0, newlineIndex).trim();
              buffer = buffer.slice(newlineIndex + 1);
              
              if (!line || line.startsWith(':')) continue; // Skip empty and comment lines
              
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.delta) {
                    fullTranslation += parsed.delta;
                    setTranslatedText(fullTranslation);
                    hasReceivedContent = true;
                  } else if (parsed.translatedText) {
                    fullTranslation = parsed.translatedText;
                    setTranslatedText(fullTranslation);
                    setIsCached(parsed.cached || false);
                    hasReceivedContent = true;
                  }
                } catch (e) {
                  // Silently skip parsing errors for incomplete JSON
                  console.debug('[TranslationPanel] Skipping malformed chunk');
                }
              }
            }
          }
        } catch (streamError) {
          console.error('[TranslationPanel] Streaming error:', streamError);
          // If we got some content before error, that's OK
          if (!hasReceivedContent) {
            throw streamError;
          }
        } finally {
          clearTimeout(streamTimeout);
        }

        // Store in cache only if we got content
        if (fullTranslation) {
          translationCache.current.set(cacheKey, fullTranslation);
          lastTranslatedRef.current = { page, language: targetLanguage };
          console.log(`[TranslationPanel] Stored in cache: ${cacheKey}`);
          setViewMode('sideBySide');
        }
        return fullTranslation;
      } else {
        // Non-streaming JSON response (for bulk translation or cache hits)
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const translated = data.translatedText;
        translationCache.current.set(cacheKey, translated);
        lastTranslatedRef.current = { page, language: targetLanguage };
        
        if (!pageText) {
          setTranslatedText(translated);
          setIsCached(data.cached || false);
          setViewMode('sideBySide');
        }
        return translated;
      }
    } catch (error: any) {
      console.error('[TranslationPanel] Translation error:', error);
      
      // Check if this is an Office document
      const isOffice = documentType?.includes('word') || documentType?.includes('document') || 
                      documentType?.includes('sheet') || documentType?.includes('presentation') ||
                      /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl || '');
      
      // Provide specific error messages based on error type
      let errorMessage = 'Translation failed';
      if (error.message) {
        // Don't show scanned PDF errors for Office documents
        if (error.message.includes('scanned PDF') && !isOffice) {
          errorMessage = 'This appears to be a scanned PDF. Text extraction is limited for image-based documents.';
        } else if (error.message.includes('CORS')) {
          errorMessage = 'Unable to access PDF. Please try downloading and re-uploading the document.';
        } else if (error.message.includes('worker')) {
          errorMessage = 'PDF processing failed. Please refresh the page and try again.';
        } else if (error.message.includes('Rate limit')) {
          errorMessage = 'Translation rate limit exceeded. Please try again later.';
        } else if (error.message.includes('credits')) {
          errorMessage = 'Translation credits exhausted. Please add credits to continue.';
        } else if (!isOffice) {
          // Only set generic error messages for non-Office documents
          errorMessage = error.message;
        }
      }

      if (!pageText && !isOffice) {
        // Only show error toasts for non-Office documents
        setError(errorMessage);
        setTranslatedText('');
        toast({
          title: 'Translation Error',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      return null;
    } finally {
      if (!pageText) {
        setIsTranslating(false);
        setExtractionStatus('');
      }
    }
  }, [targetLanguage, documentId, currentPage, extractedText, pdfDocument, extractTextFromPage, toast]);

  const handleEditText = useCallback(() => {
    setEditableText(currentText);
    setIsEditDialogOpen(true);
  }, [currentText]);

  const handleSaveEditedText = useCallback((editedText: string) => {
    setOcrExtractedText(editedText);
    setOcrEnabled(true);
    setOcrStatus('text-layer'); // User-edited text
    toast({
      title: 'Text Updated',
      description: 'Manual corrections applied',
    });
  }, [toast]);

  const handleEnableOcr = useCallback(async (method: 'ai' | 'browser' = ocrMethod) => {
    setIsOcrProcessing(true);
    setExtractionStatus('Preparing for OCR...');
    setError(null);
    setBrowserOcrProgress(0);

    try {
      const isImage = documentType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(documentUrl || '');
      const isPdf = documentType === 'application/pdf' || documentUrl?.endsWith('.pdf');
      const isText = documentType?.startsWith('text/') || /\.(txt|md|csv|log)$/i.test(documentUrl || '');
      const isOffice = documentType?.includes('word') || documentType?.includes('document') || 
                      documentType?.includes('sheet') || documentType?.includes('presentation') ||
                      /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl || '');

      // Text files: fetch content directly
      if (isText && documentUrl) {
        console.log('[Text] Fetching text file content');
        setExtractionStatus('Loading text file...');
        
        const textResponse = await fetch(documentUrl);
        if (!textResponse.ok) {
          throw new Error('Failed to fetch text file');
        }
        
        const textContent = await textResponse.text();
        setOcrExtractedText(textContent);
        setOcrEnabled(true);
        setOcrStatus('text-layer');
        setOcrConfidence(100);
        
        toast({
          title: 'Text Loaded',
          description: 'Text file content loaded successfully',
        });
        return;
      }

      // Office documents use their own parser (not OCR)
      if (isOffice) {
        console.log('[Office] Parsing Office document');
        setExtractionStatus('Parsing document...');

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parse-office-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            documentUrl,
            documentType,
            documentId
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to parse Office document');
        }

        const data = await response.json();
        const officeText = data.text;

        if (!officeText || officeText.trim().length === 0) {
          throw new Error('No text could be extracted from this document');
        }

        console.log('[Office] Parsing complete', { textLength: officeText.length, cached: data.cached });
        
        setOcrExtractedText(officeText);
        setOcrEnabled(true);
        setOcrStatus('text-layer');
        setExtractionStatus('');
        
        toast({
          title: data.cached ? 'Document Text Retrieved (Cached)' : 'Document Parsed',
          description: `Extracted ${officeText.length} characters from document`,
        });

        await handleTranslate(false, officeText);
        setIsOcrProcessing(false);
        return;
      }

      if (method === 'browser') {
        // Browser-based OCR using Tesseract.js
        console.log('[OCR] Using browser-based OCR');
        setExtractionStatus('Loading OCR engine...');

        const { performBrowserOcr } = await import('@/utils/tesseractOcr');

        let imageSource: HTMLImageElement | HTMLCanvasElement;

        if (isImage && documentUrl) {
          // For images, load as HTMLImageElement
          console.log('[OCR] Loading image for browser OCR');
          setExtractionStatus('Loading image...');
          
          imageSource = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = documentUrl;
          });
        } else if (isPdf) {
          // For PDFs, render page to canvas
          console.log('[OCR] Rendering PDF page to canvas for browser OCR');
          setExtractionStatus('Preparing page...');

          const { renderPdfPageToImage } = await import('@/utils/pdfToImage');
          
          let pdfDoc = pdfDocument;
          if (!pdfDoc && documentUrl) {
            const pdfjsLib = await import('pdfjs-dist');
            const loadingTask = pdfjsLib.getDocument({
              url: documentUrl,
              withCredentials: false,
              isEvalSupported: false
            });
            pdfDoc = await loadingTask.promise;
          }

          if (!pdfDoc) {
            throw new Error('Unable to load PDF for OCR');
          }

          // Render to canvas for Tesseract
          const page = await pdfDoc.getPage(currentPage);
          const viewport = page.getViewport({ scale: 2.0 });
          
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Failed to get canvas context');
          
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          imageSource = canvas;
        } else {
          throw new Error('Document type not supported for browser OCR');
        }

        setExtractionStatus('Extracting text with browser OCR...');
        
        const result = await performBrowserOcr(imageSource, {
          language: 'eng', // TODO: Auto-detect based on target language
          onProgress: (progress) => {
            setBrowserOcrProgress(progress);
            setExtractionStatus(`Processing: ${Math.round(progress)}%`);
          },
        });

        if (!result.text || result.text.trim().length === 0) {
          throw new Error('No text could be extracted from this page');
        }

        console.log('[OCR] Browser OCR complete', { 
          textLength: result.text.length, 
          confidence: result.confidence 
        });

        setOcrExtractedText(result.text);
        setOcrEnabled(true);
        setOcrConfidence(result.confidence);
        setOcrStatus('browser-ocr');
        setExtractionStatus('');
        setBrowserOcrProgress(0);
        
        toast({
          title: 'Browser OCR Complete',
          description: `Extracted ${result.text.length} characters (${result.confidence.toFixed(0)}% confidence)`,
        });

        await handleTranslate(false, result.text);
      } else {
        // AI-based OCR using Lovable AI
        console.log('[OCR] Using AI-based OCR');
        
        let imageBase64: string;

        if (isImage && documentUrl) {
          console.log('[OCR] Processing image document');
          setExtractionStatus('Loading image...');
          
          const { imageUrlToBase64 } = await import('@/utils/pdfToImage');
          imageBase64 = await imageUrlToBase64(documentUrl);
        } else if (isPdf) {
          console.log('[OCR] Processing PDF document');
          setExtractionStatus('Preparing page for OCR...');
          
          const { renderPdfPageToImage } = await import('@/utils/pdfToImage');
          
          let pdfDoc = pdfDocument;
          if (!pdfDoc && documentUrl) {
            const pdfjsLib = await import('pdfjs-dist');
            const loadingTask = pdfjsLib.getDocument({
              url: documentUrl,
              withCredentials: false,
              isEvalSupported: false
            });
            pdfDoc = await loadingTask.promise;
          }

          if (!pdfDoc) {
            throw new Error('Unable to load PDF for OCR');
          }

          setExtractionStatus(`Rendering page ${currentPage} as image...`);
          imageBase64 = await renderPdfPageToImage(pdfDoc, currentPage, { scale: 2.5 });
        } else {
          throw new Error('Document type not supported for OCR');
        }

        setExtractionStatus('Extracting text with AI OCR...');

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ocr-extract-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            imageBase64,
            documentId,
            pageNumber: currentPage,
            ocrMethod: 'ai_vision'
          })
        });

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('OCR rate limit exceeded. Please try again later.');
          }
          if (response.status === 402) {
            throw new Error('OCR credits exhausted. Please add credits to continue.');
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'OCR failed');
        }

        const data = await response.json();
        const ocrText = data.text;

        if (!ocrText || ocrText.trim().length === 0) {
          throw new Error('No text could be extracted from this page');
        }

        console.log('[OCR] AI OCR complete', { textLength: ocrText.length, confidence: data.confidence, cached: data.cached });
        
        setOcrExtractedText(ocrText);
        setOcrEnabled(true);
        setOcrConfidence(data.confidence);
        setOcrStatus('ai-ocr');
        setExtractionStatus('');
        
        toast({
          title: data.cached ? 'OCR Retrieved (Cached)' : 'AI OCR Complete',
          description: `Extracted ${ocrText.length} characters${data.confidence ? ` (${(data.confidence * 100).toFixed(0)}% confidence)` : ''}`,
        });

        await handleTranslate(false, ocrText);
      }
    } catch (error: any) {
      console.error('[OCR] Error:', error);
      setError(error.message || 'OCR processing failed');
      setExtractionStatus('');
      setBrowserOcrProgress(0);
      toast({
        title: 'OCR Failed',
        description: error.message || 'Failed to extract text using OCR',
        variant: 'destructive'
      });
    } finally {
      setIsOcrProcessing(false);
    }
  }, [pdfDocument, documentUrl, documentType, currentPage, documentId, ocrMethod, handleTranslate, toast]);

  const handleTranslateAll = useCallback(async () => {
    if (!onPageChange || totalPages <= 1) return;

    setIsTranslatingAll(true);
    setTranslateAllProgress(0);
    const translations = new Map<number, string>();
    
    for (let page = 1; page <= totalPages; page++) {
      try {
        const cacheKey = `${page}-${targetLanguage}`;
        let translation: string | null;
        
        if (translationCache.current.has(cacheKey)) {
          translation = translationCache.current.get(cacheKey)!;
        } else {
          // Extract text from specific page
          const pageText = await extractTextFromPage(page);
          if (!pageText.trim()) {
            console.warn(`[TranslationPanel] Page ${page} has no text to translate`);
            continue;
          }
          translation = await handleTranslate(false, pageText, page);
        }
        
        if (translation) {
          translations.set(page, translation);
        }
        
        setTranslateAllProgress((page / totalPages) * 100);
      } catch (error) {
        console.error(`[TranslationPanel] Failed to translate page ${page}:`, error);
      }
    }

    setAllTranslations(translations);
    setIsTranslatingAll(false);
    toast({
      title: 'Translation Complete',
      description: `Translated ${translations.size} of ${totalPages} pages`,
    });
  }, [onPageChange, totalPages, targetLanguage, extractTextFromPage, handleTranslate, toast]);

  const handleDownloadAll = () => {
    if (allTranslations.size === 0) {
      toast({
        title: 'No Translations',
        description: 'Please translate all pages first',
        variant: 'destructive'
      });
      return;
    }

    let fullText = '';
    for (let page = 1; page <= totalPages; page++) {
      const translation = allTranslations.get(page) || translationCache.current.get(`${page}-${targetLanguage}`);
      if (translation) {
        fullText += `--- Page ${page} ---\n\n${translation}\n\n`;
      }
    }

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-document-all-pages.txt`;
    
    // iOS Safari compatibility
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    
    // Small delay helps iOS Safari handle download
    setTimeout(() => {
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);

    toast({
      title: 'Downloaded',
      description: 'All translations saved to file',
    });
  };

  const handleDownload = () => {
    if (!translatedText) return;

    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-page-${currentPage}.txt`;
    
    // iOS Safari compatibility
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    
    setTimeout(() => {
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);

    toast({
      title: 'Downloaded',
      description: 'Translation saved to file',
    });
  };

  const handleCopy = async () => {
    if (!translatedText) return;

    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      toast({
        title: 'Copied!',
        description: 'Translation copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy translation',
        variant: 'destructive'
      });
    }
  };

  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
  };

  const handleSyncScroll = useCallback((source: 'original' | 'translated') => {
    const sourceRef = source === 'original' ? originalScrollRef : translatedScrollRef;
    const targetRef = source === 'original' ? translatedScrollRef : originalScrollRef;

    if (sourceRef.current && targetRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight);
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
  }, []);
  
  // Sync scrolling in side-by-side mode with iOS compatibility
  useEffect(() => {
    if (viewMode !== 'sideBySide') return;

    let isScrollingOriginal = false;
    let isScrollingTranslated = false;

    const handleOriginalScroll = () => {
      if (isScrollingTranslated) return;
      isScrollingOriginal = true;
      handleSyncScroll('original');
      setTimeout(() => { isScrollingOriginal = false; }, 100);
    };

    const handleTranslatedScroll = () => {
      if (isScrollingOriginal) return;
      isScrollingTranslated = true;
      handleSyncScroll('translated');
      setTimeout(() => { isScrollingTranslated = false; }, 100);
    };

    const originalEl = originalScrollRef.current;
    const translatedEl = translatedScrollRef.current;

    // Passive listeners for better iOS performance
    originalEl?.addEventListener('scroll', handleOriginalScroll, { passive: true });
    translatedEl?.addEventListener('scroll', handleTranslatedScroll, { passive: true });

    return () => {
      originalEl?.removeEventListener('scroll', handleOriginalScroll);
      translatedEl?.removeEventListener('scroll', handleTranslatedScroll);
    };
  }, [viewMode, handleSyncScroll]);
  
  // Auto-translate when panel opens, page changes, or language changes
  useEffect(() => {
    if (!isOpen || isExtracting || !currentText) return;
    
    // Check if we need to translate
    const cacheKey = `${currentPage}-${targetLanguage}`;
    
    // Skip if we already translated this exact page/language combo
    if (lastTranslatedRef.current?.page === currentPage && 
        lastTranslatedRef.current?.language === targetLanguage &&
        translationCache.current.has(cacheKey)) {
      const cachedTranslation = translationCache.current.get(cacheKey)!;
      setTranslatedText(cachedTranslation);
      setIsCached(true);
      console.log('[TranslationPanel] Auto-translate skipped - already translated', { currentPage, targetLanguage });
      return;
    }
    
    // Auto-translate
    console.log('[TranslationPanel] Auto-translating', { currentPage, targetLanguage });
    handleTranslate(true);
  }, [isOpen, currentPage, targetLanguage, extractedText, ocrExtractedText, isExtracting, handleTranslate]);
  
  // Clear cache when panel closes
  useEffect(() => {
    if (!isOpen) {
      setTranslatedText('');
      setIsCached(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderContent = () => (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Translation</h2>
          {isPageTranslated(currentPage) && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
              <CheckCircle2 className="w-3 h-3" />
              <span className="text-xs font-medium">Page {currentPage} translated</span>
            </div>
          )}
        </div>
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
          <Select value={targetLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="flex-1">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{selectedLanguage?.flag}</span>
                  <span>{selectedLanguage?.name}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* OCR Status & Text Edit Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <OcrStatusBadge 
            status={ocrStatus} 
            confidence={ocrConfidence}
            className="flex-shrink-0"
          />
          
          {currentText && !isTranslating && !isOcrProcessing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditText}
              className="gap-1.5"
            >
              <Edit className="w-3 h-3" />
              Edit Text
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleTranslate(false)}
            disabled={isTranslating || isExtracting || !currentText}
            className="flex-1"
            size="sm"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Re-translate
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'translation' ? 'sideBySide' : 'translation')}
            disabled={!translatedText}
          >
            {viewMode === 'translation' ? (
              <Columns2 className="w-4 h-4" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
          </Button>
        </div>

        {totalPages > 1 && (
          <>
            <Button
              onClick={handleTranslateAll}
              disabled={isTranslatingAll || isExtracting || !currentText}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {isTranslatingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating All Pages...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 mr-2" />
                  Translate All {totalPages} Pages
                </>
              )}
            </Button>
            
            {(allTranslations.size > 0 || 
              (totalPages > 1 && Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => translationCache.current.has(`${p}-${targetLanguage}`)).length >= totalPages)
            ) && (
              <Button
                onClick={handleDownloadAll}
                disabled={isTranslatingAll}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Pages ({allTranslations.size || totalPages} pages)
              </Button>
            )}
          </>
        )}

        {isTranslatingAll && (
          <div className="space-y-1">
            <Progress value={translateAllProgress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {Math.round(translateAllProgress)}% complete
            </p>
          </div>
        )}

        {isCached && translatedText && (
          <p className="text-xs text-muted-foreground text-center">
            ✓ Translation loaded from cache
          </p>
        )}

        {/* Office Document / Scanned PDF Warning with OCR Options */}
        {(() => {
          const isOffice = documentType?.includes('word') || documentType?.includes('document') || 
                          documentType?.includes('sheet') || documentType?.includes('presentation') ||
                          /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl || '');
          
          if (isOffice && !ocrEnabled && !isTranslating && !isOcrProcessing) {
            return (
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Languages className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Office Document Detected
                      </div>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        Click "Parse Document" below to extract text from this {
                          documentType?.includes('word') || documentType?.includes('document') ? 'Word document' :
                          documentType?.includes('sheet') ? 'Excel spreadsheet' :
                          'PowerPoint presentation'
                        }.
                      </p>
                    </div>
                    
                    <Button
                      onClick={() => handleEnableOcr('ai')}
                      disabled={isOcrProcessing}
                      size="sm"
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Parse Document
                    </Button>
                    
                    <div className="text-xs text-blue-600/80 dark:text-blue-400/80">
                      💡 Supports .docx, .xlsx, .pptx formats
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          if (isScannedPdf && !ocrEnabled && !isTranslating && !isOcrProcessing) {
            return (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <Scan className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="text-sm font-medium text-amber-900 dark:text-amber-100">
                        Scanned Document Detected
                      </div>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        This appears to be a scanned or image-based document with minimal text layer. 
                        Choose an OCR method to extract and translate text.
                      </p>
                    </div>
                    
                    {/* OCR Method Selection */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        onClick={() => handleEnableOcr('ai')}
                        disabled={isOcrProcessing}
                        size="sm"
                        className="flex-1"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        AI OCR (Better Quality)
                      </Button>
                      <Button
                        onClick={() => handleEnableOcr('browser')}
                        disabled={isOcrProcessing}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        <Scan className="w-4 h-4 mr-2" />
                        Browser OCR (Free)
                      </Button>
                    </div>
                    
                    <div className="text-xs text-amber-600/80 dark:text-amber-400/80">
                      💡 AI OCR uses credits but provides better accuracy. Browser OCR is free and works offline.
                    </div>
                  </div>
                </div>
              </div>
            );
          }
          
          return null;
        })()}

        {/* OCR Processing Status with Progress */}
        {isOcrProcessing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{extractionStatus || 'Processing with OCR...'}</span>
            </div>
            {browserOcrProgress > 0 && browserOcrProgress < 100 && (
              <div className="space-y-1">
                <Progress value={browserOcrProgress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round(browserOcrProgress)}% complete
                </p>
              </div>
            )}
          </div>
        )}

        {extractionStatus && (
          <div className="p-4 bg-muted border border-border rounded-lg">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {extractionStatus}
            </p>
          </div>
        )}

        {/* Error Message with Retry Button */}
        {(() => {
          // Don't show error box for Office documents (they have their own UI)
          const isOffice = documentType?.includes('word') || documentType?.includes('document') || 
                          documentType?.includes('sheet') || documentType?.includes('presentation') ||
                          /\.(docx?|xlsx?|pptx?)$/i.test(documentUrl || '');
          
          if (error && !isOcrProcessing && !isTranslating && !isOffice) {
            return (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-3">
                <div className="flex items-start gap-3">
                  <X className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="text-sm font-medium text-destructive">
                      Translation Error
                    </div>
                    <p className="text-xs text-destructive/80">
                      {error}
                    </p>
                    <Button
                      onClick={() => {
                        setError(null);
                        handleTranslate(false);
                      }}
                      size="sm"
                      variant="outline"
                      className="mt-2"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-180px)]">
        <div className="p-4">
          {isExtracting && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>
              <div className="w-full max-w-sm space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          )}

          {!isExtracting && !currentText && !translatedText && !isTranslating && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Globe className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                {isScannedPdf 
                  ? 'Unable to extract text from this PDF'
                  : 'Select a language and click translate to see the translation'
                }
              </p>
              {isScannedPdf && (
                <p className="text-xs text-muted-foreground max-w-sm">
                  This document appears to be scanned or image-based. Text extraction requires text-based PDFs.
                </p>
              )}
            </div>
          )}
 
          {!isExtracting && currentText && !translatedText && !isTranslating && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">
                Preparing translation...
              </p>
              <div className="w-full max-w-sm space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          )}
 
          {isTranslating && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Translating document...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
              <div className="w-full max-w-sm space-y-2 mt-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          )}

          {translatedText && viewMode === 'translation' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Translated Text</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="prose prose-sm max-w-none p-4 bg-card rounded-lg border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {translatedText}
                </p>
              </div>
            </div>
          )}

          {translatedText && viewMode === 'sideBySide' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Side-by-Side View</p>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                  <ScrollArea 
                    className="h-[300px] md:h-[400px] prose prose-sm max-w-none p-4 bg-card rounded-lg border"
                    ref={originalScrollRef}
                    onScroll={() => handleSyncScroll('original')}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {extractedText}
                    </p>
                  </ScrollArea>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Translation</p>
                  <ScrollArea 
                    className="h-[300px] md:h-[400px] prose prose-sm max-w-none p-4 bg-card rounded-lg border"
                    ref={translatedScrollRef}
                    onScroll={() => handleSyncScroll('translated')}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {translatedText}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="h-[85vh] max-h-[85vh]">
          {renderContent()}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-full md:w-[400px] lg:w-[480px] bg-background border-l shadow-2xl z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {renderContent()}
      
      <EditTextDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        initialText={editableText}
        onSave={handleSaveEditedText}
      />
    </div>
  );
}
