import { useState, useEffect, useRef } from 'react';
import { Globe, X, Loader2, Copy, Check, ChevronDown, Download, Columns2, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
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
  pdfDocument
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
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // In-memory translation cache: Map<"pageNumber-languageCode", translatedText>
  const translationCache = useRef<Map<string, string>>(new Map());
  
  // Track if this is the first open to auto-translate
  const hasAutoTranslated = useRef(false);
  
  // Refs for synced scrolling
  const originalScrollRef = useRef<HTMLDivElement>(null);
  const translatedScrollRef = useRef<HTMLDivElement>(null);
  
  // Check if current page is translated
  const isPageTranslated = (page: number) => {
    const cacheKey = `${page}-${targetLanguage}`;
    return translationCache.current.has(cacheKey);
  };
  
  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);

  // Detect if PDF is scanned (image-based with little to no text)
  useEffect(() => {
    if (extractedText && !isExtracting) {
      const textLength = extractedText.trim().length;
      const avgCharsPerPage = textLength / totalPages;
      
      // If less than 50 chars per page on average, likely scanned
      if (avgCharsPerPage < 50) {
        setIsScannedPdf(true);
      } else {
        setIsScannedPdf(false);
      }
    }
  }, [extractedText, isExtracting, totalPages]);

  // Extract text from a specific page
  const extractTextFromPage = async (pageNumber: number): Promise<string> => {
    if (!pdfDocument) return extractedText;
    
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
      console.error(`Failed to extract text from page ${pageNumber}:`, error);
      return '';
    }
  };

  const handleTranslate = async (useCache = true, pageText?: string, pageNum?: number) => {
    const textToTranslate = pageText || extractedText;
    const page = pageNum || currentPage;
    
    if (!textToTranslate || !targetLanguage) {
      toast({
        title: 'Translation Error',
        description: 'No text available to translate',
        variant: 'destructive'
      });
      return null;
    }

    // Check in-memory cache first
    const cacheKey = `${page}-${targetLanguage}`;
    if (useCache && translationCache.current.has(cacheKey)) {
      const cachedTranslation = translationCache.current.get(cacheKey)!;
      if (!pageText) {
        setTranslatedText(cachedTranslation);
        setIsCached(true);
        console.log(`[TranslationPanel] Loaded from in-memory cache: ${cacheKey}`);
      }
      return cachedTranslation;
    }

    if (!pageText) {
      setIsTranslating(true);
      setTranslatedText('');
      setIsCached(false);
    }

    try {
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

      // Handle streaming response
      if (!pageText && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullTranslation = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  fullTranslation += parsed.delta;
                  setTranslatedText(fullTranslation);
                } else if (parsed.translatedText) {
                  fullTranslation = parsed.translatedText;
                  setTranslatedText(fullTranslation);
                  setIsCached(parsed.cached || false);
                }
              } catch (e) {
                console.error('Failed to parse streaming data:', e);
              }
            }
          }
        }

        // Store in cache
        translationCache.current.set(cacheKey, fullTranslation);
        console.log(`[TranslationPanel] Stored in cache: ${cacheKey}`);
        return fullTranslation;
      } else {
        // Non-streaming response (for bulk translation)
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const translated = data.translatedText;
        translationCache.current.set(cacheKey, translated);
        
        if (!pageText) {
          setTranslatedText(translated);
          setIsCached(data.cached || false);
        }
        return translated;
      }
    } catch (error: any) {
      console.error('[TranslationPanel] Translation error:', error);
      
      let errorMessage = 'Failed to translate document';
      if (error.message?.includes('Rate limit')) {
        errorMessage = 'Translation rate limit exceeded. Please try again later.';
      } else if (error.message?.includes('credits')) {
        errorMessage = 'Translation credits exhausted. Please add credits to continue.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (!pageText) {
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
      }
    }
  };

  const handleTranslateAll = async () => {
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
          translation = await handleTranslate(false, pageText, page);
        }
        
        if (translation) {
          translations.set(page, translation);
        }
        
        setTranslateAllProgress((page / totalPages) * 100);
      } catch (error) {
        console.error(`Failed to translate page ${page}:`, error);
      }
    }

    setAllTranslations(translations);
    setIsTranslatingAll(false);
    toast({
      title: 'Translation Complete',
      description: `All ${totalPages} pages have been translated`,
    });
  };

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

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-document-all-pages.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Downloaded',
      description: 'All translations saved to file',
    });
  };

  const handleDownload = () => {
    if (!translatedText) return;

    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-page-${currentPage}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

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

  const handleSyncScroll = (source: 'original' | 'translated') => {
    const sourceRef = source === 'original' ? originalScrollRef : translatedScrollRef;
    const targetRef = source === 'original' ? translatedScrollRef : originalScrollRef;

    if (sourceRef.current && targetRef.current) {
      const scrollPercentage = sourceRef.current.scrollTop / 
        (sourceRef.current.scrollHeight - sourceRef.current.clientHeight);
      targetRef.current.scrollTop = scrollPercentage * 
        (targetRef.current.scrollHeight - targetRef.current.clientHeight);
    }
  };
  
  // Auto-translate when panel opens, page changes, or language changes
  useEffect(() => {
    if (!isOpen) {
      hasAutoTranslated.current = false;
      return;
    }
    
    if (isExtracting || !extractedText) {
      return;
    }
    
    // Check if we already have translation for this page/language in cache
    const cacheKey = `${currentPage}-${targetLanguage}`;
    if (translationCache.current.has(cacheKey)) {
      const cachedTranslation = translationCache.current.get(cacheKey)!;
      setTranslatedText(cachedTranslation);
      setIsCached(true);
      hasAutoTranslated.current = true;
      return;
    }
    
    // Auto-translate on first open or when page/language changes
    if (!hasAutoTranslated.current || translatedText) {
      handleTranslate(true);
      hasAutoTranslated.current = true;
    }
  }, [isOpen, currentPage, targetLanguage, extractedText, isExtracting]);
  
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

        <div className="flex gap-2">
          <Button
            onClick={() => handleTranslate(false)}
            disabled={isTranslating || isExtracting || !extractedText}
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
              disabled={isTranslatingAll || isExtracting || !extractedText}
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
            
            {(allTranslations.size > 0 || Array.from({ length: totalPages }, (_, i) => i + 1).some(p => translationCache.current.has(`${p}-${targetLanguage}`))) && (
              <Button
                onClick={handleDownloadAll}
                disabled={isTranslatingAll}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Download All Translations
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

        {isScannedPdf && (
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-600 dark:text-yellow-400 text-xs">!</span>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-yellow-600 dark:text-yellow-400">Scanned Document Detected</p>
              <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                This appears to be a scanned/image-based PDF with limited text. Translation quality may be reduced. For best results, use a text-based PDF.
              </p>
            </div>
          </div>
        )}
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

          {!isExtracting && !extractedText && !translatedText && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Select a language and click translate to see the translation
              </p>
            </div>
          )}

          {!isExtracting && extractedText && !translatedText && !isTranslating && (
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Original</p>
                  <ScrollArea 
                    className="h-[400px] prose prose-sm max-w-none p-4 bg-card rounded-lg border"
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
                    className="h-[400px] prose prose-sm max-w-none p-4 bg-card rounded-lg border"
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
    </div>
  );
}
