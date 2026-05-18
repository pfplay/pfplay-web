# #303 auth-setup 미인증 storageState 오염 근본 수정 — 구현 계획

> **개정 (2026-05-19, 검증 후)**: Task 1(B① shouldRetryQuery)은 사이드이펙트
> (게스트 자동로그인 ~3s 지연) 검증 발견으로 **드롭**됨. #303 근본 해소는
> Task 3·4(B②)+Task 5(A, +리스너 클릭전 arm 보정)만으로 충분(E2E 11/11 green).
> 상세 근거는 스펙 문서 상단 개정 노트 참조. 본 계획 Task 1 절은 역사적 기록.

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 사전인증 401 → `handleBubbledError` 하드 redirect 가 진행 중 sign-in POST 를 abort 해 E2E auth-setup 이 미인증 storageState 를 기록하던 #303 근본을 A+B 통합으로 제거한다.

**Architecture:** A = auth-setup 가 storageState 기록 전 authed `/me/info` 200 을 명시 대기(fail-loud, 테스트 전용). B① = bounded 401 query retry(`shouldRetryQuery` 순수함수, #313 흡수). B② = `handleBubbledError` 를 별도 모듈로 추출 후 public/guest-auto-login 경로에서 하드 redirect 억제(전역 단일점, 데코레이터와 동일 진실원천).

**Tech Stack:** Next.js App Router, @tanstack/react-query, axios, vitest(jsdom), Playwright.

**Spec:** `docs/superpowers/specs/2026-05-19-303-auth-setup-poisoning-fix-design.md`

---

## File Structure

- Create `src/app/_providers/should-retry-query.ts` — 순수 query retry 정책(B①).
- Create `src/app/_providers/should-retry-query.test.ts` — B① 단위테스트(7).
- Create `src/app/_providers/handle-bubbled-error.tsx` — `handleBubbledError` 추출(이동 + B② public-게이트). 단일 책임·단위테스트 가능.
- Create `src/app/_providers/handle-bubbled-error.test.tsx` — B② 단위테스트.
- Modify `src/app/_providers/react-query.provider.tsx` — `shouldRetryQuery`/`handleBubbledError` import 로 치환, 미사용 import 정리.
- Modify `e2e/auth/shared.ts` — A: authed-200 게이트, URL-only 재시도 루프 제거.

각 단위 책임: `should-retry-query` = "이 에러를 재시도할까"(React/next 무의존, 순수). `handle-bubbled-error` = "버블된 에러를 전역 처리(redirect/Dialog)"(클라 한정, location/Dialog 의존). provider = 두 정책을 QueryClient 에 배선만.

---

## Chunk 1: A + B 통합 구현

### Task 1: B① — `shouldRetryQuery` 순수함수 (#313 흡수)

**Files:**

- Create: `src/app/_providers/should-retry-query.test.ts`
- Create: `src/app/_providers/should-retry-query.ts`

- [ ] **Step 1: 실패 테스트 작성** — `src/app/_providers/should-retry-query.test.ts`

```ts
import { shouldRetryQuery } from './should-retry-query';

const authError = { isAxiosError: true, response: { status: 401 } };
const forbiddenError = { isAxiosError: true, response: { status: 403 } };
const serverError = { isAxiosError: true, response: { status: 500 } };
const networkError = { isAxiosError: true, message: 'Network Error' };

describe('shouldRetryQuery (web#303 / #312 — 일시 401 bounded retry)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('development 환경이면 무조건 false (어떤 에러든)', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(shouldRetryQuery(1, authError)).toBe(false);
    expect(shouldRetryQuery(1, serverError)).toBe(false);
  });

  test('403(forbidden)은 즉시 중단 — 재시도 무의미', () => {
    expect(shouldRetryQuery(1, forbiddenError)).toBe(false);
    expect(shouldRetryQuery(3, forbiddenError)).toBe(false);
  });

  describe('401(auth) — 일시 401 자가회복용 bounded 재시도', () => {
    test('failureCount 1·2 는 재시도(true)', () => {
      expect(shouldRetryQuery(1, authError)).toBe(true);
      expect(shouldRetryQuery(2, authError)).toBe(true);
    });

    test('failureCount 3 부터는 확정(false) → 그때 리다이렉트', () => {
      expect(shouldRetryQuery(3, authError)).toBe(false);
      expect(shouldRetryQuery(4, authError)).toBe(false);
    });

    test('error.status(직접)로도 401 인식', () => {
      expect(shouldRetryQuery(1, { isAxiosError: true, status: 401 })).toBe(true);
    });
  });

  describe('기타 에러(5xx/네트워크) — 기존 정책 보존', () => {
    test('failureCount <= 3 재시도', () => {
      expect(shouldRetryQuery(1, serverError)).toBe(true);
      expect(shouldRetryQuery(3, networkError)).toBe(true);
    });

    test('failureCount 4 부터 중단', () => {
      expect(shouldRetryQuery(4, serverError)).toBe(false);
    });
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/app/_providers/should-retry-query.test.ts`
Expected: FAIL — `Failed to resolve import "./should-retry-query"`.

- [ ] **Step 3: 구현 작성** — `src/app/_providers/should-retry-query.ts`

```ts
import isAuthError from '@/shared/api/http/error/is-auth-error';
import isForbiddenError from '@/shared/api/http/error/is-forbidden-error';

/**
 * 전역 쿼리 retry 정책 (web#303 / #312).
 *
 * 401(`isAuthError`)을 즉시 no-retry 로 확정하면, cold-start·세션 워밍·레이스
 * 로 인한 **일시 401** 도 곧장 에러 확정 → `handleBubbledError` 및
 * `ProtectedLayout` 의 `location.href='/'` 가 발화해 사용자를 홈으로 추방한다
 * (#303 의 `navigated to "/"`). 일시 401 과 확정 미인증 401 은 응답만으로
 * 구분 불가하므로, **bounded 재시도**로 일시 401 을 자가회복시키고 — 재시도
 * 후에도 401 이면 그때 확정시켜 정상적으로 리다이렉트한다.
 *
 * - 403(`isForbiddenError`)은 권한 문제로 재시도 무의미 → 즉시 중단(기존 동작).
 * - mutation 에는 적용되지 않음(queries 기본 옵션).
 *
 * 순수 함수로 분리(provider 의 React/next 의존과 디커플) — 단위 테스트 용이.
 */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (process.env.NODE_ENV === 'development') return false;
  if (isForbiddenError(error)) return false;
  if (isAuthError(error)) return failureCount <= 2; // 최대 2회 재시도 후 확정
  return failureCount <= 3;
}
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/app/_providers/should-retry-query.test.ts`
Expected: PASS (7 test 블록 green).

- [ ] **Step 5: 커밋**

```bash
git add src/app/_providers/should-retry-query.ts src/app/_providers/should-retry-query.test.ts
git commit -m "feat(303): bounded 401 query retry 정책 분리 (B①, #313 흡수)"
```

---

### Task 2: B② 준비 — `handleBubbledError` 모듈 추출 (행위 불변 refactor)

`handleBubbledError` 는 현재 `react-query.provider.tsx` 내부 비공개 함수라 단위 테스트 불가. `should-retry-query` 와 동일 패턴으로 별도 모듈 추출. **이 Task 는 행위 변경 0** (B② 게이트는 Task 4·5).

**Files:**

- Create: `src/app/_providers/handle-bubbled-error.tsx`
- Modify: `src/app/_providers/react-query.provider.tsx`

- [ ] **Step 1: `handle-bubbled-error.tsx` 생성** — 기존 `react-query.provider.tsx` 의 `handleBubbledError` 본문과 그 전용 import 를 그대로 이동 (행위 동일):

```tsx
import { getErrorMessage } from '@/shared/api/http/error/get-error-message';
import isAuthError from '@/shared/api/http/error/is-auth-error';
import { shouldSkipGlobalErrorHandling } from '@/shared/lib/decorators/skip-global-error-handling';
import { Dialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';

export function handleBubbledError(error: unknown) {
  if (shouldSkipGlobalErrorHandling(error)) {
    return;
  }

  const errorMessage = getErrorMessage(error);

  if (typeof window === 'undefined') {
    console.error(`[ERROR] ${errorMessage}`);
    return;
  }

  if (isAuthError(error)) {
    if (location.pathname !== '/' && !location.pathname.startsWith('/link/')) {
      location.href = '/';
    }
    return;
  }

  console.error(error);

  const { destroy } = Dialog.open({
    title: 'Error',
    Body: () => (
      <>
        <Typography type='caption1' className='text-gray-50'>
          {errorMessage}
        </Typography>

        <Dialog.ButtonGroup>
          <Dialog.Button onClick={() => destroy()}>Close</Dialog.Button>
        </Dialog.ButtonGroup>
      </>
    ),
    onClose: () => destroy(),
  });
}
```

- [ ] **Step 2: `react-query.provider.tsx` 수정** — `handleBubbledError` 본문·전용 import 제거, 모듈 import 로 치환. 변경 후 import 블록:

```tsx
'use client';
import { ReactNode } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { FIVE_MINUTES } from '@/shared/config/time';
import { handleBubbledError } from './handle-bubbled-error';
import { shouldRetryQuery } from './should-retry-query';
```

`makeQueryClient` 의 `retry` 인라인 람다를 `retry: shouldRetryQuery,` 로 치환. `QueryCache({ onError: handleBubbledError })`·`MutationCache({ onError: handleBubbledError })` 는 그대로(이제 import 된 함수 참조). 파일에서 `getErrorMessage`/`isAuthError`/`isForbiddenError`/`shouldSkipGlobalErrorHandling`/`Dialog`/`Typography` import 와 `handleBubbledError` 함수 정의는 **삭제**.

- [ ] **Step 3: 타입·린트·기존 테스트 green 확인 (행위 불변 검증)**

Run: `yarn tsc --noEmit && yarn eslint src/app/_providers --quiet && yarn vitest run src/app/_providers`
Expected: tsc 0 error, eslint 0 **error**(미사용 import 잔존 없음), 기존 should-retry-query 테스트 PASS.

> 주: 게이트는 레포 컨벤션(`eslint src --fix --quiet`, **errors-only**)에 맞춰 `--quiet`. `--max-warnings=0` 은 기존 무관 warning(`react-query.provider.tsx`/`handle-bubbled-error.tsx` 의 `i18next/no-literal-string` — `'Error'` Dialog 리터럴, 본 작업이 *이동*할 뿐 신규 아님)에 걸려 false-fail. 신규 import/미사용은 error 로 잡히므로 `--quiet` 로 충분.

- [ ] **Step 4: 커밋**

```bash
git add src/app/_providers/handle-bubbled-error.tsx src/app/_providers/react-query.provider.tsx
git commit -m "refactor(303): handleBubbledError 모듈 추출 + shouldRetryQuery 배선 (행위 불변)"
```

---

### Task 3: B② — public-route redirect 억제 (실패 테스트)

**Files:**

- Create: `src/app/_providers/handle-bubbled-error.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** — `src/app/_providers/handle-bubbled-error.test.tsx`

`location` 모킹은 `response.test.ts` 선례(`Object.defineProperty(global, 'window', ...)`)를 따른다. `isAuthError`·`shouldSkipGlobalErrorHandling`·`Dialog` 는 mock.

```tsx
vi.mock('@/shared/api/http/error/is-auth-error', () => ({ default: vi.fn() }));
vi.mock('@/shared/lib/decorators/skip-global-error-handling', () => ({
  shouldSkipGlobalErrorHandling: vi.fn(() => false),
}));
vi.mock('@/shared/api/http/error/get-error-message', () => ({
  getErrorMessage: vi.fn(() => 'msg'),
}));
const dialogOpen = vi.fn(() => ({ destroy: vi.fn() }));
vi.mock('@/shared/ui/components/dialog', () => ({
  Dialog: Object.assign((_p: unknown) => null, {
    open: (...a: unknown[]) => dialogOpen(...a),
    ButtonGroup: (_p: unknown) => null,
    Button: (_p: unknown) => null,
  }),
}));

import isAuthError from '@/shared/api/http/error/is-auth-error';
import { handleBubbledError } from './handle-bubbled-error';

type Mock = ReturnType<typeof vi.fn>;

function setPath(pathname: string) {
  Object.defineProperty(global, 'window', {
    value: { location: { href: '', pathname } },
    writable: true,
    configurable: true,
  });
}

const authErr = { isAxiosError: true, response: { status: 401 } };

beforeEach(() => {
  vi.clearAllMocks();
  (isAuthError as Mock).mockReturnValue(true);
});

describe('handleBubbledError — public-route redirect 억제 (B②, #303)', () => {
  test.each(['/sign-in', '/docs', '/docs/terms', '/auth/callback', '/parties/123'])(
    'public/guest-auto-login 경로(%s)에선 401 이어도 redirect 안 함',
    (pathname) => {
      setPath(pathname);
      handleBubbledError(authErr);
      expect(window.location.href).toBe('');
    }
  );

  test('보호 라우트(/parties)의 401 은 / 로 redirect (기존 동작 보존)', () => {
    setPath('/parties');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('/');
  });

  test('public prefix 의 부분문자열 라우트(/foo/sign-in)는 보호 취급 → redirect', () => {
    setPath('/foo/sign-in');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('/');
  });

  test('/ 와 /link/* carve-out 유지 (redirect 안 함)', () => {
    setPath('/');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('');
    setPath('/link/abc');
    handleBubbledError(authErr);
    expect(window.location.href).toBe('');
  });

  test('non-401 은 영향 없음 (Dialog 분기 — redirect 안 함)', () => {
    (isAuthError as Mock).mockReturnValue(false);
    setPath('/parties');
    handleBubbledError({ isAxiosError: true, response: { status: 500 } });
    expect(window.location.href).toBe('');
    expect(dialogOpen).toHaveBeenCalledTimes(1);
  });

  test('서버측(window undefined)에선 redirect/Dialog 없이 early-return', () => {
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    expect(() => handleBubbledError(authErr)).not.toThrow();
    expect(dialogOpen).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/app/_providers/handle-bubbled-error.test.tsx`
Expected: FAIL — public 경로(`/sign-in` 등) 케이스에서 현재 코드가 `location.href='/'` 로 설정해 `expect('').toBe('')` 가 깨짐(현 동작엔 public 게이트 없음). 보존 케이스(`/parties`,`/`,`/link/`,non-401,서버)는 PASS.

---

### Task 4: B② — public-route 게이트 구현

**Files:**

- Modify: `src/app/_providers/handle-bubbled-error.tsx`

- [ ] **Step 1: 구현** — import 추가 + `isAuthError` 분기에 게이트:

import 추가(파일 상단):

```tsx
import {
  PUBLIC_ROUTE_PREFIXES,
  GUEST_AUTO_LOGIN_ROUTE_PATTERN,
} from '@/entities/me/model/constants';
```

`isAuthError` 분기 치환:

```tsx
if (isAuthError(error)) {
  const isPublicOrGuestAutoLogin =
    PUBLIC_ROUTE_PREFIXES.some((prefix) => location.pathname.startsWith(prefix)) ||
    GUEST_AUTO_LOGIN_ROUTE_PATTERN.test(location.pathname);

  if (
    !isPublicOrGuestAutoLogin &&
    location.pathname !== '/' &&
    !location.pathname.startsWith('/link/')
  ) {
    location.href = '/';
  }
  return;
}
```

- [ ] **Step 2: 통과 확인**

Run: `yarn vitest run src/app/_providers/handle-bubbled-error.test.tsx`
Expected: PASS (전 케이스).

- [ ] **Step 3: 타입·린트·전 provider 테스트**

Run: `yarn tsc --noEmit && yarn eslint src/app/_providers --quiet && yarn vitest run src/app/_providers`
Expected: 전부 green (eslint errors-only).

- [ ] **Step 4: 커밋**

```bash
git add src/app/_providers/handle-bubbled-error.tsx src/app/_providers/handle-bubbled-error.test.tsx
git commit -m "fix(303): handleBubbledError public-route 하드 redirect 억제 (B②)"
```

---

### Task 5: A — auth-setup authed-200 게이트 (테스트 전용)

**Files:**

- Modify: `e2e/auth/shared.ts`

- [ ] **Step 1: `authenticateUser` 의 `/parties` 재진입 블록 치환**

`clickDevFullCrewSignIn(page);` 다음 줄인 **`log('goto /parties explicitly after dialog closed');` 부터** 그에 이어지는 `// web#303: dev-crew 로그인 직후 me-fetch ...` 주석 블록, `const partiesUrl = ...` 3회 재시도 for 루프, **`log(\`arrived at /parties, current URL: ${page.url()}\`);` 줄까지(이 줄 포함)** 의 연속 블록 전체를 삭제하고 아래로 치환(그 다음 `log(\`writing storageState ...\`)` 이후는 변경 없음):

```ts
// web#303 A: storageState 기록 전 "인증이 실제 성공" 을 authed /me/info 200
// 으로 검증. sign-in POST 가 사전인증-401 redirect 로 abort 되면 200 이
// 안 와 30s 후 throw → 미인증 storageState 사일런트 기록을 차단(fail-loud).
// 재시도 없음 — 진짜 sign-in 회귀를 은폐하지 않기 위함.
log('waiting for authenticated GET /me/info 200');
await page.waitForResponse(
  (res) =>
    res.url().includes('/v1/users/me/info') &&
    res.request().method() === 'GET' &&
    res.status() === 200,
  { timeout: 30_000 }
);
log('authenticated (me/info 200) — navigating to /parties');
await page.goto(`${baseURL}/parties`);
await page.waitForURL(/\/parties(?:$|[/?#])/, { timeout: 30_000 });
log(`arrived at /parties, current URL: ${page.url()}`);
```

`STEP_TIMEOUT` 상수가 위 치환으로 더 이상 참조되지 않으면 정의도 삭제(`clickDevFullCrewSignIn` 이 여전히 사용하면 유지). D-로깅(`page.on('response')`/`requestfailed`)·warm-up·`page.on('console')` 등 나머지는 **변경 없음**.

- [ ] **Step 2: 타입·린트 (e2e)**

Run: `yarn tsc --noEmit && yarn eslint e2e/auth/shared.ts --quiet`
Expected: 0 error. (E2E 실제 실증은 post-merge development run — 본 계획 범위 밖, 스펙 §6.)

- [ ] **Step 3: 커밋**

```bash
git add e2e/auth/shared.ts
git commit -m "test(303): auth-setup authed /me 200 게이트 + URL-only 재시도 제거 (A, fail-loud)"
```

---

### Task 6: 통합 검증 + 핸드오프 준비

- [ ] **Step 1: 전 단위 스위트 + 타입 + 린트**

Run: `yarn vitest run && yarn tsc --noEmit && yarn eslint src/app/_providers e2e/auth/shared.ts --quiet`
Expected: 전 테스트 PASS(신규 포함), tsc 0, 변경 파일 eslint 0 **error**. (회귀 없음 확인.)

> 주: 레포 lint 컨벤션은 `eslint src --fix --quiet`(package.json). `eslint .` 는 생성물/설정파일까지 훑어 26만+ 기존 문제로 게이트 불가 — 본 PR 변경 파일만 스코프. 레포 전체 회귀는 `yarn vitest run`(전 스위트)·`tsc --noEmit` 가 담보.

- [ ] **Step 2: 커밋 통합 점검**

`git log --oneline origin/development..HEAD` 확인. push/PR 직전 논리 단위(B①/B②추출/B②게이트/A)로 정리 — 필요 시 squash([[feedback_commit_consolidation_before_push]]). 파괴적 rebase 전 사용자 확인.

- [ ] **Step 3: 핸드오프 메모(코드 외 — 실행 스킬/사용자가 수행)**

- 신규 PR(base=development): 본문에 근본 요약 + `Closes #312`, `Refs #303`, "supersedes #313". 한글([[feedback_korean_issue_commit_pr]]).
- #313 close(superseded by 신규 PR).
- 머지 게이트: PR 체크(eslint·vercel build) + **post-merge development E2E** 모니터링([[wait-all-ci-incl-e2e-before-merge]]). 성공 기준 = e2e-a/b/d green **및** 로그에 `net::ERR_ABORTED POST .../sign/temporary/full-member` 부재(근본 제거 실증).
- 머지 후: `bugs/2026-05-14-bug-fix-roadmap.md` LIVE + `memory/project_bug_fix_roadmap_in_progress.md` 갱신(#303 framing 3차 정정 확정·해소).

---

## 완료 정의 (DoD)

- 신규 단위테스트(should-retry-query 7 + handle-bubbled-error public-게이트) GREEN, 전 기존 스위트 무회귀.
- `tsc --noEmit` 0, 변경 파일 eslint(`src/app/_providers e2e/auth/shared.ts` `--quiet`) 0 error.
- A: 미인증 시 auth-setup 이 30s 후 throw(사일런트 오염 불가), 정상 시 authed-200 후 storageState 기록.
- B①: 401 bounded retry(≤2) 배선. B②: public/guest-auto-login·`/`·`/link/*` 에서 하드 redirect 안 함, 보호 라우트 동작 보존.
- 데코레이터/`when` predicate·#311 warm-up·D-로깅·ProtectedLayout 무변경(task#2/#315 와 독립).
- post-merge development E2E 실증은 머지 후 트래킹(스펙 §6).
