import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      exclude: [
        'node_modules/',
        'tests/',
        '.next/',
        'supabase/',
        'deploy/',
        '**/*.config.*',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      // '@' maps to the project root so '@/src/...' and '@/...' both resolve
      '@': resolve(__dirname, '.'),
      // Allow bare '@/src' imports as shorthand for 'src/'
      '@src': resolve(__dirname, './src'),
    },
  },
})
