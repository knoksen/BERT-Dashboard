import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: false,
    poolOptions: {
      threads: {
        maxThreads: 1,
        minThreads: 1
      }
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'dist/**',
        '**/types.ts',
        '**/vitest.setup.*',
        '**/vite.config.*',
        '**/.github/**',
        '**/constants.ts' // pure data lists; exclude from threshold pressure
      ],
      thresholds: {
  // Incrementally raised thresholds (was 15/15/15/10)
  lines: 18,
  statements: 18,
  functions: 20,
  branches: 12
      }
    }
  }
});
