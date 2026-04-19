import path from 'path';
import { Browser, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '../.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_HOST_NAME ?? 'https://dev-api.pfplay.xyz/api/';

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

export async function registerAsDj(page: Page, playlistName: string) {
  const djQueueButton = page.locator('[data-testid="dj-queue-button"]');
  if (await djQueueButton.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await djQueueButton.click();
  } else {
    await page.getByRole('button', { name: /DJ Queue/i }).click();
  }

  await expect(page.locator('[data-testid="register-dj-queue"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('[data-testid="register-dj-queue"]').click();
  await expect(
    page.locator(`[data-testid="select-playlist-item"]:has-text("${playlistName}")`)
  ).toBeVisible({ timeout: 15_000 });
  await page.locator(`[data-testid="select-playlist-item"]:has-text("${playlistName}")`).click();

  const registration = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      /\/v1\/partyrooms\/\d+\/dj-queue$/.test(response.url()),
    { timeout: 15_000 }
  );
  await page.locator('[data-testid="playlist-confirm"]').click();
  await expect((await registration).status()).toBeLessThan(400);

  await page.locator('[data-testid="djing-guide-confirm-button"]').click({ force: true });

  const dontShowAgainBtn = page.locator('[data-testid="dont-show-again-button"]');
  if (await dontShowAgainBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await dontShowAgainBtn.click({ force: true });
  }

  const djingDialogClose = page.locator('[data-testid="djing-dialog-close"]');
  if (await djingDialogClose.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await djingDialogClose.click({ force: true });
  }
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
  expect([200, 204, 404]).toContain(response.status());

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
