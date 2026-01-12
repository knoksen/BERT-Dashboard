import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      server: {
        port: 3000,
        open: true
      },
      build: {
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('@google/genai')) return 'vendor-genai';
                if (id.includes('react')) return 'vendor-react';
                return 'vendor';
              }
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      optimizeDeps: {
        exclude: ['@google/genai']
      }
    };
});
