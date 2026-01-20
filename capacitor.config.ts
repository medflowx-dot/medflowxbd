import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.42f9a3fe64104bdd89c74c194a2006c7',
  appName: 'medflowxbd',
  webDir: 'dist',
  server: {
    url: 'https://42f9a3fe-6410-4bdd-89c7-4c194a2006c7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
