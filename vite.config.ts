import react from '@vitejs/plugin-react';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Set the base path conditionally based on environment variables
  // For GitHub Pages: set VITE_BASE_PATH="/teams-chat-image-gallery/"
  // For static web apps or root domain: leave VITE_BASE_PATH empty or set to "/"
  base: process.env.VITE_BASE_PATH || '/',
  define: {
    global: 'globalThis',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React ecosystem
          if (
            id.includes('react') ||
            id.includes('react-dom') ||
            id.includes('react-router-dom')
          ) {
            return 'react-vendor';
          }

          // Microsoft Teams and TeamsFx libraries
          if (
            id.includes('@microsoft/teams-js') ||
            id.includes('@microsoft/teamsfx')
          ) {
            return 'teams-vendor';
          }

          // Fluent UI components (often large)
          if (id.includes('@fluentui/react-components')) {
            return 'fluentui-vendor';
          }

          // Photo gallery and lightbox libraries
          if (
            id.includes('react-photo-album') ||
            id.includes('yet-another-react-lightbox')
          ) {
            return 'gallery-vendor';
          }

          // Utilities and smaller libraries
          if (id.includes('axios')) {
            return 'utils-vendor';
          }

          // Node modules that are not specifically chunked above
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000,
    // Use default minification (esbuild)
    minify: true,
  },
  server: {
    port: 53000,
    https: {
      cert: process.env.SSL_CRT_FILE
        ? fs.readFileSync(process.env.SSL_CRT_FILE)
        : undefined,
      key: process.env.SSL_KEY_FILE
        ? fs.readFileSync(process.env.SSL_KEY_FILE)
        : undefined,
    },
  },
});
