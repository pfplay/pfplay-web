# Amplitude Event Taxonomy Design

## Context

PFPlay는 파티룸 기반 음악 스트리밍 서비스다. Amplitude를 도입하여 두 가지 핵심 질문에 답하고자 한다:

1. **리텐션**: 사용자가 서비스에 더 오래 머무르게 하는 요인은 무엇인가?
2. **전환**: 일반 참여자가 적극적 참여자(파티룸 생성자)로 이어지는 요인은 무엇인가?

## Constraints

- 프론트엔드(Next.js)에서만 이벤트 전송. Amplitude Browser SDK 사용.
- 백엔드 변경 없음. WebSocket으로 수신하는 이벤트도 프론트에서 캡처.
- 퍼널 중심 설계: 목표에 직결되는 이벤트만 추적. 필요 시 추후 확장.

## 1. Funnel Definitions

### Funnel 1: Retention (서비스 체류 요인)

추적 이벤트:

```
Session Started → Partyroom Entered → Playback Reacted / Chat Message Sent → Partyroom Exited (duration_sec)
```

체류 시간(`duration_sec`)과 재방문(D1/D7)은 Amplitude Retention Analysis로 분석한다. 별도 이벤트가 아닌 분석 구성이다.

검증할 가설:

- 리액션/채팅/DJ 참여 중 어떤 행동이 체류 시간과 가장 강한 상관관계를 갖는가?
- 첫 세션에서 특정 행동을 한 사용자의 D1/D7 리텐션이 더 높은가?

### Funnel 2: Conversion (일반 참여자 → 파티룸 생성자)

```
Partyroom Entered → Playlist Created → Track Added → DJ Registered → Partyroom Created
```

검증할 가설:

- DJ 경험이 파티룸 생성 전환에 영향을 미치는가?
- 플레이리스트 준비도(트랙 수)와 전환율 사이에 관계가 있는가?
- 파티룸 생성자는 생성 전에 어떤 행동 패턴을 보이는가?

## 2. Event Catalog

네이밍 컨벤션: `Object Action` (Amplitude 권장 과거형 패턴)

### Session & Auth (3 events)

| #   | Event Name        | Trigger                        | Properties                                            |
| --- | ----------------- | ------------------------------ | ----------------------------------------------------- |
| 1   | `Session Started` | 앱 로드 시                     | `auth_type`: guest/member, `authority_tier`: GT/AM/FM |
| 2   | `User Signed Up`  | OAuth 가입 완료                | `provider`: google/twitter                            |
| 3   | `User Signed In`  | 로그인 완료 (게스트/멤버 공통) | `auth_type`: guest/member                             |

### Funnel 1: Retention (7 events)

| #      | Event Name               | Trigger                          | Properties                                                                                 |
| ------ | ------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------ |
| 4      | `Partyroom List Viewed`  | 파티룸 목록 페이지 진입          | `partyroom_count`: 표시된 파티룸 수                                                        |
| 5      | `Partyroom Entered`      | 파티룸 입장 완료                 | `partyroom_id`, `stage_type`: main/general, `crew_count`, `entry_source`: list/link/direct |
| 6      | `Partyroom Exited`       | 파티룸 퇴장                      | `partyroom_id`, `duration_sec`: 체류 시간(초)                                              |
| 7      | `Playback Reacted`       | 좋아요/싫어요/그랩 클릭          | `partyroom_id`, `reaction_type`: like/dislike/grab                                         |
| 8      | `Chat Message Sent`      | 채팅 메시지 전송                 | `partyroom_id`                                                                             |
| 9      | `Track Playback Started` | 새 곡 재생 시작 (WebSocket 수신) | `partyroom_id`, `track_id`                                                                 |
| ~~10~~ | ~~`Profile Viewed`~~     | ~~다른 크루 프로필 조회~~        | ~~`partyroom_id`, `target_crew_id`~~                                                       |

> **제외 사유**: 프로필 조회 UI(모달/카드)가 미구현 상태. 크루 목록에는 mute/kick/ban 메뉴만 존재. 프로필 기능 구현 후 재추가 예정.

### Funnel 2: Conversion (7 events)

| #   | Event Name          | Trigger           | Properties                                                        |
| --- | ------------------- | ----------------- | ----------------------------------------------------------------- |
| 11  | `Playlist Created`  | 플레이리스트 생성 | `playlist_id`                                                     |
| 12  | `Track Added`       | 트랙 추가         | `playlist_id`, `track_id`, `source`: search/grab                  |
| 13  | `Music Searched`    | 음악 검색 실행    | `query`                                                           |
| 14  | `DJ Registered`     | DJ 대기열 등록    | `partyroom_id`, `playlist_id`                                     |
| 15  | `DJ Deregistered`   | DJ 대기열 해제    | `partyroom_id`, `reason`: self/admin                              |
| 16  | `DJ Turn Started`   | 내 차례 재생 시작 | `partyroom_id`, `track_id`                                        |
| 17  | `Partyroom Created` | 파티룸 생성 완료  | `partyroom_id`, `stage_type`: main/general, `playback_time_limit` |

### Profile & Onboarding (2 events)

| #   | Event Name       | Trigger          | Properties |
| --- | ---------------- | ---------------- | ---------- |
| 18  | `Avatar Changed` | 아바타 변경      | -          |
| 19  | `Bio Updated`    | 닉네임/소개 변경 | -          |

**총 18개 이벤트.** (Profile Viewed 제외 — 프로필 UI 미구현)

## 3. User Properties

이벤트와 별도로 사용자에게 설정하는 속성. 코호트 분석과 세그먼트에 활용한다.

| Property                     | Set Timing           | Operation  | Example             |
| ---------------------------- | -------------------- | ---------- | ------------------- |
| `auth_type`                  | 로그인 시            | `set`      | `guest`, `member`   |
| `authority_tier`             | 로그인/가입 시       | `set`      | `GT`, `AM`, `FM`    |
| `oauth_provider`             | OAuth 가입 시        | `set`      | `google`, `twitter` |
| `total_playlists`            | 플레이리스트 생성 시 | `add` (+1) | `3`                 |
| `total_dj_sessions`          | DJ 턴 시작 시        | `add` (+1) | `5`                 |
| `has_created_partyroom`      | 파티룸 생성 시       | `setOnce`  | `true`              |
| `first_partyroom_entered_at` | 첫 파티룸 입장 시    | `setOnce`  | ISO timestamp       |

## 4. Dashboard Design

### Chart 1: Retention Curve

- **Type**: Retention Analysis
- **Starting Event**: `Partyroom Entered`
- **Return Event**: `Partyroom Entered`
- **Group By**: `auth_type` (guest vs member)
- **Period**: D1, D7, D14, D30
- **Question**: 게스트와 멤버의 재방문율 차이는?

### Chart 2: Retention by First Action

- **Type**: Retention Analysis
- **Starting Events**: `Playback Reacted` / `Chat Message Sent` / `DJ Registered` (각각 비교)
- **Return Event**: `Session Started`
- **Question**: 어떤 첫 세션 행동이 재방문과 가장 강한 상관관계를 갖는가?

### Chart 3: Session Duration by Interaction

- **Type**: Event Segmentation
- **Event**: `Partyroom Exited`
- **Measure**: `duration_sec` 평균
- **Segment**: Behavioral Cohort A = "같은 세션에서 `Playback Reacted` 또는 `Chat Message Sent`를 1회 이상 수행한 사용자" vs Cohort B = 나머지
- **Question**: 인터랙션을 한 사용자가 실제로 더 오래 머무는가?

### Chart 4: Conversion Funnel

- **Type**: Funnel Analysis
- **Steps**: `Partyroom Entered` → `Playlist Created` → `Track Added` → `DJ Registered` → `Partyroom Created`
- **Window**: 30 days
- **Question**: 각 단계별 이탈율은? 어디서 가장 많이 빠지는가?

### Chart 5: Creator Behavior Pattern

- **Type**: Event Segmentation (Bar Chart, 이벤트별 사용자당 평균 횟수)
- **Events**: `Partyroom Entered`, `Playback Reacted`, `Chat Message Sent`, `DJ Registered`, `DJ Turn Started`, `Track Added`, `Playlist Created`
- **Segment**: `has_created_partyroom` = true vs false
- **Time Range**: `Partyroom Created` 이전 30일
- **Question**: 파티룸 생성자는 생성 전에 어떤 행동을 더 많이 했는가?

### Chart 6: DJ Experience → Partyroom Creation

- **Type**: Event Segmentation (Conversion Rate)
- **Event**: `Partyroom Created`
- **Segment**: Behavioral Cohort A = "`DJ Turn Started`를 1회 이상 수행한 사용자" vs Cohort B = 나머지
- **Period**: 전체 기간
- **Question**: DJ 경험자의 파티룸 생성 전환율은 미경험자보다 높은가?

## 5. Implementation Notes (Original)

### SDK Integration (Next.js)

- `@amplitude/analytics-browser` SDK 사용
- 앱 초기화 시 `amplitude.init(API_KEY)` 호출
- 사용자 식별: OAuth 사용자는 `userId`로 식별, 게스트는 Amplitude 자동 `deviceId`

### User Identification (identify 호출 시점)

```
amplitude.setUserId(userId)     — 로그인 성공 시 (OAuth/게스트 공통)
amplitude.identify(identify)    — 아래 시점에서 User Property 설정:
  - 로그인 시: auth_type, authority_tier, oauth_provider
  - 플레이리스트 생성 시: total_playlists (add +1)
  - DJ 턴 시작 시: total_dj_sessions (add +1)
  - 파티룸 생성 시: has_created_partyroom (setOnce true)
  - 첫 파티룸 입장 시: first_partyroom_entered_at (setOnce)
```

### authority_tier 값 매핑

JWT 토큰 또는 `/api/v1/users/me/info` 응답의 `authorityTier` 필드로부터 매핑:

- `GT` = Guest (게스트, 비회원)
- `AM` = Associate Member (연동 회원)
- `FM` = Full Member (정회원)

### Event Timing

- `Session Started`: root layout에서 1회 발행
- `Partyroom Entered`/`Exited`: 파티룸 컴포넌트 mount/unmount 시
- `Track Playback Started`: WebSocket `playback_started` 메시지 수신 시
- `DJ Turn Started`: WebSocket `playback_started` 수신 시 `currentDjCrewId`가 내 crewId인 경우

### duration_sec 측정

- 파티룸 입장 시 `Date.now()`를 React ref에 저장
- 퇴장 시 (unmount, exit 버튼) `(Date.now() - startTime) / 1000`으로 계산
- 탭 닫기/새로고침 대응: `beforeunload` 이벤트에서 `Partyroom Exited` 전송
- `visibilitychange`로 백그라운드 전환 시에도 전송 시도
- 데이터 유실 가능성을 수용한다 (완벽한 측정보다 트렌드 파악이 목적)

### Privacy

- `query` (검색어)는 PII가 아니지만, 필요 시 해싱 처리 가능
- `Chat Message Sent`는 메시지 내용을 포함하지 않음 (발생 여부만 추적)

## 6. Technical Review (2026-04-04)

### 코드베이스 매핑

각 이벤트의 트리거 포인트와 데이터 가용성을 확인했다.

#### Session & Auth

| Event             | Trigger Point                                                                                                    | 비고                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `Session Started` | root layout에 client 래퍼 컴포넌트 추가 (`useEffect` 1회)                                                        | root layout이 RSC이므로 별도 client 컴포넌트 필요    |
| `User Signed Up`  | `features/sign-in/by-social/lib/use-social-sign-in-callback.hook.tsx` — `callbackLogin()` 성공 후                | provider는 `OAuth2Provider` 타입에서 획득            |
| `User Signed In`  | 게스트: `features/sign-in/by-guest/lib/use-sign-in.hook.tsx`, `use-auto-sign-in.hook.ts` / OAuth: 위와 동일 경로 | 게스트 진입 경로가 2개 (명시적 로그인 + 자동 로그인) |

#### Retention

| Event                    | Trigger Point                                                                                       | 비고                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `Partyroom List Viewed`  | `app/parties/(lobby)/page.tsx` → `PartyroomList` mount 시                                           | `partyroom_count`는 query 응답 배열 길이       |
| `Partyroom Entered`      | `features/partyroom/enter/lib/use-enter-partyroom.ts` — `setup()` 성공 후                           | `entry_source` 추가 구현 필요 (아래 참고)      |
| `Partyroom Exited`       | `features/partyroom/exit/lib/use-exit-partyroom.ts` + `beforeunload` 핸들러                         | `duration_sec` 추가 구현 필요 (아래 참고)      |
| `Playback Reacted`       | `widgets/partyroom-display-board/ui/parts/action-buttons.component.tsx` — like/dislike/grab onClick | `reaction_type`은 `ReactionType` enum에서 획득 |
| `Chat Message Sent`      | `features/partyroom/send-chat-message/ui/send-chat-message.component.tsx`                           | `partyroom_id`는 store에서 획득                |
| `Track Playback Started` | `entities/partyroom-client/lib/handle-subscription-event.ts` — `PLAYBACK_STARTED` 콜백              | `track_id` = `event.playback.linkId`           |

#### Conversion

| Event               | Trigger Point                                                                              | 비고                                          |
| ------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `Playlist Created`  | `features/playlist/add/api/use-create-playlist.mutation.ts` onSuccess                      | 응답에 `id` 포함                              |
| `Track Added`       | `features/playlist/add-tracks/api/use-add-playlist-track.mutation.ts` onSuccess            | `source`는 호출 경로로 구분 (search vs grab)  |
| `Music Searched`    | `features/playlist/add-tracks/api/use-search-musics.query.ts`                              | `query`는 파라미터에서 직접 획득              |
| `DJ Registered`     | `widgets/partyroom-djing-dialog/api/use-register-me-to-queue.mutation.ts` onSuccess        | `playlist_id` 요청에 포함                     |
| `DJ Deregistered`   | `widgets/partyroom-djing-dialog/api/use-unregister-me-from-queue.mutation.ts` onSuccess    | `reason` 추가 구현 필요 (아래 참고)           |
| `DJ Turn Started`   | `entities/partyroom-client/lib/subscription-callbacks/use-playback-start-callback.hook.ts` | `event.crewId === myCrewId` 비교              |
| `Partyroom Created` | `features/partyroom/create/api/use-create-partyroom.mutation.ts` onSuccess                 | `stage_type`은 응답에서 재조회 필요할 수 있음 |

#### Profile & Onboarding

| Event            | Trigger Point                                                                  | 비고 |
| ---------------- | ------------------------------------------------------------------------------ | ---- |
| `Avatar Changed` | `features/edit-profile-avatar/api/use-update-my-walllet.mutation.ts` onSuccess | —    |
| `Bio Updated`    | `features/edit-profile-bio/api/use-update-my-bio.mutation.ts` onSuccess        | —    |

### User Properties 데이터 가용성

| Property                     | 소스                                               | 확인 |
| ---------------------------- | -------------------------------------------------- | ---- |
| `auth_type`                  | `useIsGuest()` 훅 + `AuthorityTier` enum           | ✓    |
| `authority_tier`             | `GetMyInfoResponse.authorityTier` (FM/AM/GT)       | ✓    |
| `oauth_provider`             | `OAuth2Provider` 타입 (google/twitter)             | ✓    |
| `total_playlists`            | 플레이리스트 생성 mutation onSuccess에서 `add(+1)` | ✓    |
| `total_dj_sessions`          | DJ 턴 시작 콜백에서 `add(+1)`                      | ✓    |
| `has_created_partyroom`      | 파티룸 생성 mutation onSuccess에서 `setOnce`       | ✓    |
| `first_partyroom_entered_at` | 파티룸 입장 시 `setOnce`                           | ✓    |

### 추가 구현 필요 항목

#### 1. `entry_source` (Partyroom Entered)

파티룸 진입 경로를 구분하는 로직이 없다. 방안:

- 파티룸 목록에서 진입 시 query param `?source=list` 부여
- 공유 링크 진입 시 `?source=link`
- 그 외(직접 URL 입력)는 `direct`로 폴백

#### 2. `duration_sec` (Partyroom Exited)

체류 시간 측정 로직이 없다. 구현:

- 파티룸 layout mount 시 `useRef(Date.now())` 저장
- exit/beforeunload/visibilitychange 시 `(Date.now() - startTime) / 1000` 계산
- 문서 §5 Implementation Notes에 이미 명시된 방식

#### 3. `reason` (DJ Deregistered)

API에 self/admin 구분값이 없다. 그러나 코드 경로가 이미 분리되어 있으므로:

- 자발적 해제: `useUnregisterMeFromQueue` → `reason: "self"` 하드코딩
- 관리자 강제 해제: `features/partyroom/delete-dj-from-queue/` → `reason: "admin"` 하드코딩

### 제외 항목

| Event            | 사유                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `Profile Viewed` | 프로필 조회 UI(모달/카드) 미구현. 크루 목록에는 mute/kick/ban 메뉴만 존재. 프로필 기능 개발 후 재추가. |

### QA Checklist

이벤트 구현 후 Amplitude Debug Mode에서 다음 시나리오를 검증:

1. 게스트 로그인 → `User Signed In` (auth_type=guest) + `Session Started` 확인
2. OAuth 가입 → `User Signed Up` (provider) + User Property 설정 확인
3. 파티룸 입장 → 체류 → 퇴장 → `Partyroom Entered`, `Partyroom Exited` (duration_sec > 0) 확인
4. 리액션/채팅 → `Playback Reacted`, `Chat Message Sent` 확인
5. 플레이리스트 생성 → 트랙 추가 → DJ 등록 → `Playlist Created`, `Track Added`, `DJ Registered` 확인
6. 파티룸 생성 → `Partyroom Created` + `has_created_partyroom` User Property 확인
7. 탭 닫기 → `beforeunload`에서 `Partyroom Exited` 전송 확인
