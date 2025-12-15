import React, { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useInPlaceTranslation } from './useInPlaceTranslation';
import { TranslationIndicatorBar } from './TranslationIndicatorBar';

export const SUPPORTED_LANGUAGES = [
  // South Asian Languages
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', region: 'South Asia' },
  { code: 'gu', name: 'Gujarati', flag: '🇮🇳', region: 'South Asia' },
  { code: 'pa', name: 'Punjabi', flag: '🇮🇳', region: 'South Asia' },
  { code: 'ur', name: 'Urdu', flag: '🇵🇰', region: 'South Asia' },
  { code: 'bn', name: 'Bengali', flag: '🇧🇩', region: 'South Asia' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', region: 'South Asia' },
  // East Asian Languages
  { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳', region: 'East Asia' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', flag: '🇹🇼', region: 'East Asia' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', region: 'East Asia' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', region: 'East Asia' },
  // European Languages
  { code: 'es', name: 'Spanish', flag: '🇪🇸', region: 'Europe' },
  { code: 'fr', name: 'French', flag: '🇫🇷', region: 'Europe' },
  { code: 'de', name: 'German', flag: '🇩🇪', region: 'Europe' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', region: 'Europe' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', region: 'Europe' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱', region: 'Europe' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', region: 'Europe' },
  // Middle Eastern Languages
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', region: 'Middle East' },
  { code: 'fa', name: 'Persian', flag: '🇮🇷', region: 'Middle East' },
  { code: 'tr', name: 'Turkish', flag: '🇹🇷', region: 'Middle East' },
];

interface PageTranslationButtonProps {
  pageId: string;
}

export const PageTranslationButton: React.FC<PageTranslationButtonProps> = ({ pageId }) => {
  const {
    isTranslating,
    progress,
    currentLanguage,
    translatePage,
    revertToOriginal,
    cancelTranslation,
  } = useInPlaceTranslation(pageId);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Add padding to body when indicator bar is shown
  useEffect(() => {
    if (currentLanguage || isTranslating) {
      document.body.style.paddingTop = '52px';
    } else {
      document.body.style.paddingTop = '';
    }
    return () => {
      document.body.style.paddingTop = '';
    };
  }, [currentLanguage, isTranslating]);

  const handleLanguageSelect = (language: typeof SUPPORTED_LANGUAGES[0]) => {
    setIsDropdownOpen(false);
    translatePage(language.code, language.name);
  };

  // Group languages by region
  const groupedLanguages = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) acc[lang.region] = [];
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, typeof SUPPORTED_LANGUAGES>);

  // Hide dropdown when translation is active
  const showDropdown = !currentLanguage && !isTranslating;

  return (
    <>
      {/* Translation indicator bar */}
      {(currentLanguage || isTranslating) && (
        <TranslationIndicatorBar
          currentLanguage={currentLanguage || ''}
          isTranslating={isTranslating}
          progress={progress}
          onRevert={revertToOriginal}
          onCancel={cancelTranslation}
        />
      )}

      {/* Translation button */}
      {showDropdown && (
        <div className="fixed bottom-6 left-6 z-50">
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-full shadow-lg bg-white/95 backdrop-blur-sm border-border hover:bg-white hover:border-watt-bitcoin/50 transition-all"
              >
                <Globe className="w-5 h-5 mr-2 text-watt-bitcoin" />
                <span className="text-sm font-medium">Translate</span>
                <ChevronDown className="w-4 h-4 ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="start" 
              className="w-64 max-h-[70vh] overflow-y-auto"
              sideOffset={8}
            >
              {Object.entries(groupedLanguages).map(([region, languages], idx) => (
                <React.Fragment key={region}>
                  {idx > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
                    {region}
                  </DropdownMenuLabel>
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang)}
                      className="cursor-pointer"
                    >
                      <span className="mr-2 text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </DropdownMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* CSS for translation animations */}
      <style>{`
        .translation-fade {
          opacity: 0.5;
          transition: opacity 0.2s ease-out;
        }
        
        .translated {
          animation: translateFadeIn 0.3s ease-out forwards;
        }
        
        @keyframes translateFadeIn {
          from {
            opacity: 0.5;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
