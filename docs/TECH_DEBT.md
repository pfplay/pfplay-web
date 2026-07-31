# Technical Debt Registry

> 코드 품질·유지보수성 관점에서 개선이 필요한 항목을 추적한다.
> 각 항목은 방향이 명확하여 ADR 없이 바로 실행 가능한 것들이다.
>
> **최종 실사: 2026-07-31** — 전 항목을 코드에서 재확인했다. 해소된 항목은 맨 아래
> [해소된 항목](#해소된-항목) 으로 옮겼다.
>
> **사용자 영향이 있는 결함은 여기가 아니라 GitHub 이슈**로 간다. 이 문서는 "동작은 하지만
> 구조가 나쁜 것" 만 다룬다. 현재 열린 사용자 영향 결함은
> [열린 결함 이슈](#열린-결함-이슈-이-문서-범위-밖) 참조.

---

## 우선순위 범례

| 등급          | 의미                                |
| ------------- | ----------------------------------- |
| P0 — Critical | 프로덕션 안정성·보안에 직접 영향    |
| P1 — High     | 개발 생산성·코드 품질에 상당한 영향 |
| P2 — Medium   | 개선하면 좋지만 당장 문제는 아님    |

---

## P0 — Critical

### TD-001: WebSocket 재연결에 지수 백오프 없음

- **파일**: `src/shared/api/websocket/client.ts:55`
- **현상**: `reconnectDelay: 5000` 고정값 사용. 서버 장애 시 모든 클라이언트가 동시에 5초 간격으로 재연결을 시도하여 thundering herd 문제 발생 가능
- **개선 방향**: 지수 백오프 + jitter + 최대 재시도 횟수 적용
- **참고**: ADR-002

### TD-003: 에러 객체 직접 변이 (mutation)

- **파일**: `src/shared/api/http/client/interceptors/response.ts:53`
- **현상**: `e.response.data = e.response.data.data` — AxiosError 객체를 직접 변이
- **개선 방향**: WeakMap 등으로 원본 에러 객체를 보존하면서 unwrap된 데이터를 별도로 관리
- **참고**: ADR-005

---

## P1 — High

### TD-013: Avatars 컴포넌트 불필요 리렌더 (pick + shallow 비교 부재)

- **파일**: `src/widgets/partyroom-avatars/ui/avatars.component.tsx:15`
- **관련**: `src/shared/lib/functions/pick.ts`, `src/widgets/partyroom-avatars/lib/use-avatar-cluster.hook.ts:346-349`, `src/entities/avatar/ui/useAvatarDance.hook.ts:22`
- **현상**: `pick()` 셀렉터가 매번 새 객체를 반환하고 `shallow` 비교가 없어서, 채팅/공지/재생 등 무관한 상태 변경에도 Avatars 전체가 리렌더됨. 연쇄적으로 O(n) 재계산 + Avatar 자식 리렌더 유발
- **개선 방향**: `useShallow` 적용, `useAvatarCluster` 반환값 useMemo, `registerAvatar` useCallback, `djQueueCrewIds` useMemo
- **2026-07-31 확인**: 유효. `avatars.component.tsx:34` 가 여전히 `pick(state, [...])` 를 쓰고,
  `src/` 전체에 `useShallow` 사용처가 **0건**이다.
  (기존에 링크돼 있던 `AVATARS_RENDER_PERFORMANCE.md` 는 레포에 존재하지 않아 링크를 제거했다.)

### TD-004: STOMP 하트비트 — 두 heartbeat 책임 분리 영구화

- **파일**: `src/shared/api/websocket/client.ts:158-187`
- **현상**: GCP 30초 타임아웃 우회를 위해 15초 간격 커스텀 heartbeat(`/pub/heartbeat`)를 `setInterval`로 구현. 별도로 STOMP 내장 heartbeat(`heartbeatIncoming/Outgoing`)도 활성화하여 silent disconnect 감지에 사용
- **개선 방향**: STOMP built-in heartbeat을 LB keep-alive와 별개의 disconnect 감지(presence) 책임으로 추가 활성화. 기존 커스텀 heartbeat은 LB keep-alive 책임자로 영구 유지. 두 heartbeat 영구 공존
- **참고**: backend spec `pfplay-platform/docs/superpowers/specs/2026-05-09-presence-grace-window-design.md` § STOMP heartbeat resolved

### TD-005: TODO/FIXME 잔존

- **현상 (2026-07-31 실측)**: `src/` 전체에 **33건 / 29개 파일** (2026-05 시점 41건 / 32파일에서 감소)
- **남은 주요 지점**:
  - `src/shared/api/http/types/@enums.ts` — enum 생성 스크립트 한계 2건 (TD-006)
  - 나머지는 산발적. 파일당 1건 수준
- **개선 방향**: 사용자 영향이 있는 것은 GitHub Issue 로 승격, 나머지는 해당 코드를 만질 때 정리

### TD-006: `@enums.ts` 자동 생성 스크립트 미작동

- **파일**: `src/shared/api/http/types/@enums.ts`
  - `:45` — `// FIXME: enum auto generation 스크립트 수정 필요`
  - `:55` — `// TODO: 현재 스크립트가 숫자 잡아내지 못해서 수동 수정. 스크립트 수정 필요`
- **현상**: enum 자동 생성 스크립트가 숫자형 enum을 처리하지 못하여 수동 관리 중
- **개선 방향**: 스크립트 수정 또는 OpenAPI codegen 도입

---

## P2 — Medium

### TD-008: Wallet Provider가 FCP를 차단

- **파일**: `src/app/_providers/wallet.provider.tsx:10-17`
- **현상**: SSR 하이드레이션 불일치 방지를 위해 `mounted` 상태가 `true`가 될 때까지 children을 렌더링하지 않음. 지갑 기능이 필요 없는 페이지까지 FCP가 지연됨
- **개선 방향**: 지갑 기능이 필요한 페이지에서만 Provider를 렌더링하거나, `dynamic(() => import(...), { ssr: false })` 적용
- **참고**: ADR-008

### TD-009: `useStores` 2단계 셀렉터 보일러플레이트

- **파일**: `src/entities/current-partyroom/lib/use-chat.hook.ts:11-12` 외 다수
- **현상**: 매번 `const { useX } = useStores(); const value = useX(state => state.field);` 두 단계 필요
- **개선 방향**: 커스텀 훅으로 1단계 접근 패턴 제공 (예: `useCurrentPartyroomField('chat')`)
- **참고**: ADR-001

### TD-010: `index.ui.ts` ESLint 경계 미강제

- **파일**: `src/shared/ui/index.ui.ts`, 각 feature/entity의 `index.ui.ts`
- **현상**: `index.ui.ts`에서만 `'use client'` 컴포넌트를 export하는 컨벤션이 있지만, ESLint 룰로 강제되지 않아 실수로 `index.ts`에서 CSR 컴포넌트를 export할 수 있음
- **개선 방향**: 커스텀 ESLint 룰 또는 `eslint-plugin-boundaries` 설정으로 강제
- **참고**: ADR-003, ADR-011

### TD-011: 이벤트 핸들러 매핑 타입 미강제

- **파일**: `src/entities/partyroom-client/lib/partyroom-client.ts`
- **현상**: WebSocket 구독 대상과 콜백 훅의 매핑이 수동으로 관리됨. 새 이벤트 추가 시 매핑 누락 가능
- **개선 방향**: 타입 레벨에서 모든 구독 대상에 대응하는 핸들러가 존재하는지 강제
- **참고**: ADR-002

### TD-012: API 버전 관리 부재

- **파일**: `src/shared/api/http/client/client.ts:12-17`
- **현상**: API 호출에 버전 정보 없음. `baseURL`이 호스트명만 포함하며 `/v1/` 등의 prefix가 없음
- **개선 방향**: 백엔드와 협의하여 URL prefix 또는 헤더 기반 버전 관리 도입

---

## 열린 결함 이슈 (이 문서 범위 밖)

사용자에게 보이는 결함은 부채가 아니라 **이슈**로 추적한다. 현재 열려 있는 것들:

| 이슈 | 요약 |
|---|---|
| [#403](https://github.com/pfplay/pfplay-web/issues/403) | stale playback 가드 부재 — `getInitialSeek` 에 상한 방어가 없어, 서버가 유령 재생 상태면 끝난 트랙이 라이브로 재생됨 |
| [#299](https://github.com/pfplay/pfplay-web/issues/299) | 점검 자동완료 시 `MAINTENANCE_ENDED` WS 이벤트 미처리 → in-memory 오버레이 잔존 |
| [#304](https://github.com/pfplay/pfplay-web/issues/304) | 하드 unload 시 `partyroom_exited` 텔레메트리 누락 (sendBeacon 또는 서버측 발행 필요) |
| [#443](https://github.com/pfplay/pfplay-web/issues/443) | e2e `closeDjQueueDrawer` 헬퍼 플래키 — force 클릭이 드로어를 못 닫음 |
| [#404](https://github.com/pfplay/pfplay-web/issues/404) | PWA — 설치·푸시 구현은 배포됨. 잔여는 운영 측 VAPID 주입 + 라이브 스모크 |

---

## 해소된 항목

기록 보존용. 되살아나면 새 번호로 다시 등록한다.

| # | 항목 | 해소 근거 (2026-07-31 확인) |
|---|---|---|
| TD-002 | WebSocket 타입 백엔드 미검증 | `src/shared/api/websocket/types/partyroom.ts` 에 TODO/FIXME 0건. 타입이 확정됨 |
| TD-007 | `usePlaybackSkipCallback` 빈 구현 | 해당 파일이 제거됨. 스킵은 `use-playback-start-callback` / `use-playback-deactivated-callback` + 재생 종료 요약(`emit-playback-summary`) 경로로 처리 |
