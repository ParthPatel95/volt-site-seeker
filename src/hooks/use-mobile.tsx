import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

// Detect if device has touch capability
function getIsTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function useIsMobile() {
  // Initialize with actual value to prevent flash of incorrect state on mobile
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT;
    const isTouchDevice = getIsTouchDevice();
    const isTablet = window.innerWidth < TABLET_BREAKPOINT && isTouchDevice;
    // Consider mobile if: narrow screen OR touch tablet
    return isNarrowScreen || isTablet;
  });

  React.useEffect(() => {
    const isTouchDevice = getIsTouchDevice();
    
    const checkMobile = () => {
      const isNarrowScreen = window.innerWidth < MOBILE_BREAKPOINT;
      const isTablet = window.innerWidth < TABLET_BREAKPOINT && isTouchDevice;
      return isNarrowScreen || isTablet;
    };
    
    const mql = window.matchMedia(`(max-width: ${TABLET_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(checkMobile())
    }
    mql.addEventListener("change", onChange)
    // Sync on mount in case SSR value differs
    const currentIsMobile = checkMobile();
    if (currentIsMobile !== isMobile) {
      setIsMobile(currentIsMobile);
    }
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}

// Export separate hook for touch detection (useful for disabling hover effects)
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = React.useState<boolean>(() => {
    return getIsTouchDevice();
  });

  return isTouchDevice;
}
