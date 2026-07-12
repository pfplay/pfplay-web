# 플레이백 종료 요약 채팅 구획 (로드맵 #4) 설계

- 작성일: 2026-07-12
- 대상 이슈: 미등록 (착수 시 pfplay-web 이슈 발행)
- 대상 레포: **pfplay-web 단독** — 백엔드(platform) 무변경 확정
- 분류: 신규 기능 (채팅 UX — 곡 단위 챕터 구획 + 종료 통계)
- 상태: 설계 확정 (사용자 승인 2026-07-12), plan → 구현 대기

## 1. 배경 / 문제

로드맵 #4 "플레이백 구획 + 종료 통계". 채팅이 곡 경계 없이 이어져 흐르므로, 곡이 끝날 때 채팅창에 **그 곡의 챕터를 닫는 구획(footer)** 을 삽입하고 종료 통계를 노출한다. DJing이 활발해진 뒤(로드맵 #1~#3 완료) 통계가 의미를 가지므로 이 시점에 착수.

### 재정의(브레인스토밍 결론): 백엔드 무변경, 웹 단독

원안은 "시스템 메시지 채널 + 통계 집계 필요"였으나, 조사 결과 필요한 데이터가 전부 이미 웹에 도달하고 있다:

- **입장/리싱크 payload(setup-info)** 가 현재 playback(+`endTime`) · `AggregationDto(like/dislike/grab)` · currentDj를 내려줌 — platform `PartyroomSetupQueryService:81-85`
- **실시간 카운트**: `REACTION_AGGREGATION_UPDATED` 브로드캐스트가 반응 갱신마다 도착
- **경계 관측**: 다음 곡의 `PLAYBACK_STARTED` 또는 `PLAYBACK_DEACTIVATED`/`DJ_QUEUE_CHANGED(DEACTIVATE)` 도착 = 직전 곡 종료

수용하는 트레이드오프: 경계 직전 찰나의 반응이 늦게 도착하면 최종 수치가 1~2 어긋날 수 있음(재미용 통계로 수용). 신규 이벤트/집계/영속화 없음.

## 2. 확정 결정 (사용자, 2026-07-12)

1. **통계 내용 = (b)**: 곡명 + DJ 닉네임 + 반응 3종(👍좋아요/👎싫어요/🎁그랩). 청취자 수 제외.
2. **구획 = 종료 요약 1종만** (시작 구획 없음 — 시작 정보는 플레이어 UI가 이미 노출).
3. **다음 재생이 없는 케이스 필수 대응**: DJ 대기열이 비어 끝나는 경우 = `DEACTIVATE` 계열 이벤트가 경계.
4. **스킵 구분 = 휴리스틱**: 경계 도착 시각이 예상 종료보다 5초 이상 이르면 `⏭ 스킵` 표기. 오분류가 실제 고통으로 확인되면 백엔드 종료사유 필드로 승급(후속).
5. **곡 진행 중 입장한 크루 대응 필수**: `PLAYBACK_STARTED` 를 못 받았어도 setup 데이터로 스냅샷을 시드.
6. **시각 형태 = footer형 구획**: 요약 내용이 먼저, **경계선이 블록 아래** — "위쪽 채팅이 이 곡의 챕터"로 읽히게. (선이 위에 있으면 날짜 구분선처럼 아래 내용의 헤더로 오독됨 — 사용자 지적으로 정정된 결정.)

```
  (Butter 재생 동안의 채팅들…)

   🎵 Butter — DJ 크릴린 · 👍 12 · 👎 1 · 🎁 5   [⏭ 스킵]
  ─────────────────────────────────────────────
  (다음 곡 채팅들…)
```

7. **로컬 미리보기 게이트**: 구현 후 로컬 풀스택에서 완료·스킵 두 케이스의 실렌더 스크린샷(데스크탑/모바일)을 사용자에게 공유하고 디자인 컨펌 후 PR.

## 3. 현행 코드 사실 (2026-07-12 확인, pfplay-web)

- **채팅 스트림**: `entities/current-partyroom/model/current-partyroom.store.ts` 의 `chat` 필드 = `Chat<ChatMessage.Model>`(circular buffer + observer, cap `MAX_MESSAGE_AMOUNT`). 추가는 `appendChatMessage`. React 바인딩 `entities/current-partyroom/lib/use-chat.hook.ts`.
- **메시지 모델(discriminated union)**: `entities/current-partyroom/model/chat-message.model.ts` — `Model = SystemChat | UserChat`, 판별자 `from`. `SystemChat = { from:'system'; content; receivedAt }` 이 이미 존재(입장/등급/페널티 알림이 사용) → **variant 추가가 정착된 확장 방식**.
- **렌더**: `widgets/partyroom-chat-panel/ui/partyroom-chat-panel.component.tsx`(데스크탑) · `widgets-mobile/partyroom-chat-panel/partyroom-chat-panel.component.tsx`(모바일) — 단일 `map` + `from` 분기.
- **재생 WS**: 디스패처 `entities/partyroom-client/lib/handle-subscription-event.ts` → `subscription-callbacks/` 훅들.
  - `PLAYBACK_STARTED` payload = `{ playback:{linkId,name,duration("mm:ss"),thumbnailImage}, crewId }` — **⚠️ `endTime`·playbackId 없음**. 콜백이 스토어 aggregation을 0으로 리셋.
  - `PLAYBACK_DEACTIVATED` payload = base뿐. 콜백이 playback/currentDj를 즉시 클리어 → **구획 스냅샷은 추적기가 자체 보유해야 함(스토어 의존 불가)**. (참고: reaction은 스토어 `resetReaction`의 선재 복붙 버그 — reaction 필드 대신 crews motion을 리셋함 — 때문에 실제론 안 지워짐. 본 기능과 무관하나 구현 시 drive-by 수정 후보.)
  - `DJ_QUEUE_CHANGED` payload에 `changeType:'DEACTIVATE'` 가능 — 같은 비활성화에 `PLAYBACK_DEACTIVATED` 와 **둘 다 도착**.
- **반응 카운트**: 스토어 `reaction.aggregation{likeCount,dislikeCount,grabCount}`, `REACTION_AGGREGATION_UPDATED` 로 라이브 갱신, setup에서 초기 시드.
- **setup 하이드레이션**: `features/partyroom/enter/lib/use-enter-partyroom.ts` `setup()` — `getSetupInfo` 응답의 `display.{playbackActivated, playback(PartyroomPlayback: id·name·duration·endTime·linkId·thumbnail), reaction, currentDj{crewId}}` 를 스토어에 시드. ⚠️ WS 재연결 시 이 경로의 재실행은 **`reactivated=true`(멤버십 소실 재입장)일 때만** — 멤버십 유지 재연결(짧은 끊김)은 DjQueue invalidate만 수행하고 setup을 재수화하지 않는다(`use-enter-partyroom.ts:112-125`).
- **닉네임 해석**: 스토어 `crews` 배열에서 `crewId` 조회(기존 채팅/입장알림과 동일 방식).
- **i18n**: `shared/lib/localization/dictionaries/ko.json`·`en.json` 의 `chat` 네임스페이스 — **json 직접 수정**(xlsx 경유 금지 — 기존 drift 교훈).

## 4. 설계 — PlaybackSessionTracker (hold-and-clear 스냅샷 추적기)

구독 콜백들과 분리된 **순수 모듈 + 얇은 훅 배선**. 스냅샷 하나를 보유:

```ts
type PlaybackSummarySnapshot = {
  trackName: string;
  djNickname: string; // 시드 시점에 crews에서 즉시 해석해 문자열로 보관 (DJ 중도 퇴장 대비)
  counts: { like: number; dislike: number; grab: number };
  expectedEndAtLocal: number; // epoch ms, 로컬 기준
  trackIdentity: string; // linkId — 리싱크 불일치 판정용
};
```

### 규칙표

| 국면      | 트리거                                                                            | 동작                                                                                                                                                                                                                                                |
| --------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 시드 ①    | `PLAYBACK_STARTED` 수신                                                           | (보유 스냅샷 있으면 **먼저 방출**) → 새 스냅샷. `expectedEndAtLocal = 수신 로컬시각 + duration 파싱`. 로컬끼리 비교라 서버-클라 시계 skew 무관(시작·경계 메시지 전달지연 상쇄)                                                                      |
| 시드 ②    | setup 하이드레이션 (중간입장·리싱크)                                              | 스냅샷 = setup의 `playback.name`/`endTime`(서버 epoch — 이 경로만 skew 노출, 5초 여유로 흡수) + `aggregation` counts + `currentDj` 닉네임 해석. **단, 보유 스냅샷과 `trackIdentity` 불일치 시 구획 없이 폐기 후 재시드**(놓친 경계는 기념하지 않음) |
| 갱신      | `REACTION_AGGREGATION_UPDATED`                                                    | 추적기 자체 counts 갱신 (스토어 리셋 타이밍과 무관)                                                                                                                                                                                                 |
| 방출      | 다음 `PLAYBACK_STARTED` / `PLAYBACK_DEACTIVATED` / `DJ_QUEUE_CHANGED(DEACTIVATE)` | 스냅샷 → `appendChatMessage(구획 variant)` 후 **clear**. hold-and-clear라 이중 DEACTIVATE 이벤트에도 정확히 1회 (playbackId 없이 dedup 해결)                                                                                                        |
| 스킵 판정 | 방출 시                                                                           | `방출 로컬시각 < expectedEndAtLocal − 5_000` → `skipped: true`                                                                                                                                                                                      |

### 콜백 배선 순서 제약

- `PLAYBACK_STARTED` 콜백: **①구획 방출(이전 스냅샷) → ②새 스냅샷 시드 → ③기존 스토어 갱신(리셋 포함)** 순서. counts는 추적기가 자체 보유하므로 스토어 리셋(③) 타이밍과는 무관하나, **①→② 순서는 필수** — 시드가 먼저 실행되면 이전 곡 스냅샷이 덮여 구획이 소실된다.
- `PLAYBACK_DEACTIVATED` 콜백: 기존 클리어 로직 **앞에** 방출 호출.
- `DJ_QUEUE_CHANGED` 콜백: `changeType === 'DEACTIVATE'` 일 때 콜백 선두에서 방출 호출 (이 콜백엔 playback 클리어 로직이 없음 — currentDj 갱신뿐).
- 디스패처(`handle-subscription-event.ts`)는 STOMP 메시지당 동기 단일 switch — 이벤트 단위 직렬이 보장되므로 위 순서는 콜백 내부에서 완전히 통제 가능.

### 라이프사이클·멱등·시드 세칙 (스펙 리뷰 반영)

- **L1 방 enter 시 무조건 clear**: 방 입장(initPartyroom 경로) 시 추적기를 먼저 clear한 뒤 시드②를 진행한다. setup에 playback이 없으면 clear 상태 유지. (미클리어 시: 방 A 스냅샷 보유 채 방 B 입장 → B의 첫 재생 시작이 **A의 구획을 B 채팅에 방출**하는 누출.)
- **L2 WS disconnect 시 clear**: 연결 끊김 관측 시점에 추적기 clear. 멤버십 유지 재연결은 setup을 재수화하지 않으므로(§3), clear 없이는 끊김이 곡 경계를 넘을 때 낡은 스냅샷에 새 곡 counts가 오염된 틀린 구획이 방출된다. "놓친 경계는 기념하지 않음" 원칙과 일관. (시드②의 identity 불일치 폐기는 reactivated 재입장 경로의 2차 방어.)
  - 구현 힌트(plan 단계): 클라이언트에 disconnect 콜백이 공개돼 있지 않음(`onWebSocketClose`는 내부 전용). **재연결마다 실행되는 기존 비-once `onConnect`(firstConnect 패턴, `use-enter-partyroom.ts:104`)에서 clear해도 의미상 등가** — 끊김~재연결 사이엔 방출/시드 이벤트가 처리되지 않으므로. 이 쪽이 클라이언트 API 무변경으로 최소 변경.
- **L3 시드② 동일 identity**: 보유 스냅샷과 `trackIdentity` 가 같으면 폐기가 아니라 **counts만 setup 값으로 덮는다**(서버가 권위 — 끊김 중 놓친 반응 보정). `expectedEndAtLocal` 은 기존 로컬 추정이 있으면 유지(skew 노출 endTime으로 덮지 않음).
- **L4 stale setup 무시**: setup의 `endTime` 이 이미 로컬 현재시각보다 과거면 낡은 응답으로 보고 시드②를 무시한다(리싱크 중 새 곡 `PLAYBACK_STARTED` 가 먼저 처리된 뒤 늦게 도착한 stale setup이 신선한 스냅샷을 교체하는 레이스 방지).
- **L5 PLAYBACK_STARTED 중복 무시**: 직전 처리한 `event.id`(WebSocketEventBase의 멱등성 필드)를 기억해 동일 id 재전달을 무시한다. 기존 콜백들은 전부 멱등(덮어쓰기)이라 무해했지만 **추적기 방출은 최초의 비멱등 소비자** — 재전달 시 곡 중간 가짜 구획이 생긴다. 같은 곡 연속 재생은 정당하므로 identity 기반 억제는 불가, event.id 기반이 정답.
- **L6 닉네임 폴백**: 시드 시점 crews에서 crewId 미발견 시 drop하지 않고 i18n 폴백 문자열(예: "DJ")을 사용한다.
- **L7 duration 파서**: `[H:]M:SS` 관용 파서를 사용한다 — 기존 `features/playlist/list-tracks/lib/parse-duration.ts` 의 `parseDurationToSeconds`(2~3토큰+fail-safe)를 **shared 계층으로 승격**해 재사용(FSD상 entities→features import 불가). 파싱 실패 시 `expectedEndAtLocal` 미설정 → **`skipped=false` fail-safe**. ⚠️ naive 2토큰 split은 1시간 이상 트랙("1:02:03"→62초 오계산)에서 실제 스킵 전부를 완주로 오분류하므로 금지.

### 채팅 모델 확장

```ts
type PlaybackSummaryChat = {
  from: 'playback-summary';
  trackName: string;
  djNickname: string;
  counts: { like: number; dislike: number; grab: number };
  skipped: boolean;
  receivedAt: number;
};
// Model = SystemChat | UserChat | PlaybackSummaryChat
```

기존 `from` 판별 분기에 케이스 추가 — 컴파일러가 두 채팅 패널의 누락을 잡도록 exhaustive 처리.

### 렌더

- footer형 구획 컴포넌트 1개(shared 또는 entities 계층) — 요약 라인 + 하단 경계선. 스킵 시 `⏭` 뱃지.
- 데스크탑/모바일 채팅 패널 각각에 분기 추가. 모바일은 데스크탑 baseline 대조 규칙 준수. (두 패널 모두 시스템 메시지 분기가 이미 존재 — variant 추가 시 후속 `message.crew` 접근이 컴파일 에러가 되어 누락이 컴파일러에 잡힘.)
- React key: `'playback-summary' + receivedAt` (기존 시스템 메시지 key 스킴 계승).
- 문구는 i18n(`chat` 네임스페이스, ko/en json 직접 추가).

## 5. 엣지 케이스

- **다음 재생 없음(대기열 소진)**: `PLAYBACK_DEACTIVATED`/`DJ_QUEUE_CHANGED(DEACTIVATE)`가 경계 — 규칙표의 방출 트리거로 커버 (확정 결정 3).
- **곡 진행 중 입장**: 시드 ② — setup의 endTime·counts·currentDj로 완전 복원 (확정 결정 5).
- **WS 재연결, 그 사이 곡 바뀜**: 1차 방어 = disconnect 시 clear(L2 — 멤버십 유지 재연결도 커버), 2차 방어 = reactivated 재입장 시 시드②의 identity 불일치 폐기. 어느 쪽도 놓친 경계는 기념하지 않음.
- **DJ 중도 퇴장**: 닉네임을 시드 시점 문자열로 보관 — 경계 시점 crews 조회 불필요.
- **재생 없는 방 입장**: setup에 playback 없음 → 시드 없음, 추적기 빈 상태.
- **ONE_SHOT(quick-dj) 종료**: 동일 경계 이벤트로 관측 — 특수 처리 불요.
- **연속 스킵 난사**: 곡마다 방출→시드가 순차 실행 — 각 곡 1구획.
- **채팅 circular buffer 캡**: 구획도 밀려나면 소실 — ephemeral 채팅과 일관(의도).
- **경계 직전 반응 레이스**: 최종 수치 1~2 오차 가능 — 수용(§1).
- **L4 잔여 마이크로 레이스(수용)**: reactivated 리싱크 창에서 새 곡이 먼저 시드된 뒤 도착한 stale setup의 곡이 *스킵으로 조기 종료*된 경우 — 그 endTime은 아직 미래라 L4를 통과해 신선한 스냅샷을 교체, 구획 1개 오표기 가능. "리싱크 창 + 그 안의 스킵" 이중 우연으로 확률 극저 — §1 수용 트레이드오프와 동급.

## 6. 테스트 전략

- **유닛(vitest)**: 추적기 순수 모듈 — 시드①(로컬 expectedEnd 계산)/시드②(setup·불일치 폐기·동일 identity counts 덮기 L3·stale 무시 L4)/갱신/방출 1회성(이중 DEACTIVATE)/스킵 판정 경계(±5s)/빈 상태 방출 no-op/방 enter·disconnect clear(L1·L2)/event.id 중복 무시(L5)/h:mm:ss 파싱·파싱 실패 fail-safe(L7).
- **e2e(Playwright) 1본**: 짧은 곡 등록→재생→스킵 → 채팅 패널에 구획 렌더 + `⏭` 표기 assert. 텍스트 단언은 testid 기반(영어 렌더 함정 회피). 스킵 경로 = 데스크탑 DJ 다이얼로그의 `dj-skip-button`(MODERATOR 이상 — 방 생성 호스트로 충족) → **confirm 다이얼로그 수락 단계 포함**. 데스크탑 프로젝트 전제(모바일엔 스킵 버튼 없음).
- **로컬 미리보기 게이트(확정 결정 7)**: 완료·스킵 두 케이스 × 데스크탑·모바일 스크린샷 → 사용자 디자인 컨펌 → PR.

## 7. Out of scope

- 시작 구획 (결정 2로 제외).
- 청취자 수·평균/최대 동시청취 등 서버 집계 통계 (결정 1로 제외 — 필요 시 백엔드 집계와 함께 후속).
- 백엔드 종료사유(COMPLETED/SKIPPED) 필드 — 휴리스틱 오분류가 실고통으로 확인될 때 승급.
- 구획 히스토리 영속화 (채팅 자체가 ephemeral).
- 어드민 행동분석(#325 계열)과의 연동 — 별개 시스템.

## 8. 오픈 결정

없음 — planning-ready.
