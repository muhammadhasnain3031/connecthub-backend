import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // `describe`, `test`, `expect` global access patterns parameters register automation
    environment: 'jsdom', // Web engine simulation mapping
    setupFiles: './src/setupTests.js', // Runtime setups configuration if exists
  },
});
