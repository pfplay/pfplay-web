import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      // issue #372: `server-only` 패키지는 default export 가 throw, react-server condition 에만
      // empty.js 노출. vitest 는 react-server condition 을 적용하지 않으므로 server-env 모듈
      // import 시 throw. test 환경에서 empty noop 으로 매핑하여 server-env 단위 테스트 가능.
      // package exports 가 './empty' subpath 를 노출하지 않아 절대 경로 매핑.
      'server-only': path.resolve(__dirname, 'node_modules/server-only/empty.js'),
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
