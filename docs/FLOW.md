# 프로젝트 주요 데이터 흐름 (Mermaid Sequence Diagrams)

> Last Update (26.05.13)
>
> **2026-05 갱신 노트**:
>
> - 다이어그램 2(파티룸 연결/구독)에 **STOMP heartbeat 옵트인 + 커스텀 15s 간격** 반영 (2026-05-09 TECH_DEBT TD-004 정정)
> - 다이어그램 4 **시스템 공지 + 점검 가드 흐름** 신규 추가 (V14, Edge Config / `/sub/system/announcements`)
> - V16 백엔드 presence grace window는 프론트에 broadcast가 없어 다이어그램에 변동 없음 — 클라이언트는 기존 `crew_exited`만 수신

## 다이어그램 1: `StoresProvider`를 사용한 의존성 역전 및 스토어 접근 흐름

```mermaid
sequenceDiagram
    actor User
    participant Browser_App as Browser (App)
    participant SP as StoresProvider
    participant CPStore as CurrentPartyroomStore (Zustand)
    participant UIStore as UIStateStore (Zustand)
    participant Page as PartyroomPage (Component)
    participant useStoresHook as useStores (Hook)

    User->>Browser_App: App/Page Load
    Browser_App->>SP: Initialize
    SP->>CPStore: createCurrentPartyroomStore()
    SP->>UIStore: createUIStateStore()
    SP->>Browser_App: Provides Stores via Context

    Page->>useStoresHook: useStores()
    useStoresHook->>SP: Accesses Stores Context
    SP-->>useStoresHook: Returns { useCurrentPartyroom, useUIState }
    Page-->>useStoresHook: Stores access functions

    Page->>CPStore: useCurrentPartyroom(selector)
    CPStore-->>Page: Returns selected state
    Page->>UIStore: useUIState(selector)
    UIStore-->>Page: Returns selected state

    Browser_App->>User: Display UI based on Store data
```

**설명:**

1.  사용자가 앱/페이지를 로드합니다.
2.  `StoresProvider`가 초기화되면서 `CurrentPartyroomStore`와 `UIStateStore`의 Zustand 스토어 인스턴스를 생성합니다.
3.  `StoresProvider`는 이 스토어 접근 함수들을 React Context를 통해 하위 컴포넌트에 제공합니다.
4.  `PartyroomPage` (또는 다른 컴포넌트)에서 `useStores` 훅을 호출합니다.
5.  `useStores` 훅은 Context로부터 스토어 접근 함수들을 가져와 반환합니다.
6.  페이지는 반환된 함수(예: `useCurrentPartyroom`)와 셀렉터를 사용하여 스토어의 특정 상태를 구독하고 값을 가져옵니다.
7.  가져온 스토어 데이터를 기반으로 UI가 사용자에게 표시됩니다.
    - 이는 FSD에서 `shared` 레이어(`StoresProvider`, `useStores`)를 통해 `entities` 레이어(`CurrentPartyroomStore`, `UIStateStore`)의 상태를 `pages` 또는 `widgets` 레이어에서 사용하는 의존성 역전의 예시입니다.

## 다이어그램 2: `Partyroom` 연결/구독 및 해제/구독 해제 흐름

```mermaid
sequenceDiagram
    actor User
    participant Layout as PartyroomLayout
    participant PCP as PartyroomConnectionProvider
    participant PClient as PartyroomClient (Entity)
    participant WSServer as WebSocket Server
    participant EnterHook as useEnterPartyroom (Feature Hook)
    participant ExitHook as useExitPartyroom (Feature Hook)
    participant CPStore as CurrentPartyroomStore
    participant APIServer as Partyroom API Server

    %% Initial Connection (App Load)
    PCP->>PClient: 사용자 인증 확인 및 웹소켓 연결 시도
    alt User Authenticated
        PClient->>WSServer: WebSocket Connect Request<br/>(STOMP heartbeat 옵트인, 커스텀 15s/30s)
        WSServer-->>PClient: Connected
        PClient-->>PCP: Connected
    else User Not Authenticated
        PCP->>PClient: (No connect call)
    end
    Note over PClient,WSServer: heartbeat은 명시적 옵트인 시에만 활성<br/>(클라 15s outgoing / 서버 30s incoming 기대) — TECH_DEBT TD-004 참조

    %% Partyroom Entry (User navigates to /parties/(room)/[id])
    User->>Layout: Navigate to Partyroom Page (e.g., /parties/(room)/123)
    Layout->>EnterHook: enter(partyroomId)

    EnterHook->>PClient: onConnect(callback, {once: true})
    alt WebSocket Already Connected
        PClient-->>EnterHook: Immediately invoke callback
    else WebSocket Connecting/Reconnecting
        PClient-->>EnterHook: (Waits for connection, then invokes callback)
    end

    activate EnterHook
    EnterHook->>APIServer: 파티룸 입장 및 정보 로드 (enter, setup-info, notice)
    APIServer-->>EnterHook: Partyroom Data

    EnterHook->>CPStore: initPartyroom(Partyroom Data)

    EnterHook->>PClient: subscribeToPartyroomEvents("/sub/partyrooms/123")
    PClient->>WSServer: STOMP SUBSCRIBE
    WSServer-->>PClient: Subscription Confirmed
    deactivate EnterHook

    WSServer->>PClient: WebSocket Message (e.g., new chat)
    PClient->>CPStore: handlePartyroomEvent(message)
    CPStore->>Layout: (Reactively) Update UI

    %% Partyroom Exit (User leaves page or closes tab)
    User->>Layout: Navigate away / Close tab
    Layout->>ExitHook: exit()
    activate ExitHook
    alt Not exited on backend yet
        ExitHook->>APIServer: POST /partyrooms/{partyroomId}/exit
        APIServer-->>ExitHook: (Success)
    end

    ExitHook->>PClient: unsubscribeFromPartyroomEvents()
    PClient->>WSServer: STOMP UNSUBSCRIBE
    WSServer-->>PClient: (Unsubscription Confirmed)

    ExitHook->>CPStore: resetPartyroomStore()
    deactivate ExitHook

    alt User closes tab (WebSocket connection drops)
        PClient->>WSServer: WebSocket Disconnected
        PClient->>PClient: Handle disconnect (unsubscribe all, cleanup)
    end
```

**설명:**

1.  **초기 연결:**
    - `PartyroomConnectionProvider` (PCP)가 사용자 인증 상태를 확인하고, 인증된 경우 `PartyroomClient`를 통해 웹소켓 연결을 시도합니다.
2.  **파티룸 입장:**
    - 사용자가 파티룸 페이지로 이동하면 `PartyroomLayout`이 `useEnterPartyroom` 훅의 `enter` 함수를 호출합니다.
    - `enter` 함수는 웹소켓 연결을 확인 후, API 서버에서 파티룸 입장 처리 및 필요한 데이터(설정 정보, 공지 등)를 가져와 `CurrentPartyroomStore`를 초기화합니다.
    - 이후 `PartyroomClient`를 통해 해당 파티룸의 실시간 이벤트 구독을 시작합니다.
    - 웹소켓 서버로부터 이벤트 메시지가 수신되면 `PartyroomClient`가 이를 처리하여 `CurrentPartyroomStore`를 업데이트하고, UI가 이에 반응하여 변경됩니다.
3.  **파티룸 퇴장:**
    - 사용자가 페이지를 벗어나면 `PartyroomLayout`이 `useExitPartyroom` 훅의 `exit` 함수를 호출합니다.
    - `exit` 함수는 필요한 경우 API 서버에 퇴장을 알리고, `PartyroomClient`를 통해 이벤트 구독을 해제하며, `CurrentPartyroomStore`를 초기 상태로 리셋합니다.
    - 브라우저 탭 종료 등으로 웹소켓 연결이 직접 끊어지는 경우, `PartyroomClient`가 이를 감지하여 모든 구독을 해제하고 정리 작업을 수행합니다.

## 다이어그램 3: 일반적인 데이터 조회 흐름 (예: 파티룸 상세 정보)

```mermaid
sequenceDiagram
    actor User
    participant Page as PartyroomPage (Component)
    participant FetchHook as useFetchPartyroomDetailSummary (Feature Hook)
    participant RQP as ReactQueryProvider
    participant APIService as partyroomsService (Shared API)
    participant BackendServer as API Server (Backend)

    User->>Page: View Partyroom Details
    Page->>FetchHook: useFetchPartyroomDetailSummary(partyroomId)
    activate FetchHook
    FetchHook->>RQP: useQuery(['partyroomDetailSummary', partyroomId], queryFn)
    alt Cache Miss / Stale Data
        RQP->>FetchHook: (Invoke queryFn)
        FetchHook->>APIService: getDetailSummary({ partyroomId })
        APIService->>BackendServer: GET /partyrooms/{partyroomId}/summary
        BackendServer-->>APIService: PartyroomSummary Data
        APIService-->>FetchHook: PartyroomSummary Data
        FetchHook->>RQP: (Return data to React Query)
        RQP->>RQP: Cache data
        RQP-->>FetchHook: Returns { data, isLoading, error, ... }
    else Cache Hit & Fresh Data
        RQP-->>FetchHook: Returns { data (from cache), isLoading, ... }
    end
    FetchHook-->>Page: { data: partyroomSummary, isLoading, ... }
    deactivate FetchHook

    Page->>Page: Render UI with partyroomSummary data
    Page->>User: Display Partyroom Details
```

**설명:**

1.  사용자가 파티룸 상세 정보를 보려고 합니다 (페이지 로드 또는 특정 액션).
2.  `PartyroomPage` 컴포넌트는 `useFetchPartyroomDetailSummary` 훅을 호출합니다.
3.  이 훅은 내부적으로 React Query (`useQuery`)를 사용하여 데이터를 요청합니다.
4.  React Query는 캐시를 확인합니다.
    - **캐시 미스 또는 데이터가 오래된 경우:** React Query는 제공된 `queryFn` (여기서는 `partyroomsService.getDetailSummary`)을 실행하여 백엔드 API 서버로부터 데이터를 가져옵니다. 가져온 데이터는 캐시되고 훅으로 반환됩니다.
    - **캐시 히트 및 데이터가 최신인 경우:** React Query는 캐시된 데이터를 즉시 반환합니다.
5.  훅은 데이터, 로딩 상태 등을 페이지 컴포넌트에 반환합니다.
6.  페이지 컴포넌트는 이 데이터를 사용하여 UI를 렌더링하고 사용자에게 보여줍니다.
    - 이는 FSD에서 `features` 레이어의 훅이 `shared/api`를 사용하여 데이터를 가져오고, 이 데이터를 `pages` 또는 `widgets` 레이어에서 소비하는 일반적인 흐름입니다. `ReactQueryProvider`는 `app` 레이어에 위치하여 전역적으로 캐싱 및 상태 관리를 지원합니다.

## 다이어그램 4: 시스템 공지 + 점검 가드 흐름 (V14)

```mermaid
sequenceDiagram
    actor User
    participant Edge as middleware.ts (edge runtime)
    participant EdgeConfig as Vercel Edge Config<br/>(system-status)
    participant Page as Page (Next.js)
    participant SAFeature as features/system-announcement
    participant PClient as PartyroomClient (STOMP)
    participant WSServer as WebSocket Server
    participant Backend as pfplay-platform

    %% Maintenance gate (every request)
    User->>Edge: 모든 라우트 요청
    Edge->>EdgeConfig: getEdgeConfigMaintenance()
    alt phase === 'ACTIVE'
        EdgeConfig-->>Edge: { phase: 'ACTIVE', messageKo/En, endAt }
        Edge->>Page: rewrite → /maintenance (URL 유지)
        Page-->>User: 점검 페이지 표시
    else phase !== 'ACTIVE'
        EdgeConfig-->>Edge: null / INACTIVE
        Edge->>Page: 원래 라우트 그대로 진행
        Page-->>User: 정상 페이지
    end

    %% System announcement broadcast (active session)
    Note over SAFeature,WSServer: 일반 페이지 진입 후 (인증 세션 보유)
    SAFeature->>PClient: subscribe('/sub/system/announcements')
    PClient->>WSServer: STOMP SUBSCRIBE
    Backend->>WSServer: AnnouncementBroadcaster.broadcast(<br/>ANNOUNCEMENT_PUBLISHED / CANCELLED / MAINTENANCE_STARTED)
    WSServer->>PClient: 메시지 수신
    PClient->>SAFeature: handleSystemAnnouncement(payload)
    SAFeature->>SAFeature: 토스트/배너 표시 + store 업데이트
    SAFeature-->>User: 공지 UI 노출

    %% Maintenance window자체 시작 시점
    Note over Backend,EdgeConfig: MaintenanceSchedulerService(1분 cron)가<br/>scheduled_start_at 도달 시:
    Backend->>WSServer: broadcast MAINTENANCE_STARTED
    Backend->>EdgeConfig: VercelEdgeConfigAdapter로<br/>system-status.phase = 'ACTIVE' 반영
    Note over Edge: 다음 요청부터 maintenance gate 적용
```

**설명:**

1.  **점검 가드(매 요청)**: `middleware.ts`(edge runtime)가 모든 라우트 진입 시 Vercel Edge Config의 `system-status`를 동기 조회합니다. `phase === 'ACTIVE'`면 URL은 유지한 채 컨텐츠만 `/maintenance`로 rewrite하여 백엔드 왕복 없이 즉시 차단합니다.
2.  **공지 실시간 수신**: 점검이 아닌 일반 세션에서 `features/system-announcement`가 STOMP의 `/sub/system/announcements` 채널을 구독합니다. 백엔드 `AnnouncementBroadcaster`가 `ANNOUNCEMENT_PUBLISHED` / `ANNOUNCEMENT_CANCELLED` / `MAINTENANCE_STARTED` 이벤트를 발행하면 토스트/배너로 노출됩니다.
3.  **점검 시작 자동 트리거**: 백엔드 `MaintenanceSchedulerService`(1분 cron)가 `scheduled_start_at`을 넘어서면 `MAINTENANCE_STARTED`를 broadcast하고 Edge Config의 `phase`를 `ACTIVE`로 갱신합니다. 두 경로(WS broadcast + Edge Config) 모두 작동하므로, 이미 페이지에 머문 사용자는 즉시 UI 알림을 받고, 새로 진입하는 사용자는 middleware 가드로 점검 페이지를 본다.
4.  관련 ADR / 문서: pfplay-platform ADR-007(시스템 공지 아키텍처), `docs/asyncapi/asyncapi.yml`의 `systemAnnouncementBroadcast` 채널.
