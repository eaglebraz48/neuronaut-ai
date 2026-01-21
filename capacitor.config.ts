import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.neuronaut.app',
  appName: 'Neuronaut',
  webDir: '.next',
  server: {
    url: 'https://neuronaut-ai.vercel.app',
    cleartext: true
  }
};

export default config;

