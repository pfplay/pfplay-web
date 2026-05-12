# ADR-013: 시스템 공지 feature 도메인 설계 (V14)

- **상태**: 채택
- **일자**: 2026-05-03 (백엔드 V14 도입 시점에 맞춰)

## 맥락

백엔드 V14에서 시스템 공지 / 점검 안내(`system_announcement`)를 도입했다 (pfplay-platform ADR-007). 프론트엔드는 두 경로로 공지를 받게 된다:

1. **STOMP broadcast** — `/sub/system/announcements` 채널을 통해 `ANNOUNCEMENT_PUBLISHED` / `ANNOUNCEMENT_CANCELLED` / `MAINTENANCE_STARTED` 실시간 수신
2. **Edge Config / API polling** — middleware의 점검 가드는 별도(ADR-016 참고). 추가로 `/api/v1/system/status` 폴링으로 활성 공지 백필 가능

이 둘을 어떻게 단일 도메인 슬라이스로 묶고, store 책임을 어떻게 나눌지가 설계 지점.

추가로 결정 필요:

- 페이지 전환 사이에 공지 상태(이미 닫은 공지, 읽음 표시 등)를 어떻게 보존할 것인가
- DELETE(공지 취소) 도착 시 활성 알림을 어떻게 처리할 것인가 — 즉시 제거 vs 페이드아웃
- β 토글(점진 출시) 어떻게 다룰 것인가

## 결정

`features/system-announcement` 슬라이스에 도메인 전체를 담는다.

### 슬라이스 구조

```
src/features/system-announcement/
├── api/   # /system/status polling
├── lib/   # use-system-announcement-subscription (STOMP 구독)
│         #   announcement-helpers (분류·필터 유틸)
├── model/ # system-announcement.store (Zustand)
└── ui/    # 배너 / 토스트 / hydrate
```

### Store 책임

- 활성 공지 목록을 메모리에 보유 (id 키)
- `ANNOUNCEMENT_PUBLISHED` 수신 시 추가
- `ANNOUNCEMENT_CANCELLED` 수신 시 제거 (즉시 — 페이드아웃 X)
- `MAINTENANCE_STARTED` 수신 시 별도 점검 모드 진입 신호 (UI에서 페이지 차단까지는 가지 않고, 사용자 자연 이탈 유도 — 강제 차단은 middleware 책임 ADR-016)

### 초기 hydrate

- 페이지 진입 시 `/api/v1/system/status`로 활성 공지 목록 backfill
- `hydrate-announcements-from-status` 컴포넌트가 client-mount 시점에 호출
- 이후 STOMP 구독으로 실시간 동기화

### 다국어

- 공지 payload에 ko/en 텍스트 둘 다 들어있음
- 클라이언트의 `LANGUAGE_COOKIE_KEY` 값에 따라 선택해서 표시

### DELETE 종료 정책

- 어드민이 공지를 취소하면 즉시 사용자 UI에서도 사라짐 (페이드 X)
- 사용자가 이미 닫은 공지(닫기 액션)는 store flag로 hidden 처리

## 결과

- 공지 도메인이 `features/system-announcement` 한 곳에 격리 — 다른 features가 공지를 직접 import할 일 없음
- middleware 점검 가드(ADR-016)와 broadcast 흐름이 명확히 분리되어 책임 충돌 없음
- 향후 사용자별 공지 알림 설정 / 공지 이력 페이지가 필요해지면 본 슬라이스 확장

## 관련

- 백엔드 측: pfplay-platform `ADR-007 시스템 공지 아키텍처`
- WebSocket 스펙: pfplay-platform `docs/asyncapi/asyncapi.yml` `systemAnnouncementBroadcast`
- middleware 점검 가드: [ADR-016](./016-maintenance-edge-gate.md)
