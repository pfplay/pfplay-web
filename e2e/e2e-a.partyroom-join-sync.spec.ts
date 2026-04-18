import { expect, test } from './fixtures/auth.fixtures';

/**
 * E2E-A: 파티룸 생성 + Late Join State Sync
 *
 * 검증: 재생 중인 파티룸에 늦게 입장한 User2가
 *       getSetupInfo 초기 상태 스냅샷을 수신해 VideoTitle에 동일한 곡명 표시
 *
 * 기준: A (Auth→파티룸입장→WS구독 체인) + D (window.ethereum mock 주입)
 */
test('User2(late join)는 User1이 재생 중인 곡과 동일한 곡을 player에서 본다', async ({
  user1Context,
  user2Context,
}) => {
  const page1 = await user1Context.newPage();
  await page1.goto('/parties');

  // ─── User1: 파티룸 생성 ────────────────────────────────────────────
  await page1.locator('[data-testid="create-partyroom-button"]').click();
  const uniqueName = `E2E-A ${Date.now()}`;
  await page1.locator('input[name="name"]').fill(uniqueName);
  await page1.locator('textarea[name="introduce"]').fill('e2e test room');
  await page1.locator('button[type="submit"]').click();
  await page1.waitForURL(/\/parties\/\d+/, { timeout: 20_000 });

  const partyroomUrl = page1.url();
  expect(partyroomUrl).toMatch(/\/parties\/\d+/);

  // ─── User1: DJ 등록 + 곡 재생 ──────────────────────────────────────
  // STOMP 구독 완료 대기 후 DJ Queue 버튼 클릭
  await page1.locator('[data-testid="dj-queue-button"]').click();
  await expect(page1.locator('[data-testid="register-dj-queue"]')).toBeVisible({
    timeout: 15_000,
  });
  await page1.locator('[data-testid="register-dj-queue"]').click();

  // 플레이리스트 선택 다이얼로그: 첫 번째 항목 선택 후 확인
  await expect(page1.locator('[role="dialog"] li').first()).toBeVisible({ timeout: 10_000 });
  await page1.locator('[role="dialog"] li').first().click();
  await page1.locator('[role="dialog"] button:has-text("Confirm")').click();

  // PLAYBACK_STARTED WS 이벤트 → VideoTitle에 곡명 표시
  const videoTitle1 = page1.locator('[data-testid="video-title"]');
  await expect(videoTitle1).toBeVisible({ timeout: 25_000 });
  const songName = await videoTitle1.textContent();
  expect(songName).toBeTruthy();

  // ─── User2: 동일 파티룸 입장 (late join) ──────────────────────────
  const page2 = await user2Context.newPage();
  await page2.goto(partyroomUrl);

  // getSetupInfo 응답 → store.playback 세팅 → VideoTitle 렌더
  const videoTitle2 = page2.locator('[data-testid="video-title"]');
  await expect(videoTitle2).toHaveText(songName ?? '', { timeout: 20_000 });
});
