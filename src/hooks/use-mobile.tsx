import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize with actual value to prevent flash of incorrect state on mobile
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  });

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    // Sync on mount in case SSR value differs
    const currentIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
    if (currentIsMobile !== isMobile) {
      setIsMobile(currentIsMobile);
    }
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
