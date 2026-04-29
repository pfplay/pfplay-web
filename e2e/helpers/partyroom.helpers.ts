import path from 'path';
import { Browser, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '../.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_HOST_NAME ?? 'https://dev-api.pfplay.xyz/api/';
const USER_PREFERENCES_STORAGE_KEY = 'user-preferences';
const DJING_DIALOG_CLOSE_SELECTOR = '[data-testid="djing-dialog-close"]';
const DJING_DIALOG_CLOSE_SELECTOR_EMPTY = '[id^="headlessui-dialog-panel-"] > header > button'; // empty dj 모달일 때 data-testid 미연결 되어있기 때문에 임시 조치

export async function enterPartyroomAndWaitUntilReady(page: Page, partyroomUrl: string) {
  if (page.url() !== partyroomUrl) {
    await page.goto(partyroomUrl);
  }

  await expect(page.getByRole('button', { name: /DJ Queue/i })).toBeVisible({ timeout: 15_000 });
}

export async function openDjQueueDrawer(page: Page) {
  const djQueueButton = page.locator('[data-testid="dj-queue-button"]');
  await expect(djQueueButton).toBeVisible({ timeout: 30_000 });
  await expect(djQueueButton).toBeEnabled({ timeout: 40_000 });

  await djQueueButton.click({ force: true }); // 알 수 없는 이유로 실패함
  await page.evaluate(() => {
    const button = document.querySelector(
      '[data-testid="dj-queue-button"]'
    ) as HTMLButtonElement | null;
    button?.click();
  });

  await expect
    .poll(
      async () =>
        (await page
          .locator(DJING_DIALOG_CLOSE_SELECTOR)
          .isVisible()
          .catch(() => false)) ||
        (await page
          .locator(DJING_DIALOG_CLOSE_SELECTOR_EMPTY)
          .isVisible()
          .catch(() => false)),
      { timeout: 10_000 }
    )
    .toBe(true);
}

export async function createPlaylistWithTracks(page: Page, playlistName: string) {
  await page.locator('[data-testid="playlist-sidebar-button"]').click();
  await expect(page.locator('[data-testid="add-playlist-button"]')).toBeVisible({ timeout: 5_000 });
  await page.locator('[data-testid="add-playlist-button"]').click();
  await expect(page.locator('[role="dialog"] input[name="name"]')).toBeVisible({ timeout: 5_000 });
  await page.locator('[role="dialog"] input[name="name"]').fill(playlistName);
  await page.locator('[data-testid="playlist-form-add-button"]').click();
  await page.locator(`[data-testid="playlist-list-item"]:has-text("${playlistName}")`).click();
  await page.locator('[data-testid="add-song-button"]').click();
  await expect(page.locator('[data-testid="music-search-input"]')).toBeVisible({ timeout: 5_000 });
  await page.locator('[data-testid="music-search-input"]').fill('new jeans');
  await page.waitForTimeout(1_000);
  const trackAddButtons = page.locator('[data-testid="track-add-button"]');
  await expect(trackAddButtons.nth(2)).toBeVisible({ timeout: 15_000 });
  for (let i = 0; i < 3; i++) {
    await trackAddButtons.nth(i).click();
    await page.waitForTimeout(300);
  }
  await page.locator('[data-testid="music-search-close"]').click();
  await page.locator('[data-testid="drawer-close-button"]').click();
}

export async function registerAsDj(page: Page, playlistName?: string) {
  await openDjQueueDrawer(page);

  const registerButton = page.locator('[data-testid="register-dj-queue"]');
  const closeButton = page.locator(DJING_DIALOG_CLOSE_SELECTOR);
  await expect(registerButton).toBeVisible({ timeout: 10_000 });
  await expect(registerButton).toBeEnabled({ timeout: 10_000 });
  await registerButton.click({ force: true });

  const confirmButton = page.locator('[data-testid="playlist-confirm"]');
  await expect(confirmButton).toBeVisible({ timeout: 15_000 });

  const playlistItems = page.locator('[data-testid="select-playlist-item"]');
  await expect(playlistItems.first()).toBeVisible({ timeout: 15_000 });

  const playlistItem = playlistName
    ? page.locator(`[data-testid="select-playlist-item"]:has-text("${playlistName}")`)
    : playlistItems.first();
  await expect(playlistItem).toBeVisible({ timeout: 15_000 });
  await playlistItem.click({ force: true });
  await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
  await confirmButton.click({ force: true });
  await dismissDjingGuide(page);

  await closeButton.click({ force: true });
}

export async function unregisterAsDj(page: Page) {
  await openDjQueueDrawer(page);

  const unregisterButton = page.locator('[data-testid="unregister-dj-queue"]');
  await expect(page.locator('[data-testid="current-dj-item"]')).toBeVisible({
    timeout: 30_000,
  });
  await expect(unregisterButton).toBeVisible({
    timeout: 30_000,
  });
  await expect(unregisterButton).toBeEnabled({
    timeout: 30_000,
  });
  await unregisterButton.click({ force: true });

  const confirmButton = page.getByRole('button', { name: 'Confirm' });
  await expect(confirmButton).toBeVisible({ timeout: 10_000 });
  await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
  await confirmButton.click({ force: true });

  const closeButton = page.locator(DJING_DIALOG_CLOSE_SELECTOR);
  await closeButton.click({ force: true });
}

export async function dismissDjingGuide(page: Page) {
  if (await isDjingGuideHidden(page)) {
    return;
  }

  const dontShowAgainBtn = page.locator('[data-testid="dont-show-again-button"]');
  await expect(dontShowAgainBtn).toBeVisible({ timeout: 10_000 });
  await dontShowAgainBtn.click();
}

async function isDjingGuideHidden(page: Page) {
  return page.evaluate((key) => {
    const preferences = localStorage.getItem(key);
    if (!preferences) {
      return false;
    }

    try {
      return JSON.parse(preferences)?.state?.djingGuideHidden === true;
    } catch {
      return false;
    }
  }, USER_PREFERENCES_STORAGE_KEY);
}

export async function leavePartyroom(page: Page) {
  if (page.isClosed() || !/\/parties\/\d+/.test(page.url())) {
    return;
  }

  const exitRequest = page
    .waitForResponse(
      (response) =>
        response.request().method() === 'DELETE' &&
        /\/v1\/partyrooms\/\d+\/crews\/me$/.test(response.url()),
      { timeout: 10_000 }
    )
    .catch(() => null);

  await page.goto('/parties');
  await exitRequest;
  await page.waitForURL(/\/parties$/, { timeout: 10_000 });
}

export async function closePartyroom(page: Page, partyroomUrl = page.url()) {
  const partyroomId = partyroomUrl.match(/\/parties\/(\d+)/)?.[1];
  if (!partyroomId) {
    return;
  }

  const response = await page.request.delete(
    new URL(`v1/partyrooms/${partyroomId}`, API_BASE_URL).toString()
  );
  // STG cleanup에서는 세션 전파/만료 타이밍 차이로 401이 날 수 있다.
  // 정리 실패가 본 시나리오 검증 결과를 가리면 안 되므로 허용한다.
  expect([200, 204, 401, 404]).toContain(response.status());

  if (!page.isClosed()) {
    await page.goto('/parties');
    await page.waitForURL(/\/parties$/, { timeout: 10_000 });
  }
}

export async function setupUserPlaylist(
  browser: Browser,
  storageFile: string,
  playlistName: string
) {
  const ctx = await browser.newContext({
    storageState: path.join(AUTH_DIR, storageFile),
    ignoreHTTPSErrors: true,
  });
  await ctx.addInitScript(ETHEREUM_MOCK_SCRIPT);
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/parties`);
  await createPlaylistWithTracks(page, playlistName);
  await ctx.close();
}
