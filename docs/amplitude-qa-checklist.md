# Amplitude QA Checklist

설계 문서: [`2026-04-04-event-taxonomy-design.md`](./2026-04-04-event-taxonomy-design.md)

이 체크리스트는 PR-1~4 머지 후 staging 환경에서 한 번 돌려서 18개 이벤트 + 7개 user property가 모두 의도대로 송신되는지 검증하기 위한 시나리오 모음이다.

## 사전 준비

1. `.env.local` 또는 Vercel preview env에 `NEXT_PUBLIC_AMPLITUDE_API_KEY=<STAGING_KEY>` 주입 + dev 서버 재시작.
2. Amplitude 대시보드 → 우측 상단 **User Look-Up** 또는 **Event Stream** 열기.
3. 브라우저 DevTools → Network 탭 필터 `amplitude`, Application 탭 → Local Storage 도 함께 확인 가능하게.
4. 각 시나리오 시작 전 Local Storage `pfp_amplitude_*` 키를 의도적으로 클리어해야 하는 경우 별도 표기.

## 검증 시나리오

### S1. 익명 첫 진입 + Session Started

- **사전**: Local Storage 모두 클리어 + 시크릿 창
- **동작**: `https://localhost:3000` 진입
- **기대 이벤트**: `Session Started` (auth context 없을 수 있음)
- **기대 user property**: 없음 (아직 로그인 전)
- **PASS 기준**: Network에 `api2.amplitude.com/2/httpapi` POST 1건, payload에 `event_type: "Session Started"` 포함

### S2. 게스트 명시 로그인

- **사전**: S1에서 이어서, 로그인 다이얼로그까지 진입
- **동작**: "게스트로 시작" 클릭
- **기대 이벤트**: `User Signed In` (`auth_type: 'guest'`)
- **기대 user property**: `auth_type='guest'`, `authority_tier='GT'` (`/me` 캐시 populate 후 AnalyticsProvider observer가 자동 부착)
- **PASS 기준**: Amplitude → User Look-Up에서 본인 deviceId의 user property 패널에 위 2개 값 확인

### S3. 게스트 자동 로그인 (공유 링크 진입)

- **사전**: 시크릿 창에서 비로그인 상태로 시작
- **동작**: 공유 링크 (`/link/{domain}`) 진입 → 백엔드가 401 → `useAutoSignIn`이 게스트 세션 생성
- **기대 이벤트 순서**: `Session Started` → (자동 로그인) → `User Signed In(auth_type=guest)` → 라우팅 후 `Partyroom Entered(entry_source=link)`

### S4. OAuth 신규 가입

- **사전**: Local Storage `pfp_amplitude_seen_uids` 키 삭제(또는 시크릿 창)
- **동작**: 로그인 페이지 → Google OAuth → 콜백 처리
- **기대 이벤트**: `User Signed Up(provider='google')` + `User Signed In(auth_type='member')`
- **기대 user property**: `auth_type='member'`, `authority_tier`(FM/AM 중 하나), `oauth_provider='google'`
- **PASS 기준**: 두 이벤트가 동시에 보이고 user property에 oauth_provider 부착

### S5. OAuth 재로그인 (기존 계정)

- **사전**: S4 직후, Local Storage `pfp_amplitude_seen_uids`에 이미 UID가 들어있는 상태에서 sign-out 후 재로그인
- **동작**: sign-out → 같은 OAuth 계정으로 다시 로그인
- **기대 이벤트**: `User Signed In` 만 발행. `User Signed Up`은 발행되지 않아야 함.
- **PASS 기준**: Event Stream에 `User Signed Up`이 보이지 않음

### S6. 파티룸 목록 조회

- **사전**: 로그인 상태로 `/parties` 진입
- **기대 이벤트**: `Partyroom List Viewed(partyroom_count: <number>)`
- **PASS 기준**: 페이지 이동/refetch와 무관하게 mount당 1회만 발행 (refetch 시 중복 발행 X)

### S7. 파티룸 입장 — 로비 카드 클릭

- **사전**: `/parties` 진입 후
- **동작**: 일반 파티룸 카드 또는 메인 카드 클릭
- **기대 URL**: `/parties/{id}?source=list`
- **기대 이벤트**: `Partyroom Entered(partyroom_id, crew_count, entry_source='list', stage_type='main' or 'general')`
- **PASS 기준**: stage_type 필드 부착 (lobby cache hit). 첫 입장이면 `first_partyroom_entered_at` user property setOnce 도 확인.

### S8. 파티룸 입장 — 공유 링크

- **사전**: 로그인 상태에서 `/link/{domain}` 진입
- **기대 URL**: `/parties/{id}?source=link`
- **기대 이벤트**: `Partyroom Entered(entry_source='link')`. stage_type은 누락될 수 있음 (lobby 미방문 시).
- **PASS 기준**: entry_source가 'link', 이벤트는 정상 발행

### S9. 파티룸 입장 — 직접 URL

- **사전**: 주소창에 직접 `/parties/{id}` 입력 (쿼리 없음)
- **기대 이벤트**: `Partyroom Entered(entry_source='direct')`

### S10. 체류 후 자발적 퇴장

- **사전**: S7~S9 중 하나로 입장한 상태
- **동작**: 5초 이상 체류 후 exit 버튼 또는 다른 페이지로 navigation
- **기대 이벤트**: `Partyroom Exited(partyroom_id, duration_sec >= 5)`
- **PASS 기준**: duration_sec이 정수(반올림)로 표시되고 0 초과

### S11. 탭 닫기 (beforeunload)

- **사전**: 파티룸 입장 상태
- **동작**: 브라우저 탭 닫기
- **기대 이벤트**: `Partyroom Exited` 송신 (Network preserve log 옵션 켜고 확인)
- **참고**: 모바일 Safari에서는 누락될 수 있음 (Known Limitation L2)

### S12. 리액션 — Like / Dislike / Grab

- **동작**: 파티룸 내 좋아요/싫어요/그랩 버튼 각각 클릭
- **기대 이벤트**: `Playback Reacted(partyroom_id, reaction_type)` 각 클릭당 1회. reaction_type은 lowercase (`like`/`dislike`/`grab`).
- **PASS 기준**: 3종 모두 정상

### S13. 채팅 메시지 송신

- **동작**: 채팅창에 입력 후 전송
- **기대 이벤트**: `Chat Message Sent(partyroom_id)`
- **PASS 기준**: 메시지 본문은 포함되지 않음 (privacy)

### S14. 새 곡 재생 시작 (WebSocket 수신)

- **사전**: 파티룸 내 DJ가 곡 재생 시작 시점 (또는 자신이 DJ)
- **기대 이벤트**:
  - 모든 사용자: `Track Playback Started(partyroom_id, track_id)`
  - 본인이 현재 차례인 경우만: `DJ Turn Started(partyroom_id, track_id)` + user property `total_dj_sessions` +1
- **PASS 기준**: track_id가 YouTube videoId 형태 (예: `dQw4w9WgXcQ`)

### S15. 플레이리스트 생성

- **동작**: 새 플레이리스트 생성
- **기대 이벤트**: `Playlist Created(playlist_id)` + user property `total_playlists` +1
- **PASS 기준**: User Look-Up에서 total_playlists 카운트 증가

### S16. 음악 검색 + 트랙 추가

- **동작**: 음악 검색창에 키워드 입력 → 결과에서 곡 선택 → 플레이리스트에 추가
- **기대 이벤트**:
  - 디바운스 후 1회: `Music Searched(query)`
  - 추가 시: `Track Added(playlist_id, track_id, source='search')`
- **PASS 기준**: query 문자열이 그대로 송신, source는 `'search'`

### S17. DJ 등록 / 자발적 해제

- **동작**: DJ 대기열에 본인 등록 → 해제
- **기대 이벤트**: `DJ Registered(partyroom_id, playlist_id)` → `DJ Deregistered(partyroom_id, reason='self')`

### S18. DJ 관리자 강제 해제

- **사전**: 본인이 host 권한이거나 다른 사용자를 강제 해제할 수 있는 상태
- **동작**: 대기열에서 다른 DJ 강제 해제
- **기대 이벤트**: `DJ Deregistered(partyroom_id, reason='admin')`

### S19. 파티룸 생성

- **동작**: 새 파티룸 생성
- **기대 이벤트**: `Partyroom Created(partyroom_id, playback_time_limit)` + user property `has_created_partyroom: true` (setOnce)
- **PASS 기준**: stage_type 필드는 누락될 수 있음 (Known Limitation L1). user property는 처음 1회만 set, 재생성 시 재발행 X

### S20. 아바타 변경

- **동작**: 프로필 → 아바타 편집 → 저장
- **기대 이벤트**: `Avatar Changed`
- **PASS 기준**: 이벤트 properties는 비어 있음 (`{}`)

### S21. 닉네임/소개 변경

- **동작**: 프로필 편집 → 닉네임 또는 introduction 변경 → 저장
- **기대 이벤트**: `Bio Updated`
- **PASS 기준**: 이벤트 properties는 비어 있음

### S22. Sign-out → 다음 방문

- **동작**: 로그아웃 → 페이지 자동 reload → Session Started 다시 발행되는지 확인
- **기대 결과**:
  - `setUserId(null)`이 호출되어 다음 이벤트들은 user_id 없이 송신됨 (Amplitude User Look-Up에서 deviceId 기반으로만 보임)
  - 다음 방문 시 `Session Started` 정상 발행
  - localStorage `pfp_amplitude_seen_uids` 와 `pfp_amplitude_first_partyroom_entered_at_marked`는 유지됨 (의도된 동작)

## User Property 종합 검증

각 시나리오 후 Amplitude → User Look-Up → 본인 user_id 검색 → "User Properties" 패널에서 다음 값들이 채워져 있는지 확인:

| Property                     | 기대 시점                 | 확인                   |
| ---------------------------- | ------------------------- | ---------------------- |
| `auth_type`                  | 로그인 후 (`/me` settle)  | `'guest'`/`'member'`   |
| `authority_tier`             | 로그인 후                 | `'FM'`/`'AM'`/`'GT'`   |
| `oauth_provider`             | OAuth 로그인 후           | `'google'`/`'twitter'` |
| `total_playlists`            | 플레이리스트 생성마다 +1  | 누적 카운트            |
| `total_dj_sessions`          | 본인 DJ 턴 시작마다 +1    | 누적 카운트            |
| `has_created_partyroom`      | 첫 파티룸 생성 시 setOnce | `true` (불변)          |
| `first_partyroom_entered_at` | 첫 파티룸 입장 시 setOnce | ISO 8601 timestamp     |

## 자주 부딪히는 이슈

- **Network에 amplitude 요청 X**: API key 미주입 → `.env.local` 또는 Vercel env 확인 + dev 서버 재시작
- **Schema rejection 에러 (403)**: Amplitude → Govern → Data 에서 이벤트 미등록일 수 있음. Project가 Data를 활성화한 경우 18개 이벤트와 7개 user property를 사전 등록 필요
- **이벤트가 늦게 보임**: Amplitude flush 주기상 5~30초 지연 가능. Live Stream보다 User Look-Up이 즉시성 떨어짐
- **`User Signed Up` 중복 의심**: Local Storage `pfp_amplitude_seen_uids` 확인. 시크릿 창/캐시 클리어 후 재로그인하면 의도적으로 1회 더 발행됨
- **`duration_sec` 정확도 의심**: 모바일 Safari는 알려진 한계 (L2)
