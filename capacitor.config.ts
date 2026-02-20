import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pushkarstay.app',
  appName: 'PushkarStay PMS',
  webDir: 'public',
  server: {
    url: 'http://192.168.1.X:3000', // REPLACE with your PC's IP Address
    cleartext: true
  }
};

export default config;
