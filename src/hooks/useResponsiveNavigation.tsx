
import { useState, useEffect } from 'react';
import { useIsMobile } from './use-mobile';

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  priority: number; // 1 = highest priority (always visible on mobile)
  path?: string; // Optional path for navigation items
}

export function useResponsiveNavigation(items: NavigationItem[]) {
  const isMobile = useIsMobile();
  const [visibleItems, setVisibleItems] = useState<NavigationItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth < 768) {
        // Mobile: Show only top 5 priority items
        const sorted = [...items].sort((a, b) => a.priority - b.priority);
        setVisibleItems(sorted.slice(0, 5));
        setHiddenItems(sorted.slice(5));
      } else if (screenWidth < 1024) {
        // Tablet: Show top 7 priority items
        const sorted = [...items].sort((a, b) => a.priority - b.priority);
        setVisibleItems(sorted.slice(0, 7));
        setHiddenItems(sorted.slice(7));
      } else if (screenWidth < 1280) {
        // Small desktop: Show top 9 priority items
        const sorted = [...items].sort((a, b) => a.priority - b.priority);
        setVisibleItems(sorted.slice(0, 9));
        setHiddenItems(sorted.slice(9));
      } else {
        // Large desktop: Show all items
        setVisibleItems(items);
        setHiddenItems([]);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [items]);

  return {
    visibleItems,
    hiddenItems,
    isMobile,
    hasHiddenItems: hiddenItems.length > 0
  };
}
