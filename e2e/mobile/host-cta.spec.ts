import { type Page, expect } from '@playwright/test';
import { attachErrorTracing } from './chunk4.helpers';
import { test } from '../fixtures/auth.fixtures';

/**
 * #381 — 모바일 로비 "Be a PFPlay Host" CTA (mobile project).
 *
 * 이슈: 모바일 로비에 방만들기 진입점이 없었음. 옵션 B = 파티룸 목록과 같은 컨테이너
 * (1열 카드 리스트) 맨 위에 host CTA 카드 노출.
 *
 * 검증 본질:
 * - 모바일 viewport(iPhone 13 → middleware x-pf-device=mobile → MobileLobby)의 로비에
 *   host CTA(`mobile-create-partyroom-button`)가 실제로 노출된다(= 회귀 전 '미노출' 해소).
 * - 멤버가 클릭하면 useBeAHost 멤버 분기 → 파티 생성 다이얼로그가 열린다.
 *   (게스트 분기 = informSocialType 는 unit 커버. 여기선 멤버 경로만 e2e.)
 *
 * 파티룸을 실제 생성하지 않으므로(submit X) cleanup 불필요.
 */
test.describe('mobile lobby host CTA (#381)', () => {
  test('모바일 로비에 host CTA 노출 + 멤버 클릭 시 파티 생성 다이얼로그', async ({
    user1Context,
  }) => {
    test.setTimeout(60_000);
    const t0 = Date.now();
    const log = (m: string) => console.log(`[host-cta test][${Date.now() - t0}ms] ${m}`);
    const page: Page = await user1Context.newPage();
    attachErrorTracing(page, log);

    log('goto mobile lobby');
    await page.goto('/parties');

    // 1) host CTA 가 로비 목록 안에 노출 (#381 핵심)
    log('expect host CTA visible');
    const cta = page.getByTestId('mobile-create-partyroom-button');
    await expect(cta).toBeVisible({ timeout: 30_000 });
    await expect(cta).toContainText(/Be a PFPlay Host/i);

    // 2) 멤버 클릭 → 파티 생성 다이얼로그 (useBeAHost 멤버 분기)
    log('click CTA');
    await cta.click();

    log('expect create-party dialog form');
    // 생성 폼의 name 인풋 노출 = openDialog(CreatePartyroomForm) 발화 확인.
    await expect(page.locator('input[name="name"]')).toBeVisible({ timeout: 15_000 });
    log('done');
  });
});
