import { useState, useCallback, useRef } from 'react';
import { X, Loader2, Copy, Check, Download, Languages, Globe } from 'lucide-react';
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

interface MobileTranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentId?: string;
  documentType?: string;
  numPages?: number;
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
  numPages = 1
}: MobileTranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>('zh-CN');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Cache translations in memory
  const translationCache = useRef<Map<string, string>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  const selectedLanguage = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage);

  const handleTranslate = useCallback(async (page: number = currentPage) => {
    const cacheKey = `${page}-${targetLanguage}`;
    
    // Check cache first
    if (translationCache.current.has(cacheKey)) {
      setTranslatedText(translationCache.current.get(cacheKey)!);
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsTranslating(true);
    setTranslatedText('');
    setError(null);
    setProgress(10);

    try {
      // Use hardcoded Supabase URL for mobile
      const SUPABASE_URL = 'https://ktgosplhknmnyagxrgbe.supabase.co';
      const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Z29zcGxoa25tbnlhZ3hyZ2JlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2OTkzMDUsImV4cCI6MjA2NTI3NTMwNX0.KVs7C_7PHARS-JddBgARWFpDZE6yCeMTLgZhu2UKACE';

      setProgress(30);

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
          stream: true
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        if (response.status === 402) {
          throw new Error('Translation credits exhausted.');
        }
        throw new Error('Translation failed. Please try again.');
      }

      setProgress(50);

      const contentType = response.headers.get('Content-Type') || '';
      const isJsonResponse = contentType.includes('application/json');

      if (response.body && !isJsonResponse) {
        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullTranslation = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          setProgress(Math.min(90, progress + 5));

          // Process complete lines
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line || line.startsWith(':')) continue;

            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.delta) {
                  fullTranslation += parsed.delta;
                  setTranslatedText(fullTranslation);
                } else if (parsed.translatedText) {
                  fullTranslation = parsed.translatedText;
                  setTranslatedText(fullTranslation);
                }
              } catch {
                // Skip malformed JSON
              }
            }
          }
        }

        if (fullTranslation) {
          translationCache.current.set(cacheKey, fullTranslation);
        }
      } else {
        // Non-streaming response
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setTranslatedText(data.translatedText);
        translationCache.current.set(cacheKey, data.translatedText);
      }

      setProgress(100);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('[MobileTranslation] Request aborted');
        return;
      }
      console.error('[MobileTranslation] Error:', err);
      setError(err.message || 'Translation failed');
      toast({
        title: 'Translation Failed',
        description: err.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
  }, [currentPage, targetLanguage, documentUrl, documentId, toast, progress]);

  const handleCopy = async () => {
    if (!translatedText) return;
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
            <Progress value={progress} className="h-2" />
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
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
