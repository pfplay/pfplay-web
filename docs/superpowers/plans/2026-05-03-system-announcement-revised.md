# 시스템 공지사항 (V2) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v1 머지된 시스템 공지 코드를 신 contract(타입 3종 + Edge Config + 다중 표시)로 재작성하고 `feat/admin-api-sync` 브랜치 위에서 점진적으로 commit한다.

**Architecture:** 부팅 시 `middleware.ts`가 Vercel Edge Config(서버사이드)를 조회해 ACTIVE 점검이면 `/maintenance`로 rewrite. root layout server component에서 `/v1/system/status` REST를 1회 호출해 active announcements를 hydrate. 정상 부팅된 세션은 STOMP `/topic/system/announcements`를 구독해 3종 이벤트(`PUBLISHED`/`MAINTENANCE_STARTED`/`CANCELLED`)를 수신, store(Map 기반)에 반영해 4종 UI(overlay/planned-banner/event-toast/emergency-banner)를 동시에 다수 표시한다. Edge Config/REST 둘 다 실패해도 503 axios 인터셉터가 마지막 안전망 역할을 한다.

**Tech Stack:** Next.js 14 App Router · `@vercel/edge-config` · STOMP/SockJS · Zustand · vitest + @testing-library/react

**Spec:** [docs/superpowers/specs/2026-05-03-system-announcement-revised-design.md](../specs/2026-05-03-system-announcement-revised-design.md)

---

## 작업 원칙

1. **TDD**: 신규/수정 모듈은 단위 테스트 먼저, 그 후 구현. 기존 v1 테스트는 갱신 또는 삭제.
2. **Frequent commits**: chunk 내 각 task가 하나의 commit. PR review 시 chunk 단위로 따라갈 수 있게.
3. **YAGNI**: spec 범위 외 기능(자동 종료, inbox 등) 절대 추가 금지.
4. **DRY**: i18n locale 분기, severity → UI 색상 매핑 등은 helper로 분리.
5. **회귀 검증**: 각 chunk 완료 시 `yarn test:type`/`yarn lint`/`yarn test` 그린 확인 후 다음 chunk 진입.

## Pre-flight (이미 검증됨)

- `SocketClient.subscribe(destination: Destination, callback)` — `Destination = '/${string}'` 이미 path-based (`src/shared/api/websocket/client.ts:107`). v2 토픽 `/topic/system/announcements`도 그대로 사용 가능. 별도 client 변경 불필요.

## i18n keys (확정 — 본 plan에서 도입)

| key                                   | ko                                  | en                                 |
| ------------------------------------- | ----------------------------------- | ---------------------------------- |
| `system.maintenance.active.title`     | 시스템 점검 중                      | System Maintenance                 |
| `system.maintenance.active.retry`     | 재시도                              | Retry                              |
| `system.maintenance.planned.banner`   | {start} 부터 점검이 예정되어 있어요 | Maintenance scheduled from {start} |
| `system.announcement.event.close`     | 닫기                                | Close                              |
| `system.announcement.emergency.label` | 긴급 공지                           | Emergency Notice                   |

`{start}` 자리표시자는 `processI18nString` (기존 유틸)로 치환. 시간 포맷은 `YYYY-MM-DD HH:mm` (사용자 contract).

---

## File Structure

```
src/
  middleware.ts                                    [신규]
  shared/
    api/
      system-status/
        index.ts                                   [신규] re-export
        types.ts                                   [신규] SystemStatusResponse
        get-system-status.ts                       [신규] REST 클라이언트
        get-system-status.test.ts                  [신규]
        get-edge-config-maintenance.ts             [신규] server-only Edge Config 조회
        get-edge-config-maintenance.test.ts        [신규]
  features/
    system-announcement/
      model/
        system-announcement.types.ts               [재작성]
        system-announcement.store.ts               [재작성] Map 기반
        system-announcement.store.test.ts          [재작성]
      lib/
        use-system-announcement-subscription.ts    [갱신] 3 event types
        use-system-announcement-subscription.test.ts [갱신]
        announcement-helpers.ts                    [신규] locale·type-classification·시간 포맷
        announcement-helpers.test.ts               [신규]
      ui/
        system-announcement-modal.tsx              [삭제]
        system-announcement-modal.test.tsx         [삭제]
        maintenance-overlay.tsx                    [신규]
        maintenance-overlay.test.tsx               [신규]
        maintenance-planned-banner.tsx             [신규]
        maintenance-planned-banner.test.tsx        [신규]
        event-toast.tsx                            [신규]
        event-toast.test.tsx                       [신규]
        emergency-banner.tsx                       [신규]
        emergency-banner.test.tsx                  [신규]
        system-announcement-display.tsx            [신규] dispatcher
        system-announcement-display.test.tsx       [신규]
        hydrate-announcements-from-status.tsx      [신규] /v1/system/status REST 결과를 store로 inject
        hydrate-announcements-from-status.test.tsx [신규]
        system-announcement-subscriber.tsx         [그대로]
      index.ts                                     [갱신] 새 export
  app/
    layout.tsx                                     [갱신] modal → display 교체 + REST hydrate
    maintenance/
      page.tsx                                     [갱신] searchParams 메시지
      page.test.tsx                                [신규]
      layout.tsx                                   [그대로]
      refresh-button.tsx                           [그대로]
  shared/lib/localization/dictionaries/
    ko.json                                        [갱신] 위 i18n keys
    en.json                                        [갱신] 위 i18n keys
```

---

## Chunk 1: Foundation — types · store · helpers

**의존성:** 없음.

### Task 1.1: types 재작성

**Files:**

- Modify: `src/features/system-announcement/model/system-announcement.types.ts`

- [ ] **Step 1: 기존 v1 types를 spec v2 contract로 교체**

```ts
export type AnnouncementType = 'MAINTENANCE_NOTICE' | 'EVENT' | 'EMERGENCY';
export type AnnouncementSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export type AnnouncementSnapshot = {
  announcementId: number;
  type: AnnouncementType;
  severity: AnnouncementSeverity;
  titleKo: string;
  titleEn: string;
  messageKo: string;
  messageEn: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  expiresAt: string | null;
  sentAt: string;
};

export type AnnouncementPublishedEvent = AnnouncementSnapshot & {
  eventType: 'ANNOUNCEMENT_PUBLISHED';
};

export type MaintenanceStartedEvent = AnnouncementSnapshot & {
  eventType: 'MAINTENANCE_STARTED';
  type: 'MAINTENANCE_NOTICE';
  scheduledStartAt: string;
  scheduledEndAt: string;
};

export type AnnouncementCancelledEvent = {
  eventType: 'ANNOUNCEMENT_CANCELLED';
  announcementId: number;
  cancelledAt: string;
};

export type SystemAnnouncementEvent =
  | AnnouncementPublishedEvent
  | MaintenanceStartedEvent
  | AnnouncementCancelledEvent;

export type MaintenanceState = {
  phase: 'PLANNED' | 'ACTIVE';
  startAt: string;
  endAt: string;
  messageKo: string;
  messageEn: string;
};
```

- [ ] **Step 2: Run `yarn test:type`**

Expected: 깨질 것 (store/subscription/UI가 옛 type 참조). chunk 1 마지막에 그린.

- [ ] **Step 3: Commit**

```bash
git add src/features/system-announcement/model/system-announcement.types.ts
git commit -m "refactor(system-announcement): rewrite types to v2 contract"
```

### Task 1.2: store 재작성 (Map 기반 다수 active)

**Files:**

- Modify: `src/features/system-announcement/model/system-announcement.store.ts`
- Modify: `src/features/system-announcement/model/system-announcement.store.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

테스트 케이스:

- `add()`로 추가하면 `announcementId` 키로 active에 들어간다
- 같은 id를 두 번 add해도 1개만 유지된다 (idempotent)
- `cancel(id)`로 active에서 제거된다
- `dismiss(id)`는 active에서 제거하고 `dismissedIds`에 추가한다
- `add()` 시 `dismissedIds`에 있으면 추가되지 않는다 (dismissed re-publish 방지)
- `setMaintenance(state | null)`로 maintenance state를 별도 관리한다

> **Note**: v1 plan에 있던 `clearAllByType`은 caller가 없어 제거. cancel은 단건 처리만.

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/features/system-announcement/model/system-announcement.store`
Expected: FAIL (store 미구현)

- [ ] **Step 3: 구현**

```ts
import { create } from 'zustand';
import { AnnouncementSnapshot, MaintenanceState } from './system-announcement.types';

type SystemAnnouncementState = {
  announcements: Map<number, AnnouncementSnapshot>;
  dismissedIds: Set<number>;
  maintenance: MaintenanceState | null;
  add: (snapshot: AnnouncementSnapshot) => void;
  cancel: (announcementId: number) => void;
  dismiss: (announcementId: number) => void;
  setMaintenance: (state: MaintenanceState | null) => void;
};

export const createSystemAnnouncementStore = () =>
  create<SystemAnnouncementState>((set, get) => ({
    announcements: new Map(),
    dismissedIds: new Set(),
    maintenance: null,

    add: (snapshot) => {
      if (get().dismissedIds.has(snapshot.announcementId)) return;
      const next = new Map(get().announcements);
      next.set(snapshot.announcementId, snapshot);
      set({ announcements: next });
    },

    cancel: (announcementId) => {
      const next = new Map(get().announcements);
      next.delete(announcementId);
      set({ announcements: next });
    },

    dismiss: (announcementId) => {
      const nextActive = new Map(get().announcements);
      nextActive.delete(announcementId);
      const nextDismissed = new Set(get().dismissedIds);
      nextDismissed.add(announcementId);
      set({ announcements: nextActive, dismissedIds: nextDismissed });
    },

    setMaintenance: (state) => set({ maintenance: state }),
  }));

export const useSystemAnnouncementStore = createSystemAnnouncementStore();
```

- [ ] **Step 4: 통과 확인**

Run: `yarn test src/features/system-announcement/model/system-announcement.store`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/system-announcement/model/system-announcement.store.ts \
        src/features/system-announcement/model/system-announcement.store.test.ts
git commit -m "refactor(system-announcement): map-based store supporting multi-active"
```

### Task 1.3: helpers (locale 분기 + type 분류 + 시간 포맷)

**Files:**

- Create: `src/features/system-announcement/lib/announcement-helpers.ts`
- Create: `src/features/system-announcement/lib/announcement-helpers.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

테스트 케이스:

- `pickByLocale({ ko: 'A', en: 'B' }, 'ko') === 'A'`
- `pickByLocale({ ko: 'A', en: 'B' }, 'en') === 'B'`
- `getLocalizedTitle(snapshot, 'ko') === snapshot.titleKo`
- `getLocalizedMessage(snapshot, 'en') === snapshot.messageEn`
- `isExpired(snapshot, now)` — `expiresAt`이 `now`보다 과거면 true, null이면 false
- `isToast({ type: 'EVENT', severity: 'INFO' })` === true
- `isToast({ type: 'EVENT', severity: 'CRITICAL' })` === false
- `isEmergencyBanner({ type: 'EMERGENCY' })` === true
- `isPlannedNotice({ type: 'MAINTENANCE_NOTICE' })` === true
- `formatScheduledTime('2026-05-04T03:00:00') === '2026-05-04 03:00'` (KST/UTC 정책은 사용자 contract 그대로 — ISO 자른 형식)

> **Note**: locale 인자는 `'ko' | 'en'` 타입. UI 컴포넌트가 `useI18n().lang`(또는 컨텍스트 노출 키)로 locale을 읽어 helper에 전달. helpers 자체는 stateless로 `useI18n` 의존 없이 순수 함수 유지.

- [ ] **Step 2: 실패 확인**

Run: `yarn test src/features/system-announcement/lib/announcement-helpers`
Expected: FAIL

- [ ] **Step 3: 구현**

```ts
import { AnnouncementSnapshot } from '../model/system-announcement.types';

export type Locale = 'ko' | 'en';

export function pickByLocale(values: { ko: string; en: string }, locale: Locale): string {
  return locale === 'ko' ? values.ko : values.en;
}

export function getLocalizedTitle(s: AnnouncementSnapshot, locale: Locale): string {
  return pickByLocale({ ko: s.titleKo, en: s.titleEn }, locale);
}

export function getLocalizedMessage(s: AnnouncementSnapshot, locale: Locale): string {
  return pickByLocale({ ko: s.messageKo, en: s.messageEn }, locale);
}

export function isExpired(s: AnnouncementSnapshot, nowMs = Date.now()): boolean {
  if (!s.expiresAt) return false;
  return new Date(s.expiresAt).getTime() <= nowMs;
}

export const isToast = (s: AnnouncementSnapshot) =>
  s.type === 'EVENT' && (s.severity === 'INFO' || s.severity === 'WARN');
export const isEmergencyBanner = (s: AnnouncementSnapshot) => s.type === 'EMERGENCY';
export const isPlannedNotice = (s: AnnouncementSnapshot) => s.type === 'MAINTENANCE_NOTICE';

export function formatScheduledTime(iso: string): string {
  // ISO 8601 ('2026-05-04T03:00:00') → 'YYYY-MM-DD HH:mm'
  return iso.slice(0, 16).replace('T', ' ');
}
```

- [ ] **Step 4: 통과 확인 + Commit**

```bash
git add src/features/system-announcement/lib/announcement-helpers.ts \
        src/features/system-announcement/lib/announcement-helpers.test.ts
git commit -m "feat(system-announcement): add locale + type-classification + time-format helpers"
```

### Task 1.4: chunk 1 회귀 검증

- [ ] **Step 1**: `yarn test:type` PASS (모든 type 참조 정합)
- [ ] **Step 2**: `yarn test src/features/system-announcement/model src/features/system-announcement/lib` 그린

---

## Chunk 2: System status sourcing — Edge Config + REST + middleware

**의존성:** Chunk 1의 `MaintenanceState`/`AnnouncementSnapshot` types.

### Task 2.1: `@vercel/edge-config` 설치

**Files:** `package.json`, `yarn.lock`

- [ ] **Step 1: 패키지 추가**: `yarn add @vercel/edge-config`
- [ ] **Step 2: Commit**: `chore: add @vercel/edge-config for maintenance status sourcing`

### Task 2.2: REST 클라이언트 — `/v1/system/status`

**Files:**

- Create: `src/shared/api/system-status/types.ts`
- Create: `src/shared/api/system-status/get-system-status.ts`
- Create: `src/shared/api/system-status/get-system-status.test.ts`

- [ ] **Step 1: types 정의**

```ts
import {
  AnnouncementSnapshot,
  MaintenanceState,
} from '@/features/system-announcement/model/system-announcement.types';

export type SystemStatusResult = {
  maintenance: (MaintenanceState & { phase: 'ACTIVE' }) | null;
  activeAnnouncements: AnnouncementSnapshot[];
  plannedMaintenance: Array<MaintenanceState & { phase: 'PLANNED' }>;
};

export type SystemStatusResponse = { result: SystemStatusResult };
```

- [ ] **Step 2: 실패 테스트** — vitest mock with `vi.spyOn(globalThis, 'fetch')`. 케이스:

  - 200 응답 시 `result` 그대로 반환
  - 4xx/5xx 시 throw with `HTTP {status}`
  - JSON 파싱 실패 시 throw

- [ ] **Step 3: 구현**

```ts
const API_HOST = process.env.NEXT_PUBLIC_API_HOST_NAME ?? '';

export async function getSystemStatus(): Promise<SystemStatusResult> {
  const res = await fetch(`${API_HOST}v1/system/status`, {
    next: { revalidate: 10 },
  });
  if (!res.ok) throw new Error(`system-status: HTTP ${res.status}`);
  const json = (await res.json()) as SystemStatusResponse;
  return json.result;
}
```

- [ ] **Step 4: 통과 + Commit**: `feat(system-status): add REST client for /v1/system/status`

### Task 2.3: Edge Config 조회 (server-only)

**Files:**

- Create: `src/shared/api/system-status/get-edge-config-maintenance.ts`
- Create: `src/shared/api/system-status/get-edge-config-maintenance.test.ts`

- [ ] **Step 1: 실패 테스트**

테스트 setup: `@vercel/edge-config` 모듈 자체를 vi.mock으로 stub. 그리고 `EDGE_CONFIG` 환경변수는 `vi.stubEnv('EDGE_CONFIG', '...')` / `vi.unstubAllEnvs()`로 토글.

```ts
vi.mock('@vercel/edge-config', () => ({
  get: vi.fn(),
}));
```

케이스:

- `EDGE_CONFIG` 환경변수 unset이면 `get` 호출 없이 `null` 반환
- `get('maintenance')`이 `null` 반환 시 `null` 반환
- `get('maintenance')`이 `MaintenanceState` 객체 반환 시 그대로 반환
- `get` 호출이 throw하면 silent하게 `null` 반환

- [ ] **Step 2: 구현**

```ts
import { get } from '@vercel/edge-config';
import { MaintenanceState } from '@/features/system-announcement/model/system-announcement.types';

export async function getEdgeConfigMaintenance(): Promise<MaintenanceState | null> {
  if (!process.env.EDGE_CONFIG) return null;
  try {
    const value = await get<MaintenanceState | null>('maintenance');
    return value ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: index.ts에 re-export**

```ts
export * from './types';
export * from './get-system-status';
export * from './get-edge-config-maintenance';
```

- [ ] **Step 4: 통과 + Commit**: `feat(system-status): add server-only edge-config maintenance reader`

### Task 2.4: middleware.ts — ACTIVE면 `/maintenance`로 rewrite

**Files:** Create `src/middleware.ts`

- [ ] **Step 1: 구현**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getEdgeConfigMaintenance } from '@/shared/api/system-status';

export const config = {
  matcher: ['/((?!maintenance|_next/static|_next/image|favicon.ico|api).*)'],
};

export async function middleware(req: NextRequest) {
  const m = await getEdgeConfigMaintenance();
  if (m?.phase === 'ACTIVE') {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    url.searchParams.set('messageKo', m.messageKo);
    url.searchParams.set('messageEn', m.messageEn);
    url.searchParams.set('endAt', m.endAt);
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}
```

- [ ] **Step 2: 검증 — 자동화 어려움, 수동 가이드 작성**

이 chunk의 commit 메시지에 검증 절차 명시:

> 검증: Vercel Dashboard에서 `pfplay-maintenance` Edge Config에 `{"maintenance": {"phase":"ACTIVE","startAt":"...","endAt":"...","messageKo":"...","messageEn":"..."}}` 등록 → `yarn dev` → `/parties` 접속 시 `/maintenance`로 rewrite 확인.

- [ ] **Step 3: Commit**: `feat(system-status): redirect to /maintenance via middleware when edge-config phase is ACTIVE`

### Task 2.5: `/maintenance` 페이지 — searchParams 메시지

**Files:**

- Modify: `src/app/maintenance/page.tsx`
- Create: `src/app/maintenance/page.test.tsx`

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- searchParams에 messageKo만 있으면 `whitespace-pre-line` element에 그 값이 렌더된다
- searchParams가 비어있으면 default fallback 문구가 렌더된다 (한/영 둘 다)
- `RefreshButton`이 마운트된다

- [ ] **Step 2: 구현 갱신**

```tsx
import { Metadata } from 'next';
import { Typography } from '@/shared/ui/components/typography';
import RefreshButton from './refresh-button';

export const metadata: Metadata = {
  title: 'PFPlay - 시스템 점검 중',
};

type SearchParams = {
  messageKo?: string;
  messageEn?: string;
  endAt?: string;
};

const MaintenancePage = ({ searchParams }: { searchParams: SearchParams }) => {
  const messageKo =
    searchParams.messageKo ??
    '더 나은 서비스를 위해 시스템 점검을 진행하고 있습니다.\n점검이 완료되면 정상적으로 이용하실 수 있습니다.';
  const messageEn =
    searchParams.messageEn ?? 'We are performing scheduled maintenance. Please retry shortly.';

  return (
    <div className='flex flex-col items-center gap-5 max-w-[480px] text-center px-6'>
      <div className='w-[80px] h-[80px] bg-gradient-red rounded-full flexColCenter'>
        <span className='text-[36px]'>🔧</span>
      </div>
      <Typography type='title1' className='text-gray-50'>
        시스템 점검 중
      </Typography>
      <Typography type='detail1' className='text-gray-400 whitespace-pre-line'>
        {messageKo}
      </Typography>
      <Typography type='detail1' className='text-gray-500 whitespace-pre-line'>
        {messageEn}
      </Typography>
      <div className='w-[48px] h-[2px] bg-gray-700 my-1' />
      <RefreshButton />
      <Typography type='caption1' className='text-gray-700 font-extrabold mt-5'>
        PFPlay
      </Typography>
    </div>
  );
};

export default MaintenancePage;
```

- [ ] **Step 3: 통과 + Commit**: `feat(maintenance): accept localized messages from searchParams`

### Task 2.6: chunk 2 회귀 검증

- [ ] `yarn test:type` / `yarn lint` / `yarn test src/shared/api/system-status src/app/maintenance` 그린

---

## Chunk 3: WebSocket subscription — 3 event types

**의존성:** Chunk 1 store + types. (SocketClient 변경 불필요 — Pre-flight 참조)

### Task 3.1: subscription 갱신

**Files:**

- Modify: `src/features/system-announcement/lib/use-system-announcement-subscription.ts`
- Modify: `src/features/system-announcement/lib/use-system-announcement-subscription.test.ts`

- [ ] **Step 1: 실패 테스트 갱신**

테스트 케이스:

- `me`가 없으면 `client.subscribe`가 호출되지 않는다
- `me`가 있으면 `client.subscribe('/topic/system/announcements', ...)` 정확한 경로로 1회 호출된다
- `ANNOUNCEMENT_PUBLISHED` 메시지 수신 시 `store.add(payload)` 호출
- `ANNOUNCEMENT_CANCELLED` 메시지 수신 시 `store.cancel(announcementId)` 호출
- `MAINTENANCE_STARTED` 메시지 수신 시 `store.add` + `store.setMaintenance({phase:'ACTIVE',...})` 호출
- 알 수 없는 `eventType` 수신 시 무시 (silent, store 호출 없음)
- JSON parse 실패 시 silent
- hook unmount 시 `client.disconnect()` 호출

- [ ] **Step 2: 구현 갱신**

```ts
'use client';
import { useEffect } from 'react';
import { useFetchMe } from '@/entities/me';
import SocketClient from '@/shared/api/websocket/client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { SystemAnnouncementEvent } from '../model/system-announcement.types';

const TOPIC = '/topic/system/announcements';

function isEvent(value: unknown): value is SystemAnnouncementEvent {
  return typeof value === 'object' && value !== null && 'eventType' in value;
}

export default function useSystemAnnouncementSubscription() {
  const { data: me } = useFetchMe();

  useEffect(() => {
    if (!me) return;

    const client = new SocketClient();
    client.connect();

    client.subscribe(TOPIC, (message) => {
      try {
        const ev = JSON.parse(message.body);
        if (!isEvent(ev)) return;
        const store = useSystemAnnouncementStore.getState();
        switch (ev.eventType) {
          case 'ANNOUNCEMENT_PUBLISHED':
            store.add(ev);
            break;
          case 'MAINTENANCE_STARTED':
            store.add(ev);
            store.setMaintenance({
              phase: 'ACTIVE',
              startAt: ev.scheduledStartAt,
              endAt: ev.scheduledEndAt,
              messageKo: ev.messageKo,
              messageEn: ev.messageEn,
            });
            break;
          case 'ANNOUNCEMENT_CANCELLED':
            store.cancel(ev.announcementId);
            break;
        }
      } catch {
        // malformed — silent
      }
    });

    return () => client.disconnect();
  }, [me]);
}
```

- [ ] **Step 3: 통과 + Commit**: `refactor(system-announcement): handle 3 ws event types via dedicated topic`

### Task 3.2: chunk 3 회귀 검증

- [ ] `yarn test src/features/system-announcement/lib` 그린

---

## Chunk 4: UI components — 4종 + dispatcher

**의존성:** Chunk 1 store/types/helpers + i18n keys (Task 5.5 — 본 chunk에서 키만 미리 추가하거나, plan 진행 중 5.5를 4보다 먼저 수행).

> **Order note**: Task 5.5 (i18n 키 추가)을 chunk 4 진입 전에 수행하거나, chunk 4 첫 task로 옮겨도 됨. 본 plan은 implementation 순서 자유 — chunk 5에 묶어둔 것은 의미상 cleanup 묶음.

각 UI 컴포넌트는 **client component**(`'use client'`)이며 store를 직접 구독하지 않고 **props로 snapshot/maintenance 받음**. 디스패처(`SystemAnnouncementDisplay`)가 store를 구독하고 분배.

`useI18n()` 컨텍스트에서 locale을 어떻게 읽는지: 기존 코드 패턴 참고 (`src/shared/lib/localization/i18n.context.ts` 등). 본 plan에선 `const t = useI18n(); const locale = t.lang;` 가정. 실제 키가 다르면 첫 컴포넌트 구현 시 확인 후 통일.

### Task 4.1: `MaintenanceOverlay`

**Files:**

- Create: `src/features/system-announcement/ui/maintenance-overlay.tsx`
- Create: `src/features/system-announcement/ui/maintenance-overlay.test.tsx`

Props: `{ maintenance: MaintenanceState }`

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- locale `ko`일 때 `maintenance.messageKo`가 표시된다
- locale `en`일 때 `maintenance.messageEn`가 표시된다
- 재시도 버튼 클릭 시 `window.location.reload`가 호출된다 (vitest mock)
- 전체 화면을 가리는 overlay 클래스 (`fixed inset-0`)가 적용된다
- title `system.maintenance.active.title`, button `system.maintenance.active.retry` i18n 키 텍스트가 노출된다

- [ ] **Step 2: 구현**

전체 화면 점검 화면을 `/maintenance` 페이지와 동일한 레이아웃으로 inline render. (또는 단순화: 페이지로 router.push). 본 plan은 inline overlay 권장 — `WS MAINTENANCE_STARTED` 도착 시 페이지 이동 없이 즉시 가림.

- [ ] **Step 3: 통과 + Commit**: `feat(system-announcement): add MaintenanceOverlay`

### Task 4.2: `MaintenancePlannedBanner`

**Files:**

- Create: `src/features/system-announcement/ui/maintenance-planned-banner.tsx`
- Create: `src/features/system-announcement/ui/maintenance-planned-banner.test.tsx`

Props: `{ snapshot: AnnouncementSnapshot }` (type=`MAINTENANCE_NOTICE`)

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- locale `ko`일 때 `system.maintenance.planned.banner` 카피의 `{start}`가 `formatScheduledTime(snapshot.scheduledStartAt)` 결과로 치환되어 표시
- locale `en`일 때 동일 카피의 영어 버전 + 영어 시간 포맷 (동일 yyyy-MM-dd HH:mm)
- close 버튼 클릭 시 `useSystemAnnouncementStore.getState().dismiss(snapshot.announcementId)` 호출
- `snapshot.scheduledStartAt`이 null이면 컴포넌트가 null 반환 (방어)

- [ ] **Step 2: 구현**

상단 dismissable banner. close 버튼 우측. type=`MAINTENANCE_NOTICE` 외 type은 dispatcher에서 필터되므로 컴포넌트는 type 검사 안 함.

- [ ] **Step 3: 통과 + Commit**: `feat(system-announcement): add MaintenancePlannedBanner`

### Task 4.3: `EventToast`

**Files:**

- Create: `src/features/system-announcement/ui/event-toast.tsx`
- Create: `src/features/system-announcement/ui/event-toast.test.tsx`

Props: `{ snapshot: AnnouncementSnapshot }`

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- title/message가 locale에 따라 표시
- close 버튼 (`system.announcement.event.close`) 클릭 시 `dismiss(announcementId)` 호출
- `snapshot.expiresAt`이 미래면 그 시점에 자동 dismiss (vi.useFakeTimers() + advanceTimersByTime)
- `snapshot.expiresAt`이 null이면 자동 dismiss 안 함 (사용자 close만)
- `snapshot.expiresAt`이 이미 과거면 mount 즉시 dismiss

- [ ] **Step 2: 구현**

`useEffect` + `setTimeout`으로 `expiresAt` 자동 dismiss. severity별 색상은 본 plan 범위 외 (디자인 토큰은 v1 modal 스타일 참조).

- [ ] **Step 3: 통과 + Commit**: `feat(system-announcement): add EventToast`

### Task 4.4: `EmergencyBanner`

**Files:**

- Create: `src/features/system-announcement/ui/emergency-banner.tsx`
- Create: `src/features/system-announcement/ui/emergency-banner.test.tsx`

Props: `{ snapshot: AnnouncementSnapshot }`

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- title/message가 locale 따라 표시 (`system.announcement.emergency.label` 라벨 함께)
- **close 버튼 없음** (persistent) — DOM에 close 컨트롤이 없는 것 단언
- `snapshot.expiresAt` 미래면 그 시점에 store에서 cancel 처리 (또는 자체 dismiss). `EventToast`와 동일 setTimeout 패턴이지만 `dismiss` 대신 `cancel`로 갈지 design 결정 필요 — **결정: `cancel(announcementId)` 호출** (expiresAt = 시스템적 만료, dismiss는 사용자 행위)
- `expiresAt` null이면 자동 dismiss 안 함

- [ ] **Step 2: 구현**

상단 persistent banner. CRITICAL severity 색상.

- [ ] **Step 3: 통과 + Commit**: `feat(system-announcement): add EmergencyBanner`

### Task 4.5: `SystemAnnouncementDisplay` — dispatcher

**Files:**

- Create: `src/features/system-announcement/ui/system-announcement-display.tsx`
- Create: `src/features/system-announcement/ui/system-announcement-display.test.tsx`

- [ ] **Step 1: 실패 테스트**

테스트 케이스:

- store.maintenance.phase==='ACTIVE'면 `MaintenanceOverlay` 1개 mount
- store.maintenance==null이면 overlay mount 안 됨
- announcements에 `MAINTENANCE_NOTICE` 2개 있으면 `MaintenancePlannedBanner` 2개 mount
- announcements에 `EMERGENCY` 1개 있으면 `EmergencyBanner` 1개 mount
- announcements에 `EVENT`(severity INFO/WARN) 3개 있으면 `EventToast` 3개 mount
- 동시: maintenance ACTIVE + EMERGENCY 1 + EVENT 2 → overlay 1 + banner 1 + toast 2 = 4 mount

- [ ] **Step 2: 구현**

```tsx
'use client';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { isToast, isEmergencyBanner, isPlannedNotice } from '../lib/announcement-helpers';
import MaintenanceOverlay from './maintenance-overlay';
import MaintenancePlannedBanner from './maintenance-planned-banner';
import EventToast from './event-toast';
import EmergencyBanner from './emergency-banner';

export default function SystemAnnouncementDisplay() {
  const announcements = useSystemAnnouncementStore((s) => Array.from(s.announcements.values()));
  const maintenance = useSystemAnnouncementStore((s) => s.maintenance);

  return (
    <>
      {maintenance?.phase === 'ACTIVE' && <MaintenanceOverlay maintenance={maintenance} />}
      {announcements.filter(isPlannedNotice).map((a) => (
        <MaintenancePlannedBanner key={a.announcementId} snapshot={a} />
      ))}
      {announcements.filter(isEmergencyBanner).map((a) => (
        <EmergencyBanner key={a.announcementId} snapshot={a} />
      ))}
      {announcements.filter(isToast).map((a) => (
        <EventToast key={a.announcementId} snapshot={a} />
      ))}
    </>
  );
}
```

- [ ] **Step 3: 통과 + Commit**: `feat(system-announcement): add SystemAnnouncementDisplay dispatcher`

### Task 4.6: chunk 4 회귀 검증

- [ ] `yarn test:type` / `yarn lint` / `yarn test src/features/system-announcement/ui` 그린

---

## Chunk 5: Integration & cleanup

**의존성:** Chunk 1~4 모두.

### Task 5.1: 기존 v1 modal 삭제

**Files:**

- Delete: `src/features/system-announcement/ui/system-announcement-modal.tsx`
- Delete: `src/features/system-announcement/ui/system-announcement-modal.test.tsx`

- [ ] **Step 1: 삭제**: `git rm` 두 파일
- [ ] **Step 2: `index.ts`에서 modal export 제거 + `SystemAnnouncementDisplay` export 추가**
- [ ] **Step 3: `yarn test:type` PASS 확인**
- [ ] **Step 4: Commit**: `refactor(system-announcement): remove v1 modal — replaced by display dispatcher`

### Task 5.2: root layout — REST hydrate + display 마운트

**Files:** Modify `src/app/layout.tsx`

- [ ] **Step 1: spec 결정 — REST hydrate 위치는 root layout server component로 lock-in**

(spec doc 결정사항에 명문화됨)

- [ ] **Step 2: 구현**

```tsx
import { getSystemStatus } from '@/shared/api/system-status';
import SystemAnnouncementSubscriber from '@/features/system-announcement/ui/system-announcement-subscriber';
import SystemAnnouncementDisplay from '@/features/system-announcement/ui/system-announcement-display';
import HydrateAnnouncementsFromStatus from '@/features/system-announcement/ui/hydrate-announcements-from-status'; // 신규 client wrapper

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let initialActive: AnnouncementSnapshot[] = [];
  let initialMaintenance: MaintenanceState | null = null;
  try {
    const status = await getSystemStatus();
    initialActive = status.activeAnnouncements;
    initialMaintenance = status.maintenance;
  } catch {
    // REST 실패 — 통과 (ws + 503 인터셉터에서 보정)
  }

  // (기존 layout 트리에 inject)
  return (
    /* existing tree */
    <>
      <HydrateAnnouncementsFromStatus
        initialActive={initialActive}
        initialMaintenance={initialMaintenance}
      />
      <SystemAnnouncementSubscriber />
      <SystemAnnouncementDisplay />
      {children}
    </>
  );
}
```

`HydrateAnnouncementsFromStatus`는 client component — props 받아 mount 시점에 store에 inject.

- [ ] **Step 3: `HydrateAnnouncementsFromStatus` 구현 + 단위 테스트**

```tsx
'use client';
import { useEffect } from 'react';
import { useSystemAnnouncementStore } from '../model/system-announcement.store';
import { AnnouncementSnapshot, MaintenanceState } from '../model/system-announcement.types';

type Props = {
  initialActive: AnnouncementSnapshot[];
  initialMaintenance: MaintenanceState | null;
};

export default function HydrateAnnouncementsFromStatus({
  initialActive,
  initialMaintenance,
}: Props) {
  useEffect(() => {
    const store = useSystemAnnouncementStore.getState();
    initialActive.forEach((a) => store.add(a));
    if (initialMaintenance) store.setMaintenance(initialMaintenance);
  }, [initialActive, initialMaintenance]);
  return null;
}
```

테스트 케이스:

- mount 시 `initialActive` 각각이 `store.add`로 들어간다
- `initialMaintenance`가 null이 아니면 `store.setMaintenance`로 설정된다
- 빈 배열/null이면 호출 없음

- [ ] **Step 4: Commit**: `feat(layout): hydrate announcements via /v1/system/status and mount display`

### Task 5.3: 503 인터셉터 — 격하 검증 (코드 변경 없음)

**Files:** Verify only `src/shared/api/http/client/interceptors/response.ts`

- [ ] **Step 1**: 코드 그대로 유지 확인 — 검증만, 변경 없음
- [ ] **Step 2**: `redirectOnServiceUnavailable` 함수에 짧은 주석 추가 (선택, 격하 의도 명시)
- [ ] **Step 3 (조건부 commit — diff 없으면 skip)**: 주석 추가 시에만 commit `docs(interceptor): clarify 503 redirect is fallback-of-last-resort`

### Task 5.4: i18n 카피 추가

**Files:** Modify `src/shared/lib/localization/dictionaries/ko.json`, `en.json`

위 "i18n keys (확정)" 표의 5개 키 추가. 카피 정확히 그 표의 값.

> **Note**: `feedback_pfplay_web_i18n_drift.md` 정책에 따라 ko.json/en.json 직접 수정. xlsx는 별도 PR로 분리.

- [ ] **Step 1: ko.json 추가**

(JSON 트리에서 `system.maintenance.active.title` 등을 만들기 위해 nested 구조 — 기존 i18n.js generator의 구조 따라가야 함. 첫 task 진입 시 i18n.js generator 코드 확인 후 정확한 nested key 형식 결정.)

- [ ] **Step 2: en.json 추가**
- [ ] **Step 3: typecheck (i18n type generated 자동 갱신)**
- [ ] **Step 4: Commit**: `feat(i18n): add system-announcement copy (5 keys, ko/en)`

### Task 5.5: chunk 5 회귀 검증

- [ ] **Step 1**: `yarn test:type` PASS
- [ ] **Step 2**: `yarn lint` PASS
- [ ] **Step 3**: `yarn test` 전체 PASS

검증만, commit 없음.

---

## 마무리

모든 chunk 완료 후 `feat/admin-api-sync` 브랜치 처리 결정 (머지/PR/그대로):

- @superpowers:finishing-a-development-branch 흐름 따름

## Cross-cutting notes

- **Server-only 보호**: `get-edge-config-maintenance.ts`는 client component에서 import 금지. 본 plan에서는 별도 ESLint 규칙 도입 안 함 (YAGNI). 사용자가 향후 import 사고 발생 시 별도 follow-up.
- **i18n drift**: `ko.json`/`en.json` 직접 수정 정책. xlsx는 별도 PR.
- **테스트 환경**: vitest mock으로 `@vercel/edge-config`의 `get` mock + `vi.stubEnv('EDGE_CONFIG', ...)` 조합. setup 파일에 일괄 mock은 안 둠 — 테스트별 scope.
- **announcementId vs id**: v1은 `id: string`, v2는 `announcementId: number`. v1 dismissedIds는 sessionStorage 비저장이라 마이그레이션 이슈 없음.
- **time format 일관성**: `formatScheduledTime`은 ISO 문자열을 단순 slice. 시간대 변환 안 함 (사용자 contract 따라 BE가 보낸 그대로). 향후 timezone 표시 정책 변경 시 helper만 수정.
