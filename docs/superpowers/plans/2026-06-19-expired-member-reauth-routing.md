# 만료-회원 재인증 라우팅 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 방 안에서 로그인 회원의 토큰이 만료되면 게스트로 강등하지 않고 재로그인으로 라우팅한다(방문자·게스트만료는 게스트 경로 유지).

**Architecture:** localStorage "회원 세션 이력" 플래그로 만료-회원 vs 방문자를 구별하고, `signInGuest`의 유일 호출처(`useAutoSignInByGuest`)에서 분류기로 게이트. 만료-회원은 단일 `reauthenticate()` 지점(향후 refresh 삽입점)으로 보낸다.

**Tech Stack:** Next.js(App Router), React, TanStack Query, Vitest + @testing-library/react. 스펙: `docs/superpowers/specs/2026-06-19-expired-member-reauth-routing-design.md`.

---

## 파일 구조

- Create `src/entities/me/lib/member-session.ts` — 회원 세션 이력 플래그(localStorage, SSR 가드). 책임: mark/has/clear.
- Create `src/entities/me/lib/member-session.test.ts`
- Create `src/features/sign-in/by-guest/lib/classify-auth-error.ts` — 순수 분류기(401 → IGNORE/VISITOR/EXPIRED_MEMBER).
- Create `src/features/sign-in/by-guest/lib/classify-auth-error.test.ts`
- Create `src/features/sign-in/by-guest/lib/reauthenticate.ts` — `buildReauthUrl`(순수) + `reauthenticate`(내비게이션).
- Create `src/features/sign-in/by-guest/lib/reauthenticate.test.ts`
- Modify `src/features/sign-in/by-guest/lib/use-auto-sign-in.hook.ts` — 분류기로 게이트, EXPIRED_MEMBER→reauthenticate.
- Modify `src/app/parties/layout.tsx` — me 성공 시 `markMemberSession`.
- Modify `src/features/sign-out/api/use-sign-out.mutation.ts` — onSettled에 `clearMemberSession`.

---

## Chunk 1: 핵심 단위 (격리)

### Task 1: 회원 세션 이력 플래그 (`member-session`)

**Files:** Create `src/entities/me/lib/member-session.ts`, `src/entities/me/lib/member-session.test.ts`

- [ ] **Step 1: 실패 테스트 작성** — `member-session.test.ts`

```ts
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { markMemberSession, hadMemberSession, clearMemberSession } from './member-session';

beforeEach(() => localStorage.clear());

describe('member-session', () => {
  test('비게스트(FM) me → 플래그 세팅', () => {
    markMemberSession(AuthorityTier.FM);
    expect(hadMemberSession()).toBe(true);
  });
  test('비게스트(AM) me → 플래그 세팅', () => {
    markMemberSession(AuthorityTier.AM);
    expect(hadMemberSession()).toBe(true);
  });
  test('게스트(GT) me → 세팅 안 함', () => {
    markMemberSession(AuthorityTier.GT);
    expect(hadMemberSession()).toBe(false);
  });
  test('clear → 제거', () => {
    markMemberSession(AuthorityTier.FM);
    clearMemberSession();
    expect(hadMemberSession()).toBe(false);
  });
  test('기본값 false', () => {
    expect(hadMemberSession()).toBe(false);
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `yarn vitest run src/entities/me/lib/member-session.test.ts` · Expected: FAIL (module not found).

- [ ] **Step 3: 구현** — `member-session.ts`

```ts
import { AuthorityTier } from '@/shared/api/http/types/@enums';

const KEY = 'pf_had_member_session';

// SSR 가드: window 없으면 no-op/false.
export function markMemberSession(authorityTier: AuthorityTier): void {
  if (typeof window === 'undefined') return;
  if (authorityTier === AuthorityTier.FM || authorityTier === AuthorityTier.AM) {
    window.localStorage.setItem(KEY, '1');
  }
}

export function hadMemberSession(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(KEY) === '1';
}

export function clearMemberSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(KEY);
}
```

- [ ] **Step 4: 통과 확인** — Run: `yarn vitest run src/entities/me/lib/member-session.test.ts` · Expected: PASS.
- [ ] **Step 5: 커밋** — `git add src/entities/me/lib/member-session.* && git commit -m "feat(auth): 회원 세션 이력 플래그 (#428)"`

### Task 2: 순수 분류기 (`classifyAuthError`)

**Files:** Create `src/features/sign-in/by-guest/lib/classify-auth-error.ts`, `.test.ts`

- [ ] **Step 1: 실패 테스트**

```ts
import { AxiosError } from 'axios';
import { classifyAuthError } from './classify-auth-error';

const err401 = new AxiosError('e', undefined, undefined, undefined, { status: 401 } as never);
const err500 = new AxiosError('e', undefined, undefined, undefined, { status: 500 } as never);

describe('classifyAuthError', () => {
  test('401 + 플래그 있음 → EXPIRED_MEMBER', () => {
    expect(classifyAuthError({ error: err401, partyroomId: 5, hadMemberSession: true })).toBe(
      'EXPIRED_MEMBER'
    );
  });
  test('401 + 플래그 없음 → VISITOR', () => {
    expect(classifyAuthError({ error: err401, partyroomId: 5, hadMemberSession: false })).toBe(
      'VISITOR'
    );
  });
  test('비401 → IGNORE', () => {
    expect(classifyAuthError({ error: err500, partyroomId: 5, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
  test('partyroomId 없음 → IGNORE', () => {
    expect(classifyAuthError({ error: err401, partyroomId: null, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
  test('error 없음 → IGNORE', () => {
    expect(classifyAuthError({ error: null, partyroomId: 5, hadMemberSession: true })).toBe(
      'IGNORE'
    );
  });
});
```

- [ ] **Step 2: 실패 확인** — Run: `yarn vitest run src/features/sign-in/by-guest/lib/classify-auth-error.test.ts` · Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
import isAuthError from '@/shared/api/http/error/is-auth-error';

export type AuthErrorClass = 'IGNORE' | 'VISITOR' | 'EXPIRED_MEMBER';

interface Input {
  error: unknown;
  partyroomId: number | null;
  hadMemberSession: boolean;
}

export function classifyAuthError({ error, partyroomId, hadMemberSession }: Input): AuthErrorClass {
  if (!error || !isAuthError(error) || !partyroomId) return 'IGNORE';
  return hadMemberSession ? 'EXPIRED_MEMBER' : 'VISITOR';
}
```

- [ ] **Step 4: 통과 확인** · Expected: PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(auth): 파티룸 401 분류기 (#428)"`

### Task 3: 재인증 지점 (`reauthenticate`)

**Files:** Create `src/features/sign-in/by-guest/lib/reauthenticate.ts`, `.test.ts`

- [ ] **Step 1: 실패 테스트** (순수 `buildReauthUrl`만 단위 테스트 — 내비게이션 부작용은 통합에서)

```ts
import { buildReauthUrl } from './reauthenticate';

describe('buildReauthUrl', () => {
  test('룸 pathname을 returnTo로 인코딩한 /sign-in URL', () => {
    expect(buildReauthUrl('/parties/5')).toBe('/sign-in?returnTo=%2Fparties%2F5');
  });
  test('pathname만 받으므로 휘발성 쿼리(?source=link)는 애초에 포함 안 됨', () => {
    // 호출처가 location.pathname(쿼리 제외)을 넘기는 계약을 문서화
    expect(buildReauthUrl('/parties/5')).not.toContain('source');
  });
});
```

- [ ] **Step 2: 실패 확인** · Expected: FAIL.

- [ ] **Step 3: 구현**

```ts
// returnTo 는 location.pathname(쿼리 제외)만 받는다 → ?source=link 등 휘발성 쿼리 자연 배제.
export function buildReauthUrl(roomPathname: string): string {
  return `/sign-in?returnTo=${encodeURIComponent(roomPathname)}`;
}

// 오늘(#1): 재로그인 페이지로 이동. 향후 refresh 도입 시 이 함수 맨 앞에
// "조용히 refresh 시도 → 성공 시 무중단 / 실패 시 아래 이동" 단계를 삽입한다(단일 지점).
export function reauthenticate(roomPathname: string): void {
  if (typeof window === 'undefined') return;
  window.location.href = buildReauthUrl(roomPathname);
}
```

- [ ] **Step 4: 통과 확인** · Expected: PASS.
- [ ] **Step 5: 커밋** — `git commit -m "feat(auth): reauthenticate 지점(returnTo 보존) (#428)"`

---

## Chunk 2: 통합 (배선)

### Task 4: `useAutoSignInByGuest` 게이트 + mark/clear 배선

**Files:**

- Modify `src/features/sign-in/by-guest/lib/use-auto-sign-in.hook.ts`
- Modify `src/app/parties/layout.tsx`
- Modify `src/features/sign-out/api/use-sign-out.mutation.ts`
- Test: `src/features/sign-in/by-guest/lib/use-auto-sign-in.hook.test.ts` (없으면 생성)

- [ ] **Step 1: 실패 테스트** — 만료-회원은 `signInGuest` 미호출 + reauth, 방문자는 signInGuest

```ts
const mockSignInGuest = vi.fn().mockResolvedValue(undefined);
vi.mock('@/shared/api/http/services', () => ({
  usersService: { signInGuest: () => mockSignInGuest() },
}));
const mockReauth = vi.fn();
vi.mock('./reauthenticate', () => ({ reauthenticate: (p: string) => mockReauth(p) }));
vi.mock('@/entities/me/lib/member-session', () => ({ hadMemberSession: () => mockHadMember }));

import { renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
// ... QueryClientProvider wrapper (기존 테스트 헬퍼 패턴 따름)
let mockHadMember = false;
const err401 = new AxiosError('e', undefined, undefined, undefined, { status: 401 } as never);

beforeEach(() => {
  vi.clearAllMocks();
  mockHadMember = false;
});

test('만료-회원(플래그 O) 401 → reauthenticate, signInGuest 미호출', async () => {
  mockHadMember = true;
  renderHook(() => useAutoSignIn(err401, 5), { wrapper });
  await waitFor(() => expect(mockReauth).toHaveBeenCalled());
  expect(mockSignInGuest).not.toHaveBeenCalled();
});

test('방문자(플래그 X) 401 → signInGuest, reauth 미호출', async () => {
  mockHadMember = false;
  renderHook(() => useAutoSignIn(err401, 5), { wrapper });
  await waitFor(() => expect(mockSignInGuest).toHaveBeenCalled());
  expect(mockReauth).not.toHaveBeenCalled();
});

test('멱등성 — 재렌더해도 reauth 1회', async () => {
  mockHadMember = true;
  const { rerender } = renderHook(() => useAutoSignIn(err401, 5), { wrapper });
  rerender();
  rerender();
  await waitFor(() => expect(mockReauth).toHaveBeenCalledTimes(1));
});
```

- [ ] **Step 2: 실패 확인** — Run: `yarn vitest run src/features/sign-in/by-guest/lib/use-auto-sign-in.hook.test.ts` · Expected: FAIL.

- [ ] **Step 3: 구현** — `use-auto-sign-in.hook.ts` 수정 (기존 `attempted` ref 유지, 분류기 게이트)

```ts
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from '@/shared/api/http/query-keys';
import { usersService } from '@/shared/api/http/services';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import { hadMemberSession } from '@/entities/me/lib/member-session';
import { trackSignedIn } from '@/shared/lib/analytics/auth-tracking';
import { classifyAuthError } from './classify-auth-error';
import { reauthenticate } from './reauthenticate';

export default function useAutoSignIn(error: unknown, partyroomId: number | null) {
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    const decision = classifyAuthError({
      error,
      partyroomId,
      hadMemberSession: hadMemberSession(),
    });
    if (decision === 'IGNORE') return;

    attempted.current = true;

    if (decision === 'EXPIRED_MEMBER') {
      reauthenticate(window.location.pathname); // returnTo = 룸 pathname(쿼리 제외)
      return;
    }

    // VISITOR (기존 게스트 자동 로그인 — 링크-도메인 A 포함)
    setIsSigningIn(true);
    usersService
      .signInGuest()
      .then(() => {
        trackSignedIn(AuthorityTier.GT);
        return queryClient.refetchQueries({ queryKey: [QueryKeys.Me] });
      })
      .catch(() => {
        location.href = '/';
      })
      .finally(() => setIsSigningIn(false));
  }, [error, partyroomId, queryClient]);

  return { isSigningIn };
}
```

- [ ] **Step 4: `parties/layout.tsx`에 mark 배선** — 기존 `me` effect(`:31-38`) 옆에 추가

```tsx
import { markMemberSession } from '@/entities/me/lib/member-session';
// ...
useEffect(() => {
  if (me) markMemberSession(me.authorityTier);
}, [me]);
```

- [ ] **Step 5: `use-sign-out.mutation.ts`에 clear 배선** — `onSettled` 안, `setUserId(null)` 옆

```ts
import { clearMemberSession } from '@/entities/me/lib/member-session';
// onSettled 내부:
clearMemberSession();
```

- [ ] **Step 6: 통과 확인** — Run: `yarn vitest run src/features/sign-in/by-guest src/entities/me/lib` · Expected: PASS (신규 + 기존 회귀).
- [ ] **Step 7: 타입체크/린트** — Run: `yarn tsc --noEmit && yarn lint` (또는 레포 스크립트) · Expected: 0 에러.
- [ ] **Step 8: 커밋** — `git commit -m "feat(auth): 만료-회원 재로그인 라우팅 배선 (#428)"`

---

## 회귀/검증

- 전체 유닛: `yarn vitest run` (또는 영향 범위) GREEN.
- 불변식 회귀: 링크-도메인/방문자 401 → 여전히 게스트 로그인(VISITOR). 만료-회원 401 → reauth.
- (머지 전, 사용자 게이트) 로컬 풀스택 + e2e: 회원 만료 시뮬레이션은 비용 큼 → 유닛/통합으로 충분 판단, 필요 시 수동 스모크.

## 범위 밖 (별도 트랙)

백엔드 refresh/슬라이딩 갱신(#306-①), WS inbound 만료검증(#306-②), web #402 재연결 tryEnter. `reauthenticate`가 향후 refresh 삽입 단일 지점.
