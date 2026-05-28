# 모바일 반응형 — Chunk 1 (Foundation) 구현 Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 반응형 5-chunk PR 시리즈의 **Chunk 1 (Foundation)** — middleware 가 UA 감지해 `x-pf-device` 헤더 주입 + 기존 `(lobby)/page.tsx` · `(room)/[id]/page.tsx` 를 desktop shell 위젯으로 추출 + page.tsx 를 RSC thin shim 으로 변환 + 모바일 진입자는 임시 fallback 카드 노출. **데스크탑 UX 무변경** 이 본 PR 의 회귀 게이트.

**Architecture:**

- middleware: maintenance rewrite(기존) → `x-pf-device` 요청 헤더 주입(신규) → 언어 쿠키 default(기존, merged-headers 패턴). mobile redirect 분기 + `setCookieToRequestHeader` helper 제거.
- page.tsx: `'use client'` 제거 → RSC. `headers().get('x-pf-device')` 보고 desktop shell 또는 mobile fallback 카드 분기 렌더.
- shell: 기존 client 본문 + Header + ProtectedLayout overlay 3개(MyPlaylist · SidebarPlayer · ModalPlayer) + room bg 이미지 흡수.
- layouts: device-neutral 책임만 유지(ProtectedLayout auth gate · `(room)/[id]/layout.tsx` enter/teardown · `(lobby)/layout.tsx` 최소 wrapper).

**Tech Stack:** Next.js 13+ App Router (RSC + Client), TypeScript, Vitest + RTL, Playwright (existing E2E suite — 회귀 가드), Tailwind v3

**선행 문서:**

- 아키텍처 스펙: `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` (특히 §1.4, §1.5, §3.3 Chunk 1)
- 스코프 스펙: `docs/superpowers/specs/2026-05-22-mobile-responsive-scope-design.md`
- GH 이슈: pfplay-web#340

**관련 메모리:** [[feedback_pr_series_workflow]] · [[feedback_commit_consolidation_before_push]] · [[feedback_korean_issue_commit_pr]] · [[feedback_elegant_no_code_dirtying]] · [[wait-all-ci-incl-e2e-before-merge]] · [[reference_pfplay_web_local_dev_http_webpack]]

---

## File Structure

> 본 chunk 1 의 모든 작업 결과. 각 파일의 책임을 한 문장으로 정리.

### 생성 (Create)

| 경로                                                                  | 책임                                                                                                                                    |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/widgets/partyroom-page-desktop/lobby.component.tsx`              | 데스크탑 로비 페이지 본문 ('use client'). 기존 `(lobby)/page.tsx` body + `(lobby)/layout.tsx` 의 `<Header />` 흡수                      |
| `src/widgets/partyroom-page-desktop/room.component.tsx`               | 데스크탑 룸 페이지 본문 ('use client'). 기존 `(room)/[id]/page.tsx` body + `(room)/[id]/layout.tsx` 의 bg 이미지 main wrapper 흡수      |
| `src/widgets/partyroom-page-desktop/desktop-overlays.component.tsx`   | 데스크탑 전용 overlay 3개 묶음 ('use client'): `<MyPlaylist />`, `<SidebarPlayer />`, `<ModalPlayer />`. 기존 ProtectedLayout 에서 추출 |
| `src/widgets/partyroom-page-desktop/index.ts`                         | barrel export                                                                                                                           |
| `src/widgets/mobile-fallback-card/mobile-fallback-card.component.tsx` | Chunk 1 임시 카드. 모바일 진입자가 빈 페이지를 보지 않게 "곧 출시" 안내 + 데스크탑 안내 (현 `/mobile-notice` 톤). Chunk 5 에서 제거     |
| `src/widgets/mobile-fallback-card/index.ts`                           | barrel export                                                                                                                           |
| `src/middleware.test.ts`                                              | middleware 통합 단위 테스트 (vitest, mock NextRequest). x-pf-device 주입 · maintenance · 언어 쿠키 default 3축 검증                     |

### 수정 (Modify)

| 경로                                            | 변경 내용                                                                                                                                                                                           |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/middleware.ts`                             | (1) mobile UA redirect 블록 제거 (2) `x-pf-device` request 헤더 주입 (3) merged-headers 패턴으로 단일 `NextResponse.next({ request: { headers } })` 호출 (4) `setCookieToRequestHeader` helper 제거 |
| `src/shared/lib/functions/is-mobile-ua.test.ts` | 보강: 임베디드 WebView (KAKAOTALK · NAVER · FBAV), 태블릿(Android Tablet) UA, 봇(Googlebot) UA 추가                                                                                                 |
| `src/app/parties/layout.tsx`                    | overlay 3개(`<MyPlaylist />`, `<SidebarPlayer />`, `<ModalPlayer />`) 제거. auth 게이트는 device 무관 유지. import 정리.                                                                            |
| `src/app/parties/(lobby)/layout.tsx`            | `<Header />` 렌더 제거. main wrapper 도 desktop shell 로 이동. `<>{children}</>` 또는 fragment-only minimal wrapper 가 됨.                                                                          |
| `src/app/parties/(lobby)/page.tsx`              | `'use client'` 제거 → RSC. `headers().get('x-pf-device')` 보고 `<DesktopLobby />` 또는 `<MobileFallbackCard />` 분기 렌더.                                                                          |
| `src/app/parties/(room)/[id]/layout.tsx`        | `<main className='bg-partyRoom ...'>` 의 className 을 `<>{children}</>` (또는 fragment) 로 단순화. bg 이미지는 desktop shell 로 이동. enter/teardown · ?source 정리는 그대로.                       |
| `src/app/parties/(room)/[id]/page.tsx`          | `'use client'` 제거 → RSC. `headers().get('x-pf-device')` 보고 `<DesktopRoom partyroomId={...} />` 또는 `<MobileFallbackCard />` 분기.                                                              |

### 보존 (No change in chunk 1, removed in chunk 5)

| 경로                           | 사유                                                                                      |
| ------------------------------ | ----------------------------------------------------------------------------------------- |
| `src/app/mobile-notice/`       | middleware 가 더 이상 redirect 하지 않으므로 routable 하지만 도달 불가. chunk 5 에서 삭제 |
| 관련 i18n 키 `mobile_notice_*` | chunk 5 catch-up                                                                          |
| `MobileGuard` (있다면)         | chunk 5 catch-up                                                                          |

---

## Phase 1: middleware 단위 (UI 변경 0)

테스트 우선 작성 → middleware 코드 변경 → 검증 + 커밋.

> ⚠️ **Phase 1~3 atomic PR 제약**: Task 1.3 가 머지되는 시점부터 모바일 redirect 가 작동하지 않는다(분기 제거됨). Task 3.2/3.3 가 머지되지 않으면 모바일 UA 가 `(lobby)/page.tsx` 의 client 본문(`useAppRouter` 등) 으로 진입해 오작동. **Phase 1~3 의 모든 커밋은 단일 PR 로 함께 머지**해야 한다. 중간 push 금지. Phase 4 의 Task 4.2 Step 7 까지 도달한 후 일괄 push.

### Task 1.1: `isMobileUA` 매트릭스 보강

**Files:**

- Modify: `src/shared/lib/functions/is-mobile-ua.test.ts`

기존 매트릭스(iPhone · Android · iPod · BlackBerry · Opera Mini · Desktop Chrome/Firefox/Safari · iPadOS desktop UA · 빈 문자열) 외에 임베디드 WebView · 태블릿 · 봇 UA 추가.

- [ ] **Step 1: 추가 케이스 작성 (failing 가능 케이스 우선)**

```ts
// 기존 describe('isMobileUA', () => { ... }) 안에 추가

test('KAKAOTALK 임베디드 WebView UA를 모바일로 판별한다', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 13; SM-S908N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 KAKAOTALK 10.4.5';
  expect(isMobileUA(ua)).toBe(true);
});

test('NAVER 임베디드 WebView UA를 모바일로 판별한다', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 13; SM-S918N Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 NAVER(inapp; search; 1340; 12.6.4)';
  expect(isMobileUA(ua)).toBe(true);
});

test('Facebook 임베디드 WebView UA를 모바일로 판별한다', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 13; SM-S908N Build/TP1A.220624.014) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/116.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/440.0.0.34.83;]';
  expect(isMobileUA(ua)).toBe(true);
});

test('Android Tablet UA를 모바일로 판별한다 (Mobile 토큰 없어도 Android 매칭)', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 14; SM-X910) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  expect(isMobileUA(ua)).toBe(true);
});

test('Googlebot UA를 데스크탑으로 판별한다 (Mobile 토큰 없는 봇)', () => {
  const ua = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  expect(isMobileUA(ua)).toBe(false);
});

test('Googlebot Mobile UA를 모바일로 판별한다', () => {
  const ua =
    'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
  expect(isMobileUA(ua)).toBe(true);
});
```

- [ ] **Step 2: 테스트 실행하여 매트릭스 검증**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
npx vitest run src/shared/lib/functions/is-mobile-ua.test.ts
```

Expected: 모두 PASS (기존 정규식이 `Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile` 매칭이라 위 케이스 전부 잡힘). 만약 FAIL 케이스가 나오면 util 수정은 **본 task 범위 밖** — 별 PR 로 처리하고 본 plan 진행은 유지.

- [ ] **Step 3: 커밋**

```bash
git add src/shared/lib/functions/is-mobile-ua.test.ts
git commit -m "test(is-mobile-ua): 임베디드 WebView·태블릿·봇 UA 매트릭스 보강"
```

---

### Task 1.2: middleware 통합 테스트 작성 (Red)

**Files:**

- Create: `src/middleware.test.ts`

middleware 의 **새 동작** 을 먼저 테스트로 잠근다. 실제 middleware 변경은 Task 1.3 에서. 본 task 가 끝나면 test 는 FAIL 또는 일부 PASS(maintenance 는 기존 동작 보존).

- [ ] **Step 0: NextRequest 가 jsdom 환경에서 생성 가능한지 사전 확인**

`vitest.config.ts` 가 `environment: 'jsdom'` 이라 `next/server` 의 `NextRequest` 가 그대로 import 될지 불확실. 다음 throwaway 로 확인:

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
cat > /tmp/next-request-smoke.test.ts <<'EOF'
import { NextRequest } from 'next/server';
import { test, expect } from 'vitest';
test('jsdom 에서 NextRequest 생성', () => {
  const req = new NextRequest(new URL('http://localhost/'));
  expect(req).toBeDefined();
});
EOF
cp /tmp/next-request-smoke.test.ts src/_next-request-smoke.test.ts
npx vitest run src/_next-request-smoke.test.ts
rm src/_next-request-smoke.test.ts
```

- PASS → Step 1 진행, 별도 environment 지정 불요.
- FAIL (`Request is not defined`, `TextEncoder is not defined`, 또는 `fetch is not defined` 류) → Step 1 의 테스트 파일 첫 줄에 vitest 환경 지정 디렉티브 추가:

  ```ts
  // @vitest-environment edge-runtime
  ```

  추가로 의존성 필요 시: `yarn add -D @edge-runtime/vm`. 본 fallback 동봉 commit 은 본 Task 1.2 의 마지막에 묶어서 처리.

- [ ] **Step 1: 테스트 파일 작성**

```ts
// src/middleware.test.ts
// Step 0 fallback 필요 시 첫 줄: // @vitest-environment edge-runtime
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// getEdgeConfigMaintenance 를 default(비활성)로 mock.
vi.mock('@/shared/api/system-status', () => ({
  getEdgeConfigMaintenance: vi.fn().mockResolvedValue(null),
}));

import { getEdgeConfigMaintenance } from '@/shared/api/system-status';
import { LANGUAGE_COOKIE_KEY, Language } from '@/shared/lib/localization/constants';
import { middleware } from './middleware';

const buildReq = (url: string, headers: Record<string, string> = {}) => {
  return new NextRequest(new URL(url, 'http://localhost'), { headers });
};

/**
 * NOTE: 본 테스트는 Next.js 가 `NextResponse.next({ request: { headers } })` 시
 * `x-middleware-override-headers` / `x-middleware-request-*` 응답 헤더를 set 한다는
 * **현 Next.js 14.x 구현 세부**에 의존한다. Next 업그레이드 시 본 단언이 실패하면
 * 본 테스트 재작성 필요 (당시 framework 가 노출하는 검증 가능한 표면으로 마이그레이션).
 */

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getEdgeConfigMaintenance).mockResolvedValue(null);
  });

  describe('x-pf-device 헤더 주입', () => {
    test('데스크탑 UA → 응답이 x-pf-device=desktop 으로 다운스트림에 전달된다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      });
      const res = await middleware(req);

      expect(res?.headers.get('x-middleware-override-headers')).toContain('x-pf-device');
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('desktop');
    });

    test('모바일 UA → 응답이 x-pf-device=mobile 로 전달된다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      });
      const res = await middleware(req);
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('mobile');
    });

    test('User-Agent 미존재 → desktop 으로 fallback', async () => {
      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);
      expect(res?.headers.get('x-middleware-request-x-pf-device')).toBe('desktop');
    });
  });

  describe('mobile redirect 제거 검증', () => {
    test('모바일 UA 가 /mobile-notice 로 redirect 되지 않는다', async () => {
      const req = buildReq('http://localhost/parties', {
        'user-agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Safari/604.1',
      });
      const res = await middleware(req);
      // redirect 였다면 location 헤더가 set 됐을 것.
      expect(res?.headers.get('location')).toBeNull();
    });
  });

  describe('점검 ACTIVE rewrite 보존', () => {
    test('점검 ACTIVE → /maintenance 로 rewrite (기존 동작)', async () => {
      vi.mocked(getEdgeConfigMaintenance).mockResolvedValue({
        phase: 'ACTIVE',
        messageKo: '점검 중',
        messageEn: 'Under maintenance',
        endAt: '2026-05-28T20:00:00Z',
      } as any);

      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);
      const rewriteUrl = res?.headers.get('x-middleware-rewrite');
      expect(rewriteUrl).toContain('/maintenance');
      expect(rewriteUrl).toContain('messageKo=');
    });
  });

  describe('언어 쿠키 default 보존', () => {
    test(`${LANGUAGE_COOKIE_KEY} 쿠키 없음 → response.cookies 에 set + 다운스트림 Cookie 헤더에 합성`, async () => {
      const req = buildReq('http://localhost/parties');
      const res = await middleware(req);

      const setCookieHeader = res?.headers.get('set-cookie') ?? '';
      expect(setCookieHeader).toContain(`${LANGUAGE_COOKIE_KEY}=${Language.En}`);
      expect(setCookieHeader).toContain('Max-Age='); // TEN_YEARS
      expect(setCookieHeader).toContain('Secure');
    });

    test(`${LANGUAGE_COOKIE_KEY} 쿠키 있음 → 변경 안 함`, async () => {
      const req = buildReq('http://localhost/parties', {
        cookie: `${LANGUAGE_COOKIE_KEY}=${Language.Ko}`,
      });
      const res = await middleware(req);
      const setCookieHeader = res?.headers.get('set-cookie') ?? '';
      expect(setCookieHeader).not.toContain(`${LANGUAGE_COOKIE_KEY}=`);
    });
  });
});
```

- [ ] **Step 2: 테스트 실행 — 일부 FAIL 예상**

```bash
npx vitest run src/middleware.test.ts
```

Expected: 점검 rewrite + redirect-없음 두 테스트는 현 코드에서도 통과 가능성 있음(redirect 없음 단언은 현 코드에서 fail — 현 middleware 가 mobile redirect 함). x-pf-device 단언은 모두 fail. 언어 쿠키는 현 동작 보존하므로 일부 pass.

- [ ] **Step 3: 커밋 (테스트만, 코드 미변경)**

```bash
git add src/middleware.test.ts
git commit -m "test(middleware): x-pf-device 헤더 주입·mobile redirect 제거·기존 동작 보존 통합 테스트 (Red)"
```

---

### Task 1.3: middleware 재작성 (Green)

**Files:**

- Modify: `src/middleware.ts`

Task 1.2 의 테스트를 통과시키는 최소 변경. 스펙 §1.5.2 의 코드를 그대로 적용.

- [ ] **Step 1: middleware.ts 재작성**

기존 파일을 다음 코드로 교체. `setCookieToRequestHeader` helper + 관련 import (`RequestCookies`, `ResponseCookies`) 제거:

```ts
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

import { getEdgeConfigMaintenance } from '@/shared/api/system-status';
import { TEN_YEARS } from '@/shared/config/time';
import { isMobileUA } from '@/shared/lib/functions/is-mobile-ua';
import { LANGUAGE_COOKIE_KEY, Language } from './shared/lib/localization/constants';

const DEVICE_HEADER = 'x-pf-device';

export const middleware = async (req: NextRequest) => {
  // 1) 점검 ACTIVE — rewrite. 변경 없음.
  const maintenance = await getEdgeConfigMaintenance();
  if (maintenance?.phase === 'ACTIVE') {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    url.searchParams.set('messageKo', maintenance.messageKo);
    url.searchParams.set('messageEn', maintenance.messageEn);
    url.searchParams.set('endAt', maintenance.endAt);
    return NextResponse.rewrite(url);
  }

  // 2) UA → x-pf-device 요청 헤더 주입. page.tsx 의 conditional 렌더 입력값.
  const ua = req.headers.get('user-agent') ?? '';
  const isMobile = isMobileUA(ua);
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set(DEVICE_HEADER, isMobile ? 'mobile' : 'desktop');

  // 3) 언어 쿠키 default. 단일 NextResponse.next 호출로 합성.
  const needsLanguageCookie = !req.cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  if (needsLanguageCookie) {
    // SSR 일관성: 현재 요청부터 새 쿠키를 본다 — req Cookie 헤더에도 합성
    const existingCookie = reqHeaders.get('cookie') ?? '';
    reqHeaders.set(
      'cookie',
      existingCookie
        ? `${existingCookie}; ${LANGUAGE_COOKIE_KEY}=${Language.En}`
        : `${LANGUAGE_COOKIE_KEY}=${Language.En}`
    );
  }

  const response = NextResponse.next({ request: { headers: reqHeaders } });
  if (needsLanguageCookie) {
    response.cookies.set(LANGUAGE_COOKIE_KEY, Language.En, {
      path: '/',
      maxAge: TEN_YEARS,
      secure: true,
    });
  }
  return response;
};

export const config = {
  matcher: ['/((?!maintenance|api|_next/static|_next/image|favicon.ico|images|icons).*)'],
};
```

- [ ] **Step 2: 테스트 실행 — 전부 PASS 검증**

```bash
npx vitest run src/middleware.test.ts
npx vitest run src/shared/lib/functions/is-mobile-ua.test.ts
```

Expected: 모두 PASS.

- [ ] **Step 3: 타입체크 + 린트**

```bash
npx tsc --noEmit
npx eslint src/middleware.ts src/middleware.test.ts
```

Expected: error 0.

- [ ] **Step 4: 커밋**

```bash
git add src/middleware.ts
git commit -m "feat(middleware): x-pf-device 헤더 주입 + mobile redirect 제거 + 언어 쿠키 merged-headers 패턴

- 점검 ACTIVE 단계는 변경 없음 (early return 우선순위)
- mobile UA → /mobile-notice redirect 분기 제거
- isMobileUA 기반 x-pf-device='mobile'|'desktop' request 헤더 주입
- 언어 쿠키 set + x-pf-device 주입을 단일 NextResponse.next 호출로 합성
  (setCookieToRequestHeader helper 의존 제거; helper 자체는 더 이상 사용처 없음)
- /mobile-notice 라우트 파일은 chunk 5 catch-up 에서 삭제 예정

스펙: docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md §1.5.2
이슈: pfplay-web#340"
```

---

## Phase 2: Desktop Shell 추출

기존 `(lobby)/page.tsx` · `(room)/[id]/page.tsx` · ProtectedLayout overlays · `(lobby)/layout.tsx` Header · `(room)/[id]/layout.tsx` bg 이미지를 desktop shell 위젯으로 이동. **순수 이동(move-only)** — 이 단계까지는 page.tsx 가 여전히 기존 코드를 import 하지 않음(다음 phase 에서 wire). 본 phase 끝에는 desktop shell 위젯이 import 가능한 형태로 존재.

### Task 2.1: DesktopOverlays 컴포넌트 추출

**Files:**

- Create: `src/widgets/partyroom-page-desktop/desktop-overlays.component.tsx`
- Create: `src/widgets/partyroom-page-desktop/index.ts`

ProtectedLayout 의 3 overlay 를 묶음으로 추출.

- [ ] **Step 1: `desktop-overlays.component.tsx` 생성**

```tsx
// src/widgets/partyroom-page-desktop/desktop-overlays.component.tsx
'use client';

import { SidebarPlayer, ModalPlayer } from '@/widgets/music-preview-player';
import { MyPlaylist } from '@/widgets/my-playlist';

/**
 * 데스크탑 전용 overlay 3개 묶음.
 *
 * 본 컴포넌트는 데스크탑 lobby/room shell 안에서 단 한 번 mount 된다.
 * 모바일 트리에는 import 되지 않음 — 별도 트리(`widgets-mobile/`)가 가짐.
 *
 * 기존: `app/parties/layout.tsx` (ProtectedLayout) 에서 children 의 sibling 으로 mount.
 * 본 chunk 1 에서 desktop shell 내부로 이동(모바일 누출 차단).
 */
export const DesktopOverlays = () => {
  return (
    <>
      <MyPlaylist />
      {/* ⓐ 사이드바 미리보기 플레이어 (플레이리스트 트랙용) */}
      <SidebarPlayer />
      {/* ⓑ 모달 미리보기 플레이어 (검색 결과용) - 모달과 분리된 고정 위치 */}
      <ModalPlayer />
    </>
  );
};
```

- [ ] **Step 2: overlay 위치 invariant 검증 (사전)**

DesktopOverlays 가 기존 ProtectedLayout 안 `<children>` sibling 위치에서 desktop shell 의 `<main>` 안쪽으로 **DOM box 가 바뀐다**. overlay 3개의 positioning 이 viewport-relative(`position: fixed`) 여야 안전. 다음 grep 으로 확인:

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
grep -rn "position:\s*absolute\|absolute\s*inset\|absolute\s*top" \
  src/widgets/my-playlist/ \
  src/widgets/music-preview-player/
```

Expected: `position: absolute` 사용이 발견되더라도 그 컴포넌트가 자체 portal 또는 viewport-anchored wrapper 안에서 쓰이는지 확인. `fixed` 만 발견되면 안전. 결과를 plan 실행 노트에 기록(commit message 또는 PR description). 만약 ancestor-relative absolute 가 발견되면 본 task 진행 전에 별 처리(예: 해당 overlay 를 portal 로 감싸기 — chunk 1 범위 밖이면 backlog 등록).

- [ ] **Step 3: `index.ts` barrel 생성 (현재 시점엔 DesktopOverlays 만)**

```ts
// src/widgets/partyroom-page-desktop/index.ts
export { DesktopOverlays } from './desktop-overlays.component';
// DesktopLobby, DesktopRoom 은 Task 2.2 / 2.3 에서 추가
```

- [ ] **Step 4: 타입체크**

```bash
npx tsc --noEmit
```

Expected: error 0 (DesktopOverlays 가 아직 어디서도 import 되지 않으므로 self-contained).

- [ ] **Step 5: 커밋**

```bash
git add src/widgets/partyroom-page-desktop/desktop-overlays.component.tsx \
        src/widgets/partyroom-page-desktop/index.ts
git commit -m "feat(widgets/partyroom-page-desktop): DesktopOverlays 추출

MyPlaylist + SidebarPlayer + ModalPlayer 묶음. 기존 ProtectedLayout 내부에서
desktop shell 로 이동 준비 단계. 본 commit 은 신규 컴포넌트 생성만 — wiring 은 Phase 3.

스펙: 2026-05-28-mobile-responsive-architecture-design.md §1.4.2 · §2.7"
```

---

### Task 2.2: Desktop Lobby Shell 추출

**Files:**

- Create: `src/widgets/partyroom-page-desktop/lobby.component.tsx`
- Modify: `src/widgets/partyroom-page-desktop/index.ts`

기존 `(lobby)/page.tsx` body + `(lobby)/layout.tsx` 의 `<Header />` + main wrapper + `<DesktopOverlays />` 를 한 컴포넌트로 통합.

- [ ] **Step 1: `lobby.component.tsx` 생성**

```tsx
// src/widgets/partyroom-page-desktop/lobby.component.tsx
'use client';

import { PartyroomCreateCard } from '@/features/partyroom/create';
import { MainPartyroomCard, PartyroomList } from '@/features/partyroom/list';
import SuspenseWithErrorBoundary from '@/shared/api/http/error/suspense-with-error-boundary.component';
import { cn } from '@/shared/lib/functions/cn';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { Header } from '@/widgets/layouts';
import { Sidebar } from '@/widgets/sidebar';
import { DesktopOverlays } from './desktop-overlays.component';

/**
 * 데스크탑 로비 페이지 본문.
 *
 * 기존: `src/app/parties/(lobby)/page.tsx` body
 * + `src/app/parties/(lobby)/layout.tsx` 의 <Header /> 및 main wrapper
 * + DesktopOverlays (ProtectedLayout 에서 추출).
 *
 * 모바일 트리는 별도(`widgets-mobile/partyroom-page-mobile/lobby`, chunk 2).
 */
export const DesktopLobby = () => {
  const router = useAppRouter();

  return (
    <>
      <Header />
      <main className='px-app pt-app pb-app overflow-y-auto'>
        <Sidebar
          onClickAvatarSetting={() => {
            router.push('/settings/avatar');
          }}
          className={cn([
            'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
            'fixed z-10 bottom-8 right-8 transform',
            'laptop:bottom-[unset] laptop:right-[unset] laptop:top-1/2 laptop:left-8 laptop:-translate-y-1/2',
          ])}
        />

        <div className='max-w-desktop mx-auto'>
          <SuspenseWithErrorBoundary enableReload>
            <MainPartyroomCard />
          </SuspenseWithErrorBoundary>

          <section
            className={cn([
              'grid gap-[1.5rem] mt-6 overflow-y-auto',
              'grid-rows-[240px] auto-rows-[240px] grid-flow-row-dense',
              'grid-cols-1',
              'tablet:grid-cols-[repeat(auto-fit,calc((100%-1.5rem)/2))]',
              'desktop:grid-cols-[repeat(auto-fit,calc((100%-3rem)/3))]',
            ])}
          >
            <PartyroomCreateCard />
            <PartyroomList trackView />
          </section>
        </div>
      </main>
      <DesktopOverlays />
    </>
  );
};
```

- [ ] **Step 2: `index.ts` 에 DesktopLobby export 추가**

```ts
// src/widgets/partyroom-page-desktop/index.ts
export { DesktopLobby } from './lobby.component';
export { DesktopOverlays } from './desktop-overlays.component';
```

- [ ] **Step 3: 타입체크**

```bash
npx tsc --noEmit
```

Expected: error 0.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/partyroom-page-desktop/lobby.component.tsx \
        src/widgets/partyroom-page-desktop/index.ts
git commit -m "feat(widgets/partyroom-page-desktop): DesktopLobby shell 추출

기존 (lobby)/page.tsx body + (lobby)/layout.tsx 의 Header·main wrapper
+ DesktopOverlays 묶음. wiring 은 Phase 3.

스펙: §1.4.2 · §3.3 Chunk 1"
```

---

### Task 2.3: Desktop Room Shell 추출

**Files:**

- Create: `src/widgets/partyroom-page-desktop/room.component.tsx`
- Modify: `src/widgets/partyroom-page-desktop/index.ts`

기존 `(room)/[id]/page.tsx` body + `(room)/[id]/layout.tsx` 의 main bg 이미지 wrapper + `<DesktopOverlays />` 를 한 컴포넌트로 통합. partyroomId 를 prop 으로 받음.

> ⚠️ 본 task 는 큰 코드 이동(약 230 줄). 로직 변경은 **0** — 기존 `(room)/[id]/page.tsx` 의 body 를 그대로 옮기고, 동적 `params.id` 사용을 prop `partyroomId` 로 치환.

- [ ] **Step 1: `room.component.tsx` 생성**

```tsx
// src/widgets/partyroom-page-desktop/room.component.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCurrentPartyroomAlerts } from '@/entities/current-partyroom';
import { useSuspenseFetchMe, useIsGuest } from '@/entities/me';
import { ProfileEditFormV2 } from '@/features/edit-profile-bio';
import { useFetchPartyroomDetailSummary } from '@/features/partyroom/get-summary';
import { useSharePartyroom } from '@/features/partyroom/share-link';
import { useInformSocialType } from '@/features/sign-in/by-social';
import { cn } from '@/shared/lib/functions/cn';
import { useDisclosure } from '@/shared/lib/hooks/use-disclosure.hook';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useStores } from '@/shared/lib/store/stores.context';
import { Button } from '@/shared/ui/components/button';
import { useDialog } from '@/shared/ui/components/dialog';
import Profile from '@/shared/ui/components/profile/profile.component';
import { Typography } from '@/shared/ui/components/typography';
import { PFDj, PFHeadset, PFInfoOutline, PFLink } from '@/shared/ui/icons';
import { PartyroomAvatars } from '@/widgets/partyroom-avatars';
import { PartyroomDetailTrigger } from '@/widgets/partyroom-detail';
import { PartyroomDisplayBoard } from '@/widgets/partyroom-display-board';
import { DjingDialog } from '@/widgets/partyroom-djing-dialog';
import { useOpenEditProfileAvatarDialog } from '@/widgets/partyroom-edit-profile-avatar-dialog';
import { PartyRoomListTrigger } from '@/widgets/partyroom-party-list';
import { Sidebar } from '@/widgets/sidebar';
import ChatTabPanel from '@/app/parties/(room)/[id]/_panels/chat-tab-panel.component';
import CinemaDetailPanel from '@/app/parties/(room)/[id]/_panels/cinema-detail-panel.component';
import CinemaPlaylistPanel from '@/app/parties/(room)/[id]/_panels/cinema-playlist-panel.component';
import { DesktopOverlays } from './desktop-overlays.component';

type Props = {
  partyroomId: number;
};

/**
 * 데스크탑 룸 페이지 본문.
 *
 * 기존: `src/app/parties/(room)/[id]/page.tsx` body (params.id → partyroomId prop)
 * + `(room)/[id]/layout.tsx` 의 main bg 이미지 wrapper
 * + DesktopOverlays.
 *
 * 모바일 트리는 별도(`widgets-mobile/partyroom-page-mobile/room`, chunk 2).
 */
export const DesktopRoom = ({ partyroomId }: Props) => {
  const t = useI18n();
  const {
    open: isDjingDialogOpen,
    onOpen: openDjingDialog,
    onClose: closeDjingDialog,
  } = useDisclosure();

  const isGuest = useIsGuest();
  const informSocialType = useInformSocialType();
  const { data: me } = useSuspenseFetchMe();

  const { data: partyroomSummary, isLoading: isPartyroomSummaryLoading } =
    useFetchPartyroomDetailSummary(partyroomId, !!partyroomId);
  const sharePartyroom = useSharePartyroom(partyroomSummary);

  const openEditProfileAvatarDialog = useOpenEditProfileAvatarDialog();
  const { openDialog } = useDialog();
  const { useUIState } = useStores();
  const cinemaView = useUIState((state) => state.cinemaView);
  const cinemaChatOpen = useUIState((state) => state.cinemaChatOpen);
  const cinemaSidePanel = useUIState((state) => state.cinemaSidePanel);
  const setCinemaSidePanel = useUIState((state) => state.setCinemaSidePanel);

  const [boardWidth, setBoardWidth] = useState(512);

  useEffect(() => {
    if (!cinemaView) {
      setBoardWidth(512);
      return;
    }
    const computeWidth = () => {
      setBoardWidth(window.innerWidth - 400 - 80);
    };
    computeWidth();
    window.addEventListener('resize', computeWidth);
    return () => window.removeEventListener('resize', computeWidth);
  }, [cinemaView]);

  useCurrentPartyroomAlerts();

  const toggleSidePanel = (panel: 'detail' | 'playlist') => {
    setCinemaSidePanel(cinemaSidePanel === panel ? 'none' : panel);
  };

  const handleClickProfileButton = async () => {
    if (await isGuest()) {
      informSocialType();
      return;
    }
    openDialog((_, onCancel) => ({
      title: ({ defaultClassName }) => (
        <Typography type='title2' className={defaultClassName}>
          {t.common.btn.my_profile}
        </Typography>
      ),
      titleAlign: 'left',
      showCloseIcon: true,
      classNames: {
        container: 'w-[620px] h-[391px] py-7 px-10 bg-black',
      },
      Body: (
        <ProfileEditFormV2
          onClickAvatarSetting={async () => {
            openEditProfileAvatarDialog();
            onCancel?.();
          }}
        />
      ),
    }));
  };

  const sidebarActions = (
    <div className='flex items-center gap-4'>
      <button onClick={handleClickProfileButton} className='relative size-9 cursor-pointer'>
        <Profile size={36} src={me.avatarIconUri} />
      </button>
      <button
        onClick={() => cinemaView && toggleSidePanel('playlist')}
        className={cn(
          'flex items-center justify-center rounded-lg size-9 transition-colors',
          cinemaView && cinemaSidePanel === 'playlist'
            ? 'bg-gray-600'
            : 'bg-gray-800 hover:bg-gray-700'
        )}
        title={t.common.btn.playlist}
      >
        <PFHeadset width={24} height={24} className='[&_*]:fill-gray-400' />
      </button>
      <button
        onClick={async () => {
          if (await isGuest()) {
            informSocialType();
            return;
          }
          openDjingDialog();
        }}
        className='bg-gray-800 flex items-center justify-center rounded-lg size-9 hover:bg-gray-700 transition-colors'
        title={t.dj.title.dj_queue}
      >
        <PFDj width={24} height={24} className='text-gray-400' />
      </button>
      <button
        onClick={sharePartyroom}
        disabled={isPartyroomSummaryLoading}
        className='bg-gray-800 flex items-center justify-center rounded-lg size-9 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
        title={t.common.btn.share}
      >
        <PFLink width={24} height={24} className='text-gray-400' />
      </button>
    </div>
  );

  const headerActions = (
    <div className='flex items-center gap-3'>
      {cinemaView ? (
        <Button
          color='secondary'
          variant='outline'
          Icon={<PFInfoOutline width={20} height={20} className='[&_*]:stroke-white' />}
          size='sm'
          className='text-gray-50 w-full'
          onClick={() => toggleSidePanel('detail')}
        >
          {t.party.title.party_info}
        </Button>
      ) : (
        <PartyroomDetailTrigger />
      )}
      <PartyRoomListTrigger />
    </div>
  );

  const sidePanelContent =
    cinemaSidePanel === 'detail' ? (
      <CinemaDetailPanel onClose={() => setCinemaSidePanel('none')} />
    ) : cinemaSidePanel === 'playlist' ? (
      <CinemaPlaylistPanel onClose={() => setCinemaSidePanel('none')} />
    ) : undefined;

  const chatPanelContent = cinemaChatOpen ? (
    <ChatTabPanel className='pt-5 px-5 pb-3 min-h-0' />
  ) : undefined;

  return (
    <main className='bg-partyRoom bg-left-bottom overflow-hidden'>
      <PartyroomAvatars />

      <div
        className={
          cinemaView
            ? 'absolute top-[44px] left-0 right-[400px] px-[40px]'
            : 'absolute top-[44px] left-1/2 transform -translate-x-1/2 max-w-full w-[calc(512px+(40px*2))] px-[40px]'
        }
      >
        <PartyroomDisplayBoard
          width={boardWidth}
          headerActions={headerActions}
          sidebarActions={sidebarActions}
          sidePanelContent={sidePanelContent}
          chatPanelContent={chatPanelContent}
        />
      </div>

      <Sidebar
        className={cn([
          'flexCol justify-between gap-10 px-1 py-6 bg-[#0E0E0E] rounded',
          'absolute top-1/2 left-[40px] transform -translate-y-1/2',
          cinemaView && 'hidden',
        ])}
        extraButtons={[
          {
            onClick: async () => {
              if (await isGuest()) {
                informSocialType();
                return;
              }
              openDjingDialog();
            },
            icon: (size, className) => <PFDj width={size} height={size} className={className} />,
            text: t.dj.title.dj_queue,
            testId: 'dj-queue-button',
          },
          {
            onClick: sharePartyroom,
            icon: (size, className) => <PFLink width={size} height={size} className={className} />,
            text: t.common.btn.share,
            disabled: isPartyroomSummaryLoading,
          },
        ]}
        onClickAvatarSetting={openEditProfileAvatarDialog}
      />

      <div
        className={cn(
          'absolute top-0 right-0 w-[400px] max-w-full h-screen flexCol bg-black pt-8 pb-3 px-7',
          cinemaView && 'hidden'
        )}
      >
        <div className='bg-black grid grid-cols-2 gap-3 mb-5'>
          <PartyroomDetailTrigger />
          <PartyRoomListTrigger />
        </div>
        <ChatTabPanel />
      </div>

      <DjingDialog partyroomId={partyroomId} open={isDjingDialogOpen} close={closeDjingDialog} />

      <DesktopOverlays />
    </main>
  );
};
```

> NOTE: `ChatTabPanel`, `CinemaDetailPanel`, `CinemaPlaylistPanel` 은 기존 `_panels/` 경로에 그대로 둔다. 본 chunk 1 은 이동·재배치 없음. import 경로는 `@/app/parties/(room)/[id]/_panels/...` 절대경로로 명시.

- [ ] **Step 2: `index.ts` 에 DesktopRoom export 추가**

```ts
// src/widgets/partyroom-page-desktop/index.ts
export { DesktopLobby } from './lobby.component';
export { DesktopRoom } from './room.component';
export { DesktopOverlays } from './desktop-overlays.component';
```

- [ ] **Step 3: 타입체크**

```bash
npx tsc --noEmit
```

Expected: error 0. import 경로 오류 발생 시 fix.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/partyroom-page-desktop/room.component.tsx \
        src/widgets/partyroom-page-desktop/index.ts
git commit -m "feat(widgets/partyroom-page-desktop): DesktopRoom shell 추출

기존 (room)/[id]/page.tsx body (params.id → partyroomId prop) + (room)/[id]/layout.tsx
의 main bg 이미지 wrapper + DesktopOverlays 묶음. _panels/ 컴포넌트는 그대로 사용.
wiring 은 Phase 3.

스펙: §1.4.2 · §3.3 Chunk 1"
```

---

## Phase 3: page.tsx RSC 변환 + Layout 정리 + Mobile Fallback

이 phase 가 본 PR 의 **실 동작 변경 시점**. desktop UA 진입자에게는 무변경, mobile UA 는 fallback 카드 노출.

### Task 3.1: MobileFallbackCard 위젯 생성

**Files:**

- Create: `src/widgets/mobile-fallback-card/mobile-fallback-card.component.tsx`
- Create: `src/widgets/mobile-fallback-card/index.ts`

Chunk 5 catch-up 에서 제거될 임시 컴포넌트. 톤은 현 `/mobile-notice` 와 동일.

- [ ] **Step 1: 컴포넌트 작성**

```tsx
// src/widgets/mobile-fallback-card/mobile-fallback-card.component.tsx
'use client';

import { Typography } from '@/shared/ui/components/typography';

/**
 * 모바일 진입자가 빈 페이지를 보지 않게 표시하는 임시 카드.
 *
 * Chunk 1 시점엔 모바일 페이지 본문이 아직 없음 → 본 카드를 노출.
 * Chunk 2~4 에 모바일 페이지가 실제로 채워지면 page.tsx 의 분기가 이 카드를 거치지 않음.
 * Chunk 5 catch-up 에서 본 컴포넌트 + /mobile-notice 라우트 함께 삭제.
 */
export const MobileFallbackCard = () => {
  return (
    <main className='min-h-screen flex items-center justify-center px-6 py-10 bg-black'>
      <div className='max-w-md w-full text-center space-y-4'>
        <Typography type='title2' className='text-white'>
          모바일 버전 준비 중
        </Typography>
        <Typography type='body1' className='text-gray-300'>
          이 페이지의 모바일 버전은 곧 출시됩니다.
          <br />
          데스크탑 브라우저로 접속하시면 모든 기능을 이용하실 수 있습니다.
        </Typography>
      </div>
    </main>
  );
};
```

- [ ] **Step 2: barrel**

```ts
// src/widgets/mobile-fallback-card/index.ts
export { MobileFallbackCard } from './mobile-fallback-card.component';
```

- [ ] **Step 3: 타입체크**

```bash
npx tsc --noEmit
```

Expected: error 0.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets/mobile-fallback-card/
git commit -m "feat(widgets/mobile-fallback-card): chunk 1 임시 모바일 안내 카드

모바일 페이지 본문이 채워지기 전(chunk 2~4) 임시 노출용.
Chunk 5 catch-up 에서 /mobile-notice 라우트 삭제와 함께 제거.

스펙: §3.3 Chunk 1 · §3.4"
```

---

### Task 3.2: `(lobby)/layout.tsx` 정리 + `(lobby)/page.tsx` RSC 변환

**Files:**

- Modify: `src/app/parties/(lobby)/layout.tsx`
- Modify: `src/app/parties/(lobby)/page.tsx`

- [ ] **Step 1: `(lobby)/layout.tsx` 정리 — Header · main wrapper 제거 (둘 다 DesktopLobby 가 가짐)**

```tsx
// src/app/parties/(lobby)/layout.tsx
import { PropsWithChildren } from 'react';

const PartyLobbyLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export default PartyLobbyLayout;
```

> 본 layout 은 더 이상 device-specific UI 없음. fragment-only wrapper. 향후 chunk 에서 추가 정리 (필요 시 layout 제거 검토 — 본 chunk 범위 밖).

- [ ] **Step 2: `(lobby)/page.tsx` RSC 변환**

```tsx
// src/app/parties/(lobby)/page.tsx
import { headers } from 'next/headers';
import { MobileFallbackCard } from '@/widgets/mobile-fallback-card';
import { DesktopLobby } from '@/widgets/partyroom-page-desktop';

const PartyLobbyPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  return isMobile ? <MobileFallbackCard /> : <DesktopLobby />;
};

export default PartyLobbyPage;
```

> `'use client'` 제거. `headers()` 는 RSC API.

- [ ] **Step 3: 데스크탑 로컬 검증 (npx next dev — [[reference_pfplay_web_local_dev_http_webpack]] 적용, yarn dev 금지)**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
npx next dev
```

다른 터미널에서:

```bash
# 데스크탑 UA 로 로비 진입
curl -i http://localhost:3000/parties \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
# 200 + HTML 정상 (Sidebar 등)

# 모바일 UA
curl -i http://localhost:3000/parties \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile Safari/604.1'
# 200 + HTML 에 "모바일 버전 준비 중" 텍스트 포함
```

Expected: 데스크탑은 기존 로비와 동일 렌더, 모바일은 fallback 카드 텍스트 포함.

- [ ] **Step 4: 타입체크 + 린트**

```bash
npx tsc --noEmit
npx eslint src/app/parties/\(lobby\)/
```

- [ ] **Step 5: 단위 테스트 영향 확인**

```bash
npx vitest run
```

Expected: 기존 테스트 무회귀(로비 관련 테스트 fail 시 fixture/mock 보강 — 본 task 안에서 처리).

- [ ] **Step 6: 커밋**

```bash
git add src/app/parties/\(lobby\)/layout.tsx \
        src/app/parties/\(lobby\)/page.tsx
git commit -m "refactor(parties/lobby): page.tsx RSC 변환 + x-pf-device 헤더 분기

- (lobby)/page.tsx 'use client' 제거 → RSC, headers() 로 device 분기
- 데스크탑: DesktopLobby 렌더 (기존 본문 + Header)
- 모바일: MobileFallbackCard 임시 노출 (chunk 5 에 제거)
- (lobby)/layout.tsx 는 fragment-only minimal wrapper 로 축소

스펙: §1.4.2 · §1.5.3 · §3.3 Chunk 1"
```

---

### Task 3.3: `(room)/[id]/layout.tsx` 정리 + `(room)/[id]/page.tsx` RSC 변환

**Files:**

- Modify: `src/app/parties/(room)/[id]/layout.tsx`
- Modify: `src/app/parties/(room)/[id]/page.tsx`

- [ ] **Step 1: `(room)/[id]/layout.tsx` 정리 — main bg className 제거 (DesktopRoom 이 가짐)**

```tsx
// src/app/parties/(room)/[id]/layout.tsx
'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren } from 'react';
import { useEnterPartyroom } from '@/features/partyroom/enter';
import { useTeardownPartyroom } from '@/features/partyroom/exit';
import { parseEntrySource } from '@/shared/lib/analytics/room-tracking';
import useDidMountEffect from '@/shared/lib/hooks/use-did-mount-effect';

export default function PartyroomLayout({ children }: PropsWithChildren) {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const partyroomId = Number(params.id);
  const entrySource = parseEntrySource(searchParams.get('source'));
  const enter = useEnterPartyroom(partyroomId, { entrySource });
  const teardown = useTeardownPartyroom(partyroomId);

  useDidMountEffect(() => {
    enter();

    if (searchParams.get('source')) {
      router.replace(`/parties/${params.id}`, { scroll: false });
    }

    return () => {
      teardown();
    };
  });

  return <>{children}</>;
}
```

> enter/teardown · ?source strip 은 device 무관 — 유지. main bg className 은 DesktopRoom 이 가짐. fragment-only wrapper.

- [ ] **Step 2: `(room)/[id]/page.tsx` RSC 변환**

```tsx
// src/app/parties/(room)/[id]/page.tsx
import { headers } from 'next/headers';
import { MobileFallbackCard } from '@/widgets/mobile-fallback-card';
import { DesktopRoom } from '@/widgets/partyroom-page-desktop';

const PartyroomPage = ({ params }: { params: { id: string } }) => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const partyroomId = Number(params.id);
  return isMobile ? <MobileFallbackCard /> : <DesktopRoom partyroomId={partyroomId} />;
};

export default PartyroomPage;
```

- [ ] **Step 3: 데스크탑 + 모바일 로컬 검증 (curl + 브라우저 hydration)**

`curl` 만으로는 RSC server 출력만 확인되고 client 'use client' 의 hydration 은 검증 안 됨. 본 chunk 1 가 RSC→client 경계를 새로 만드는 만큼 hydration 도 확인.

(a) curl 로 server 출력 확인:

```bash
# 백엔드 docker compose 가 떠 있어야 룸이 실제로 입장됨 (Cluster A presence 등).
npx next dev

# 별 터미널:
curl -i 'http://localhost:3000/parties/1' \
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
# 200 + 데스크탑 룸 HTML (PartyroomAvatars, PartyroomDisplayBoard 등 hydration target 포함)

curl -i 'http://localhost:3000/parties/1' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile Safari/604.1'
# 200 + "모바일 버전 준비 중"
```

(b) 브라우저 hydration 확인 (데스크탑 viewport, Chrome DevTools 열고):

1. `http://localhost:3000/parties/1` 진입
2. Console 에 hydration mismatch 경고 없음 확인
3. cinema toggle · DJ 큐 다이얼로그 등 interactive 동작 확인 (client state 작동 = hydration 성공)
4. React DevTools (있다면) → DesktopRoom 이 'use client' 트리로 표시되고 useState/useEffect 마운트 확인
5. 모바일 viewport (DevTools 디바이스 시뮬레이션) → fallback 카드 노출 + 다른 hydration 경고 없음

참고: [[reference_frontend_playwright_debug]] — 의심 시 Playwright headed 로 정확히 측정.

- [ ] **Step 4: 타입체크 + 린트**

```bash
npx tsc --noEmit
npx eslint src/app/parties/\(room\)/
```

- [ ] **Step 5: 단위·통합 테스트 무회귀**

```bash
npx vitest run
```

- [ ] **Step 6: 커밋**

```bash
git add src/app/parties/\(room\)/\[id\]/layout.tsx \
        src/app/parties/\(room\)/\[id\]/page.tsx
git commit -m "refactor(parties/room): page.tsx RSC 변환 + x-pf-device 헤더 분기

- (room)/[id]/page.tsx 'use client' 제거 → RSC, headers() 로 device 분기
- params.id → DesktopRoom partyroomId prop
- 데스크탑: DesktopRoom 렌더 (기존 본문 + main bg 이미지 + DesktopOverlays)
- 모바일: MobileFallbackCard 임시 노출 (chunk 5 에 제거)
- (room)/[id]/layout.tsx 는 enter/teardown·?source strip 만 유지

스펙: §1.4.2 · §1.5.3 · §3.3 Chunk 1"
```

---

### Task 3.4: ProtectedLayout overlay 3개 제거

**Files:**

- Modify: `src/app/parties/layout.tsx`

DesktopLobby/DesktopRoom 이 이미 `<DesktopOverlays />` 를 렌더하므로 ProtectedLayout 에서 제거. auth 게이트는 device 무관 유지.

- [ ] **Step 0: scope 사전 확인 — 다른 라우트가 본 overlay 들에 의존하는지 grep**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
grep -rn "MyPlaylist\|SidebarPlayer\|ModalPlayer" src/app/ src/widgets/ src/features/ \
  | grep -v "src/widgets/my-playlist\|src/widgets/music-preview-player\|src/widgets/partyroom-page-desktop"
```

Expected: 외부 의존 발견 = ProtectedLayout 의 sibling 위치가 아닌 다른 곳에서 mount 되는 경우. 일반적으로 모두 `app/parties/*` 트리 안에서만 쓰임. 만약 비-`/parties` 라우트가 의존하면 본 task 전에 별 조치 (대안 mount 점 또는 본 chunk 범위 확장 결정).

- [ ] **Step 1: layout.tsx 수정**

```tsx
// src/app/parties/layout.tsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import { GUEST_AUTO_LOGIN_ROUTE_PATTERN } from '@/entities/me/model/constants';
import { usePartyroomEnterErrorAlerts } from '@/features/partyroom/enter';
import { useAutoSignInByGuest } from '@/features/sign-in/by-guest';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import PlaylistActionProvider from './playlist-action.provider';
import PartyroomConnectionProvider from '../_providers/partyroom-connection.provider';

const ProtectedLayout = ({ children }: PropsWithChildren) => {
  const { data: me, error, isLoading } = useFetchMe();
  const pathname = usePathname();
  const router = useRouter();

  const isPartyroomRoute = GUEST_AUTO_LOGIN_ROUTE_PATTERN.test(pathname);
  const partyroomIdFromPath = isPartyroomRoute ? Number(pathname.split('/')[2]) : null;
  const { isSigningIn } = useAutoSignInByGuest(error, partyroomIdFromPath);

  /**
   * 비로그인 상태에서 로비 등 파티룸이 아닌 라우트 접속 시 홈으로 리다이렉트
   */
  useEffect(() => {
    if (error && isAuthError(error) && !isPartyroomRoute) {
      location.href = '/';
    }
  }, [error, isPartyroomRoute]);

  useEffect(() => {
    /**
     * 로그인은 했지만 프로필을 아직 생성하지 않은 경우
     */
    if (me && !me.profileUpdated) {
      router.replace('/settings/profile');
    }
  }, [me, router]);

  usePartyroomEnterErrorAlerts();

  if (isLoading || isSigningIn || !me || !me.profileUpdated) {
    return null;
  }

  return (
    <PartyroomConnectionProvider>
      <PlaylistActionProvider>{children}</PlaylistActionProvider>
    </PartyroomConnectionProvider>
  );
};

export default ProtectedLayout;
```

> 변경: 3 overlay (`<MyPlaylist />`, `<SidebarPlayer />`, `<ModalPlayer />`) 와 관련 import 4건 제거. 나머지 auth gate · profile 미생성 redirect · auto-guest-sign-in 로직은 그대로.

- [ ] **Step 2: 데스크탑 회귀 검증 (수동)**

```bash
npx next dev
```

브라우저에서:

1. `http://localhost:3000/parties` 진입 → 로비 정상 (MyPlaylist · SidebarPlayer · ModalPlayer 가 DesktopLobby 안에서 렌더됨)
2. `http://localhost:3000/parties/1` 진입 → 룸 정상 (overlay 동일)
3. 플레이리스트 열기 → 정상
4. 검색 모달 → 미리보기 플레이어 정상

- [ ] **Step 3: 타입체크 + 린트**

```bash
npx tsc --noEmit
npx eslint src/app/parties/layout.tsx
```

- [ ] **Step 4: 단위 테스트 무회귀**

```bash
npx vitest run
```

- [ ] **Step 5: 커밋**

```bash
git add src/app/parties/layout.tsx
git commit -m "refactor(parties/layout): desktop overlay 3개 제거 (desktop shell 로 이동)

ProtectedLayout 의 device-specific overlay (MyPlaylist · SidebarPlayer · ModalPlayer) 를
DesktopLobby · DesktopRoom 내부의 DesktopOverlays 로 이동. auth gate · auto-guest-sign-in
· profile-not-created redirect 는 device 무관 — 유지.

모바일 트리는 본 overlay 를 import 하지 않음 (격리 가치 첫 실현).

스펙: §1.4.2 · §3.3 Chunk 1"
```

---

## Phase 4: GH 이슈 #340 갱신 + 마무리 검증

### Task 4.1: GH 이슈 #340 본문에 §5 갱신 코멘트

**Files:** 없음 (GitHub 코멘트만)

- [ ] **Step 1: 코멘트 작성**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
gh issue comment 340 --body '## 결정 갱신 (chunk 1 PR 동봉)

스코프(2026-05-22) §확정결정 **5번** "모바일 게스트 채팅 차단" → **"허용"** 으로 갱신.

**근거:**

- WS 이미 게스트 입장 시점에 연결됨 → 채팅 송신은 추가 인프라 비용 0
- 데스크탑은 게스트 채팅 허용 → 모바일에서만 막으면 데스크탑↔모바일 일관성 깨짐
- 게스트의 채팅 참여 자체가 "혼자 아니다" 핵심 체험 가치 → 막으면 깔때기 결정적 칸이 비워짐
- 전환 압력은 DJ/큐잉/grab 게이트만으로 충분

상세: `pfplay-web/docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` §2.2 갱신 + 결정 이력'
```

- [ ] **Step 2: 확인**

```bash
gh issue view 340 --comments | tail -20
```

Expected: 위 코멘트가 노출됨.

---

### Task 4.2: 전체 스위트 무회귀 검증 + 커밋 정리

**Files:** 없음 (검증 + push 준비)

- [ ] **Step 1: 전체 단위·통합 테스트**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
npx vitest run
```

Expected: 전체 PASS. 실패가 있으면 어느 task 에서 회귀를 만들었는지 추적해 fix.

- [ ] **Step 2: 타입체크 (전 코드)**

```bash
npx tsc --noEmit
```

Expected: error 0.

- [ ] **Step 3: 린트 (전 코드)**

```bash
npx eslint src/
```

Expected: error 0.

- [ ] **Step 4: 빌드 확인 (RSC 변환 후 prod build 가 깨지지 않는지)**

```bash
npx next build
```

Expected:

- 빌드 성공
- `/parties` · `/parties/[id]` 가 빌드 manifest 에서 **`ƒ (Dynamic)`** 로 표기 (RSC + `headers()` 사용 → 자동 dynamic). 만약 `○ (Static)` 으로 표기되면 something wrong — page 가 RSC 변환되지 않았거나 headers() 호출이 누락.
- 만약 다음 류 에러 발생: `Dynamic server usage: Page couldn't be rendered statically because it used \`headers\`.`— 페이지에`export const dynamic = 'force-static'`또는`generateStaticParams` 가 남아 있는지 확인. 본 chunk 의 page.tsx 에 위 export 없음을 사전 확인:

  ```bash
  grep -E "force-static|generateStaticParams|revalidate" src/app/parties/\(lobby\)/page.tsx src/app/parties/\(room\)/\[id\]/page.tsx
  ```

  (없어야 함.)

- [ ] **Step 5: 데스크탑 헤드드 smoke (수동)**

```bash
npx next dev
```

브라우저에서 데스크탑 UA 로:

1. `http://localhost:3000/parties` — 로비 (Sidebar · 카드 그리드)
2. `http://localhost:3000/parties/1` — 룸 (전광판 · 채팅 · cinema toggle)
3. 사이드바·헤더·이용 정상

모바일 viewport (DevTools) 로:

1. `/parties` — fallback 카드 "모바일 버전 준비 중"
2. `/parties/1` — fallback 카드

- [ ] **Step 6: 로컬 커밋 정리 ([[feedback_commit_consolidation_before_push]] 확인)**

```bash
git log --oneline origin/development..HEAD
```

본 chunk 의 커밋 시리즈가 논리 단위로 적절히 분리되어 있어야 함. 본 plan 의 task 단위 = 논리 단위. 추가 squash 불필요.

- [ ] **Step 7: push 준비 알림 (사용자 트리거 대기)**

```
# 사용자가 명시적으로 푸시 트리거할 때까지 보류.
# 명시 트리거 받으면:
# git push -u origin feature/mobile-responsive-spec
# (또는 별 chunk-1 전용 브랜치 분기 후 push — 사용자 결정)
```

---

## 마무리 체크리스트

- [ ] 모든 Phase 1~4 task 의 step 완료 + 체크
- [ ] `git log --oneline origin/development..HEAD` 가 의도한 커밋 시리즈와 일치
- [ ] `npx vitest run` · `npx tsc --noEmit` · `npx eslint src/` 모두 green
- [ ] `npx next build` 성공
- [ ] 데스크탑 헤드드 smoke 통과 (로비·룸·overlay 동작)
- [ ] 모바일 헤드드 smoke 통과 (fallback 카드 노출)
- [ ] GH 이슈 #340 에 §5 갱신 코멘트 게시
- [ ] 사용자에게 PR 생성/push 트리거 요청

## 롤백 절차

본 chunk 1 의 모든 commit 은 단일 PR 로 머지된다(Phase 1 의 atomic-PR 제약). 머지 후 데스크탑 회귀가 발견되면:

```bash
# main(stg) 머지 후라면 develop 에 revert PR
gh pr create -B development -H revert/mobile-responsive-chunk1 \
  --title "revert: 모바일 반응형 chunk 1 (Foundation) 회귀 대응" \
  --body "원인: ..."

# 로컬 branch 단계라면 단순 reset:
git log --oneline origin/development..HEAD
git reset --hard origin/development
```

원자성 보장: phase 사이 partial revert 는 금지(중간 상태가 prod 동작 불가). 전체 PR 단위로만 revert.

## 다음 chunk

본 chunk 1 PR 머지 + dev/stg 안정화 후 chunk 2 (로비 + 룸 청취) plan 작성. 별 plan 파일 = `docs/superpowers/plans/YYYY-MM-DD-mobile-responsive-chunk2-lobby-room-listening.md`.

본 plan 의 진실 원천 = `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md`.
