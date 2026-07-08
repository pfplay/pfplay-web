# WS 재연결 멤버십 resync (감지-후-분기)

- 날짜: 2026-06-19
- 범위: pfplay-web (주) + pfplay-platform (응답 신호 1필드)
- 이슈: web #402 · 상위 platform #306(토큰/멤버십) · 가족 #304 / #303 / web #428(③)
- 상태: 설계 승인됨 (구현 전)

## 1. 배경 / 문제

WS 소프트 재연결(백그라운드 탭 복귀, 네트워크 블립) 시 `handleConnect`(매 연결)는 구독을 reconcile하고 비-`once` onConnect 콜백을 재실행하지만, **룸 입장 로직 `enter`가 `{ once: true }`로 등록**돼(`use-enter-partyroom.ts:97`) 재연결 시 재실행되지 않는다. `enter`가 하던 두 가지가 누락된다:

1. `tryEnter`(백엔드 crew 멤버십 재활성) → presence grace가 만료된 동안 백엔드가 exit시킨 경우 **멤버십 미복구** → 룸 액션이 `CRW-001`/`No value present`로 실패(#303·#304·③의 상류).
2. `setup`(setupInfo·notice fetch → `initPartyroom` 스토어 재수화) → **디스플레이 검정**(상태 stale).

= [[reference_ws_reconnect_no_state_resync]] / web #402. 이 갭이 stale-멤버십 클래스의 **공통 상류 트리거**.

## 2. 목표 / 비목표

**목표**

- 재연결 시 멤버십을 재확립해 `CRW-001` 버스트·stale 멤버십을 제거.
- 멤버십이 실제 끊긴(grace 만료) 경우 디스플레이/상태를 복구(검정 해소).
- **흔한 짧은 블립(멤버십 유지)에서 YouTube 플레이어 remount를 유발하지 않는다** (#426 iOS 자동재생 끊김 계열 회귀 방지).

**비목표**

- 백엔드 refresh/슬라이딩 갱신(#306-①), WS inbound 만료검증(#306-②)은 별도.

## 3. 핵심 통찰

- `handleDisconnect`는 **live STOMP 핸들만 teardown**하고 `subscriptions[]`·zustand 스토어는 **보존**한다(`client.ts:69-77,193-198`). 따라서 짧은 블립(멤버십 유지)에선 스토어/플레이어가 살아있어 추가 재수화가 불필요하다.
- **디스플레이 검정은 멤버십 상실(긴 단절)과 동행**한다 → "재수화가 필요한 경우"와 "멤버십이 끊긴 경우"가 일치 → 멤버십 상실 신호로 분기하면 두 증상을 함께 해결하면서 remount를 최소화할 수 있다.
- 백엔드 `tryEnter`는 이미 분기를 계산한다: 같은-룸 재입장(이미 active, countryCode만 갱신) vs `ensureCrewActive`의 `transitioned`(inactive→active 재활성). **이 신호를 응답에 노출**하면 프론트가 분기 가능.

## 4. 설계 — 감지-후-분기 (Approach C)

### 4.1 platform — enter 응답에 `reactivated: boolean`

- `tryEnter`의 반환을 `CrewData` → 작은 결과 타입 `TryEnterResult(CrewData crew, boolean reactivated)`로 변경.
  - 같은-룸 재입장 분기(`PartyroomAccessCommandService:87-113`) → `reactivated=false`.
  - `ensureCrewActive` 경로 → `reactivated = result.transitioned`(기존 inactive→active 또는 신규 INSERT는 true; 이미 active/raceLoser는 false).
  - ⚠️ `transitioned=true`는 **신규 INSERT(최초 입장)에도** true다. 무해함: web resync는 **재연결에서만** 동작(첫 연결 skip)하고 그땐 crew row가 이미 존재해 INSERT 분기에 안 닿는다. 첫 연결 `once` enter는 `reactivated`를 무시한다. → `TryEnterResult`에 "reactivated=true는 신규 INSERT 포함; 재연결 소비자에게만 유의미(재연결은 INSERT 안 함)" 주석.
- 호출처 2곳: 컨트롤러(`PartyroomAccessCommandController:44`)는 `EnterPartyroomResponse.from(crew, reactivated)`로 매핑; 봇(`VirtualDjOrchestratorImpl:149`)은 반환 무시(필드 미사용).
- `EnterPartyroomResponse` + web `EnterResponse` 타입에 `reactivated` 추가. **이벤트/도메인 로직 무변경 — 신호 노출만.**

### 4.2 web — 재연결 resync 핸들러

- `use-enter-partyroom.ts`에 **비-`once` onConnect "resync" 핸들러** 추가. **첫 연결 skip 가드는 훅 인스턴스 스코프 `useRef`**(`firstConnect`)로 둬 연결 간 보존 — 콜백 로컬 변수 금지(매 연결 리셋되면 무의미). enter 함수는 `useDidMountEffect`로 마운트당 1회만 호출되므로 핸들러 중복 등록 없음. (가드 필수 이유: 등록 시점에 소켓 미연결이라 `once` enter와 resync가 같은 큐에 들어가 **첫 `handleConnect`에서 둘 다 발화 → 첫 연결 이중 tryEnter** 위험.)
- 재연결 동작:
  1. `enter({ partyroomId })`(tryEnter) 호출 — 멱등, 멤버십 재확립(CRW-001 차단).
  2. 응답 `reactivated`로 분기:
     - **`true`(멤버십 상실 → 재활성)**: `setup(enterResponse)` 풀 재수화(initPartyroom) + DJ큐 invalidate. 검정 해소. 드문 케이스라 플레이어 remount 허용. **룸 재구독은 추가하지 않는다** — `handleConnect`가 onConnect 큐 _이전에_ `subscriptions[]`를 이미 reconcile(재구독)하므로, 여기서 `client.subscribe`를 다시 부르면 동일 destination 중복 핸들이 생긴다(client 계약 위반).
     - **`false`(멤버십 유지)**: **경량** — `initPartyroom`/플레이어/구독 미접촉. DJ큐만 invalidate(블립 중 놓친 큐 변경 보정). playback/crews zustand는 직후 live 이벤트가 보정(짧은 블립이라 누락 최소, self-heal).
  3. `enter` onError(tryEnter 실패 = 룸 닫힘/penalty/멤버십 영구 상실) → 로비(`/parties`). **의식적 결정**: `reactivated=true` 재수화의 `setup` 실패도 첫-입장과 동일하게 로비로 보낸다 — reactivated는 "이미 룸 밖이었음"을 뜻하므로 재입장 실패=로비가 일관. (이미 들어와 있던 유저를 화면만 깜빡하다 로비로 보내는 케이스는 아님.)

### 4.3 #426 회귀 방어

경량 경로가 `initPartyroom`·플레이어를 안 건드리므로 흔한 짧은 블립에서 remount 0. 풀 재수화는 멤버십이 실제 끊긴(사실상 재입장) 드문 경우만 → 그땐 remount 수용 가능.

## 5. 데이터 흐름

```
handleConnect (매 연결)
  ├─ 구독 reconcile (룸 sub 재구독 — 이벤트 스트림 복구)  [기존]
  ├─ once enter (첫 연결만)                              [기존]
  └─ resync (비-once, firstConnect 이후만):
        enter(tryEnter) →
          reactivated=true  → setup() 풀 재수화 (검정 해소)
          reactivated=false → 경량 (DJ큐 invalidate, 플레이어 무영향)
        onError → /parties
```

## 6. 엣지 케이스

- 첫 연결: resync는 `firstConnect` ref로 skip → once enter만(중복 tryEnter 없음).
- 멤버십 유지 + 블립 중 트랙 전환 발생: 경량 경로는 즉시 재수화 안 함 → 다음 live playback 이벤트가 보정(수 초 내). 가시적 staleness가 문제되면 후속으로 "playback만 선택 머지"(remount 없이) 검토.
- 멤버십 영구 상실(룸 종료/추방): tryEnter throw → 로비.
- 동시성: tryEnter는 멱등(`ensureCrewActive` race 처리 기존 보장).

## 7. 테스트

**platform (IT/unit)**

- 같은-룸 재입장(이미 active) → `reactivated=false`.
- inactive crew 후 tryEnter → `reactivated=true`.
- 봇 경로 회귀(반환 무시).

**web (vitest)**

- 재연결 + `reactivated=false` → `setup`/`initPartyroom` **미호출**(플레이어 무영향), DJ큐 invalidate 호출.
- 재연결 + `reactivated=true` → `setup` 호출(재수화).
- 첫 연결 → resync skip(enter 1회만, 중복 tryEnter 없음).
- `enter` onError → `/parties`.

## 8. 미해결 / 후속

- 경량 경로의 playback staleness가 실제로 가시적이면 "selective playback merge"(remount 없는 부분 갱신) 후속.
- #306-①(refresh) 도입 시 재인증→재연결 흐름과 resync 연계.
