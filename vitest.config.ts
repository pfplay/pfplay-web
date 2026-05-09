import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'eslint-custom-plugin/**/*.test.{js,ts}'],
    exclude: ['e2e/**'],
    css: false,
    env: {
      NEXT_PUBLIC_API_HOST_NAME: 'http://localhost:8080/api/',
    },
  },
});
