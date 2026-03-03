# ADR-001: 상태 관리로 Zustand + Context DI 패턴 채택

- **상태**: 채택됨
- **일자**: 2024-06

## 맥락

파티룸에 진입하면 크루 목록, 재생 상태, DJ 큐, 채팅 등 실시간 상태를 여러 위젯에서 공유해야 한다. 동시에 파티룸 퇴장 시 모든 상태를 깔끔하게 초기화해야 하므로, 스토어의 **lifecycle 제어**가 핵심 요구사항이었다.

## 선택지

| 선택지                   | 장점                            | 단점                                        |
| ------------------------ | ------------------------------- | ------------------------------------------- |
| Redux Toolkit            | 생태계 풍부, DevTools           | 보일러플레이트 과다, 이 규모에 과잉         |
| Zustand 전역 싱글턴      | 간단, 경량                      | 스토어 초기화가 수동, lifecycle 제어 불가   |
| **Zustand + Context DI** | lifecycle이 React tree와 동기화 | 2단계 selector 패턴 필요                    |
| Jotai / Recoil           | atom 단위 세분화                | 파티룸 전체 상태를 한번에 초기화하기 어려움 |

## 결정

**Zustand + Context DI** 패턴을 채택한다.

`StoresProvider`에서 `createCurrentPartyroomStore()`로 스토어 인스턴스를 생성하고, `useStores()` 훅으로 하위 컴포넌트에 주입한다. 파티룸 퇴장 시 Provider가 언마운트되면 스토어도 함께 파괴된다.

```
StoresProvider (mount/unmount = store create/destroy)
  └─ useStores() → { useCurrentPartyroom, useUIState }
       └─ useCurrentPartyroom(selector) → 필요한 상태만 구독
```

### 핵심 파일

- `src/app/_providers/stores.provider.tsx` — 스토어 생성 및 Context 제공
- `src/shared/lib/store/stores.context.tsx` — useStores 훅
- `src/entities/current-partyroom/model/current-partyroom.store.ts` — 파티룸 스토어

## 결과

- **(+)** 스토어 lifecycle이 React tree와 자연스럽게 동기화
- **(+)** 테스트에서 `jest.mock('stores.context')` 한 줄로 격리 가능
- **(+)** 파티룸 퇴장 시 별도 reset 로직 불필요
- **(-)** `useStores(s => s.useCurrentPartyroom(selector))` 형태의 2단계 셀렉터가 다소 장황
- **(-)** Provider 외부에서 스토어 접근 시 `getState()` 패턴 필요
