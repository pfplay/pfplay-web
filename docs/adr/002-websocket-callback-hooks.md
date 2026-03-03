# ADR-002: WebSocket 구독을 콜백 훅 패턴으로 분리

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

STOMP WebSocket 구독 시 채팅, 크루 변동, 등급 변경, 패널티, 반응 집계, 재생 상태 등 10종 이상의 이벤트를 처리해야 한다. 하나의 핸들러에 모으면 파일이 비대해지고, 이벤트 타입별 테스트가 어렵다.

## 선택지

| 선택지                  | 장점                             | 단점                               |
| ----------------------- | -------------------------------- | ---------------------------------- |
| 단일 핸들러 switch-case | 구조 단순                        | 코드 비대, 단일 파일 수백 줄       |
| Event emitter 패턴      | 느슨한 결합                      | 타입 안전성 약함, 구독 추적 어려움 |
| **개별 콜백 훅**        | 훅 단위 테스트 용이, 관심사 분리 | 훅 수가 많아짐                     |

## 결정

**이벤트 타입별 개별 콜백 훅**(`use-*-callback.hook.ts`)으로 분리한다.

`handleSubscriptionEvent`가 메시지 타입으로 디스패치하고, 각 콜백 훅이 Zustand 스토어 업데이트를 담당한다.

```
STOMP message 수신
  → handleSubscriptionEvent(type, payload)
    → useChatCallback          (채팅 메시지)
    → useCrewGradeCallback     (등급 변경)
    → useCrewPenaltyCallback   (패널티 부과)
    → useCrewProfileCallback   (프로필 변경)
    → useReactionAggregation   (반응 집계)
    → useReactionMotion        (반응 모션)
    → usePartyroomNotice       (공지)
    → usePartyroomClose        (파티룸 종료)
    → usePartyroomDeactivation (비활성화)
    → usePlaybackCallback      (재생 상태)
    → useDjQueueCallback       (DJ 큐 변동)
```

### 핵심 파일

- `src/entities/partyroom-client/lib/handle-subscription-event.ts` — 디스패처
- `src/entities/partyroom-client/lib/subscription-callbacks/` — 11개 콜백 훅

## 결과

- **(+)** 훅 단위 테스트 용이 — 11개 콜백 전부 유닛 테스트 완료
- **(+)** 새 이벤트 타입 추가 시 훅 하나만 추가
- **(+)** 각 콜백이 자신이 업데이트할 스토어 슬라이스만 알면 됨
- **(-)** 파일 수가 많아짐 (11개 콜백 + 1개 디스패처)
