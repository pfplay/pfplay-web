import path from 'path';
import { Browser, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { ETHEREUM_MOCK_SCRIPT } from '../fixtures/ethereum-mock';

const AUTH_DIR = path.join(__dirname, '../.auth');
const BASE_URL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';

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
  await page.locator('[data-testid="dj-queue-button"]').click();
  await expect(page.locator('[data-testid="register-dj-queue"]')).toBeVisible({ timeout: 10_000 });
  await page.locator('[data-testid="register-dj-queue"]').click();
  await expect(
    page.locator(`[data-testid="select-playlist-item"]:has-text("${playlistName}")`)
  ).toBeVisible({ timeout: 15_000 });
  await page.locator(`[data-testid="select-playlist-item"]:has-text("${playlistName}")`).click();
  await page.locator('[data-testid="playlist-confirm"]').click();
  await page.locator('[data-testid="djing-guide-confirm-button"]').click();

  const dontShowAgainBtn = page.locator('[data-testid="dont-show-again-button"]');
  if (await dontShowAgainBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await dontShowAgainBtn.click();
  }

  const djingDialogClose = page.locator('[data-testid="djing-dialog-close"]');
  if (await djingDialogClose.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await djingDialogClose.click();
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
