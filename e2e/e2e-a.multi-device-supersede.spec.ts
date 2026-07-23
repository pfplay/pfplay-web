import path from 'path';
import type { BrowserContext, Page } from '@playwright/test';
import { expect, test } from './fixtures/auth.fixtures';
import { ETHEREUM_MOCK_SCRIPT } from './fixtures/ethereum-mock';
import {
  closePartyroom,
  createPartyroom,
  enterPartyroomAndWaitUntilReady,
  leavePartyroom,
} from './helpers/partyroom.helpers';

/**
 * E2E-A: 멀티 디바이스 세션 승계 — 재연결 시 되훔침(핑퐁) 금지 (#477)
 *
 * 정책: new-session-wins. 같은 계정이 다른 기기에서 방에 입장하면 서버가 이전 기기의 crew 를
 * 자동 EXIT(autoExit)한다. 이때 위험한 함정은, 밀려난(옛) 기기가 WS 재연결하는 순간
 * 재연결 핸들러가 "기억하던 방"을 tryEnter 로 재주장해 새 기기의 방을 역으로 밀어내는
 * 세션 되훔침(핑퐁)이다.
 *
 * #477 은 재연결 resync 를 tryEnter 재주장 대신 서버 권위 스냅샷(GET /me/active) 조회 후
 * 분기로 바꿨다. 이 테스트는 되훔침이 사라졌음을 증명한다:
 *
 *   1. host(user2): 방 Y 생성·입장·유지
 *   2. device A(user1): 방 X 생성·입장 (active crew in X)
 *   3. device A: 오프라인 (WS 단절)
 *   4. device B(user1, 같은 계정): 방 Y 입장 → 서버가 user1 을 X 에서 autoExit, 이제 Y 가 활성 방
 *   5. device A: 온라인 (WS 재연결) → resync 는 스냅샷(Y ≠ X)을 보고 X 를 재점유하지 않고 로비로 이탈
 *
 * 검증: device A 는 로비(/parties)로 이탈하고 방 X 를 재점유하지 않으며,
 *      device B 는 방 Y 구독을 유지한다(되훔김 없음).
 */
test('멀티 디바이스 승계: 밀려난 기기가 재연결해도 옛 방을 되훔치지 않고 로비로 이탈한다', async ({
  browser,
}) => {
  test.setTimeout(150_000);

  const startedAt = Date.now();
  const log = (message: string) => {
    const elapsed = `${Date.now() - startedAt}ms`.padStart(8, ' ');
    console.log(`[E2E-supersede][${elapsed}] ${message}`);
  };

  const AUTH_DIR = path.join(__dirname, '.auth');
  const makeContext = async (storageFile: string) => {
    const ctx = await browser.newContext({
      storageState: path.join(AUTH_DIR, storageFile),
      ignoreHTTPSErrors: true,
    });
    await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
    return ctx;
  };

  const subscribedRoomId = (page: Page) =>
    page.evaluate(
      () =>
        (window as Window & { __PFPLAY_E2E__?: { subscribedRoomId?: number } }).__PFPLAY_E2E__
          ?.subscribedRoomId
    );

  // host(user2) + device A/B(user1, 같은 계정 두 기기)
  const hostCtx = await makeContext('a-user2.json');
  const ctxA = await makeContext('a-user1.json');
  const ctxB = await makeContext('a-user1.json');

  const hostPage = await hostCtx.newPage();
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  let roomXUrl: string | undefined;
  let roomYUrl: string | undefined;

  try {
    // ─── host(user2): 방 Y 생성·입장 ───────────────────────────────────
    await hostPage.goto('/parties');
    roomYUrl = await createPartyroom(hostPage, `Y${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(hostPage, roomYUrl);
    const idY = Number(roomYUrl.match(/\/parties\/(\d+)/)?.[1]);
    log(`host created+entered room Y=${idY}`);

    // ─── device A(user1): 방 X 생성·입장 ──────────────────────────────
    await pageA.goto('/parties');
    roomXUrl = await createPartyroom(pageA, `X${Date.now().toString(36)}`);
    await enterPartyroomAndWaitUntilReady(pageA, roomXUrl);
    const idX = Number(roomXUrl.match(/\/parties\/(\d+)/)?.[1]);
    expect(await subscribedRoomId(pageA)).toBe(idX);
    log(`device A created+entered room X=${idX}`);

    // ─── device A: 오프라인 (WS 단절) ─────────────────────────────────
    await ctxA.setOffline(true);
    log('device A offline (WS dropped)');

    // ─── device B(user1): 방 Y 입장 → 서버가 user1 을 X 에서 autoExit ──
    await pageB.goto('/parties');
    await enterPartyroomAndWaitUntilReady(pageB, roomYUrl);
    expect(await subscribedRoomId(pageB)).toBe(idY);
    log(`device B(user1) entered room Y=${idY} → server autoExits user1 from X`);

    // ─── device A: 온라인 (WS 재연결) → 스냅샷 분기로 로비 이탈 ────────
    await ctxA.setOffline(false);
    log('device A online — reconnecting, resync should snapshot Y≠X and leave to lobby');

    // ★ 핵심: A 는 X 를 재점유하지 않고 로비로 이탈한다 (되훔침/핑퐁 없음).
    //   STOMP reconnectDelay(5s) + 스냅샷 조회 왕복을 고려해 넉넉한 타임아웃.
    await pageA.waitForURL(/\/parties$/, { timeout: 60_000 });
    log('device A left to lobby (did NOT re-occupy X) ✅');

    // ★ device B 는 여전히 Y 구독 유지 — A 의 재연결이 Y 를 되훔치지 않았다.
    await expect.poll(() => subscribedRoomId(pageB), { timeout: 10_000 }).toBe(idY);
    log('device B still subscribed to Y (no re-steal) ✅');
  } finally {
    log('cleanup');
    await leavePartyroom(pageB).catch(() => null);
    await (roomXUrl ? closePartyroom(pageA, roomXUrl) : leavePartyroom(pageA)).catch(() => null);
    await (roomYUrl ? closePartyroom(hostPage, roomYUrl) : leavePartyroom(hostPage)).catch(
      () => null
    );
    await Promise.all(
      [hostCtx, ctxA, ctxB].map((c: BrowserContext) => c.close().catch(() => null))
    );
  }
});
