
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced mobile detection hook with more device info and performance optimizations
export function useMobileDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    orientation: 'portrait' as 'portrait' | 'landscape',
    platform: 'web' as 'web' | 'ios' | 'android',
    isRetina: false,
    viewportHeight: 0,
    viewportWidth: 0,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  })

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024
      const orientation = width > height ? 'landscape' : 'portrait'
      const isRetina = window.devicePixelRatio > 1
      
      // Detect platform
      let platform: 'web' | 'ios' | 'android' = 'web'
      const userAgent = navigator.userAgent.toLowerCase()
      if (userAgent.includes('android')) {
        platform = 'android'
      } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        platform = 'ios'
      }

      // Get safe area insets for mobile devices
      const getSafeAreaInsets = () => {
        if (typeof window !== 'undefined') {
          const style = getComputedStyle(document.documentElement);
          return {
            top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
            bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
            left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
            right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
          };
        }
        return { top: 0, bottom: 0, left: 0, right: 0 };
      };

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        orientation,
        platform,
        isRetina,
        viewportHeight: height,
        viewportWidth: width,
        safeAreaInsets: getSafeAreaInsets()
      })
    }

    updateDeviceInfo()
    
    // Use throttled resize listener for better performance
    let timeoutId: NodeJS.Timeout
    const throttledUpdate = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateDeviceInfo, 100)
    }

    window.addEventListener('resize', throttledUpdate)
    window.addEventListener('orientationchange', updateDeviceInfo)

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', throttledUpdate)
      window.removeEventListener('orientationchange', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
