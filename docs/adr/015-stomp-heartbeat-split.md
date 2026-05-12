# ADR-015: STOMP heartbeat 옵트인 + 커스텀 간격 분리 모델

- **상태**: 채택
- **일자**: 2026-05-09 (TECH_DEBT TD-004 정정)

## 맥락

`@stomp/stompjs` 기본 설정은 4초 outgoing / 4초 incoming heartbeat이며, 모든 연결에 자동 활성화된다. 두 가지 문제가 있었다:

1. **과도한 트래픽** — 모바일 환경에서 4초마다 ping/pong이 발생하면서 백그라운드 탭의 배터리·데이터 소모가 측정 가능한 수준
2. **이중 책임 혼동** — heartbeat는 두 가지 역할을 동시에 하고 있었음:
   - **LB keep-alive**: Cloud LB / 프록시가 idle 연결을 끊지 않게 함 (보통 60s 임계)
   - **Presence 신호**: 사용자가 살아 있는지 백엔드가 추정

V16에서 백엔드가 **presence grace window**(pending_exit_at + Redis TTL)를 도입(ADR-010, pfplay-platform)하면서 presence 신호의 책임이 STOMP heartbeat에서 분리됐다. 백엔드는 더 이상 heartbeat 부재만으로 OFFLINE을 결론짓지 않으며, presence는 grace timer로 자체 관리된다. 따라서 STOMP heartbeat는 **LB keep-alive 단일 책임**으로 좁힐 수 있게 됨.

## 결정

STOMP heartbeat를 **명시적 옵트인** + **LB-친화 간격**으로 변경한다.

### 옵트인 기본값

- `PartyroomClient` 생성 시 heartbeat **기본 비활성**
- 명시적으로 활성화한 경우에만 ping/pong 시작 (예: 장시간 연결이 필요한 페이지)

### 활성화 시 간격

- Outgoing (클라이언트 → 서버 ping): **15s**
- Incoming (서버 → 클라이언트 ping 기대): **30s**

### 이유

- **LB keep-alive**: 대부분의 Cloud LB는 60s idle 임계가 기본. 15s/30s면 충분한 여유
- **모바일 친화**: 4s 대비 4배 가까이 트래픽 감소
- **Presence 와 분리**: heartbeat 부재가 OFFLINE을 의미하지 않음 (백엔드 presence grace window가 책임 — pfplay-platform ADR-010)

### 기존 코드 마이그레이션

- `@stomp/stompjs` 기본값에 의존하던 모든 위치에서 명시 설정으로 전환
- TECH_DEBT TD-004 항목에서 추적 (2026-05-09 정정 commit)

## 결과

- 모바일/데스크탑 모두 STOMP 트래픽 의미 있게 감소
- heartbeat ↔ presence 책임이 명확히 분리: heartbeat은 LB-only, presence는 백엔드 grace window
- 단점: heartbeat가 옵트인이라 새 STOMP 연결 추가 시 활성화 여부를 명시적으로 결정해야 함 — 잊으면 LB 임계에 걸려 연결이 끊길 수 있음 (FLOW.md 다이어그램 2 / TECH_DEBT.md TD-004에 명시)

## 관련

- TECH_DEBT TD-004 항목 (2026-05-09 정정)
- 백엔드 presence: pfplay-platform [ADR-010](https://github.com/pfplay/pfplay-platform/blob/develop/docs/adr/010-presence-grace-window.md)
- FLOW.md 다이어그램 2 (파티룸 연결/구독 흐름)
