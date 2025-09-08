import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()] as any,
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: false,
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
        lines: 15,
        statements: 15,
        functions: 15,
        branches: 10
      }
    }
  }
});
