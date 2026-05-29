import { expect } from '@playwright/test';
import {
  CHAT_SCROLL_TOLERANCE_PX,
  COLLAPSED_VIDEO_HEIGHT,
  COLLAPSED_VIDEO_WIDTH,
  expectIframeNotVisuallyHidden,
  expectIframeToBeOnScreen,
  gotoMobileRoomAndWaitForVideo,
  mobilePartyroomName,
  mobilePlaylistName,
} from './display-board.helpers';
import { test } from '../fixtures/auth.fixtures';
import {
  closePartyroom,
  createPartyroom,
  createPlaylistWithTracks,
  enterPartyroomAndWaitUntilReady,
  registerAsDj,
} from '../helpers/partyroom.helpers';

/**
 * chunk 3.1 spec §5 — ToS 보존 가드 (Playwright headed, mandatory CI).
 *
 * iPhone 13 (390×844) 단일 매트릭스 — 추가 viewport (SE / Pixel) 는 후속 polish.
 * 세션 cleanup: 각 케이스는 createPartyroom 으로 신규 룸 + 끝에 closePartyroom.
 */

test('Mode A 진입: IFrame visible + boundingBox ≥ 80×45 + viewport 안 + 시각 hidden 아님', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);

  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  await expectIframeToBeOnScreen(page);
  await expectIframeNotVisuallyHidden(page);

  await closePartyroom(page);
});

test('Mode A → Mode B 토글: wrapper 80×45 정확값 + IFrame 여전히 visible + DOM identity 보존', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  const iframeBefore = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  expect(iframeBefore).not.toBeNull();

  await page.getByRole('button', { name: '영상 가리기' }).click();
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();

  const wrapper = page.getByTestId('video-wrapper');
  const wrapperBox = await wrapper.boundingBox();
  expect(wrapperBox).not.toBeNull();
  if (!wrapperBox) return;
  expect(Math.round(wrapperBox.width)).toBe(COLLAPSED_VIDEO_WIDTH);
  expect(Math.round(wrapperBox.height)).toBe(COLLAPSED_VIDEO_HEIGHT);

  await expectIframeNotVisuallyHidden(page);

  const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  expect(iframeAfter).not.toBeNull();
  const sameElement = await page.evaluate(([a, b]) => a === b, [iframeBefore, iframeAfter]);
  expect(sameElement).toBe(true);

  await closePartyroom(page);
});

test('Mode B → Mode A 복귀: IFrame 동일 element + 16:9 wrapper 복귀', async ({ user1Context }) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  const iframeInitial = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();

  await page.getByRole('button', { name: '영상 가리기' }).click();
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
  await page.getByRole('button', { name: '영상 펼치기' }).click();
  await expect(page.getByRole('button', { name: '영상 가리기' })).toBeVisible();

  const wrapper = page.getByTestId('video-wrapper');
  await expect(wrapper).toHaveClass(/aspect-video/);

  const iframeAfter = await page.locator('iframe[src*="youtube.com/embed"]').elementHandle();
  const sameElement = await page.evaluate(([a, b]) => a === b, [iframeInitial, iframeAfter]);
  expect(sameElement).toBe(true);

  await closePartyroom(page);
});

test('Mode C (재생 없음): BlankPlaceholder visible + IFrame 미존재', async ({ user1Context }) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);

  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  await expect(page.getByTestId('blank-placeholder')).toBeVisible();
  await expect(page.locator('iframe[src*="youtube.com/embed"]')).toHaveCount(0);

  await closePartyroom(page);
});

test('sticky-top 높이 변화 시 chat scroll offset ≤ CHAT_SCROLL_TOLERANCE_PX 보존', async ({
  user1Context,
}) => {
  test.setTimeout(120_000);
  const page = await user1Context.newPage();

  const partyroomUrl = await createPartyroom(page, mobilePartyroomName());
  await enterPartyroomAndWaitUntilReady(page, partyroomUrl);
  await createPlaylistWithTracks(page, mobilePlaylistName());
  await registerAsDj(page);
  await gotoMobileRoomAndWaitForVideo(page, partyroomUrl);

  const chatTab = page.getByRole('tab', { name: /채팅/ }).first();
  if (await chatTab.isVisible().catch(() => false)) {
    await chatTab.click();
  }

  const chatContainer = page.locator('[data-tab-content="chat"]').first();
  await expect(chatContainer).toBeVisible();

  await page.waitForTimeout(500);

  const scrollBefore = await chatContainer.evaluate((el) => el.scrollTop);

  await page.getByRole('button', { name: '영상 가리기' }).click();
  await expect(page.getByRole('button', { name: '영상 펼치기' })).toBeVisible();
  await page.waitForTimeout(300);

  const scrollAfter = await chatContainer.evaluate((el) => el.scrollTop);

  const delta = Math.abs(scrollAfter - scrollBefore);
  expect(delta).toBeLessThanOrEqual(CHAT_SCROLL_TOLERANCE_PX);

  await closePartyroom(page);
});
