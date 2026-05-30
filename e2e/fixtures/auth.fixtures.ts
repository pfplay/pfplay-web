import path from 'path';
import { BrowserContext, test as baseTest } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from './ethereum-mock';

const AUTH_DIR = path.join(__dirname, '../.auth');

type AuthFixtures = {
  user1Context: BrowserContext;
  user2Context: BrowserContext;
};

/**
 * 인증된 브라우저 컨텍스트를 제공하는 fixture.
 * auth.setup.ts가 저장한 storageState를 복원하여
 * 모든 테스트가 로그인 상태에서 시작.
 */
export const test = baseTest.extend<AuthFixtures>({
  user1Context: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, `${getAuthPrefix(testInfo.file)}-user1.json`),
      ignoreHTTPSErrors: true,
    });
    await context.addInitScript(ETHEREUM_MOCK_SCRIPT);
    await use(context);
    await context.close();
  },

  user2Context: async ({ browser }, use, testInfo) => {
    const context = await browser.newContext({
      storageState: path.join(AUTH_DIR, `${getAuthPrefix(testInfo.file)}-user2.json`),
      ignoreHTTPSErrors: true,
    });
    await context.addInitScript(ETHEREUM_MOCK_SCRIPT);
    await use(context);
    await context.close();
  },
});

export { expect } from '@playwright/test';

function getAuthPrefix(testFile: string) {
  if (testFile.includes('e2e-a.')) {
    return 'a';
  }

  if (testFile.includes('e2e-b.')) {
    return 'b';
  }

  if (testFile.includes('e2e-c.')) {
    return 'c';
  }

  if (testFile.includes('e2e-d.')) {
    return 'd';
  }

  // chunk 3.1 + chunk 4 — 모든 mobile/ 경로 spec 은 user A storage state 재사용.
  if (testFile.includes('mobile/') || testFile.includes('mobile\\')) {
    return 'a';
  }

  throw new Error(`No auth prefix configured for test file: ${testFile}`);
}
