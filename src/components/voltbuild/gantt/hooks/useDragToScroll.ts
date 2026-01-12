import { useState, useRef, useCallback, useEffect, RefObject } from 'react';

interface UseDragToScrollOptions {
  /** Whether to enable horizontal scrolling */
  horizontal?: boolean;
  /** Whether to enable vertical scrolling */
  vertical?: boolean;
  /** Speed multiplier for scroll (default: 1) */
  scrollSpeed?: number;
}

interface UseDragToScrollReturn {
  /** Whether currently dragging */
  isDragging: boolean;
  /** Props to spread on the scrollable container */
  dragProps: {
    onMouseDown: (e: React.MouseEvent) => void;
    style: React.CSSProperties;
  };
}

/**
 * Hook to enable drag-to-scroll functionality on a scrollable element
 */
export function useDragToScroll(
  scrollRef: RefObject<HTMLElement | null>,
  options: UseDragToScrollOptions = {}
): UseDragToScrollReturn {
  const {
    horizontal = true,
    vertical = true,
    scrollSpeed = 1,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const scrollPos = useRef({ left: 0, top: 0 });
  const hasMovedRef = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    // Don't start drag if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-no-drag]') ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('[role="button"]') ||
      target.closest('[role="slider"]') ||
      target.closest('.cursor-ew-resize') // Resize handles
    ) {
      return;
    }

    // Get the scroll viewport element (ScrollArea uses a viewport child)
    const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
      || scrollRef.current;
    
    if (!scrollElement) return;

    setIsDragging(true);
    hasMovedRef.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    scrollPos.current = { 
      left: scrollElement.scrollLeft, 
      top: scrollElement.scrollTop 
    };

    // Prevent text selection during drag
    e.preventDefault();
  }, [scrollRef]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const scrollElement = scrollRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement
        || scrollRef.current;
      
      if (!scrollElement) return;

      hasMovedRef.current = true;
      
      const dx = (e.clientX - startPos.current.x) * scrollSpeed;
      const dy = (e.clientY - startPos.current.y) * scrollSpeed;
      
      if (horizontal) {
        scrollElement.scrollLeft = scrollPos.current.left - dx;
      }
      if (vertical) {
        scrollElement.scrollTop = scrollPos.current.top - dy;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add listeners to document to capture mouse events outside the element
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent clicks from firing if we dragged
    const handleClick = (e: MouseEvent) => {
      if (hasMovedRef.current) {
        e.stopPropagation();
      }
    };
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isDragging, scrollRef, horizontal, vertical, scrollSpeed]);

  return {
    isDragging,
    dragProps: {
      onMouseDown: handleMouseDown,
      style: {
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: isDragging ? 'none' : undefined,
      } as React.CSSProperties,
    },
  };
}
