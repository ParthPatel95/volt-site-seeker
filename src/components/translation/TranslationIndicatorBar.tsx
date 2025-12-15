import React from 'react';
import { Globe, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SUPPORTED_LANGUAGES } from './PageTranslationButton';

interface TranslationIndicatorBarProps {
  currentLanguage: string;
  isTranslating: boolean;
  progress: number;
  onRevert: () => void;
  onCancel: () => void;
}

export const TranslationIndicatorBar: React.FC<TranslationIndicatorBarProps> = ({
  currentLanguage,
  isTranslating,
  progress,
  onRevert,
  onCancel,
}) => {
  const language = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);
  
  if (!language) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] animate-in slide-in-from-top duration-300">
      {/* Progress bar during translation */}
      {isTranslating && (
        <div className="h-1 bg-muted">
          <Progress value={progress} className="h-1 rounded-none" />
        </div>
      )}
      
      {/* Indicator bar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">{language.flag}</span>
            <div className="flex items-center gap-2">
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-watt-bitcoin" />
                  <span className="text-sm font-medium text-foreground">
                    Translating to {language.name}...
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {progress}%
                  </span>
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4 text-watt-bitcoin" />
                  <span className="text-sm font-medium text-foreground">
                    Viewing in {language.name}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              AI Translation
            </span>
            
            {isTranslating ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Cancel</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onRevert}
                className="gap-1"
              >
                <span>View in English</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
