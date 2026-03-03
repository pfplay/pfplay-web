# Technical Debt Registry

> 코드 품질·유지보수성 관점에서 개선이 필요한 항목을 추적한다.
> 각 항목은 방향이 명확하여 ADR 없이 바로 실행 가능한 것들이다.

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

### TD-002: WebSocket 타입 백엔드 미검증

- **파일**: `src/shared/api/websocket/types/partyroom.ts`
  - `:81` — `// TODO: 임의로 작성. 실제 타입 확인 필요` (PlaybackSkipEvent)
  - `:143` — `// FIXME: 맘대로 작성함. api 측과 enum 일치할지 확인 필요` (PARTYROOM_CLOSE)
- **현상**: 프론트엔드가 임의로 정의한 타입이 백엔드와 불일치할 수 있음
- **개선 방향**: 백엔드 API 스펙과 대조 후 타입 확정

### TD-003: 에러 객체 직접 변이 (mutation)

- **파일**: `src/shared/api/http/client/interceptors/response.ts:53`
- **현상**: `e.response.data = e.response.data.data` — AxiosError 객체를 직접 변이
- **개선 방향**: WeakMap 등으로 원본 에러 객체를 보존하면서 unwrap된 데이터를 별도로 관리
- **참고**: ADR-005

---

## P1 — High

### TD-004: STOMP 하트비트 커스텀 구현 → 내장 기능 전환

- **파일**: `src/shared/api/websocket/client.ts:158-183`
- **현상**: GCP 60초 타임아웃 우회를 위해 4초 간격 커스텀 heartbeat(`/pub/heartbeat`)를 `setInterval`로 구현. STOMP 프로토콜 내장 heartbeat를 사용하지 않음
- **개선 방향**: STOMP built-in heartbeat로 마이그레이션 (Slack 논의 참조)
- **참고**: 코드 내 주석에 마이그레이션 계획 기재됨

### TD-005: TODO/FIXME 41개 미해결

- **현상**: `src/` 전체에 41개의 TODO/FIXME가 32개 파일에 분포
- **주요 파일**:
  - `src/shared/api/websocket/types/partyroom.ts` — 타입 검증 2건
  - `src/shared/api/http/types/@enums.ts` — enum 스크립트 2건
  - `src/entities/partyroom-client/lib/subscription-callbacks/` — 구현 누락 1건
  - `src/entities/current-partyroom/model/` — 상태 관리 1건
- **개선 방향**: 각 TODO를 GitHub Issue로 전환하여 추적하거나, 해결 후 제거

### TD-006: `@enums.ts` 자동 생성 스크립트 미작동

- **파일**: `src/shared/api/http/types/@enums.ts`
  - `:45` — `// FIXME: enum auto generation 스크립트 수정 필요`
  - `:55` — `// TODO: 현재 스크립트가 숫자 잡아내지 못해서 수동 수정. 스크립트 수정 필요`
- **현상**: enum 자동 생성 스크립트가 숫자형 enum을 처리하지 못하여 수동 관리 중
- **개선 방향**: 스크립트 수정 또는 OpenAPI codegen 도입

### TD-007: `usePlaybackSkipCallback` 빈 구현

- **파일**: `src/entities/partyroom-client/lib/subscription-callbacks/use-playback-skip-callback.hook.ts:3-6`
- **현상**: 콜백 함수가 `// TODO: implementation`만 있고 빈 상태
- **개선 방향**: 재생 스킵 이벤트 수신 시 UI 상태 반영 로직 구현

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
