import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    globals: true,
    css: false,
    include: ['**/__tests__/**/*.test.{ts,tsx}'],
    testTimeout: 30000,
    hookTimeout: 30000,
    poolOptions: {
      threads: {
        maxThreads: 2,
        minThreads: 1,
        singleThread: true
      }
    },
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'dist/**',
        'build/**',
        'electron/**',
        '**/types.ts',
        '**/vitest.setup.*',
        '**/vite.config.*',
        '**/vitest.config.*',
        '**/.github/**',
        '**/node_modules/**',
        '**/constants.ts',
        '**/*.config.*',
        '**/eslint.config.cjs'
      ],
      thresholds: {
        lines: 20,
        statements: 20,
        functions: 20,
        branches: 15
      }
    }
  }
});
