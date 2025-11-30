import { useState } from 'react';
import { Globe, X, Loader2, Copy, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface TranslationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  currentPage: number;
  extractedText: string;
  isExtracting: boolean;
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
  extractedText,
  isExtracting
}: TranslationPanelProps) {
  const [targetLanguage, setTargetLanguage] = useState<string>('zh-CN');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!extractedText || !targetLanguage) {
      toast({
        title: 'Translation Error',
        description: 'No text available to translate',
        variant: 'destructive'
      });
      return;
    }

    setIsTranslating(true);
    setTranslatedText('');
    setIsCached(false);

    try {
      const { data, error } = await supabase.functions.invoke('translate-document', {
        body: {
          text: extractedText,
          targetLanguage,
          documentId,
          pageNumber: currentPage
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setTranslatedText(data.translatedText);
      setIsCached(data.cached || false);

      if (data.cached) {
        toast({
          title: 'Translation Loaded',
          description: 'Translation loaded from cache',
        });
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

      toast({
        title: 'Translation Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsTranslating(false);
    }
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

  // Auto-translate when language changes or text updates
  const handleLanguageChange = (lang: string) => {
    setTargetLanguage(lang);
    if (extractedText && !isExtracting) {
      // Reset translation and trigger new translation
      setTranslatedText('');
      setTimeout(() => handleTranslate(), 100);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-full md:w-[400px] lg:w-[480px] bg-background border-l shadow-2xl z-50",
        "transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Translation</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Page {currentPage}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
          <Select value={targetLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select language" />
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

        <Button
          onClick={handleTranslate}
          disabled={isTranslating || isExtracting || !extractedText}
          className="w-full"
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
              Translate This Page
            </>
          )}
        </Button>

        {isCached && (
          <p className="text-xs text-muted-foreground text-center">
            ✓ Translation loaded from cache
          </p>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="h-[calc(100%-180px)]">
        <div className="p-4">
          {isExtracting && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Extracting text from PDF...</p>
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="w-12 h-12 text-primary/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                Click "Translate This Page" to translate
              </p>
            </div>
          )}

          {isTranslating && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Translating document...</p>
              <p className="text-xs text-muted-foreground mt-2">This may take a moment</p>
            </div>
          )}

          {translatedText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Translated Text</p>
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
              <div className="prose prose-sm max-w-none p-4 bg-card rounded-lg border">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {translatedText}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
