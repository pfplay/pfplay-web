# Mobile Desktop Redirect Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 접속 시 데스크탑 전환 안내 페이지(`/mobile-notice`)로 리다이렉트하는 기능 구현

**Architecture:** Next.js 미들웨어에서 UA 기반 1차 감지 후 리다이렉트, 클라이언트 MobileGuard 컴포넌트에서 뷰포트 기반 2차 보정. `/mobile-notice` 페이지는 헤더/푸터 없는 단독 레이아웃으로 다크 테마 안내 메시지를 표시.

**Tech Stack:** Next.js 14 App Router, Tailwind CSS, Vitest, React Testing Library

**Spec:** `docs/superpowers/specs/2026-04-19-mobile-desktop-redirect-design.md`

---

## Chunk 1: Utility & i18n

### Task 1: `isMobileUA` 유틸리티 함수

**Files:**

- Create: `src/shared/lib/functions/is-mobile-ua.ts`
- Test: `src/shared/lib/functions/is-mobile-ua.test.ts`

- [ ] **Step 1: 테스트 파일 작성**

```ts
// src/shared/lib/functions/is-mobile-ua.test.ts
import { isMobileUA } from './is-mobile-ua';

describe('isMobileUA', () => {
  test('iPhone Safari UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Android Chrome UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('iPod UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('BlackBerry UA를 모바일로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (BB10; Kbd) AppleWebKit/537.35+ (KHTML, like Gecko) Version/10.3.3.2205 Mobile Safari/537.35+';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('Opera Mini UA를 모바일로 판별한다', () => {
    const ua =
      'Opera/9.80 (Android; Opera Mini/36.2.2254/191.241; U; en) Presto/2.12.423 Version/12.16';
    expect(isMobileUA(ua)).toBe(true);
  });

  test('데스크탑 Chrome UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('데스크탑 Firefox UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:120.0) Gecko/20100101 Firefox/120.0';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('데스크탑 Safari UA를 데스크탑으로 판별한다', () => {
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('iPadOS 13+는 데스크탑 Safari UA를 전송하므로 데스크탑으로 판별한다', () => {
    // iPadOS 13+ sends macOS desktop Safari UA — iPad keyword is NOT in the string
    const ua =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15';
    expect(isMobileUA(ua)).toBe(false);
  });

  test('빈 문자열은 데스크탑으로 판별한다', () => {
    expect(isMobileUA('')).toBe(false);
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `yarn vitest run src/shared/lib/functions/is-mobile-ua.test.ts`
Expected: FAIL — `isMobileUA` 모듈을 찾을 수 없음

- [ ] **Step 3: 구현 작성**

```ts
// src/shared/lib/functions/is-mobile-ua.ts
const MOBILE_UA_REGEX = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i;

export const isMobileUA = (ua: string): boolean => MOBILE_UA_REGEX.test(ua);
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `yarn vitest run src/shared/lib/functions/is-mobile-ua.test.ts`
Expected: PASS — 모든 10개 테스트 통과

- [ ] **Step 5: 커밋**

```bash
git add src/shared/lib/functions/is-mobile-ua.ts src/shared/lib/functions/is-mobile-ua.test.ts
git commit -m "feat: isMobileUA 유틸리티 함수 및 테스트 추가"
```

---

### Task 2: i18n 키 추가

**Files:**

- Modify: `src/shared/lib/localization/dictionaries/ko.json` (끝부분, `crews` 키 뒤)
- Modify: `src/shared/lib/localization/dictionaries/en.json` (끝부분, `crews` 키 뒤)

- [ ] **Step 1: `ko.json`에 `mobileNotice` 키 추가**

`crews` 블록 닫는 `}` 뒤에 쉼표(`,`)를 추가한 후 새 블록을 삽입:

```json
  "mobileNotice": {
    "title": "파티는 큰 화면에서!",
    "description": "PFPlay는 현재 데스크탑에서 즐길 수 있어요. PC나 노트북으로 접속해주세요!"
  }
```

- [ ] **Step 2: `en.json`에 `mobileNotice` 키 추가**

`crews` 블록 닫는 `}` 뒤에 쉼표(`,`)를 추가한 후 새 블록을 삽입:

```json
  "mobileNotice": {
    "title": "The party's better on a big screen!",
    "description": "PFPlay is currently available on desktop. Please visit us from your PC or laptop!"
  }
```

- [ ] **Step 3: 타입 체크**

Run: `yarn test:type`
Expected: PASS — `Dictionary` 타입은 `en.json`에서 자동 추론되므로 (`type Dictionary = typeof DictionaryEN`), 두 JSON에 동일한 키 구조가 있으면 통과.

- [ ] **Step 4: 커밋**

```bash
git add src/shared/lib/localization/dictionaries/ko.json src/shared/lib/localization/dictionaries/en.json
git commit -m "feat: mobileNotice i18n 키 추가 (KO/EN)"
```

---

## Chunk 2: Mobile Notice Page

### Task 3: `/mobile-notice` 레이아웃

**Files:**

- Create: `src/app/mobile-notice/layout.tsx`

**참고 파일:** `src/app/(home)/layout.tsx` — 기존 레이아웃 패턴 참고. 홈은 `Header`/`Footer` + `bg-onboarding`. mobile-notice는 헤더/푸터 없이 `bg-onboarding`만 사용.

- [ ] **Step 1: 레이아웃 파일 작성**

```tsx
// src/app/mobile-notice/layout.tsx
import { FC, PropsWithChildren } from 'react';

const MobileNoticeLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main className='bg-onboarding min-h-screen flexColCenter px-6'>{children}</main>;
};

export default MobileNoticeLayout;
```

- [ ] **Step 2: 커밋**

```bash
git add src/app/mobile-notice/layout.tsx
git commit -m "feat: /mobile-notice 단독 레이아웃 추가"
```

---

### Task 4: `/mobile-notice` 페이지

**Files:**

- Create: `src/app/mobile-notice/page.tsx`

**참고 파일:**

- `src/app/(home)/page.tsx` — `Image` 컴포넌트로 워드마크 로고 사용 패턴
- `src/app/(auth)/sign-in/page.tsx` — 로고 + 중앙 정렬 카드 패턴
- 스펙의 "콘텐츠 (수직 중앙 정렬)" 섹션

**디자인 구성 (수직 순서):**

1. PFPlay 워드마크 로고 (`/images/Logo/wordmark_medium_white.png`)
2. 구분선
3. 모니터 아이콘 (인라인 SVG)
4. 제목 (`t.mobileNotice.title`)
5. 설명 (`t.mobileNotice.description`)
6. 구분선
7. `pfplay.xyz` URL 텍스트

- [ ] **Step 1: 페이지 컴포넌트 작성**

```tsx
// src/app/mobile-notice/page.tsx
'use client';

import Image from 'next/image';
import { useI18n } from '@/shared/lib/localization/i18n.context';

const DesktopMonitorIcon = () => (
  <svg
    width='56'
    height='56'
    viewBox='0 0 56 56'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
    aria-hidden='true'
  >
    <rect x='6' y='8' width='44' height='30' rx='3' stroke='#e5e5e5' strokeWidth='2' />
    <rect x='10' y='12' width='36' height='22' rx='1' fill='#1a1a1a' />
    <line x1='20' y1='42' x2='36' y2='42' stroke='#e5e5e5' strokeWidth='2' strokeLinecap='round' />
    <line x1='28' y1='38' x2='28' y2='42' stroke='#e5e5e5' strokeWidth='2' />
    <circle cx='28' cy='23' r='5' stroke='#AE001F' strokeWidth='1.5' />
    <polygon points='26.5,21 26.5,25 30,23' fill='#AE001F' />
  </svg>
);

const Divider = () => <div className='w-[60px] h-px bg-gray-800' />;

const MobileNoticePage = () => {
  const t = useI18n();

  return (
    <div className='flex flex-col items-center gap-7 max-w-[320px] text-center'>
      <Image
        src='/images/Logo/wordmark_medium_white.png'
        width={150}
        height={36}
        alt='PFPlay'
        priority
        className='object-contain'
      />

      <Divider />

      <DesktopMonitorIcon />

      <h1 className='text-xl font-bold text-gray-200 leading-relaxed'>{t.mobileNotice.title}</h1>

      <p className='text-sm text-gray-400 leading-relaxed max-w-[280px]'>
        {t.mobileNotice.description}
      </p>

      <Divider />

      <span className='text-xs text-gray-600'>pfplay.xyz</span>
    </div>
  );
};

export default MobileNoticePage;
```

- [ ] **Step 2: 개발 서버에서 `/mobile-notice` 접속하여 시각적 확인**

Run: `npx next dev --turbo --port 3000`
Navigate: `http://localhost:3000/mobile-notice`
Expected: 다크 배경에 로고, 모니터 아이콘, 제목, 설명, URL 텍스트가 수직 중앙 정렬로 표시

- [ ] **Step 3: 커밋**

```bash
git add src/app/mobile-notice/page.tsx
git commit -m "feat: /mobile-notice 페이지 컴포넌트 구현"
```

---

## Chunk 3: MobileGuard Component

### Task 5: MobileGuard 컴포넌트

**Files:**

- Create: `src/shared/ui/components/mobile-guard/mobile-guard.component.tsx`
- Create: `src/shared/ui/components/mobile-guard/index.ts`
- Test: `src/shared/ui/components/mobile-guard/mobile-guard.component.test.tsx`
- Modify: `src/app/layout.tsx:36` (MobileGuard 추가)

**참고 파일:**

- `src/shared/lib/router/use-app-router.hook.ts` — `useAppRouter` 사용 패턴. `push`에 `PathMap` 타입 필요.
- `types/pathmap.d.ts` — `/mobile-notice` 경로 추가 필요.
- `src/shared/ui/components/back-button/index.ts` — barrel export 패턴 참고.

- [ ] **Step 1: PathMap에 `/mobile-notice` 경로 추가**

`types/pathmap.d.ts`에 추가:

```ts
'/mobile-notice': { path: undefined };
```

(`'/parties/[id]'` 행 뒤에 추가)

- [ ] **Step 2: 테스트 파일 작성**

```tsx
// src/shared/ui/components/mobile-guard/mobile-guard.component.test.tsx
vi.mock('@/shared/lib/router/use-app-router.hook');

import { renderHook } from '@testing-library/react';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';
import { useMobileGuard } from './mobile-guard.component';

const mockPush = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  (useAppRouter as Mock).mockReturnValue({ push: mockPush });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useMobileGuard', () => {
  test('뷰포트 너비가 768px 미만이면 /mobile-notice로 이동한다', () => {
    vi.stubGlobal('innerWidth', 375);

    renderHook(() => useMobileGuard());

    expect(mockPush).toHaveBeenCalledWith('/mobile-notice');
  });

  test('뷰포트 너비가 768px 이상이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 1024);

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('뷰포트 너비가 정확히 768px이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 768);

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });

  test('현재 경로가 /mobile-notice이면 이동하지 않는다', () => {
    vi.stubGlobal('innerWidth', 375);
    vi.stubGlobal('location', { pathname: '/mobile-notice' });

    renderHook(() => useMobileGuard());

    expect(mockPush).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: 테스트 실행하여 실패 확인**

Run: `yarn vitest run src/shared/ui/components/mobile-guard/mobile-guard.component.test.tsx`
Expected: FAIL — `useMobileGuard` 모듈을 찾을 수 없음

- [ ] **Step 4: MobileGuard 컴포넌트 구현**

```tsx
// src/shared/ui/components/mobile-guard/mobile-guard.component.tsx
'use client';

import { useEffect } from 'react';
import { useAppRouter } from '@/shared/lib/router/use-app-router.hook';

const TABLET_BREAKPOINT = 768;

export const useMobileGuard = () => {
  const router = useAppRouter();

  useEffect(() => {
    if (window.location.pathname === '/mobile-notice') return;
    if (window.innerWidth < TABLET_BREAKPOINT) {
      router.push('/mobile-notice');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

const MobileGuard = () => {
  useMobileGuard();
  return null;
};

export default MobileGuard;
```

- [ ] **Step 5: barrel export 작성**

```ts
// src/shared/ui/components/mobile-guard/index.ts
export { default as MobileGuard } from './mobile-guard.component';
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `yarn vitest run src/shared/ui/components/mobile-guard/mobile-guard.component.test.tsx`
Expected: PASS — 4개 테스트 통과

- [ ] **Step 7: Root Layout에 MobileGuard 추가**

`src/app/layout.tsx`를 수정한다. import 추가 후 `<body>` 바로 안에 `<MobileGuard />` 삽입:

```tsx
// import 추가 (기존 import 블록에)
import { MobileGuard } from '@/shared/ui/components/mobile-guard';

// <body> 태그 안, 첫 번째 자식으로 추가:
<body className={pretendardVariable.className}>
  <MobileGuard />
  <ReactQueryProvider>{/* ... 기존 코드 유지 */}</ReactQueryProvider>
  {/* ... 기존 코드 유지 */}
</body>;
```

- [ ] **Step 8: 커밋**

```bash
git add types/pathmap.d.ts src/shared/ui/components/mobile-guard/ src/app/layout.tsx
git commit -m "feat: MobileGuard 컴포넌트 구현 및 Root Layout에 추가"
```

---

## Chunk 4: Middleware

### Task 6: 미들웨어에 모바일 감지 로직 추가

**Files:**

- Modify: `src/middleware.ts:1-21` (모바일 감지 로직 추가)

**참고 파일:**

- 스펙의 "미들웨어 변경 상세" 섹션
- 기존 `src/middleware.ts` — 언어 쿠키 설정 로직. `/mobile-notice`도 이 로직을 통과해야 함.

**변경 핵심:** `isMobileUA` import 추가, 기존 로직 앞에 모바일 감지 분기 삽입. `/mobile-notice` 경로는 리다이렉트에서 제외하되 언어 쿠키 로직은 통과시킨다.

- [ ] **Step 1: 미들웨어 수정**

`src/middleware.ts` 수정 — import 추가 및 함수 본문 변경:

```ts
// 기존 import 뒤에 추가
import { isMobileUA } from '@/shared/lib/functions/is-mobile-ua';

export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 모바일 UA 감지 → /mobile-notice로 리다이렉트 (단, /mobile-notice 자체는 제외)
  if (pathname !== '/mobile-notice') {
    const ua = req.headers.get('user-agent') || '';
    if (isMobileUA(ua)) {
      return NextResponse.redirect(new URL('/mobile-notice', req.url));
    }
  }

  // 기존 언어 쿠키 로직 (모든 요청에 적용, /mobile-notice 포함)
  const response = NextResponse.next();

  if (!req.cookies.get(LANGUAGE_COOKIE_KEY)?.value) {
    response.cookies.set(LANGUAGE_COOKIE_KEY, Language.En, {
      path: '/',
      maxAge: TEN_YEARS,
      secure: true,
    });

    setCookieToRequestHeader(req, response);

    return response;
  }
};
```

`config.matcher`는 변경 없음 — 기존 matcher가 이미 `/mobile-notice`를 포함.

- [ ] **Step 2: 개발 서버에서 동작 확인**

Run: `npx next dev --turbo --port 3000`

- 데스크탑 브라우저에서 `http://localhost:3000` 접속 → 기존 홈페이지 표시 (리다이렉트 없음)
- 브라우저 DevTools > Network conditions에서 UA를 iPhone으로 변경 후 접속 → `/mobile-notice`로 리다이렉트

- [ ] **Step 3: 커밋**

```bash
git add src/middleware.ts
git commit -m "feat: 미들웨어에 모바일 UA 감지 리다이렉트 추가"
```

---

### Task 7: 전체 테스트 실행 및 최종 확인

- [ ] **Step 1: 전체 테스트 스위트 실행**

Run: `yarn test`
Expected: 기존 테스트 + 새 테스트 모두 PASS

- [ ] **Step 2: 타입 체크**

Run: `yarn test:type`
Expected: PASS

- [ ] **Step 3: 최종 커밋 (필요 시)**

누락된 파일이 있으면 추가 커밋. 없으면 스킵.
