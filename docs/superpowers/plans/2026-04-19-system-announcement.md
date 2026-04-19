# System Announcement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 시스템 점검 공지 모달과 점검 중 페이지를 구현하여, 점검 예고를 실시간으로 전달하고 503 응답 시 점검 페이지로 리다이렉트한다.

**Architecture:** 3개의 독립적인 레이어로 구성한다. (1) `/maintenance` 독립 페이지 — 503 시 리다이렉트 대상, (2) HTTP 인터셉터 — 503 감지 → 리다이렉트, (3) 시스템 공지 모달 — WebSocket으로 수신한 공지를 전역 모달로 표시. WebSocket 구독 토픽은 백엔드 협의 후 연동하되, 프론트엔드 수신 인프라를 먼저 구축한다.

**Tech Stack:** Next.js App Router, Headless UI (Dialog), Zustand, @stomp/stompjs, Axios interceptors, Vitest

**Spec:** `docs/superpowers/specs/2026-04-19-system-announcement-design.md`

---

## File Structure

```
src/
  app/maintenance/
    layout.tsx                              ← 독립 레이아웃 (Provider 불필요)
    page.tsx                                ← 점검 안내 페이지 (Server Component)
    refresh-button.tsx                      ← 새로고침 버튼 (Client Component)

  features/system-announcement/
    model/
      system-announcement.types.ts          ← SystemAnnouncementEvent 타입
      system-announcement.store.ts          ← dismissed ID 관리 + 현재 공지 상태
      system-announcement.store.test.ts     ← 스토어 테스트
    lib/
      use-system-announcement-subscription.ts   ← WebSocket 구독 훅
      use-system-announcement-subscription.test.ts ← 구독 훅 테스트
    ui/
      system-announcement-modal.tsx          ← 전역 모달 컴포넌트
      system-announcement-modal.test.tsx     ← 모달 테스트
      system-announcement-subscriber.tsx     ← WebSocket 구독 컴포넌트 (렌더링 없음)
    index.ts                                ← public exports

  shared/api/http/client/interceptors/
    response.ts                             ← 503 핸들링 추가 (redirect-on-503)
    response.test.ts                        ← 503 테스트 추가
```

---

## Chunk 1: Maintenance Page & 503 Interceptor

### Task 1: /maintenance 페이지 — 독립 레이아웃

**Files:**

- Create: `src/app/maintenance/layout.tsx`
- Create: `src/app/maintenance/page.tsx`

**참고 파일:**

- `src/app/mobile-notice/layout.tsx` — 독립 레이아웃 패턴
- `src/app/mobile-notice/page.tsx` — 독립 페이지 패턴

- [ ] **Step 1: layout.tsx 작성**

```tsx
// src/app/maintenance/layout.tsx
import { FC, PropsWithChildren } from 'react';

const MaintenanceLayout: FC<PropsWithChildren> = ({ children }) => {
  return <main className='bg-black min-h-screen flexColCenter'>{children}</main>;
};

export default MaintenanceLayout;
```

- [ ] **Step 2: page.tsx 작성**

디자인 스펙 (목업 확정본):

- 배경: `bg-black`
- 아이콘: 레드 그라디언트 원형 (`bg-gradient-red`, 80px)
- 제목: `title1` (28px bold), `text-gray-50`
- 본문: `detail1` (16px normal), `text-gray-400`
- 점검 시간 박스: `bg-gray-800`, `border-gray-700`, `rounded-[6px]`
- 시간 값: `text-red-200`, bold
- 새로고침: `text-red-300`, underline
- 로고: `text-gray-700`

Server Component로 유지하되, 클릭 핸들러가 필요한 새로고침 버튼은 별도 Client Component로 분리한다. 이렇게 하면 `metadata` export를 유지할 수 있다.

```tsx
// src/app/maintenance/page.tsx
import { Metadata } from 'next';
import { Typography } from '@/shared/ui/components/typography';
import RefreshButton from './refresh-button';

export const metadata: Metadata = {
  title: 'PFPlay - 시스템 점검 중',
};

const MaintenancePage = () => {
  return (
    <div className='flex flex-col items-center gap-5 max-w-[480px] text-center px-6'>
      {/* 브랜드 아이콘 */}
      <div className='w-[80px] h-[80px] bg-gradient-red rounded-full flexColCenter'>
        <span className='text-[36px]'>🔧</span>
      </div>

      {/* 제목 */}
      <Typography type='title1' className='text-gray-50'>
        시스템 점검 중
      </Typography>

      {/* 설명 */}
      <Typography type='detail1' className='text-gray-400 whitespace-pre-line'>
        {
          '더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.\n점검이 완료되면 정상적으로 이용하실 수 있습니다.'
        }
      </Typography>

      {/* 구분선 */}
      <div className='w-[48px] h-[2px] bg-gray-700 my-1' />

      {/* 새로고침 */}
      <RefreshButton />

      {/* 로고 */}
      <Typography type='caption1' className='text-gray-700 font-extrabold mt-5'>
        PFPlay
      </Typography>
    </div>
  );
};

export default MaintenancePage;
```

```tsx
// src/app/maintenance/refresh-button.tsx
'use client';

import { Typography } from '@/shared/ui/components/typography';

export default function RefreshButton() {
  return (
    <Typography type='caption1' className='text-gray-500'>
      점검이 완료되었나요?{' '}
      <button
        onClick={() => {
          window.location.href = '/';
        }}
        className='text-red-300 underline underline-offset-2 font-semibold'
      >
        새로고침
      </button>
    </Typography>
  );
}
```

- [ ] **Step 3: 브라우저에서 확인**

Run: `http://localhost:3000/maintenance`
Expected: 점검 안내 페이지가 정상적으로 표시됨 (독립 레이아웃, 헤더/푸터 없음)

- [ ] **Step 4: Commit**

```bash
git add src/app/maintenance/layout.tsx src/app/maintenance/page.tsx src/app/maintenance/refresh-button.tsx
git commit -m "feat: add /maintenance page with independent layout"
```

---

### Task 2: 503 HTTP 인터셉터

**Files:**

- Modify: `src/shared/api/http/client/interceptors/response.ts`
- Modify: `src/shared/api/http/client/interceptors/response.test.ts`
- Modify: `src/shared/api/http/client/client.ts`

**참고 파일:**

- `src/shared/api/http/client/client.ts:20-23` — 현재 에러 체인: `flow([logError, unwrapError, emitError])`
- `src/shared/api/http/client/interceptors/response.ts:59-67` — 현재 `emitError` 함수
- `src/shared/lib/functions/flow.ts` — `flow` 유틸리티. 각 함수가 `Promise.reject(e)`를 반환하면 다음 함수로 전파됨. **중요:** `flow`의 `processFunction`은 `try/catch`로 감싸므로 `Promise.reject`로 throw하면 다음 함수의 input으로 error 객체가 전달된다.

- [ ] **Step 1: 503 리다이렉트 함수 테스트 작성**

`response.test.ts`에 import 업데이트 및 새 describe 블록 추가:

```ts
// response.test.ts의 기존 import 수정 (redirectOnServiceUnavailable 추가):
import {
  logResponse,
  unwrapResponse,
  logError,
  unwrapError,
  emitError,
  redirectOnServiceUnavailable,
} from './response';
```

```ts
// response.test.ts 하단에 추가

describe('redirectOnServiceUnavailable', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // window.location 모킹
    Object.defineProperty(global, 'window', {
      value: {
        location: { href: '', pathname: '/parties/1' },
      },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true,
    });
  });

  test('503 응답이면 /maintenance로 리다이렉트', async () => {
    const error = createAxiosError({ responseData: {} });
    error.response!.status = 503;

    await expect(redirectOnServiceUnavailable(error)).rejects.toBe(error);
    expect(window.location.href).toBe('/maintenance');
  });

  test('503이 아닌 에러는 리다이렉트하지 않음', async () => {
    const error = createAxiosError({ responseData: {} });
    error.response!.status = 500;

    await expect(redirectOnServiceUnavailable(error)).rejects.toBe(error);
    expect(window.location.href).not.toBe('/maintenance');
  });

  test('이미 /maintenance에 있으면 리다이렉트하지 않음 (무한 루프 방지)', async () => {
    window.location.pathname = '/maintenance';
    const error = createAxiosError({ responseData: {} });
    error.response!.status = 503;

    await expect(redirectOnServiceUnavailable(error)).rejects.toBe(error);
    expect(window.location.href).toBe('');
  });

  test('response가 없는 에러는 리다이렉트하지 않음', async () => {
    const error = createAxiosError({ hasResponse: false });

    await expect(redirectOnServiceUnavailable(error)).rejects.toBe(error);
    expect(window.location.href).toBe('');
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npx vitest run src/shared/api/http/client/interceptors/response.test.ts`
Expected: FAIL — `redirectOnServiceUnavailable` is not defined

- [ ] **Step 3: redirectOnServiceUnavailable 함수 구현**

`response.ts` 파일 하단에 추가:

```ts
// src/shared/api/http/client/interceptors/response.ts 에 추가

export function redirectOnServiceUnavailable(e: AxiosError) {
  if (
    e.response?.status === 503 &&
    typeof window !== 'undefined' &&
    window.location.pathname !== '/maintenance'
  ) {
    window.location.href = '/maintenance';
  }

  return Promise.reject(e);
}
```

- [ ] **Step 4: 에러 인터셉터 체인에 등록**

`client.ts`의 에러 체인 수정:

```ts
// src/shared/api/http/client/client.ts
// 기존:
// flow([logError, unwrapError, emitError])
// 변경:
import {
  emitError,
  logError,
  logResponse,
  redirectOnServiceUnavailable,
  unwrapError,
  unwrapResponse,
} from './interceptors/response';

// ...
axiosInstance.interceptors.response.use(
  flow([logResponse, unwrapResponse]),
  flow([logError, redirectOnServiceUnavailable, unwrapError, emitError])
);
```

> **순서 설명:** `logError` → `redirectOnServiceUnavailable` → `unwrapError` → `emitError`. 503을 로깅 직후, unwrap 전에 리다이렉트한다. 리다이렉트 후에도 `Promise.reject`를 반환하므로 체인은 계속 진행되지만, 페이지 전환이 일어나므로 실질적으로 후속 처리는 무의미하다.

- [ ] **Step 5: 테스트 실행**

Run: `npx vitest run src/shared/api/http/client/interceptors/response.test.ts`
Expected: PASS — 모든 테스트 통과

- [ ] **Step 6: Commit**

```bash
git add src/shared/api/http/client/interceptors/response.ts src/shared/api/http/client/interceptors/response.test.ts src/shared/api/http/client/client.ts
git commit -m "feat: add 503 redirect to /maintenance in HTTP interceptor"
```

---

## Chunk 2: System Announcement Store & Modal

### Task 3: SystemAnnouncementEvent 타입 정의

**Files:**

- Create: `src/features/system-announcement/model/system-announcement.types.ts`

- [ ] **Step 1: 타입 파일 작성**

```ts
// src/features/system-announcement/model/system-announcement.types.ts

export type SystemAnnouncementType = 'MAINTENANCE';

export type SystemAnnouncementEvent = {
  id: string;
  type: SystemAnnouncementType;
  title: string;
  content: string;
  scheduledAt?: number; // UTC timestamp (ms)
};
```

- [ ] **Step 2: Commit**

```bash
git add src/features/system-announcement/model/system-announcement.types.ts
git commit -m "feat: define SystemAnnouncementEvent type"
```

---

### Task 4: System Announcement Zustand Store

**Files:**

- Create: `src/features/system-announcement/model/system-announcement.store.ts`
- Create: `src/features/system-announcement/model/system-announcement.store.test.ts`

**참고 파일:**

- `src/entities/current-partyroom/model/current-partyroom.store.ts` — Zustand store 패턴
- `src/app/_providers/stores.provider.tsx` — 글로벌 store 등록 패턴

> **설계 결정:** 이 스토어는 글로벌 `StoresProvider`에 등록하지 않는다. `features/` 레벨의 자체 store로, 모듈 스코프 싱글턴으로 관리한다. 이유: (1) system-announcement는 다른 feature에서 참조하지 않음, (2) 글로벌 Stores 인터페이스를 오염시키지 않음, (3) dismissed ID는 세션 내 메모리 관리로 충분.

- [ ] **Step 1: 스토어 테스트 작성**

```ts
// src/features/system-announcement/model/system-announcement.store.test.ts

import { SystemAnnouncementEvent } from './system-announcement.types';

// 테스트마다 fresh store를 생성하기 위해 export된 factory 함수를 사용
import { createSystemAnnouncementStore } from './system-announcement.store';

const createTestStore = () => createSystemAnnouncementStore();

const MOCK_EVENT: SystemAnnouncementEvent = {
  id: 'ann-001',
  type: 'MAINTENANCE',
  title: '서버 점검 안내',
  content: '점검이 예정되어 있습니다.',
  scheduledAt: 1745060400000,
};

describe('system-announcement store', () => {
  test('초기 상태: currentAnnouncement가 null', () => {
    const store = createTestStore();
    expect(store.getState().currentAnnouncement).toBeNull();
  });

  test('showAnnouncement: 새 공지를 설정', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);

    expect(store.getState().currentAnnouncement).toEqual(MOCK_EVENT);
  });

  test('dismiss: currentAnnouncement를 null로 설정하고 dismissedIds에 추가', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();

    expect(store.getState().currentAnnouncement).toBeNull();
    expect(store.getState().isDismissed(MOCK_EVENT.id)).toBe(true);
  });

  test('isDismissed: dismiss된 ID는 true, 아닌 ID는 false', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();

    expect(store.getState().isDismissed('ann-001')).toBe(true);
    expect(store.getState().isDismissed('ann-002')).toBe(false);
  });

  test('showAnnouncement: 이미 dismiss된 공지는 무시', () => {
    const store = createTestStore();
    store.getState().showAnnouncement(MOCK_EVENT);
    store.getState().dismiss();
    store.getState().showAnnouncement(MOCK_EVENT);

    expect(store.getState().currentAnnouncement).toBeNull();
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npx vitest run src/features/system-announcement/model/system-announcement.store.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 스토어 구현**

```ts
// src/features/system-announcement/model/system-announcement.store.ts
import { create } from 'zustand';
import { SystemAnnouncementEvent } from './system-announcement.types';

type SystemAnnouncementState = {
  currentAnnouncement: SystemAnnouncementEvent | null;
  dismissedIds: Set<string>;
  showAnnouncement: (event: SystemAnnouncementEvent) => void;
  dismiss: () => void;
  isDismissed: (id: string) => boolean;
};

export const createSystemAnnouncementStore = () => {
  return create<SystemAnnouncementState>((set, get) => ({
    currentAnnouncement: null,
    dismissedIds: new Set<string>(),

    showAnnouncement: (event) => {
      if (get().dismissedIds.has(event.id)) return;
      set({ currentAnnouncement: event });
    },

    dismiss: () => {
      const current = get().currentAnnouncement;
      if (!current) return;

      const nextDismissed = new Set(get().dismissedIds);
      nextDismissed.add(current.id);
      set({ currentAnnouncement: null, dismissedIds: nextDismissed });
    },

    isDismissed: (id) => get().dismissedIds.has(id),
  }));
};

/**
 * 모듈 스코프 싱글턴 — SystemAnnouncementModal에서 직접 import하여 사용
 */
export const useSystemAnnouncementStore = createSystemAnnouncementStore();
```

- [ ] **Step 4: 테스트 실행**

Run: `npx vitest run src/features/system-announcement/model/system-announcement.store.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/system-announcement/model/system-announcement.store.ts src/features/system-announcement/model/system-announcement.store.test.ts
git commit -m "feat: add system announcement Zustand store with dismissed ID tracking"
```

---

### Task 5: SystemAnnouncementModal 컴포넌트

**Files:**

- Create: `src/features/system-announcement/ui/system-announcement-modal.tsx`
- Create: `src/features/system-announcement/ui/system-announcement-modal.test.tsx`

**참고 파일:**

- `src/shared/ui/components/dialog/dialog.component.tsx` — Dialog 컴포넌트 API
- `src/shared/ui/components/typography/typography.component.tsx` — Typography 타입: `body1`, `detail1`, `caption2`
- `src/shared/ui/components/button/button.component.tsx` — Button: `size='xl'`, `color='primary'`

**디자인 스펙 (확정):**

- Dialog.Panel: `w-[440px]`, `bg-gray-800`, `border-gray-700`, `rounded-[6px]`, `pt-[52px] px-[32px] pb-[32px]`
- Title: `body1` (20px bold), `text-gray-50`, center 정렬
- Sub (본문): `detail1` (16px normal), `text-gray-300`
- 점검 시각 박스: `bg-[rgba(243,31,44,0.06)]`, `border border-[rgba(243,31,44,0.2)]`, `rounded-[6px]`
- 시각 텍스트: `text-red-200` (20px bold)
- Button: `Dialog.Button` size `xl` (56px), primary fill (`bg-gradient-red`)
- ButtonGroup: `mt-[36px]`

- [ ] **Step 1: 모달 컴포넌트 테스트 작성**

```tsx
// src/features/system-announcement/ui/system-announcement-modal.test.tsx
vi.mock('@/shared/ui/components/dialog', () => ({
  Dialog: Object.assign(
    ({ open, Body, onClose }: any) => {
      if (!open) return null;
      const BodyContent = typeof Body === 'function' ? Body : () => Body;
      return (
        <div data-testid='dialog'>
          <BodyContent />
        </div>
      );
    },
    {
      ButtonGroup: ({ children }: any) => <div data-testid='button-group'>{children}</div>,
      Button: ({ children, onClick }: any) => (
        <button data-testid='dialog-button' onClick={onClick}>
          {children}
        </button>
      ),
    }
  ),
}));

vi.mock('@/shared/ui/components/typography', () => ({
  Typography: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import SystemAnnouncementModal from './system-announcement-modal';

beforeEach(() => {
  const { dismiss, showAnnouncement } = useSystemAnnouncementStore.getState();
  // Reset store
  useSystemAnnouncementStore.setState({
    currentAnnouncement: null,
    dismissedIds: new Set(),
  });
});

describe('SystemAnnouncementModal', () => {
  test('공지가 없으면 모달이 보이지 않음', () => {
    render(<SystemAnnouncementModal />);
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });

  test('공지가 있으면 모달이 보임', () => {
    act(() => {
      useSystemAnnouncementStore.getState().showAnnouncement({
        id: 'test-1',
        type: 'MAINTENANCE',
        title: '점검 안내',
        content: '점검입니다.',
      });
    });

    render(<SystemAnnouncementModal />);
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
  });

  test('확인 버튼 클릭 시 dismiss', async () => {
    act(() => {
      useSystemAnnouncementStore.getState().showAnnouncement({
        id: 'test-2',
        type: 'MAINTENANCE',
        title: '점검 안내',
        content: '점검입니다.',
      });
    });

    render(<SystemAnnouncementModal />);
    await userEvent.click(screen.getByTestId('dialog-button'));

    expect(useSystemAnnouncementStore.getState().currentAnnouncement).toBeNull();
    expect(useSystemAnnouncementStore.getState().isDismissed('test-2')).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npx vitest run src/features/system-announcement/ui/system-announcement-modal.test.tsx`
Expected: FAIL

- [ ] **Step 3: 모달 컴포넌트 구현**

```tsx
// src/features/system-announcement/ui/system-announcement-modal.tsx
'use client';

import { Dialog } from '@/shared/ui/components/dialog';
import { Typography } from '@/shared/ui/components/typography';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';

function formatScheduledAt(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} (${dayOfWeek}) ${hours}:${minutes}`;
}

export default function SystemAnnouncementModal() {
  const currentAnnouncement = useSystemAnnouncementStore((s) => s.currentAnnouncement);
  const dismiss = useSystemAnnouncementStore((s) => s.dismiss);

  return (
    <Dialog
      open={!!currentAnnouncement}
      title={currentAnnouncement?.title}
      Sub={
        currentAnnouncement ? (
          <Typography type='detail1' className='text-gray-300 whitespace-pre-line text-center'>
            {currentAnnouncement.content}
          </Typography>
        ) : undefined
      }
      Body={
        currentAnnouncement ? (
          <>
            {currentAnnouncement.scheduledAt && (
              <div className='bg-[rgba(243,31,44,0.06)] border border-[rgba(243,31,44,0.2)] rounded-[6px] p-4 text-center'>
                <Typography
                  type='caption2'
                  className='text-red-400 font-bold tracking-wider mb-1.5'
                >
                  점검 예정 시각
                </Typography>
                <Typography type='body1' className='text-red-200'>
                  {formatScheduledAt(currentAnnouncement.scheduledAt)}
                </Typography>
              </div>
            )}

            <Dialog.ButtonGroup>
              <Dialog.Button onClick={dismiss}>확인</Dialog.Button>
            </Dialog.ButtonGroup>
          </>
        ) : (
          <></>
        )
      }
      onClose={dismiss}
    />
  );
}
```

- [ ] **Step 4: 테스트 실행**

Run: `npx vitest run src/features/system-announcement/ui/system-announcement-modal.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/system-announcement/ui/system-announcement-modal.tsx src/features/system-announcement/ui/system-announcement-modal.test.tsx
git commit -m "feat: add SystemAnnouncementModal component using Dialog"
```

---

### Task 6: index.ts 및 root layout 연동

**Files:**

- Create: `src/features/system-announcement/index.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: index.ts 작성**

```ts
// src/features/system-announcement/index.ts
// (Chunk 3에서 SystemAnnouncementSubscriber export 추가 예정)
export { default as SystemAnnouncementModal } from './ui/system-announcement-modal';
export { useSystemAnnouncementStore } from './model/system-announcement.store';
export type { SystemAnnouncementEvent } from './model/system-announcement.types';
```

- [ ] **Step 2: root layout에 모달 추가**

`src/app/layout.tsx` 수정 — `DialogProvider` 안에 `SystemAnnouncementModal` 추가:

```tsx
// src/app/layout.tsx
// import 추가:
import { SystemAnnouncementModal } from '@/features/system-announcement';

// DialogProvider 내부, children 뒤에 추가:
<DialogProvider>
  {children}
  <SystemAnnouncementModal />
</DialogProvider>;
```

> **위치 근거:** `SystemAnnouncementModal`은 `Dialog` 컴포넌트를 직접 사용하므로 `DialogProvider`에 의존하지 않으나, `children`과 같은 레벨에 배치하기 위해 `DialogProvider` 내부에 둔다. Chunk 3에서 `SystemAnnouncementSubscriber`도 여기에 추가된다.

- [ ] **Step 3: 빌드 확인**

Run: `npx next build` (또는 dev 서버에서 페이지 접속)
Expected: 에러 없이 빌드 성공

- [ ] **Step 4: Commit**

```bash
git add src/features/system-announcement/index.ts src/app/layout.tsx
git commit -m "feat: wire SystemAnnouncementModal into root layout"
```

---

## Chunk 3: WebSocket 구독 연동

### Task 7: 시스템 공지 WebSocket 구독 훅 + 테스트

**Files:**

- Create: `src/features/system-announcement/lib/use-system-announcement-subscription.ts`
- Create: `src/features/system-announcement/lib/use-system-announcement-subscription.test.ts`

**참고 파일:**

- `src/shared/api/websocket/client.ts` — `SocketClient` 클래스, `subscribe(destination, callback)` API
- `src/entities/partyroom-client/lib/partyroom-client.ts` — `PartyroomClient`가 `SocketClient`를 래핑하는 패턴
- `src/app/_providers/partyroom-connection.provider.tsx` — `useFetchMe`로 인증 확인 후 connect

**설계 결정:**
현재 WebSocket 구독(`PartyroomClient`)은 `parties` layout에서만 활성화된다. 시스템 공지는 **어디에서든** 수신해야 하므로, `PartyroomClient`를 사용할 수 없다.

방안: `SocketClient`를 직접 사용하는 훅을 만들어 root layout에 배치한다. 단, 이 훅은 `PartyroomConnectionProvider`와 별도의 WebSocket 커넥션을 생성하게 된다.

> ⚠️ **백엔드 협의 필요:** 시스템 공지 WebSocket 토픽 경로가 아직 결정되지 않았다. 아래 코드에서 `/sub/system/announcements`는 placeholder이다. 백엔드와 토픽 경로를 확정한 후 수정한다.

> ⚠️ **중복 커넥션 이슈 (향후 리팩토링 대상):** `parties` layout 안에서는 `PartyroomClient`의 커넥션과 이 훅의 커넥션이 동시에 존재한다. 향후 `SocketClient`를 싱글턴으로 공유하거나, `PartyroomClient`에 `subscribeGlobal()` 메서드를 추가하는 리팩토링을 검토한다. 현재 스코프에서는 별도 커넥션으로 진행한다.

- [ ] **Step 1: 구독 훅 테스트 작성**

```ts
// src/features/system-announcement/lib/use-system-announcement-subscription.test.ts
const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockSubscribe = vi.fn();

vi.mock('@/shared/api/websocket/client', () => ({
  default: vi.fn().mockImplementation(() => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    subscribe: mockSubscribe,
  })),
}));

vi.mock('@/entities/me', () => ({
  useFetchMe: vi.fn(),
}));

import { renderHook } from '@testing-library/react';
import { useFetchMe } from '@/entities/me';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import useSystemAnnouncementSubscription from './use-system-announcement-subscription';

beforeEach(() => {
  vi.clearAllMocks();
  useSystemAnnouncementStore.setState({
    currentAnnouncement: null,
    dismissedIds: new Set(),
  });
});

describe('useSystemAnnouncementSubscription', () => {
  test('me가 없으면 connect하지 않음', () => {
    (useFetchMe as Mock).mockReturnValue({ data: undefined });

    renderHook(() => useSystemAnnouncementSubscription());

    expect(mockConnect).not.toHaveBeenCalled();
  });

  test('me가 있으면 connect 및 subscribe 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });

    renderHook(() => useSystemAnnouncementSubscription());

    expect(mockConnect).toHaveBeenCalledOnce();
    expect(mockSubscribe).toHaveBeenCalledWith('/sub/system/announcements', expect.any(Function));
  });

  test('유효한 메시지 수신 시 store에 공지 반영', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });

    renderHook(() => useSystemAnnouncementSubscription());

    // subscribe의 콜백 추출
    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    subscribeCallback({
      body: JSON.stringify({
        id: 'ann-test',
        type: 'MAINTENANCE',
        title: '점검',
        content: '점검입니다.',
      }),
    });

    expect(useSystemAnnouncementStore.getState().currentAnnouncement?.id).toBe('ann-test');
  });

  test('잘못된 JSON 메시지는 무시', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });

    renderHook(() => useSystemAnnouncementSubscription());

    const subscribeCallback = mockSubscribe.mock.calls[0][1];
    // 에러가 throw되지 않아야 함
    expect(() => subscribeCallback({ body: 'invalid json' })).not.toThrow();
    expect(useSystemAnnouncementStore.getState().currentAnnouncement).toBeNull();
  });

  test('unmount 시 disconnect 호출', () => {
    (useFetchMe as Mock).mockReturnValue({ data: { id: 1 } });

    const { unmount } = renderHook(() => useSystemAnnouncementSubscription());
    unmount();

    expect(mockDisconnect).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인**

Run: `npx vitest run src/features/system-announcement/lib/use-system-announcement-subscription.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: 구독 훅 구현**

```ts
// src/features/system-announcement/lib/use-system-announcement-subscription.ts
'use client';

import { useEffect, useRef } from 'react';
import { useFetchMe } from '@/entities/me';
import SocketClient from '@/shared/api/websocket/client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { SystemAnnouncementEvent } from '../model/system-announcement.types';

/**
 * 시스템 공지 WebSocket 구독 훅
 *
 * root layout에서 호출하여, 인증된 유저가 있으면 글로벌 토픽을 구독한다.
 * 백엔드에서 시스템 공지 이벤트를 푸시하면 store에 반영 → 모달 표시.
 */
export default function useSystemAnnouncementSubscription() {
  const { data: me } = useFetchMe();
  const clientRef = useRef<SocketClient | null>(null);

  useEffect(() => {
    if (!me) return;

    const client = new SocketClient();
    clientRef.current = client;
    client.connect();

    // TODO: 백엔드와 토픽 경로 확정 후 수정
    client.subscribe('/sub/system/announcements', (message) => {
      try {
        const event: SystemAnnouncementEvent = JSON.parse(message.body);
        useSystemAnnouncementStore.getState().showAnnouncement(event);
      } catch {
        // malformed message — ignore
      }
    });

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [me]);
}
```

> **Note:** `showAnnouncement`를 useEffect 의존성에 넣지 않고, 콜백 내부에서 `getState()`로 접근한다. 이렇게 하면 불필요한 재연결을 방지할 수 있다.

- [ ] **Step 4: 테스트 실행**

Run: `npx vitest run src/features/system-announcement/lib/use-system-announcement-subscription.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/system-announcement/lib/use-system-announcement-subscription.ts src/features/system-announcement/lib/use-system-announcement-subscription.test.ts
git commit -m "feat: add WebSocket subscription hook for system announcements

WebSocket topic path is a placeholder (/sub/system/announcements).
To be updated after backend coordination."
```

---

### Task 8: 구독 컴포넌트 분리 및 layout 연동

**Files:**

- Create: `src/features/system-announcement/ui/system-announcement-subscriber.tsx`
- Modify: `src/features/system-announcement/index.ts`
- Modify: `src/app/layout.tsx`

> **설계 결정:** WebSocket 구독 훅을 모달 컴포넌트에 넣지 않고, 별도의 `SystemAnnouncementSubscriber` 컴포넌트로 분리한다. 이유: (1) SRP — 모달은 UI만, 구독은 구독만, (2) 모달이 조건부 렌더링되어도 구독은 유지됨, (3) 모달 테스트에서 WebSocket 모킹이 불필요.

- [ ] **Step 1: Subscriber 컴포넌트 작성**

```tsx
// src/features/system-announcement/ui/system-announcement-subscriber.tsx
'use client';

import useSystemAnnouncementSubscription from '../lib/use-system-announcement-subscription';

/**
 * WebSocket 구독만 담당하는 컴포넌트 (UI 렌더링 없음).
 * root layout에 배치하여 전역에서 시스템 공지를 수신한다.
 */
export default function SystemAnnouncementSubscriber() {
  useSystemAnnouncementSubscription();
  return null;
}
```

- [ ] **Step 2: index.ts 업데이트**

```ts
// src/features/system-announcement/index.ts
export { default as SystemAnnouncementModal } from './ui/system-announcement-modal';
export { default as SystemAnnouncementSubscriber } from './ui/system-announcement-subscriber';
export { useSystemAnnouncementStore } from './model/system-announcement.store';
export type { SystemAnnouncementEvent } from './model/system-announcement.types';
```

- [ ] **Step 3: root layout에 Subscriber 추가**

`src/app/layout.tsx` 수정:

```tsx
// import 변경:
import {
  SystemAnnouncementModal,
  SystemAnnouncementSubscriber,
} from '@/features/system-announcement';

// DialogProvider 내부:
<DialogProvider>
  {children}
  <SystemAnnouncementModal />
  <SystemAnnouncementSubscriber />
</DialogProvider>;
```

- [ ] **Step 4: Commit**

```bash
git add src/features/system-announcement/ui/system-announcement-subscriber.tsx src/features/system-announcement/index.ts src/app/layout.tsx
git commit -m "feat: add SystemAnnouncementSubscriber and wire into root layout"
```

---

### Task 9: 수동 테스트 & 정리

- [ ] **Step 1: 수동 테스트 — /maintenance 페이지**

Run: `http://localhost:3000/maintenance`
Expected: 점검 안내 페이지가 독립 레이아웃으로 정상 표시됨 (헤더/푸터 없음)

- [ ] **Step 2: 수동 테스트 — 모달 표시**

앱이 로드된 상태에서 브라우저 DevTools Console:

```js
// Zustand store에 직접 공지 주입
// (window.__ZUSTAND_STORE는 접근 불가하므로, 개발 중 임시 전역 노출 또는 React DevTools 사용)
// 또는 dev 서버에서 임시로 useEffect에 테스트 이벤트를 넣어 확인
```

> WebSocket 구독은 백엔드 토픽이 준비된 후 E2E로 검증한다.

- [ ] **Step 3: 임시 파일 삭제**

```bash
rm public/preview-system-announcement.html
```

- [ ] **Step 4: 전체 테스트 실행**

Run: `npx vitest run`
Expected: 모든 테스트 PASS

- [ ] **Step 5: 최종 Commit**

```bash
git add -A
git commit -m "chore: clean up preview files"
```
