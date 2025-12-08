import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Loader2, Copy, Check, Download, Languages, Globe, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

// Constants for translation limits
const TRANSLATION_TIMEOUT_MS = 90000; // 90 seconds timeout
const LARGE_FILE_WARNING_MB = 10; // Show warning for files > 10MB

interface MobileTranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentId?: string;
  documentType?: string;
  numPages?: number;
  fileSizeBytes?: number;
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

// Supabase config - hardcoded to avoid env variable issues on mobile
const SUPABASE_URL = 'https://ktgosplhknmnyagxrgbe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE';

/**
 * MobileTranslationPanel - Optimized for mobile devices
 * 
 * Uses server-side text extraction via edge function instead of client-side react-pdf
 * This avoids canvas memory issues on iOS Safari
 */
export function MobileTranslationPanel({
  isOpen,
  onClose,
  documentUrl,
  documentId,
  documentType,
  numPages = 1,
  fileSizeBytes
}: MobileTranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>('zh-CN');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const { toast } = useToast();
  
  // Cache translations in memory
  const translationCache = useRef<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);
  
  // Calculate file size in MB for display
  const fileSizeMB = fileSizeBytes ? fileSizeBytes / (1024 * 1024) : 0;
  const isLargeFile = fileSizeMB > LARGE_FILE_WARNING_MB;

  // Track mount state
  useEffect(() => {
    isMountedRef.current = true;
    console.log('[MobileTranslationPanel] MOUNT', { 
      documentUrl: documentUrl?.substring(0, 80), 
      documentId, 
      numPages,
      fileSizeMB: fileSizeMB.toFixed(2),
      isLargeFile
    });
    
    return () => {
      isMountedRef.current = false;
      console.log('[MobileTranslationPanel] UNMOUNT');
      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Clear any pending timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [documentUrl, documentId, numPages, fileSizeMB, isLargeFile]);

  const handleTranslate = useCallback(async (page: number = currentPage) => {
    const cacheKey = `${documentId || documentUrl}-${page}-${targetLanguage}`;
    
    console.log('[MobileTranslationPanel] handleTranslate called', {
      page,
      targetLanguage,
      cacheKey,
      hasCached: translationCache.current.has(cacheKey),
      fileSizeMB: fileSizeMB.toFixed(2)
    });
    
    // Check cache first
    if (translationCache.current.has(cacheKey)) {
      console.log('[MobileTranslationPanel] Cache HIT');
      setTranslatedText(translationCache.current.get(cacheKey)!);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      console.log('[MobileTranslationPanel] Aborting previous request');
      abortControllerRef.current.abort();
    }
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    abortControllerRef.current = new AbortController();

    setIsTranslating(true);
    setTranslatedText('');
    setError(null);
    setProgress(10);
    setIsTimedOut(false);

    const startTime = Date.now();
    
    // Set timeout for translation
    timeoutRef.current = setTimeout(() => {
      console.log('[MobileTranslationPanel] Translation timeout reached after', TRANSLATION_TIMEOUT_MS / 1000, 'seconds');
      setIsTimedOut(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (isMountedRef.current) {
        setIsTranslating(false);
        setError(`Translation timed out after ${TRANSLATION_TIMEOUT_MS / 1000} seconds. The document may be too large or complex.`);
        toast({
          title: "Translation Timeout",
          description: "The translation took too long. Try a specific page instead.",
          variant: "destructive"
        });
      }
    }, TRANSLATION_TIMEOUT_MS);

    try {
      console.log('[MobileTranslationPanel] Calling edge function', {
        url: `${SUPABASE_URL}/functions/v1/translate-document`,
        documentUrl: documentUrl?.substring(0, 80),
        targetLanguage,
        pageNumber: page,
        documentType
      });

      setProgress(20);

      // Call edge function which handles server-side extraction
      const response = await fetch(`${SUPABASE_URL}/functions/v1/translate-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          documentUrl,
          targetLanguage,
          documentId,
          pageNumber: page,
          extractServerSide: true, // Signal to extract text server-side
          documentType,
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      // Clear timeout on successful response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      console.log('[MobileTranslationPanel] Response received', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('Content-Type'),
        elapsed: Date.now() - startTime + 'ms'
      });

      if (!response.ok) {
        let errorMessage = 'Translation failed. Please try again.';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('[MobileTranslationPanel] Error response:', errorData);
        } catch {
          console.error('[MobileTranslationPanel] Failed to parse error response');
        }
        
        if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (response.status === 402) {
          errorMessage = 'Translation credits exhausted.';
        }
        
        throw new Error(errorMessage);
      }

      setProgress(40);

      const contentType = response.headers.get('Content-Type') || '';
      const isJsonResponse = contentType.includes('application/json');
      
      console.log('[MobileTranslationPanel] Processing response', { isJsonResponse, contentType });

      if (response.body && !isJsonResponse) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullTranslation = '';
        let buffer = '';
        let chunkCount = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[MobileTranslationPanel] Stream complete', { chunkCount, fullLength: fullTranslation.length });
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          chunkCount++;
          
          // Update progress based on chunks received (use functional update)
          if (isMountedRef.current) {
            setProgress(prev => Math.min(90, prev + 2));
          }

          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line || line.startsWith(':')) continue;

            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') {
                console.log('[MobileTranslationPanel] Received [DONE] signal');
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  fullTranslation += parsed.delta;
                  if (isMountedRef.current) {
                    setTranslatedText(fullTranslation);
                  }
                } else if (parsed.translatedText) {
                  fullTranslation = parsed.translatedText;
                  if (isMountedRef.current) {
                    setTranslatedText(fullTranslation);
                  }
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        if (fullTranslation) {
          console.log('[MobileTranslationPanel] Caching translation', { cacheKey, length: fullTranslation.length });
          translationCache.current.set(cacheKey, fullTranslation);
        }
      } else {
        // Non-streaming response
        const data = await response.json();
        console.log('[MobileTranslationPanel] Non-streaming response:', { 
          hasTranslatedText: !!data.translatedText,
          cached: data.cached,
          error: data.error
        });
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        if (isMountedRef.current) {
          setTranslatedText(data.translatedText);
        }
        translationCache.current.set(cacheKey, data.translatedText);
      }

      if (isMountedRef.current) {
        setProgress(100);
      }
      
      console.log('[MobileTranslationPanel] Translation complete', { elapsed: Date.now() - startTime + 'ms' });
      
    } catch (err: any) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (err.name === 'AbortError') {
        console.log('[MobileTranslationPanel] Request aborted');
        if (!isTimedOut) {
          return; // Only return silently if not a timeout abort
        }
      }
      
      console.error('[MobileTranslationPanel] Translation error:', err);
      
      if (isMountedRef.current && !isTimedOut) {
        setError(err.message || 'Translation failed');
        toast({
          title: 'Translation Failed',
          description: err.message || 'Please try again',
          variant: 'destructive'
        });
      }
    } finally {
      // Clear timeout on completion
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (isMountedRef.current) {
        setIsTranslating(false);
      }
    }
  }, [currentPage, targetLanguage, documentUrl, documentId, documentType, toast, fileSizeMB, isTimedOut]);

  const handleCopy = async () => {
    if (!translatedText) return;
    console.log('[MobileTranslationPanel] Copying to clipboard');
    try {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      toast({ title: 'Copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Please select and copy manually',
        variant: 'destructive'
      });
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    console.log('[MobileTranslationPanel] Downloading translation');
    const blob = new Blob([translatedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `translation_page${currentPage}_${targetLanguage}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded' });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > numPages) return;
    console.log('[MobileTranslationPanel] Page change', { from: currentPage, to: page });
    setCurrentPage(page);
    setTranslatedText('');
    // Auto-translate on page change if translation was already started
    if (translationCache.current.size > 0) {
      handleTranslate(page);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-base">
              <Languages className="w-5 h-5" />
              Translate Document
            </DrawerTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 touch-manipulation"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-4 space-y-4">
          {/* Large File Warning */}
          {isLargeFile && !isTranslating && !translatedText && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-amber-600">Large File Warning</p>
                <p className="text-muted-foreground">
                  This document is {fileSizeMB.toFixed(1)}MB. Translation may take longer or timeout.
                </p>
              </div>
            </div>
          )}
          
          {/* Language Selection */}
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger className="h-11 touch-manipulation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="h-11">
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page Navigation (if PDF with multiple pages) */}
          {numPages > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isTranslating}
                className="h-10 touch-manipulation"
              >
                Previous
              </Button>
              <span className="text-sm font-medium min-w-[80px] text-center">
                Page {currentPage} / {numPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= numPages || isTranslating}
                className="h-10 touch-manipulation"
              >
                Next
              </Button>
            </div>
          )}

          {/* Translate Button */}
          <Button
            onClick={() => handleTranslate()}
            disabled={isTranslating}
            className="w-full h-12 touch-manipulation text-base"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="w-5 h-5 mr-2" />
                Translate to {selectedLanguage?.name}
              </>
            )}
          </Button>

          {/* Progress Bar */}
          {isTranslating && (
            <div className="space-y-1">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 40 ? 'Extracting text...' : progress < 90 ? 'Translating...' : 'Finishing...'}
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-destructive">{error}</p>
                {isTimedOut && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Try translating a specific page instead of the whole document.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Translation Result */}
          {translatedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <span>{selectedLanguage?.flag}</span>
                  Translation
                </h4>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 touch-manipulation"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 touch-manipulation"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[300px] rounded-lg border bg-muted/30">
                <div className="p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {translatedText}
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Empty State */}
          {!translatedText && !isTranslating && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <Languages className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">
                Select a language and tap "Translate" to begin
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
