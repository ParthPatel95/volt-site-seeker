import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface TranslationSegment {
  id: string;
  text: string;
  element: Element;
}

interface TranslationState {
  isTranslating: boolean;
  progress: number;
  currentLanguage: string | null;
  error: string | null;
}

const RTL_LANGUAGES = ['ar', 'ur', 'fa'];

// Generate content hash for cache invalidation
const generateContentHash = (segments: TranslationSegment[]): string => {
  const content = segments.map(s => s.text).join('|');
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

// Get cache key
const getCacheKey = (pageId: string, languageCode: string, contentHash: string): string => {
  return `translation-${pageId}-${languageCode}-${contentHash}`;
};

export const useInPlaceTranslation = (pageId: string) => {
  const [state, setState] = useState<TranslationState>({
    isTranslating: false,
    progress: 0,
    currentLanguage: null,
    error: null,
  });

  const originalContentRef = useRef<Map<string, { text: string; dir: string | null; className: string }>>(new Map());
  const segmentsRef = useRef<TranslationSegment[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Extract all translatable elements from the page
  const extractTranslatableElements = useCallback((): TranslationSegment[] => {
    const mainContent = document.querySelector('main');
    if (!mainContent) return [];

    const selectors = 'h1, h2, h3, h4, h5, h6, p, li, td, th, [data-translate]';
    const elements = mainContent.querySelectorAll(selectors);
    const segments: TranslationSegment[] = [];
    const seenTexts = new Set<string>();

    elements.forEach((el, index) => {
      // Skip elements that are just wrappers or have child elements with text
      const hasOnlyTextChildren = Array.from(el.childNodes).every(
        node => node.nodeType === Node.TEXT_NODE || 
               (node.nodeType === Node.ELEMENT_NODE && 
                ['STRONG', 'EM', 'B', 'I', 'SPAN', 'A', 'CODE'].includes((node as Element).tagName))
      );

      if (!hasOnlyTextChildren && el.children.length > 0) {
        // Check if all children are also selected - skip this parent
        const hasSelectedChildren = Array.from(el.children).some(
          child => child.matches(selectors)
        );
        if (hasSelectedChildren) return;
      }

      const text = el.textContent?.trim();
      
      // Skip if empty, too short, only numbers, or duplicate
      if (!text || text.length < 3 || text.match(/^[0-9.,\s%$€£¥]+$/) || seenTexts.has(text)) {
        return;
      }

      seenTexts.add(text);
      const id = `t-${index}`;
      el.setAttribute('data-translate-id', id);
      
      segments.push({ id, text, element: el });
    });

    return segments;
  }, []);

  // Save original content for reverting
  const saveOriginalContent = useCallback((segments: TranslationSegment[]) => {
    originalContentRef.current.clear();
    segments.forEach(({ id, element }) => {
      originalContentRef.current.set(id, {
        text: element.innerHTML,
        dir: element.getAttribute('dir'),
        className: element.className,
      });
    });
  }, []);

  // Apply translation to a single element
  const applyTranslation = useCallback((id: string, translatedText: string, languageCode: string) => {
    const element = document.querySelector(`[data-translate-id="${id}"]`);
    if (!element) return;

    const isRTL = RTL_LANGUAGES.includes(languageCode);
    
    // Animate the transition
    element.classList.add('translation-fade');
    
    requestAnimationFrame(() => {
      element.textContent = translatedText;
      
      if (isRTL) {
        element.setAttribute('dir', 'rtl');
        element.classList.add('text-right');
      }
      
      element.classList.add('translated');
      element.classList.remove('translation-fade');
    });
  }, []);

  // Parse streaming response and extract translations
  const parseTranslationChunk = (chunk: string): Map<string, string> => {
    const translations = new Map<string, string>();
    
    // Match pattern: [T001]translated text[T002]next text...
    const regex = /\[T(\d+)\]([^\[]*)/g;
    let match;
    
    while ((match = regex.exec(chunk)) !== null) {
      const id = `t-${parseInt(match[1], 10)}`;
      const text = match[2].trim();
      if (text) {
        translations.set(id, text);
      }
    }
    
    return translations;
  };

  // Main translation function
  const translatePage = useCallback(async (languageCode: string, languageName: string) => {
    // Abort any existing translation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState({
      isTranslating: true,
      progress: 0,
      currentLanguage: languageCode,
      error: null,
    });

    try {
      // Extract elements
      const segments = extractTranslatableElements();
      if (segments.length === 0) {
        throw new Error('No translatable content found');
      }

      segmentsRef.current = segments;
      saveOriginalContent(segments);

      // Check cache
      const contentHash = generateContentHash(segments);
      const cacheKey = getCacheKey(pageId, languageCode, contentHash);
      const cachedTranslations = localStorage.getItem(cacheKey);

      if (cachedTranslations) {
        const translations = JSON.parse(cachedTranslations) as Record<string, string>;
        let applied = 0;
        
        Object.entries(translations).forEach(([id, text]) => {
          applyTranslation(id, text, languageCode);
          applied++;
          setState(prev => ({ ...prev, progress: Math.round((applied / segments.length) * 100) }));
        });

        setState(prev => ({ ...prev, isTranslating: false, progress: 100 }));
        toast.success(`Page translated to ${languageName} (cached)`);
        return;
      }

      // Prepare segments for API
      const segmentData = segments.map(s => ({ id: s.id, text: s.text }));

      // Call translation API
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-page`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            segments: segmentData,
            targetLanguage: languageCode,
            pageId,
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok) {
        throw new Error('Translation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      const appliedTranslations: Record<string, string> = {};
      let translatedCount = 0;

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
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  fullContent += content;
                  
                  // Parse and apply translations as they stream in
                  const translations = parseTranslationChunk(fullContent);
                  translations.forEach((text, id) => {
                    if (!appliedTranslations[id]) {
                      applyTranslation(id, text, languageCode);
                      appliedTranslations[id] = text;
                      translatedCount++;
                      setState(prev => ({ 
                        ...prev, 
                        progress: Math.round((translatedCount / segments.length) * 100) 
                      }));
                    }
                  });
                }
              } catch {
                // Ignore parsing errors for partial chunks
              }
            }
          }
        }
      }

      // Cache the translations
      localStorage.setItem(cacheKey, JSON.stringify(appliedTranslations));

      setState(prev => ({ ...prev, isTranslating: false, progress: 100 }));
      toast.success(`Page translated to ${languageName}`);

    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return; // Translation was cancelled
      }
      
      console.error('Translation error:', error);
      setState(prev => ({ 
        ...prev, 
        isTranslating: false, 
        error: error instanceof Error ? error.message : 'Translation failed' 
      }));
      toast.error('Translation failed. Please try again.');
    }
  }, [pageId, extractTranslatableElements, saveOriginalContent, applyTranslation]);

  // Revert to original English content
  const revertToOriginal = useCallback(() => {
    originalContentRef.current.forEach((original, id) => {
      const element = document.querySelector(`[data-translate-id="${id}"]`);
      if (element) {
        element.innerHTML = original.text;
        element.className = original.className;
        
        if (original.dir) {
          element.setAttribute('dir', original.dir);
        } else {
          element.removeAttribute('dir');
        }
        
        element.classList.remove('translated', 'text-right');
      }
    });

    setState({
      isTranslating: false,
      progress: 0,
      currentLanguage: null,
      error: null,
    });

    toast.success('Reverted to English');
  }, []);

  // Cancel ongoing translation
  const cancelTranslation = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    revertToOriginal();
  }, [revertToOriginal]);

  return {
    ...state,
    translatePage,
    revertToOriginal,
    cancelTranslation,
  };
};
