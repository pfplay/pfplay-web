# 시스템 공지사항 (V2 — Revised) 설계

> **Note**: 본 문서는 [2026-04-19 v1 설계](./2026-04-19-system-announcement-design.md)를 대체한다. v1 구현은 머지 완료 상태이며 본 문서는 그 위에 신 스펙(타입 3종 + Edge Config + 다중 표시)을 반영하기 위한 갱신본이다.

## 목표

서비스 운영 중 (a) 사전 예고된 점검, (b) 일반 이벤트 공지, (c) 긴급 공지를 다국어로 전달하고, 점검 진입 시 사용자 세션을 즉시 차단하는 흐름을 백엔드와 합의된 contract 위에서 구축한다.

## 범위

### 포함 (In)

- WebSocket 토픽 `/topic/system/announcements` 구독, 3종 이벤트 (`ANNOUNCEMENT_PUBLISHED`/`MAINTENANCE_STARTED`/`ANNOUNCEMENT_CANCELLED`) 처리
- 부팅 시점 점검 모드 인지 — Vercel Edge Config 우선, REST `/v1/system/status` fallback, 503 인터셉터 fallback의 fallback
- UI: 점검 ACTIVE overlay / 점검 PLANNED banner / EVENT toast / EMERGENCY persistent banner — 동시 다수 표시 가능
- i18n: 한/영 분리 컬럼 (`titleKo`/`titleEn`/`messageKo`/`messageEn`) → user locale 기준 분기 표시
- 기존 v1 머지 코드 마이그레이션: types/store/subscription/UI 재작성, `/maintenance` 페이지 재활용

### 제외 (Out)

- 어드민 공지 작성 UI (pfplay-admin 측 별도 작업)
- 사용자 inbox/보관함 (스펙상 ws 미수신 공지는 catch up 안 함, 부팅 시 Edge Config + REST로만 회복)
- 공지 modify (POST/DELETE만, 잘못 발사하면 DELETE → 재발사)
- 점검 자동 종료 (admin 명시 DELETE 필요)

## 컨텍스트 — 기존 머지 코드와의 차이

| 항목                     | v1 (머지 완료)                               | v2 (본 설계)                                             |
| ------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `SystemAnnouncementType` | `'MAINTENANCE'` 1종                          | `'MAINTENANCE_NOTICE'` / `'EVENT'` / `'EMERGENCY'`       |
| `severity`               | 없음                                         | `'INFO'` / `'WARN'` / `'CRITICAL'`                       |
| 언어                     | 단일 (`title`/`content`)                     | 분리 (`titleKo`/`titleEn`/`messageKo`/`messageEn`)       |
| 시간 필드                | `scheduledAt?`                               | `scheduledStartAt`/`scheduledEndAt`/`expiresAt`/`sentAt` |
| WS 토픽                  | `/sub/system/announcements` (TODO 표시)      | `/topic/system/announcements` (확정)                     |
| WS 이벤트                | 단일 payload                                 | 3종 분기 (`PUBLISHED`/`MAINTENANCE_STARTED`/`CANCELLED`) |
| 표시                     | 단일 모달                                    | overlay/banner/toast 4종 분기, 동시 다수                 |
| store                    | `currentAnnouncement` 1개                    | `announcements: Map<id, ...>` 다수 active                |
| 부팅 인지                | 503 axios 인터셉터 → `/maintenance` redirect | Edge Config → REST fallback → (인터셉터 격하)            |

## 결정사항

| 항목                     | 결정                                                                                                        | 이유                                                                                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Edge Config 호출 위치    | `src/middleware.ts` (server-only)                                                                           | 모든 페이지 진입 전 1회 평가, client bundle에 토큰 노출 위험 0                                                                               |
| Edge Config schema       | `{ phase: 'PLANNED'\|'ACTIVE', startAt, endAt, messageKo, messageEn }` 또는 `null`                          | 사용자 contract 그대로                                                                                                                       |
| Edge Config 실패 시      | `/v1/system/status` REST 호출 (Cache-Control: public, max-age=10)                                           | contract 그대로                                                                                                                              |
| REST도 실패 시           | 통과 (사용자에게 점검 화면 안 띄움)                                                                         | 가용성 우선 — 인지 못 하면 ws 도착 시점에 보정                                                                                               |
| REST 호출 위치           | root layout server component (`src/app/layout.tsx`)                                                         | middleware는 latency 민감 — Edge Config만 짧게 처리. REST `/v1/system/status`는 layout에서 1회, active announcements hydration까지 함께 수행 |
| 503 인터셉터             | **유지 (격하)** — Edge Config/REST 둘 다 놓친 경우의 마지막 안전망. 동작은 그대로 (`/maintenance` redirect) | 제거 시 fallback 깊이 부족                                                                                                                   |
| WS 구독 위치             | 기존 `useSystemAnnouncementSubscription` 갱신 — root layout에서 마운트                                      | v1 흐름 재활용, 별도 SocketClient 유지 (TODO 주석은 그대로)                                                                                  |
| 다중 표시 store          | `Map<announcementId, AnnouncementSnapshot>` + dismissedIds                                                  | overlay/banner/toast가 동시에 떠야 함                                                                                                        |
| toast 자동 dismiss       | EVENT 타입은 `expiresAt`까지 또는 사용자 close, EMERGENCY는 persistent                                      | 사용자 contract                                                                                                                              |
| dismiss 영속성           | 메모리 (세션 단위). 재로그인/새로고침 시 다시 표시                                                          | 사용자 contract — inbox 없음, 부팅 시 active 다시 그림                                                                                       |
| `/maintenance` 페이지    | v1 코드 그대로 재활용. 다만 메시지를 props/query로 받도록 수정 (Edge Config의 `messageKo`/`messageEn` 표시) | DRY                                                                                                                                          |
| `expiresAt` 도달 시 처리 | `EventToast`/`EmergencyBanner` 모두 `cancel(announcementId)` 호출 (사용자 행위인 `dismiss`와 구분)          | 시스템 만료(시간 초과)와 사용자 dismiss는 의미가 다르므로 store 메서드도 분리. dismiss는 dismissedIds에 영구 기록되어 재발사 시 표시 안 됨   |
| 사용자 locale 결정       | 기존 i18n context (`useI18n`)                                                                               | 신규 도입 없음                                                                                                                               |

## 데이터 contracts

### Vercel Edge Config

키: `maintenance` (snake_case 아님 — 사용자 contract)

```ts
type Maintenance = {
  phase: 'PLANNED' | 'ACTIVE';
  startAt: string; // ISO 8601
  endAt: string; // ISO 8601
  messageKo: string;
  messageEn: string;
} | null;
```

### REST: `GET /api/v1/system/status` (인증 불필요, Cache-Control: public, max-age=10)

```ts
type SystemStatusResponse = {
  result: {
    maintenance: null | {
      phase: 'ACTIVE';
      startAt: string;
      endAt: string;
      messageKo: string;
      messageEn: string;
    };
    activeAnnouncements: AnnouncementSnapshot[];
    plannedMaintenance: Array<{
      phase: 'PLANNED';
      startAt: string;
      endAt: string;
      messageKo: string;
      messageEn: string;
    }>;
  };
};
```

### WebSocket 토픽 `/topic/system/announcements`

```ts
type AnnouncementSnapshot = {
  announcementId: number;
  type: 'MAINTENANCE_NOTICE' | 'EVENT' | 'EMERGENCY';
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  titleKo: string;
  titleEn: string;
  messageKo: string;
  messageEn: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  expiresAt: string | null;
  sentAt: string;
};

type AnnouncementPublishedEvent = AnnouncementSnapshot & {
  eventType: 'ANNOUNCEMENT_PUBLISHED';
};

type MaintenanceStartedEvent = AnnouncementSnapshot & {
  eventType: 'MAINTENANCE_STARTED';
  type: 'MAINTENANCE_NOTICE';
  scheduledStartAt: string;
  scheduledEndAt: string;
};

type AnnouncementCancelledEvent = {
  eventType: 'ANNOUNCEMENT_CANCELLED';
  announcementId: number;
  cancelledAt: string;
};

type SystemAnnouncementEvent =
  | AnnouncementPublishedEvent
  | MaintenanceStartedEvent
  | AnnouncementCancelledEvent;
```

## UI 책임 매트릭스

| 상태                 | 트리거                                                                 | 컴포넌트                                            | dismiss                                                     |
| -------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------- |
| 점검 ACTIVE          | Edge Config `phase='ACTIVE'` 또는 `MAINTENANCE_STARTED` ws 이벤트      | `MaintenanceOverlay` (전체 화면 가림 + 재시도 버튼) | 사용자 재시도 클릭 → reload                                 |
| 점검 PLANNED         | Edge Config `phase='PLANNED'` 또는 type=`MAINTENANCE_NOTICE` published | `MaintenancePlannedBanner` (상단, dismissable)      | 사용자 X 또는 cancel 이벤트                                 |
| EVENT (INFO/WARN)    | `ANNOUNCEMENT_PUBLISHED` & type=`EVENT`                                | `EventToast` (우상단)                               | 자동 dismiss (`expiresAt` 또는 일정 시간) 또는 사용자 close |
| EMERGENCY (CRITICAL) | `ANNOUNCEMENT_PUBLISHED` & type=`EMERGENCY`                            | `EmergencyBanner` (상단 persistent)                 | `expiresAt` 도달 또는 cancel 이벤트                         |
| 모든 dismiss/cancel  | `ANNOUNCEMENT_CANCELLED` 이벤트                                        | 해당 `announcementId`의 모든 표시 즉시 제거         | —                                                           |

i18n 표시: `useI18n()` 컨텍스트 locale에 따라 `titleKo`/`titleEn`, `messageKo`/`messageEn` 중 택일.

## 기존 코드 마이그레이션 정책

| 파일                                                                                   | 액션                                                                                               |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/features/system-announcement/model/system-announcement.types.ts`                  | 신 contract로 **재작성**                                                                           |
| `src/features/system-announcement/model/system-announcement.store.ts`                  | 다수 표시 지원 (Map 기반)으로 **재작성**                                                           |
| `src/features/system-announcement/lib/use-system-announcement-subscription.ts`         | 토픽 + 3 event types로 **갱신**                                                                    |
| `src/features/system-announcement/ui/system-announcement-modal.tsx`                    | **삭제** — 신 UI 4종으로 분리                                                                      |
| `src/features/system-announcement/ui/system-announcement-subscriber.tsx`               | 그대로 (구독 hook만 호출)                                                                          |
| `src/features/system-announcement/ui/maintenance-overlay.tsx`                          | **신규**                                                                                           |
| `src/features/system-announcement/ui/maintenance-planned-banner.tsx`                   | **신규**                                                                                           |
| `src/features/system-announcement/ui/event-toast.tsx`                                  | **신규**                                                                                           |
| `src/features/system-announcement/ui/emergency-banner.tsx`                             | **신규**                                                                                           |
| `src/features/system-announcement/ui/system-announcement-display.tsx`                  | **신규** — 4종 컴포넌트를 store 상태에 따라 mount하는 dispatcher                                   |
| `src/app/maintenance/page.tsx`                                                         | 메시지 props/query로 받도록 **수정**                                                               |
| `src/app/maintenance/refresh-button.tsx`                                               | 그대로                                                                                             |
| `src/app/layout.tsx`                                                                   | `<SystemAnnouncementSubscriber />` + `<SystemAnnouncementDisplay />` 마운트 (기존 modal 자리 교체) |
| `src/middleware.ts`                                                                    | **신규** — Edge Config 조회, ACTIVE면 `/maintenance` rewrite                                       |
| `src/shared/api/system-status/index.ts`                                                | **신규** — REST `/v1/system/status` 클라이언트 + types                                             |
| `src/shared/api/http/client/interceptors/response.ts` (`redirectOnServiceUnavailable`) | 그대로 유지 (격하 — fallback의 fallback)                                                           |

## Vercel Edge Config 운영 정책

- Vercel Dashboard → Storage → Create Edge Config → 이름 `pfplay-maintenance`
- Projects 탭 → Connect Project → pfplay-web 선택, 모든 환경 (Production/Preview/Development)
- 결과: `EDGE_CONFIG` 환경변수가 자동 주입됨 (수동 secret 추가 0)
- **금지: `NEXT_PUBLIC_*` 접두사** — Edge Config 토큰이 client bundle에 노출되면 안 됨
- 사용 위치: `middleware.ts`, server component, route handler만

## 검증

- `yarn test` — 단위 테스트 (store/subscription/UI 컴포넌트 4종, types 등)
- `yarn test:type` — TypeScript 타입 체크
- `yarn lint`
- 수기 — Edge Config 실제 토글 후 부팅 시 overlay 노출 확인 (운영자 작업)
- 수기 — BE staging의 `/topic/system/announcements`에 mock event 발행 후 client UI 분기 확인

## 범위 외 (YAGNI)

- 사용자 inbox/공지 보관함
- 공지 modify (수정)
- 점검 자동 종료
- 어드민 측 발사/이력/취소 UI (pfplay-admin 별도 작업)
- 공지 read receipt
- 점검 카운트다운 타이머 표시
