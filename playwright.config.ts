import path from 'path';
import { defineConfig, devices } from '@playwright/test';

// 로그인 세션 저장해두고 테스트에서 재사용하려고 쓰는 경로
export const AUTH_STATE_DIR = path.join(__dirname, 'e2e/.auth');

export default defineConfig({
  // e2e 테스트 파일들 여기서 찾음
  testDir: './e2e',

  // 테스트 파일 당 최대 60초
  timeout: 60_000,

  // expect 체크도 최대 15초
  expect: { timeout: 15_000 },

  // 테스트 파일 동시 병렬 처리 비활성화
  fullyParallel: false,

  // 디버깅 용으로 test.only 남아있다면 바로 실패 처리
  forbidOnly: !!process.env.CI,

  // 재시도 횟수 (예상 못한 flaky 방지용)
  retries: process.env.CI ? 1 : 0,

  // 테스트 작업 나눠서 돌릴 워커 수
  // CI 의 cross-region + cold-start 환경에서 2 workers 가 동일 백엔드/Vercel 을
  // 동시 hit 하면 워밍 안 된 상태에서 상호 간섭으로 flake 가 발생한다. 총 소요
  // 시간이 늘더라도 안정성 우선으로 CI 도 1 worker 로 직렬화.
  workers: 1,

  // 테스트 결과 출력할 형식
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'https://localhost:3000',
    // 실패해서 재시도할 때만 trace/video  남김
    trace: 'on-first-retry',
    video: 'on-first-retry',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
      : {},
  },

  projects: [
    {
      name: 'auth-a',
      testMatch: /auth\/setup\.a\.ts/,
      teardown: undefined,
    },
    {
      name: 'auth-b',
      testMatch: /auth\/setup\.b\.ts/,
      teardown: undefined,
    },
    {
      name: 'auth-c',
      testMatch: /auth\/setup\.c\.ts/,
      teardown: undefined,
    },
    {
      name: 'auth-d',
      testMatch: /auth\/setup\.d\.ts/,
      teardown: undefined,
    },
    {
      name: 'e2e-a',
      testMatch: /e2e-a\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-a'],
    },
    {
      name: 'e2e-b',
      testMatch: /e2e-b\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-b'],
    },
    {
      name: 'e2e-c',
      testMatch: /e2e-c\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-c'],
    },
    {
      name: 'e2e-d',
      testMatch: /e2e-d\..*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['auth-d'],
    },
    {
      name: 'display-board-tos-mobile',
      testMatch: /mobile\/display-board\.tos\.spec\.ts/,
      // iPhone 13 viewport (390×844) + 모바일 UA 보존, browserName 만 chromium 으로 override.
      // CI workflow 의 `npx playwright install --with-deps chromium` 이 chromium 만 설치하므로
      // 기본 `browserName='webkit'` 가 launch 실패함 (`webkit-2272/pw_run.sh` not found).
      // ToS 가드의 본질은 viewport/IFrame DOM 단언이라 engine 영향 미미 — 다른 e2e-a~d project 와 동일 browser 사용.
      use: { ...devices['iPhone 13'], browserName: 'chromium' },
      dependencies: ['auth-a'],
    },
  ],
});
