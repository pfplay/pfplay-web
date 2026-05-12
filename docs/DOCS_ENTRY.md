# 프로젝트 문서 목록

> Last Update (26.05.13)

## root

### 진입점

- [README.md](../README.md) — 프로젝트 개요·셋업·도메인·아키텍처·운영 정책. 처음 합류했다면 여기부터.

### docs (개발 가이드)

- [docs/CONTRIBUTING.md](./CONTRIBUTING.md) — 기여 방법, 브랜치 전략, PR 규칙, 코드 스타일
- [docs/CI_CD.md](./CI_CD.md) — GitHub Actions 4종 + Vercel native git integration. 트리거 조건, 환경 변수
- [docs/FLOW.md](./FLOW.md) — 핵심 흐름 다이어그램 (로그인, 파티룸 진입, STOMP 구독, 시스템 공지)
- [docs/REACT_QUERY.md](./REACT_QUERY.md) — TanStack Query 사용 가이드 (staleTime, retry, RSC prefetch)
- [docs/TESTING.md](./TESTING.md) — Vitest + RTL + MSW 가이드 (Jest 아님)
- [docs/E2E_POLICY.md](./E2E_POLICY.md) — Playwright e2e 시나리오 선정 정책
- [docs/TECH_DEBT.md](./TECH_DEBT.md) — 알려진 기술 부채 모음 (TD-001~)
- [docs/AVATARS_RENDER_PERFORMANCE.md](./AVATARS_RENDER_PERFORMANCE.md) — 아바타 컴포넌트 렌더 성능 분석 + 개선안

### docs (계측/이벤트)

- [docs/2026-04-04-event-taxonomy-design.md](./2026-04-04-event-taxonomy-design.md) — Amplitude 이벤트 분류표 v1 (Session, Partyroom, Track, Auth 등)
- [docs/amplitude-backend-asks.md](./amplitude-backend-asks.md) — 백엔드에 요청 중인 계측 항목(L1~L4) 추적
- [docs/amplitude-qa-checklist.md](./amplitude-qa-checklist.md) — 스테이징 검증 시나리오 (S1~S10)

### docs (테스트 로드맵)

- [docs/TEST_ROADMAP.md](./TEST_ROADMAP.md) — 테스트 커버리지 확장 로드맵 (FSD 레이어별 현황, Phase 진행)

### docs/adr (아키텍처 결정 기록)

- [001 Zustand Context DI](./adr/001-zustand-context-di.md)
- [002 WebSocket Callback Hooks](./adr/002-websocket-callback-hooks.md)
- [003 UI Barrel Export Split](./adr/003-ui-barrel-export-split.md)
- [004 MSW Integration Testing](./adr/004-msw-integration-testing.md)
- [005 Error Handling Strategy](./adr/005-error-handling-strategy.md)
- [006 Custom i18n](./adr/006-custom-i18n.md)
- [007 Service Class Decorators](./adr/007-service-class-decorators.md)
- [008 Blockchain Wallet Stack](./adr/008-blockchain-wallet-stack.md)
- [009 Error Monitoring](./adr/009-error-monitoring.md)
- [010 Accessibility Strategy](./adr/010-accessibility-strategy.md)
- [011 FSD Import Boundary](./adr/011-fsd-import-boundary.md)
- [012 파티룸 신고 UI 설계 (V13)](./adr/012-partyroom-report-ui.md)
- [013 시스템 공지 feature 도메인 설계 (V14)](./adr/013-system-announcement-feature.md)
- [014 Amplitude super-admin 자동 opt-out](./adr/014-amplitude-super-admin-opt-out.md)
- [015 STOMP heartbeat 옵트인 + 커스텀 간격](./adr/015-stomp-heartbeat-split.md)
- [016 middleware 점검 가드 (Vercel Edge Config)](./adr/016-maintenance-edge-gate.md)

## src (코드 옆 README)

### shared/lib

- [Chat](../src/shared/lib/chat/README.md) — 실시간 채팅 라이브러리(전송·수신·UI 연동) 가이드
- [Decorators / skip-global-error-handling](../src/shared/lib/decorators/skip-global-error-handling/README.md) — 전역 에러 핸들러 우회 데코레이터
- [Decorators / mock](../src/shared/lib/decorators/mock/README.md) — API 응답 / 함수 동작 모킹용 데코레이터
- [Decorators / singleton](../src/shared/lib/decorators/singleton/README.md) — 싱글턴 패턴 데코레이터
- [Localization / renderer](../src/shared/lib/localization/renderer/README.md) — i18n 텍스트 렌더링·지역화 처리

### entities

- [partyroom-client](../src/entities/partyroom-client/README.md) — 파티룸 STOMP 클라이언트, 상태 관리
- [playlist](../src/entities/playlist/README.md) — 플레이리스트 데이터 모델·상태
- [wallet](../src/entities/wallet/README.md) — Web3 지갑(RainbowKit/wagmi/viem) 연결 + NFT 조회
- [current-partyroom](../src/entities/current-partyroom/README.md) — 현재 입장 파티룸 상태 동기화
- [ui-state](../src/entities/ui-state/README.md) — 전역 UI 상태(모달, 테마 등)

## 백엔드 연계 문서 (참고용 — pfplay-platform 리포)

- pfplay-platform `docs/OPERATIONS.md` — JVM TZ KST, super-admin seed, admin-origin-guard, Cookie 분리 등
- pfplay-platform `docs/asyncapi/asyncapi.yml` — WebSocket 채널 / 메시지 / 이벤트 시그니처 권위 문서
- pfplay-platform `docs/CONTEXT_MAP.md` — Bounded Context 매핑
