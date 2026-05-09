import path from 'path';
import { Browser, Locator, Page } from '@playwright/test';
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

  const partyroomId = Number(partyroomUrl.match(/\/parties\/(\d+)/)?.[1]);
  await expect
    .poll(
      async () =>
        page.evaluate((id) => {
          return (
            (
              window as Window & {
                __PFPLAY_E2E__?: {
                  subscribedRoomId?: number;
                };
              }
            ).__PFPLAY_E2E__?.subscribedRoomId === id
          );
        }, partyroomId),
      { timeout: 20_000 }
    )
    .toBe(true);
}

export async function openDjQueueDrawer(page: Page) {
  const djQueueButton = page.getByRole('button', { name: /^dj queue$/i });
  await expect(djQueueButton).toBeVisible({ timeout: 30_000 });
  await expect(djQueueButton).toBeEnabled({ timeout: 40_000 });

  await djQueueButton.click({ force: true }); // 알 수 없는 이유로 실패함
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find((candidate) =>
      /dj queue/i.test(candidate.textContent?.trim() ?? '')
    ) as HTMLButtonElement | undefined;
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

function parseDurationToMinutes(text: string): number {
  const parts = text.trim().split(':').map(Number);
  if (parts.some((n) => Number.isNaN(n))) return Number.POSITIVE_INFINITY;
  if (parts.length === 3) return parts[0] * 60 + parts[1] + parts[2] / 60;
  if (parts.length === 2) return parts[0] + parts[1] / 60;
  return parts[0] / 60;
}

async function pickShortTrackIndices(
  page: Page,
  count: number,
  maxMinutes: number
): Promise<number[]> {
  const durations = page.locator('[data-testid="track-duration"]');
  const total = await durations.count();
  const indices: number[] = [];
  for (let i = 0; i < total; i++) {
    const text = (await durations.nth(i).textContent()) ?? '';
    if (parseDurationToMinutes(text) < maxMinutes) {
      indices.push(i);
      if (indices.length === count) break;
    }
  }
  if (indices.length < count) {
    throw new Error(
      `not enough tracks shorter than ${maxMinutes}min (found ${indices.length}/${count})`
    );
  }
  return indices;
}

export async function createPlaylistWithTracks(page: Page, playlistName: string) {
  await page.getByRole('button', { name: /^playlist$/i }).click();
  await expect(page.getByRole('button', { name: /add list/i })).toBeVisible({ timeout: 5_000 });
  await page.getByRole('button', { name: /add list/i }).click();

  const playlistNameInput = page.locator('[role="dialog"] input[name="name"]');
  await expect(playlistNameInput).toBeVisible({ timeout: 5_000 });
  await playlistNameInput.fill(playlistName);
  await page.getByRole('button', { name: /^add$/i }).click();

  await page.getByRole('button', { name: new RegExp(playlistName) }).click();
  await page.getByRole('button', { name: /add song/i }).click();

  const musicSearchInput = page.getByPlaceholder(/search|url/i);
  await expect(musicSearchInput).toBeVisible({ timeout: 5_000 });
  await musicSearchInput.fill('new jeans');
  await page.waitForTimeout(1_000);
  const trackAddButtons = page.locator('[data-testid="track-add-button"]');
  await expect(trackAddButtons.nth(2)).toBeVisible({ timeout: 15_000 });
  const shortIndices = await pickShortTrackIndices(page, 3, 5);
  for (const idx of shortIndices) {
    await trackAddButtons.nth(idx).click();
    await page.waitForTimeout(300);
  }
  await page.locator('[data-testid="music-search-close"]').click();
  await page.locator('[data-testid="drawer-close-button"]').click();
}

export async function createPartyroom(
  page: Page,
  partyroomName: string,
  introduction = 'e2e-test'
) {
  await page.getByRole('button', { name: /be a pfplay host/i }).click();
  await page.locator('input[name="name"]').fill(partyroomName);
  await page.locator('textarea[name="introduce"]').fill(introduction);
  await page.getByRole('button', { name: /create party/i }).click();
  await page.waitForURL(/\/parties\/\d+/, { timeout: 20_000 });

  return page.url();
}

export async function registerAsDj(page: Page, playlistName?: string) {
  await openDjQueueDrawer(page);

  const registerButton = page.getByRole('button', { name: /register.*dj queue|dj 대기 등록/i });
  const closeButton = page.locator(DJING_DIALOG_CLOSE_SELECTOR);
  await expect(registerButton).toBeVisible({ timeout: 10_000 });
  await expect(registerButton).toBeEnabled({ timeout: 10_000 });
  await registerButton.click({ force: true });

  const confirmButton = page.getByRole('button', { name: /^confirm$/i });
  await expect(confirmButton).toBeVisible({ timeout: 15_000 });

  const playlistItems = page.locator('[role="button"][data-testid="select-playlist-item"]');
  await expect(playlistItems.first()).toBeVisible({ timeout: 15_000 });

  const playlistItem = playlistName
    ? page.getByRole('button', { name: new RegExp(playlistName) })
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

  const unregisterButton = page.getByRole('button', {
    name: /cancel dj queue registration|dj 대기 등록 취소/i,
  });
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

export async function openPartyroomChatPanel(page: Page) {
  const chatTab = page.getByRole('tab', { name: /chat/i });
  await expect(chatTab).toBeVisible({ timeout: 10_000 });
  await chatTab.click();
  await expect(page.getByRole('textbox').last()).toBeVisible({ timeout: 10_000 });
}

export async function openPartyroomCrewsPanel(page: Page) {
  const crewsTab = page.locator('[data-testid="partyroomCrewsPanel-tab"]');
  await expect(crewsTab).toBeVisible({ timeout: 10_000 });
  await crewsTab.click();
  await expect(page.getByRole('tab', { name: /all/i })).toBeVisible({ timeout: 10_000 });
}

export async function openAllCrewsPanel(page: Page) {
  await openPartyroomCrewsPanel(page);

  const allCrewsTab = page.getByRole('tab', { name: /all/i });
  await expect(allCrewsTab).toBeVisible({ timeout: 10_000 });
  await allCrewsTab.click();
  await expandAllCrewCategories(page);
}

export async function openRestrictionPanel(page: Page) {
  await openPartyroomCrewsPanel(page);

  const restrictionTab = page.getByRole('tab', { name: /restriction/i });
  await expect(restrictionTab).toBeVisible({ timeout: 10_000 });
  await restrictionTab.click();
  await expect
    .poll(
      async () => {
        const emptyStateVisible = await page
          .getByText('There are no restrictions.')
          .isVisible()
          .catch(() => false);
        if (emptyStateVisible) return true;

        return page
          .locator('[data-testid^="restriction-category-"]')
          .first()
          .isVisible()
          .catch(() => false);
      },
      { timeout: 10_000 }
    )
    .toBe(true);
}

export async function openRestrictionCategory(
  page: Page,
  category: 'BLOCK' | 'PERMANENT_EXPULSION'
) {
  const categoryButton = page.locator(`[data-testid="restriction-category-${category}"]`);
  await expect(categoryButton).toBeVisible({ timeout: 10_000 });
  await categoryButton.click();
}

async function expandAllCrewCategories(page: Page) {
  const categoryButtons = page.locator('[data-testid^="all-crews-category-"]');
  const count = await categoryButtons.count();

  for (let i = 0; i < count; i++) {
    await categoryButtons.nth(i).click();
  }
}

export async function sendChatMessage(page: Page, message: string) {
  const chatInput = page.getByRole('textbox').last();
  await expect(chatInput).toBeVisible({ timeout: 10_000 });
  await chatInput.fill(message);
  await chatInput.press('Enter');
}

export async function openMyProfileDialog(page: Page) {
  const profileButton = page.getByRole('button', { name: /my profile/i });
  await expect(profileButton).toBeVisible({ timeout: 10_000 });
  await profileButton.evaluate((element) => {
    (element as HTMLButtonElement).click();
  });

  const dialog = page
    .locator('[data-testid="dialog-panel"]')
    .filter({ has: page.getByRole('button', { name: /avatar settings/i }) })
    .first();
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  return dialog;
}

export async function openAvatarSettingsFromMyProfile(page: Page) {
  const profileDialog = await openMyProfileDialog(page);
  const avatarSettingsButton = profileDialog.getByRole('button', { name: /avatar settings/i });
  await expect(avatarSettingsButton).toBeVisible({ timeout: 10_000 });
  await avatarSettingsButton.click();

  const avatarEditPanel = page.getByRole('tab', { name: /body/i });
  await expect(avatarEditPanel).toBeVisible({ timeout: 10_000 });
  return avatarEditPanel;
}

export async function selectAvatarBodyByIndex(page: Page, index: number) {
  const avatarItems = page.getByRole('button', { name: /Avatar Parts/i });
  await expect(avatarItems.nth(index)).toBeVisible({ timeout: 15_000 });

  const selectedItem = avatarItems.nth(index);
  const avatarItemContainer = selectedItem.locator('xpath=..');
  const avatarBodyUri = await avatarItemContainer.getAttribute('data-image-src');
  await selectedItem.click();
  await expect(avatarItemContainer).toHaveAttribute('data-selected', 'true', { timeout: 10_000 });

  const selectedPreview = page.locator('[data-testid="avatar-edit-selected-preview"]');
  await expect(selectedPreview).toHaveAttribute('data-avatar-body-uri', avatarBodyUri ?? '', {
    timeout: 10_000,
  });

  return avatarBodyUri ?? '';
}

export async function saveAvatarSettings(page: Page) {
  const saveButton = page.getByRole('button', { name: /save/i });
  await expect(saveButton).toBeEnabled({ timeout: 10_000 });
  await saveButton.click();
  await expect(saveButton).toBeHidden({ timeout: 20_000 });
  await closeVisibleDialogOverlays(page);
}

function getCurrentDj(page: Page) {
  return page.locator('[data-testid="partyroom-current-dj"]');
}

export async function getCurrentDjAvatarBodyUri(page: Page) {
  const currentDj = getCurrentDj(page);
  await expect(currentDj).toBeVisible({ timeout: 20_000 });
  return (await currentDj.getAttribute('data-avatar-body-uri')) ?? '';
}

export async function waitForCurrentDjAvatarBody(page: Page, avatarBodyUri: string) {
  const currentDj = getCurrentDj(page);
  await expect(currentDj).toHaveAttribute('data-avatar-body-uri', avatarBodyUri, {
    timeout: 20_000,
  });
}

export async function likeCurrentPlayback(page: Page) {
  const likeButton = page.locator('[data-testid="playback-like-button"]');
  await expect(likeButton).toBeVisible({ timeout: 10_000 });
  await expect(likeButton).toBeEnabled({ timeout: 10_000 });
  await likeButton.click();
}

export async function closeVisibleDialogOverlays(page: Page) {
  const dialogs = page.locator('[data-testid="dialog-panel"]');

  while ((await dialogs.count()) > 0) {
    const dialog = dialogs.last();
    if (!(await dialog.isVisible().catch(() => false))) {
      break;
    }

    const actionButton = dialog
      .locator('[data-testid="dialog-close-button"]')
      .or(dialog.locator('[data-testid="confirm-dialog-confirm-button"]'))
      .or(dialog.locator('[data-testid="alert-dialog-confirm-button"]'))
      .or(dialog.locator('[data-testid="error-dialog-confirm-button"]'))
      .or(dialog.locator('[data-testid="confirm-dialog-cancel-button"]'))
      .first();

    if (await actionButton.isVisible().catch(() => false)) {
      await actionButton.evaluate((element) => {
        (element as HTMLButtonElement).click();
      });
      await page.waitForTimeout(600);
      continue;
    }

    const backdrop = page.locator('[data-testid="dialog-backdrop"]').last();
    if (!(await backdrop.isVisible().catch(() => false))) {
      break;
    }

    await backdrop.evaluate((element) => {
      (element as HTMLDivElement).click();
    });
    await page.waitForTimeout(600);
  }

  await expect(page.locator('[data-testid="dialog-panel"]:visible')).toHaveCount(0, {
    timeout: 10_000,
  });
}

export async function waitForCurrentDjLikeReaction(page: Page) {
  const currentDj = getCurrentDj(page);
  await expect(currentDj).toHaveAttribute('data-reaction-type', 'LIKE', { timeout: 15_000 });
  await expect(currentDj.locator('[data-testid="avatar-reaction"]')).toBeVisible({
    timeout: 15_000,
  });
}

export function getChatMessageItemByContent(page: Page, message: string) {
  return page.locator('[data-testid="chat-message-item"]').filter({ hasText: message }).first();
}

export async function waitForChatMessage(page: Page, message: string) {
  const chatItem = getChatMessageItemByContent(page, message);
  await expect(chatItem).toBeVisible({ timeout: 15_000 });
  return chatItem;
}

export async function waitForChatMessageToDisappear(page: Page, message: string) {
  await expect(getChatMessageItemByContent(page, message)).toHaveCount(0, { timeout: 15_000 });
}

export async function getChatNicknameByMessage(page: Page, message: string) {
  const chatItem = await waitForChatMessage(page, message);
  return (
    (await chatItem.locator('[data-testid="chat-message-nickname"]').textContent())?.trim() ?? ''
  );
}

async function hoverAndOpenMenu(target: Locator) {
  await expect(target).toBeVisible({ timeout: 15_000 });
  await target.hover({ force: true });
  const menuButton = target.locator('[data-testid$="menu-button"]');
  await expect(menuButton).toBeVisible({ timeout: 10_000 });
  await menuButton.click();
}

export async function blockCrewFromChatMessage(page: Page, message: string) {
  const chatItem = page
    .locator('[data-testid="chat-message-hover-item"]')
    .filter({ hasText: message })
    .first();
  await hoverAndOpenMenu(chatItem);
  await page.locator('[data-testid="chat-message-menu-block"]').click();
}

export async function clickCrewMenuAction(
  page: Page,
  nickname: string,
  action: 'kick' | 'ban' | 'block'
) {
  const crewItem = page
    .locator('[data-testid="crew-list-item-hover"]')
    .filter({ hasText: nickname })
    .first();
  await hoverAndOpenMenu(crewItem);
  await page.locator(`[data-testid="crew-menu-${action}"]`).click();
}

export async function liftBlockedCrew(page: Page, nickname: string) {
  const blockedItem = page
    .locator('[data-testid="restriction-list-item"]')
    .filter({ hasText: nickname })
    .first();
  await expect(blockedItem).toBeVisible({ timeout: 15_000 });
  await blockedItem.locator('[data-testid="restriction-block-lift-button"]').click();
}

export async function waitForRestrictionItemToDisappear(page: Page, nickname: string) {
  await expect(
    page.locator('[data-testid="restriction-list-item"]').filter({ hasText: nickname })
  ).toHaveCount(0, {
    timeout: 15_000,
  });
}

export async function confirmPenaltyDialog(page: Page, reason: string) {
  const reasonInput = page.locator('[data-testid="impose-penalty-reason-input"]');
  await expect(reasonInput).toBeVisible({ timeout: 10_000 });
  await reasonInput.fill(reason);

  const confirmButton = page.locator('[data-testid="impose-penalty-confirm-button"]');
  await expect(confirmButton).toBeEnabled({ timeout: 10_000 });
  await confirmButton.click();
}

export async function confirmAlertDialog(page: Page, message?: string) {
  const dialog = message
    ? page.locator('[data-testid="dialog-panel"]').filter({ hasText: message }).first()
    : page.locator('[data-testid="dialog-panel"]').first();
  await expect(dialog).toBeVisible({ timeout: 10_000 });
  const confirmButton = dialog
    .locator('[data-testid="alert-dialog-confirm-button"]')
    .or(dialog.locator('[data-testid="error-dialog-confirm-button"]'))
    .or(dialog.getByRole('button', { name: 'Confirm' }))
    .or(dialog.getByRole('button', { name: '확인' }))
    .or(dialog.getByRole('button', { name: 'Close' }))
    .first();
  await expect(confirmButton).toBeVisible({ timeout: 10_000 });
  await confirmButton.click();
  await expect(dialog).toBeHidden({ timeout: 10_000 });
}

export async function confirmPenaltyAlertAndWaitForLobby(page: Page, message: string) {
  const dialog = page.locator('[data-testid="dialog-panel"]').filter({ hasText: message }).first();
  await expect(dialog).toBeVisible({ timeout: 20_000 });
  await dialog.locator('[data-testid="penalty-alert-confirm-button"]').click();
  await page.waitForURL(/\/parties(?:\?.*)?$/, { timeout: 20_000 });
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

  // cleanup 시도. 응답 status 검증 안 함 — 정리 실패가 본 시나리오 검증
  // 결과를 가리지 않게 한다. 성공(200/204), 세션 만료(401), 이미 정리됨
  // (404), playwright client-side artifact 등 어떤 결과든 흡수한다.
  await page.request
    .delete(new URL(`v1/partyrooms/${partyroomId}`, API_BASE_URL).toString())
    .catch(() => null);

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
