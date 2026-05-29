import { expect, type Page } from '@playwright/test';

export const CHAT_SCROLL_TOLERANCE_PX = 10;
export const COLLAPSED_VIDEO_WIDTH = 80;
export const COLLAPSED_VIDEO_HEIGHT = 45;

export const mobilePartyroomName = () => `MOBILE-TOS-${Date.now()}`;
export const mobilePlaylistName = () => `mobile-tos-pl-${Date.now()}`;

export async function gotoMobileRoomAndWaitForVideo(page: Page, partyroomUrl: string) {
  await page.goto(partyroomUrl);
  await expect(page.getByTestId('video-wrapper')).toBeVisible({ timeout: 30_000 });
}

export async function expectIframeToBeOnScreen(page: Page) {
  const iframe = page.locator('iframe[src*="youtube.com/embed"]');
  await expect(iframe).toBeVisible();
  const box = await iframe.boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;
  expect(box.width).toBeGreaterThanOrEqual(COLLAPSED_VIDEO_WIDTH);
  expect(box.height).toBeGreaterThanOrEqual(COLLAPSED_VIDEO_HEIGHT);
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();
  if (!viewport) return;
  expect(box.x).toBeGreaterThan(-box.width);
  expect(box.y).toBeGreaterThan(-box.height);
  expect(box.x).toBeLessThan(viewport.width);
  expect(box.y).toBeLessThan(viewport.height);
}

export async function expectIframeNotVisuallyHidden(page: Page) {
  const result = await page.locator('iframe[src*="youtube.com/embed"]').evaluate((el) => {
    const style = window.getComputedStyle(el);
    return { opacity: parseFloat(style.opacity), visibility: style.visibility };
  });
  expect(result.visibility).not.toBe('hidden');
  expect(result.opacity).toBeGreaterThan(0);
}
