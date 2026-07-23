import path from 'path';
import type { Browser, BrowserContext, Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';
import {
  closePartyroom,
  createPartyroom,
  enterPartyroomAndWaitUntilReady,
  leavePartyroom,
} from './helpers/partyroom.helpers';

/**
 * E2E-A: 멀티 디바이스 세션 승계 UX (#476)
 *
 * platform#369(SESSION_SUPERSEDED 발행) + web#477(getMyActiveRoom 스냅샷)과 세트.
 * ⚠️ 라이브 실행에는 #477(/me/active) + #369(알림)를 모두 포함한 백엔드가 필요하다.
 *
 * 두 흐름을 검증한다:
 *   1) 새 기기 사전 컨펌: 다른 세션이 활성 방 점유 중일 때 입장 전 확인 다이얼로그, 취소 시 미입장
 *   2) 밀려난 브라우저 모달: 다른 기기가 입장해 이 방이 밀려나면 안내 모달 + 로비 이동(재연결 불필요)
 */

const AUTH_DIR = path.join(__dirname, '.auth');

async function makeContext(browser: Browser, storageFile: string): Promise<BrowserContext> {
  const ctx = await browser.newContext({
    storageState: path.join(AUTH_DIR, storageFile),
    ignoreHTTPSErrors: true,
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  return ctx;
}

const subscribedRoomId = (page: Page) =>
  page.evaluate(
    () =>
      (window as Window & { __PFPLAY_E2E__?: { subscribedRoomId?: number } }).__PFPLAY_E2E__
        ?.subscribedRoomId
  );

test('사전 컨펌: 다른 기기가 활성 방 점유 중 → 새 기기 입장 시 확인, 취소하면 입장하지 않는다', async ({
  browser,
}) => {
  test.setTimeout(120_000);

  const hostCtx = await makeContext(browser, 'a-user2.json');
  const ctxA = await makeContext(browser, 'a-user1.json');
  const ctxB = await makeContext(browser, 'a-user1.json');
  const hostPage = await hostCtx.newPage();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  let roomXUrl: string | undefined;
  let roomYUrl: string | undefined;

  try {
    // host(user2) 방 Y 준비
    await hostPage.goto('/parties');
    roomYUrl = await createPartyroom(hostPage, `Y${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(hostPage, roomYUrl);

    // device A(user1) 방 X 입장 (활성 방 점유)
    await pageA.goto('/parties');
    roomXUrl = await createPartyroom(pageA, `X${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(pageA, roomXUrl);
    const idX = Number(roomXUrl.match(/\/parties\/(\d+)/)?.[1]);

    // device B(user1, 새 세션) 방 Y 로 이동 → 사전 컨펌 노출
    await pageB.goto(roomYUrl);
    const confirmDialog = pageB.locator('[data-testid="dialog-panel"]').first();
    await expect(confirmDialog).toBeVisible({ timeout: 15_000 });
    // 취소 → 입장하지 않고 로비로
    await confirmDialog.locator('[data-testid="confirm-dialog-cancel-button"]').click();
    await pageB.waitForURL(/\/parties(?:\?.*)?$/, { timeout: 15_000 });

    // A 는 여전히 방 X 유지 (B 가 밀어내지 않았다)
    await expect.poll(() => subscribedRoomId(pageA), { timeout: 10_000 }).toBe(idX);
  } finally {
    await leavePartyroom(pageB).catch(() => null);
    await (roomXUrl ? closePartyroom(pageA, roomXUrl) : leavePartyroom(pageA)).catch(() => null);
    await (roomYUrl ? closePartyroom(hostPage, roomYUrl) : leavePartyroom(hostPage)).catch(
      () => null
    );
    await Promise.all([hostCtx, ctxA, ctxB].map((c) => c.close().catch(() => null)));
  }
});

test('밀려난 모달: 다른 기기가 입장해 이 방이 밀려나면 안내 모달 + 로비 이동 (재연결 불필요)', async ({
  browser,
}) => {
  test.setTimeout(120_000);

  const hostCtx = await makeContext(browser, 'a-user2.json');
  const ctxA = await makeContext(browser, 'a-user1.json');
  const ctxB = await makeContext(browser, 'a-user1.json');
  const hostPage = await hostCtx.newPage();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  let roomXUrl: string | undefined;
  let roomYUrl: string | undefined;

  try {
    await hostPage.goto('/parties');
    roomYUrl = await createPartyroom(hostPage, `Y${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(hostPage, roomYUrl);
    const idY = Number(roomYUrl.match(/\/parties\/(\d+)/)?.[1]);

    // device A(user1) 방 X 입장 후 접속 유지
    await pageA.goto('/parties');
    roomXUrl = await createPartyroom(pageA, `X${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(pageA, roomXUrl);

    // device B(user1) 방 Y 입장 — 사전 컨펌이 뜨면 승인하고 진행
    await pageB.goto(roomYUrl);
    const confirmDialog = pageB.locator('[data-testid="dialog-panel"]').first();
    if (await confirmDialog.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await confirmDialog.locator('[data-testid="confirm-dialog-confirm-button"]').click();
    }
    await expect.poll(() => subscribedRoomId(pageB), { timeout: 15_000 }).toBe(idY);

    // ★ A 는 SESSION_SUPERSEDED 수신 → 안내 모달 노출 + 로비 이동 (오프라인/재연결 없이)
    const alertDialog = pageA.locator('[data-testid="dialog-panel"]').first();
    await expect(alertDialog).toBeVisible({ timeout: 15_000 });
    await pageA.waitForURL(/\/parties(?:\?.*)?$/, { timeout: 15_000 });
  } finally {
    await leavePartyroom(pageB).catch(() => null);
    await (roomXUrl ? closePartyroom(pageA, roomXUrl) : leavePartyroom(pageA)).catch(() => null);
    await (roomYUrl ? closePartyroom(hostPage, roomYUrl) : leavePartyroom(hostPage)).catch(
      () => null
    );
    await Promise.all([hostCtx, ctxA, ctxB].map((c) => c.close().catch(() => null)));
  }
});
