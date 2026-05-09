# Backend 협업 요청 — Amplitude 분석 정확도 향상

작성일: 2026-05-02
관련 문서: [`2026-04-04-event-taxonomy-design.md`](./2026-04-04-event-taxonomy-design.md) §7 (Known Limitations)
관련 PR: pfplay-web `feat/amplitude-foundation` (4 commits, development 대비 ahead)

## 배경

pfplay-web에 Amplitude 이벤트 택소노미(18 events + 7 user properties)를 도입했습니다. 코드 리뷰와 spec 문서화 과정에서, 현재 backend 응답만으로는 분석 데이터의 **정확도** 또는 **수신율**이 제한되는 4건이 식별됐습니다.

이 문서는 그 4건을 backend 측에 전달하기 위한 것입니다. 모두 **이미 ship한 분석 기능을 부분 동작에서 완전 동작으로** 끌어올리는 개선이며, 어떤 것도 신규 client 의존성을 만들지 않습니다 (모두 기존 응답 객체에 필드 추가 / 동작 멱등화).

각 항목은 독립적으로 처리 가능하며 우선순위는 ROI 기준으로 정렬했습니다. 일정 / 리소스 사정 따라 일부만 채택 가능합니다.

---

## L1. `stageType` 필드를 partyroom setup 응답에 추가

**우선순위: 높음** — 분석 정확도 직접 향상

### 현재 상황

- `Partyroom Entered` 이벤트의 `stage_type` 프로퍼티는 main / general 구분.
- 현재 client는 lobby 목록 캐시(`GET /v1/partyrooms`)에서 `stageType`을 추출.
- 결과: lobby를 거치지 않고 들어온 사용자(공유 링크, 직접 URL)는 `stage_type` **누락**.

### 영향

- Amplitude Chart 1 (Retention by stage) 코호트 비교가 lobby 진입자에 편향.
- `stage_type` 필터 사용 시 link/direct 진입 표본 손실.

### 요청

`GET /v1/partyrooms/{partyroomId}/setup` 응답에 `stageType` 필드 추가.

```diff
GET /v1/partyrooms/{partyroomId}/setup

Response 200 (GetSetUpInfoResponse):
{
+  "stageType": "MAIN" | "GENERAL",
   "crews": [...],
   "display": { ... }
}
```

대안: `GET /v1/partyrooms/{partyroomId}/summary` 응답(`PartyroomDetailSummary`)에 추가하는 것도 가능 — 어느 쪽이 backend domain 모델에 자연스러운지는 backend 판단 위임.

### 예상 작업량

- DTO 1개 필드 + service에서 매핑: 30분
- API 문서(Swagger) 갱신: 5분
- 백엔드 테스트: 15분
- **총 약 1시간**

### Client 측 후속

`use-enter-partyroom.ts`에서 lobby 캐시 lookup 제거 → 응답 필드 직접 사용. 5분 작업.

---

## L4. `isNewUser` 플래그를 OAuth 토큰 교환 응답에 추가

**우선순위: 높음** — `User Signed Up` 이벤트의 절대값 정확도 직결

### 현재 상황

- `User Signed Up` 이벤트는 OAuth 가입 시점에 1회 발화돼야 함 (재로그인은 `User Signed In`).
- backend가 "이번 로그인이 가입인지 재로그인인지" 시그널을 주지 않아, client는 localStorage(`pfp_amplitude_seen_uids`)에 본 적 있는 UID를 캐시해 추론.
- 한계:
  - 시크릿 모드 / 브라우저 cache clear → 재로그인이 가입으로 잘못 카운트
  - 멀티 디바이스 → 디바이스 A에서 가입한 사용자가 디바이스 B에서 처음 로그인하면 그 디바이스에서 또 가입 카운트
  - 분석 trend는 신뢰 가능하지만 **절대값 부정확**

### 영향

- Funnel 1 Step 1 정확도
- Amplitude Conversion Funnel "OAuth 가입 → 첫 파티룸 입장" 비율 신뢰성
- Cross-device user journey 분석 불가

### 요청

`POST /v1/auth/oauth/callback` 응답에 `isNewUser: boolean` 필드 추가.

```diff
POST /v1/auth/oauth/callback

Request body: { provider, code, codeVerifier, state }

Response 200 (TokenExchangeResponse):
{
   "tokenType": "...",
   "expiresIn": 3600,
   "issuedAt": "...",
+  "isNewUser": true | false
}
```

판정 기준은 backend 위임. 일반적으로:

- `true`: 이번 호출에서 user 레코드를 신규 INSERT한 경우
- `false`: 기존 user 레코드의 토큰만 갱신한 경우

### 예상 작업량

- TokenExchangeResponse DTO 1개 필드 + service 분기: 30분
- 통합 테스트 1건: 30분
- **총 약 1시간**

### Client 측 후속

`use-social-sign-in-callback.hook.tsx`의 `trackSignedUpIfFirstTime` 호출을 백엔드 플래그 기반으로 단순화. localStorage 휴리스틱 + `auth-tracking.ts`의 seen-UID 코드 제거 가능. 약 30분.

---

## L2. partyroom exit API 멱등성 보장

**우선순위: 중** — 모바일 환경 데이터 수신율 향상

### 현재 상황

- `Partyroom Exited` 이벤트는 자발적 exit + `beforeunload` (탭 닫기) 두 채널에서 발화.
- 모바일 Safari, 일부 Android Chrome에서 `beforeunload`는 신뢰성이 낮음 → tab kill 시 종종 미실행.
- 더 신뢰성 높은 `pagehide`/`visibilitychange='hidden'` 리스너를 추가하고 싶지만, 현재 `DELETE /v1/partyrooms/{id}/crews/me` API가 멱등하지 않을 가능성이 있어 중복 호출 시 backend 에러 위험으로 보류 중.

### 영향

- 모바일 사용자의 `duration_sec` 데이터 결손
- Amplitude Chart 3 (Session Duration by Interaction) 모바일 코호트 정확도 저하

### 요청

`DELETE /v1/partyrooms/{partyroomId}/crews/me`가 멱등하게 동작하도록 보장. 즉:

- 첫 호출 → 정상 exit 처리, 200 응답
- 후속 동일 호출 → 이미 exit된 상태이므로 변경 없이 200 응답 (또는 명시적 204). **404 / 409 / 500 미반환**.

이미 멱등하게 동작 중인지 검증만 해주셔도 충분합니다.

### 예상 작업량

- 현재 동작 검증: 15분
- 미멱등이면 service 레이어에서 "이미 exit된 crew는 no-op" 로직 추가: 30분
- 테스트 1건: 15분
- **총 약 30분 ~ 1시간**

### Client 측 후속

`app/parties/(room)/[id]/layout.tsx`에 `pagehide` 리스너 추가. 약 15분.

---

## L5. GRAB 리액션 응답에 추가된 트랙 정보 포함

**우선순위: 낮음** — 분석 가시성 부분 향상 (대안 메트릭 존재)

### 현재 상황

- 사용자의 GRAB 리액션은 server-side에서 자동으로 사용자 플레이리스트에 트랙 추가.
- 현재 client는 `Track Added(source='grab')` 이벤트를 발화하지 않음 — 추가된 trackId / playlistId를 응답에서 받지 못하기 때문.
- 차선책: GRAB 행동 자체는 `Playback Reacted(reaction_type='grab')`로 캡처되므로 funnel에 빈 구멍은 없음.

### 영향

- Conversion Funnel의 "그랩 → 트랙 추가" 단계 가시성 부족
- Track Added 절대 카운트가 search 경로만 반영 (실제로는 grab 비중도 클 가능성)

### 요청

`POST /v1/partyrooms/{partyroomId}/playbacks/reaction` 응답에서 GRAB 타입일 때 추가된 트랙 정보를 함께 반환.

```diff
POST /v1/partyrooms/{partyroomId}/playbacks/reaction
Body: { reactionType: "GRAB" }

Response 200 (ReactionResponse):
{
   "isLiked": false,
   "isDisliked": false,
   "isGrabbed": true,
+  "addedTrack": { "trackId": 12345, "playlistId": 67 } | null
}
```

LIKE/DISLIKE 응답에서는 `addedTrack: null` 또는 필드 생략.

### 예상 작업량

- ReactionResponse DTO 확장: 15분
- service 레이어에서 GRAB 분기 시 추가된 entity 정보 반환: 30분
- 테스트 갱신: 30분
- **총 약 1.5시간**

### Client 측 후속

`use-grab-current-playback.mutation.ts` onSuccess에 `track('Track Added', { source: 'grab', ... })` 추가. 약 15분.

---

## 요약

| ID  | 항목                       | Backend 작업량 | Client 후속 | 우선순위 | 분석 효과                |
| --- | -------------------------- | -------------: | ----------: | -------- | ------------------------ |
| L1  | setup 응답 stageType 추가  |             1h |          5m | 높음     | stage_type 100% coverage |
| L4  | OAuth 응답 isNewUser 추가  |             1h |         30m | 높음     | User Signed Up 정확도    |
| L2  | exit API 멱등성 보장       |         0.5–1h |         15m | 중       | 모바일 데이터 수신율     |
| L5  | GRAB 응답에 트랙 정보 추가 |           1.5h |         15m | 낮음     | grab 경로 가시화         |

**전체 합계**: backend ~4–4.5h + client ~1h. 4건 모두 backwards-compatible (기존 응답에 필드 추가 또는 행동 보강만).

## 개별 진행 가능

각 항목은 독립적이며 순차/병렬 처리 모두 가능. 일부만 채택해도 client 측은 각각 별개 PR로 따라갈 수 있습니다.

## 문의

- Spec 또는 client 동작에 관한 질문은 `docs/2026-04-04-event-taxonomy-design.md` 참조 또는 frontend 담당자에게 문의.
- backend 응답 schema 결정 권한은 backend 팀에 있으며, 위 제안은 client 사용 패턴 기반의 권고입니다.
