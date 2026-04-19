import path from 'path';
import { defineConfig, devices } from '@playwright/test';

// 로그인 세션 저장해두고 테스트에서 재사용하려고 쓰는 경로
export const AUTH_STATE_DIR = path.join(__dirname, 'e2e/.auth');

export default defineConfig({
  // e2e 테스트 파일들 여기서 찾음
  testDir: './e2e',

  // 테스트 파일 당 최대 60초
  timeout: 6000_000,

  // expect 체크도 최대 15초
  expect: { timeout: 1500_000 },

  // 테스트 파일 동시 병렬 처리 비활성화
  fullyParallel: false,

  // 디버깅 용으로 test.only 남아있다면 바로 실패 처리
  forbidOnly: !!process.env.CI,

  // 재시도 횟수 (예상 못한 flaky 방지용)
  retries: process.env.CI ? 1 : 0,

  // 테스트 작업 나눠서 돌릴 워커 수
  workers: 1,

  // 테스트 결과 출력할 형식
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:3000',
    // 실패해서 재시도할 때만 trace/video  남김
    trace: 'on-first-retry',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
      teardown: undefined,
    },
    {
      name: 'e2e',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-setup'],
    },
  ],
});
