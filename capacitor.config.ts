
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f025a902daf499ebc5519c59def333f',
  appName: 'Assistente Inteligente Pro',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1f2937",
      showSpinner: false,
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      backgroundColor: "#1f2937",
      style: "DARK"
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true
    }
  },
  // Configuração para desenvolvimento (será removida em produção)
  server: process.env.NODE_ENV === 'development' ? {
    url: "https://7f025a90-2daf-499e-bc55-19c59def333f.lovableproject.com?forceHideBadge=true",
    cleartext: true
  } : undefined
};

export default config;
