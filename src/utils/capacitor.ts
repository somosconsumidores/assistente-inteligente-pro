
import { Capacitor } from '@capacitor/core';

// Utility functions for Capacitor
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return Capacitor.getPlatform();
};

export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

export const isWeb = () => {
  return Capacitor.getPlatform() === 'web';
};

// Safe area handling for mobile devices
export const getSafeAreaInsets = () => {
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

// App state management
export const handleAppStateChange = (callback: (isActive: boolean) => void) => {
  if (isNativePlatform()) {
    // Will be implemented with App plugin in Phase 3
    console.log('App state change handler registered for native platform');
  }
  
  // Fallback for web
  document.addEventListener('visibilitychange', () => {
    callback(!document.hidden);
  });
};
