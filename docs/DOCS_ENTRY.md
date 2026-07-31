# 문서 색인

> 이 레포의 문서가 **무엇이고 언제 읽어야 하는지**를 모은 지도. 최종 갱신: 2026-07-31.

문서는 성격에 따라 3층이다.

| 층 | 뜻 | 갱신 책임 |
|---|---|---|
| 🟢 **상시 문서** | 현재 코드를 설명한다. 틀리면 버그로 취급 | 관련 코드를 바꾼 PR 이 같이 갱신 |
| 🔵 **결정 기록(ADR)** | 왜 그렇게 했는지. 뒤집힐 때만 새 ADR 로 대체 | 결정이 바뀔 때만 |
| ⚪ **시점 산출물** | 특정 날짜의 설계·계획·분석 스냅샷 | 갱신하지 않음 |

---

## 🟢 상시 문서

| 문서 | 언제 읽나 |
|---|---|
| [README.md](./README.md) | 처음 들어왔을 때. 로컬 실행·배포 대상·PWA/모바일 개요 |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | 코드 스타일·브랜치 전략·PR 규칙 |
| [CI_CD.md](./CI_CD.md) | GitHub Actions 구성, 브랜치별 실행 조건, e2e 트리거 |
| [FLOW.md](./FLOW.md) | 스토어 주입·WS 구독 등 주요 데이터 흐름 (시퀀스 다이어그램) |
| [REACT_QUERY.md](./REACT_QUERY.md) | 서버 상태 관리 규칙 |
| [TESTING.md](./TESTING.md) | 단위·통합 테스트 작성 가이드, MSW 인프라, 네이밍 |
| [E2E_POLICY.md](./E2E_POLICY.md) | **e2e 시나리오를 추가하기 전에** — 선정 기준·체크리스트 |
| [../e2e/README.md](../e2e/README.md) | e2e 실행 방법, 디렉터리 구조, selector 기준, **실전 함정** |
| [TECH_DEBT.md](./TECH_DEBT.md) | 구조적 부채 목록(+해소 기록). 사용자 영향 결함은 GitHub 이슈 |

## 🔵 결정 기록 (ADR)

| ADR | 결정 |
|---|---|
| [001](./adr/001-zustand-context-di.md) | Zustand + Context 의존성 주입 |
| [002](./adr/002-websocket-callback-hooks.md) | WebSocket 콜백 훅 구조 |
| [003](./adr/003-ui-barrel-export-split.md) | `index.ui.ts` 배럴 분리 (CSR 경계) |
| [004](./adr/004-msw-integration-testing.md) | MSW 기반 통합 테스트 |
| [005](./adr/005-error-handling-strategy.md) | 에러 처리 전략 |
| [006](./adr/006-custom-i18n.md) | 자체 i18n |
| [007](./adr/007-service-class-decorators.md) | 서비스 클래스 데코레이터 |
| [008](./adr/008-blockchain-wallet-stack.md) | 지갑 스택 (RainbowKit/wagmi) |
| [009](./adr/009-error-monitoring.md) | 에러 모니터링 |
| [010](./adr/010-accessibility-strategy.md) | 접근성 전략 |
| [011](./adr/011-fsd-import-boundary.md) | FSD import 경계 |
| [012](./adr/012-amplitude-user-id-strategy.md) | amplitude user_id 전략 |
| [013](./adr/013-pwa-service-worker-no-caching.md) | **PWA 서비스워커는 아무것도 캐싱하지 않는다** |
| [014](./adr/014-mobile-widget-split.md) | **모바일은 서버 판정 + 전용 위젯 트리** |

## ⚪ 시점 산출물

| 문서 | 시점 | 성격 |
|---|---|---|
| [TEST_ROADMAP.md](./TEST_ROADMAP.md) | 2026-03 | 테스트 커버리지 확장 로드맵 |
| [2026-04-04-event-taxonomy-design.md](./2026-04-04-event-taxonomy-design.md) | 2026-04 | 분석 이벤트 택소노미 설계 |
| [amplitude-backend-asks.md](./amplitude-backend-asks.md) · [amplitude-qa-checklist.md](./amplitude-qa-checklist.md) | 2026-05 | amplitude 연동 요청·QA 체크리스트 |
| `superpowers/specs/` · `superpowers/plans/` | 각 파일 날짜 | 기능별 설계서·실행 계획 (47건). 특정 기능의 "왜" 를 추적할 때 |

최근 자주 참조되는 시점 산출물:

| 문서 | 내용 |
|---|---|
| `superpowers/specs/2026-06-16-pwa-installable-push-design.md` | PWA 설치·푸시 설계 |
| `superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` | 모바일 반응형 아키텍처 |
| `superpowers/plans/2026-07-12-playback-summary-chat-divider.md` | 재생 종료 요약 구획 |

## src 내부 README

컴포넌트/모듈 사용법은 해당 디렉터리의 README 에 있다.

- 엔티티 — [current-partyroom](../src/entities/current-partyroom/README.md) ·
  [partyroom-client](../src/entities/partyroom-client/README.md) ·
  [playlist](../src/entities/playlist/README.md) ·
  [ui-state](../src/entities/ui-state/README.md) ·
  [wallet](../src/entities/wallet/README.md)
- 기능 — [playlist/add](../src/features/playlist/add/README.md) ·
  [sign-in/by-social](../src/features/sign-in/by-social/README.md)
- 공용 — [chat](../src/shared/lib/chat/README.md) ·
  [localization/renderer](../src/shared/lib/localization/renderer/README.md) ·
  데코레이터([mock](../src/shared/lib/decorators/mock/README.md) ·
  [singleton](../src/shared/lib/decorators/singleton/README.md) ·
  [skip-global-error-handling](../src/shared/lib/decorators/skip-global-error-handling/README.md))

---

## 문서를 고칠 때

- 🟢 상시 문서는 **코드를 바꾼 PR 안에서 같이** 고친다. 미루면 드리프트가 쌓인다
  (이 색인이 4개월간 절반의 문서를 누락하고 있었던 이유).
- 새 결정은 ADR 을 추가한다. 기존 ADR 은 수정하지 않고 새 ADR 로 대체한다.
- ⚪ 시점 산출물은 고치지 않는다.
