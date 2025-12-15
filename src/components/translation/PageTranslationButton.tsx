import React, { useState } from 'react';
import { Globe, X, ChevronDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { TranslatedContentModal } from './TranslatedContentModal';

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
  const [selectedLanguage, setSelectedLanguage] = useState<typeof SUPPORTED_LANGUAGES[0] | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string>('');

  const extractPageContent = (): string => {
    // Extract main content from the page
    const mainContent = document.querySelector('main');
    if (!mainContent) return '';

    // Get all text content, excluding navigation and footer
    const textElements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, span:not(.sr-only), td, th');
    const textContent: string[] = [];
    
    textElements.forEach((el) => {
      const text = el.textContent?.trim();
      if (text && text.length > 2 && !text.match(/^[0-9.,]+$/)) {
        textContent.push(text);
      }
    });

    // Deduplicate and join
    const uniqueContent = [...new Set(textContent)];
    return uniqueContent.join('\n\n');
  };

  const handleLanguageSelect = async (language: typeof SUPPORTED_LANGUAGES[0]) => {
    setSelectedLanguage(language);
    setIsTranslating(true);
    setShowModal(true);
    
    try {
      const pageContent = extractPageContent();
      
      // Call the translation edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            content: pageContent,
            targetLanguage: language.code,
            pageId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  result += parsed.content;
                  setTranslatedContent(result);
                }
              } catch {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatedContent('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setTranslatedContent('');
    setSelectedLanguage(null);
  };

  // Group languages by region
  const groupedLanguages = SUPPORTED_LANGUAGES.reduce((acc, lang) => {
    if (!acc[lang.region]) acc[lang.region] = [];
    acc[lang.region].push(lang);
    return acc;
  }, {} as Record<string, typeof SUPPORTED_LANGUAGES>);

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <DropdownMenu>
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

      {showModal && selectedLanguage && (
        <TranslatedContentModal
          isOpen={showModal}
          onClose={handleClose}
          language={selectedLanguage}
          content={translatedContent}
          isTranslating={isTranslating}
        />
      )}
    </>
  );
};
