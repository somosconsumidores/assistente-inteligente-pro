
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.7f025a902daf499ebc5519c59def333f',
  appName: 'assistente-inteligente-pro',
  webDir: 'dist',
  server: {
    url: 'https://7f025a90-2daf-499e-bc55-19c59def333f.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1f2937',
      showSpinner: true,
      spinnerColor: '#3b82f6'
    }
  }
};

export default config;
