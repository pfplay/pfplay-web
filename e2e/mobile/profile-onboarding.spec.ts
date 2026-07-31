import { test, expect } from '@playwright/test';

/**
 * #393 — 모바일 신규 소셜 가입자(AM 준회원) 강제 프로필 온보딩 (mobile project).
 *
 * 이슈: 모바일 신규 AM 은 가입 직후 강제 리다이렉트 2겹에 모두 막다른 길로 빠졌다.
 *   #1 parties/layout → /settings/profile → 모바일 "데스크탑 전용" 폴백 카드
 *   #2 settings/profile/layout(AM) → /settings/avatar → 모바일 "데스크탑 전용" 폴백 카드
 *
 * 검증 본질(데드엔드 2겹 해소):
 * - 모바일 viewport(iPhone 13 → x-pf-device=mobile)에서 /settings/profile 이
 *   폴백 카드가 아니라 실제 폼(`mobile-profile-form`)을 렌더한다(#1 해소).
 * - 닉네임 입력→제출 후 아바타 desktop-only 카드를 거치지 않고 /parties 로 착지한다(#2 해소).
 *
 * ⚠️ 캐시 auth 픽스처(user1Context = FM, profileUpdated=true) 미사용: guard 가 FM→/parties
 *    로 즉시 리다이렉트해 폼이 안 뜬다. fresh 컨텍스트 + associate(AM) dev 로그인으로
 *    profileUpdated=false AM 을 생성해야 한다.
 */

// 캐시 storageState 무시 — fresh 컨텍스트로 신규 AM 로그인 (mobile UA 는 project use 가 유지)
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('mobile 신규 AM 프로필 온보딩 (#393)', () => {
  test('강제 프로필 온보딩 → /parties (데드엔드 2겹 해소)', async ({ page }) => {
    test.setTimeout(60_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[profile-onboarding test][${Date.now() - t0}ms] ${m}`);
    page.on('console', (msg) => {
      if (msg.type() === 'error') log(`console.error: ${msg.text()}`);
    });

    log('goto /sign-in');
    await page.goto('/sign-in');

    log('open dev sign-in dialog');
    await page.locator('[data-testid="dev-sign-in-button"]').click({ force: true });
    const dialog = page
      .locator('[data-testid="dialog-panel"]')
      .filter({ has: page.locator('[data-testid="dev-sign-in-associate"]') })
      .first();
    await expect(dialog).toBeVisible({ timeout: 30_000 });

    log('sign in as associate (AM)');
    await dialog.locator('[data-testid="dev-sign-in-associate"]').click({ force: true });

    // 데드엔드 #1 해소: /settings/profile 모바일 폼 노출(폴백 카드 아님)
    log('expect /settings/profile mobile form');
    await expect(page).toHaveURL(/\/settings\/profile/, { timeout: 30_000 });
    await expect(page.locator('[data-testid="mobile-profile-form"]')).toBeVisible({
      timeout: 30_000,
    });

    log('fill nickname + submit');
    const unique = `am${Date.now() % 100000}`;
    const nicknameInput = page.locator('[data-testid="mobile-profile-form"] input').first();
    const submitButton = page.locator('[data-testid="mobile-profile-submit"]');

    // ⚠️ 테스트 측 방어일 뿐, 근본 원인은 제품 결함이다 — #487.
    // 폼 기본값이 마운트 이후 비동기로 도착해 이미 입력된 값을 덮어쓴다. 페이지가 빠를수록
    // (풀 스위트 후반처럼 warm 일 때) 우리가 먼저 입력해 값이 지워지고, 검증 실패로 제출
    // 버튼이 disabled 로 남아 클릭이 60s 타임아웃난다. 실사용자도 빠르게 타이핑하면 같은
    // 방식으로 입력을 잃는다. #487 이 수정되면 이 재시도 블록은 제거해도 된다.
    await expect(async () => {
      await nicknameInput.fill(unique);
      await expect(nicknameInput).toHaveValue(unique, { timeout: 2_000 });
      await expect(submitButton).toBeEnabled({ timeout: 2_000 });
    }).toPass({ timeout: 20_000 });

    await submitButton.click();

    // 데드엔드 #2 해소: 아바타 desktop-only 카드 거치지 않고 /parties 착지
    log('expect /parties landing (avatar 단계 생략)');
    await expect(page).toHaveURL(/\/parties/, { timeout: 30_000 });
  });
});
