import React, { useEffect, useRef } from 'react';
import { X, Loader2, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface TranslatedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: { code: string; name: string; flag: string };
  content: string;
  isTranslating: boolean;
}

export const TranslatedContentModal: React.FC<TranslatedContentModalProps> = ({
  isOpen,
  onClose,
  language,
  content,
  isTranslating,
}) => {
  const [copied, setCopied] = React.useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (contentRef.current && isTranslating) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isTranslating]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated-content-${language.code}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded translation');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{language.flag}</span>
            <div>
              <h2 className="font-bold text-foreground">
                Translated to {language.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isTranslating ? 'Translating page content...' : 'Translation complete'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isTranslating && content && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6" ref={contentRef}>
          {isTranslating && !content ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-watt-bitcoin" />
              <p className="text-muted-foreground">Translating page content...</p>
              <p className="text-sm text-muted-foreground/70">This may take a moment for longer pages</p>
            </div>
          ) : (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <div 
                className={`whitespace-pre-wrap text-foreground leading-relaxed ${
                  ['ar', 'ur', 'fa'].includes(language.code) ? 'text-right' : ''
                }`}
                dir={['ar', 'ur', 'fa'].includes(language.code) ? 'rtl' : 'ltr'}
              >
                {content}
                {isTranslating && (
                  <span className="inline-block w-2 h-5 bg-watt-bitcoin animate-pulse ml-1" />
                )}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Powered by AI translation • Some technical terms may require review
          </p>
        </div>
      </div>
    </div>
  );
};
