# E2E 테스트 가이드

Playwright 기반 e2e 테스트. 데스크탑 시나리오 A~D + 재생 요약 + 모바일 project 로 파티룸 핵심
기능을 검증한다. 시나리오 선정 기준은 [`../docs/E2E_POLICY.md`](../docs/E2E_POLICY.md).

> 실사 기준: 2026-07-31.
> **먼저 읽을 것**: 아래 [실전 함정](#실전-함정-반복해서-당한-것들). 여기 적힌 4가지가
> 지금까지 e2e 디버깅 시간을 가장 많이 잡아먹은 원인이다.

---

## 디렉토리 구조

```
e2e/
├── .auth/                          # storageState 저장 위치 (gitignore)
│   ├── a-user1.json                # A 시나리오용 User1 (Full Crew / HOST) 인증 상태
│   ├── a-user2.json                # A 시나리오용 User2 (Associate Crew) 인증 상태
│   ├── b-user1.json                # B 시나리오용 User1 인증 상태
│   ├── b-user2.json                # B 시나리오용 User2 인증 상태
│   ├── c-user1.json                # C 시나리오용 User1 인증 상태
│   ├── c-user2.json                # C 시나리오용 User2 인증 상태
│   └── d-user1.json                # D 시나리오용 User1 인증 상태
├── auth/                           # 시나리오별 storageState 생성 로직
│   ├── setup.a.ts                  # A 시나리오용 인증 세션 저장
│   ├── setup.b.ts                  # B 시나리오용 인증 세션 저장
│   ├── setup.c.ts                  # C 시나리오용 인증 세션 저장
│   ├── setup.d.ts                  # D 시나리오용 인증 세션 저장
│   └── shared.ts                   # 공통 로그인/세션 생성 유틸
├── fixtures/                       # 테스트 전 반복 세팅을 재사용할 수 있게 추상화하는 전처리 레이어 (실행 전 필요한 것을 setup, 끝난 후 정리하는 tearup)
│   ├── ethereum-mock.ts            # window.ethereum mock (wagmi/RainbowKit 초기화용)
│   └── auth.fixtures.ts            # user1Context / user2Context Playwright fixture
├── helpers/                        # 파티룸/플레이리스트/DJ 등록 등 e2e 공용 동작
│   └── partyroom.helpers.ts        # 시나리오에 공통적으로 사용되는 helper 함수
│                                  # e.g. playlist 생성, DJ 등록, 파티룸 퇴장/종료
├── config/env.ts                   # e2e 환경변수 파싱 (E2E_BASE_URL 등)
├── e2e-a.partyroom-join-sync.spec.ts   # 파티룸 생성 + Late Join 상태 동기화
├── e2e-b.dj-state-machine.spec.ts      # DJ 상태 머신 + 다중 클라이언트 동기화
├── e2e-b.playback-summary.spec.ts      # 재생 종료 요약 채팅 구획
├── e2e-c.partyroom-moderation.spec.ts  # block / kick / ban moderation
├── e2e-d.profile-avatar-reaction-chat.spec.ts # avatar / reaction / chat
└── mobile/                         # 모바일 viewport(iPhone 13) 전용 project
    ├── display-board.tos.spec.ts   # YouTube 임베드 ToS 최소 크기 가드
    ├── dj-register.spec.ts · add-tracks.spec.ts
    ├── playlist-management.spec.ts · profile-onboarding.spec.ts · host-cta.spec.ts
    └── chunk4.helpers.ts · display-board.helpers.ts
```

Playwright project 는 `auth-a`~`auth-d`(세션 준비) + `e2e-a`~`e2e-d` + `mobile` 이다.
각 e2e project 는 대응하는 auth project 에만 의존하므로, 한 시나리오만 돌리면 그 시나리오의
세션만 생성된다.

---

## 실행 방법

### 0. 대상 서버 준비

**로컬에서 돌릴 때는 백엔드까지 포함한 풀스택이 떠 있어야 한다.** e2e 는 실제 API·WS 를 때린다.

```bash
# 1) 백엔드 풀스택 (pfplay-platform 레포에서)
docker compose -f docker-compose.local.yml -p pfplay-local --env-file .env.local up -d --build

# 2) 웹 dev 서버 — HTTP + webpack 으로 띄운다
npx next dev
```

> ⚠️ `yarn dev` 는 `next dev --experimental-https --turbo` 다. 로컬(특히 Windows)에서 이 조합은
> 자체 인증서·turbo 문제로 실패하는 경우가 있다. **e2e 용으로는 `npx next dev`(HTTP·webpack)를
> 쓰고, `E2E_BASE_URL` 을 `http://localhost:3000` 으로 넘긴다.**

### 1. 실행

```bash
# 전체 (auth project 가 먼저 돌며 세션을 만든다)
E2E_BASE_URL=http://localhost:3000 yarn test:e2e

# 특정 시나리오만
E2E_BASE_URL=http://localhost:3000 yarn test:e2e --project=e2e-b

# 브라우저를 보면서
E2E_BASE_URL=http://localhost:3000 yarn test:e2e:headed
```

`package.json` 에 정의된 e2e 스크립트는 **`test:e2e` 와 `test:e2e:headed` 둘 뿐**이다.
UI/디버그/리포트는 Playwright CLI 를 직접 쓴다.

```bash
npx playwright test --ui
npx playwright test --debug
npx playwright show-report
```

### 2. cold 실행 flake

로컬에서 처음 한 번은 Next 컴파일·백엔드 워밍 때문에 타임아웃이 날 수 있다.
**동일 조건으로 한 번 더(warm) 돌려보고 판단한다.** 두 번째도 같은 지점에서 실패하면 그때부터
진짜 원인을 찾는다.

---

## 환경 변수

| 변수           | 기본값                   | 설명                 |
| -------------- | ------------------------ | -------------------- |
| `E2E_BASE_URL` | `https://localhost:3000` | 테스트 대상 서버 URL |

CI에서는 `E2E_BASE_URL`을 별도로 설정하지 않아도 된다. `deployment_status` 이벤트가 발행될 때 Vercel이 `target_url`(방금 배포된 URL)을 직접 제공하고, workflow에서 이를 `E2E_BASE_URL`로 주입한다.

Vercel 프로젝트 설정에서 Preview 환경 변수로 아래를 추가해야 한다:

| 변수                           | 값     |
| ------------------------------ | ------ |
| `NEXT_PUBLIC_ENABLE_DEV_LOGIN` | `true` |

---

## 실전 함정 (반복해서 당한 것들)

### 1. 스펙 간 플레이리스트 오염 — `.first()` 로 고르지 말 것

여러 스펙이 **같은 e2e 계정을 공유**한다. 앞선 스펙이 만든 플레이리스트가 남아 있으면
`.first()` 로 고른 플레이리스트가 내 스펙의 것이 아닐 수 있다. 특히 **7분을 넘는 트랙이 섞이면
백엔드 재생 시간 제한이 그 트랙을 정상적으로 제거**하는데, 스펙 입장에서는 "이유 없이 큐가
비었다" 로 보인다.

- 플레이리스트·트랙은 **이름으로 선택**한다. 인덱스나 `.first()` 금지.
- 재생 검증용 트랙은 짧은 것을 고른다(`selectShortTracks` 계열 헬퍼).
- 이 원인은 "풀 스위트에서만 깨진다 → 부하 문제겠지" 로 두 번 오진한 뒤, 스펙 안에서 NET/WS 를
  계측해서야 확정됐다. **풀 스위트 전용 실패를 부하로 단정하지 말 것.**

### 2. force 클릭은 오버레이를 이기지 못한다 (#443)

`closeDjQueueDrawer` 헬퍼는 `click({ force: true })` 를 10초 동안 반복한다. force 는
**액션성 검사만 우회**할 뿐, 이벤트는 여전히 최상단 요소가 받는다. transition 중인 백드롭이나
React Query devtools 오버레이가 클릭을 계속 흡수하면 드로어는 끝내 닫히지 않는다(~50% 재현,
머신 부하 시 증폭).

- 대안: transition 완료를 기다린 뒤 일반 클릭, 실패 시 **`Escape` 폴백**(Headless UI Dialog 는
  ESC 로 닫힌다). `e2e-b.playback-summary.spec.ts` 가 이 우회 경로를 쓴다.
- 근본 수정은 [#443](https://github.com/pfplay/pfplay-web/issues/443) 으로 열려 있다.

### 3. 헬퍼는 UI 기본값에 취약하다

토글·아코디언을 "무조건 클릭" 하는 헬퍼는 그 UI 의 기본 상태가 바뀌는 순간 정반대로 동작한다
(크루 계급 그룹이 기본 접힘 → 기본 펼침으로 바뀌면서 kick/ban 스펙이 깨진 사례).
**상태를 읽고 조건부로 클릭**하도록 쓴다.

### 4. 백엔드 500 이 프론트 에러로 위장한다

백엔드가 500 을 주면 화면에는 Suspense/에러 바운더리 메시지만 뜬다. e2e 실패 메시지도 프론트
문제처럼 보인다. **네트워크 응답을 먼저 확인**한다(스펙 안에서 `page.on('response')` 계측).

---

## 주요 설계 결정

### window.ethereum mock

RainbowKit/wagmi는 페이지 로드 시 `window.ethereum` 존재 여부를 체크한다. 이 mock이 없으면 지갑 provider 초기화 에러가 발생한다. `ETHEREUM_MOCK_SCRIPT`를 `context.addInitScript()`로 모든 페이지 로드 전에 주입한다.

### storageState 기반 인증 재사용

매 테스트마다 로그인하면 느리고 불안정하다. 각 시나리오는 대응되는 `auth/setup.<scenario>.ts`에서 필요한 사용자 세션만 먼저 만들고, 이후 테스트는 해당 `.auth/<scenario>-user*.json` 상태를 복원해 시작한다.

예:

- `e2e-a` 실행 시 `auth-a`만 선행 실행
- `e2e-c` 실행 시 `auth-c`만 선행 실행
- `e2e-d` 실행 시 `auth-d`만 선행 실행

### 독립된 브라우저 컨텍스트

`user1Context`, `user2Context` fixture는 각각 독립된 `BrowserContext`이므로 같은 테스트 내에서 두 사용자가 동시에 다른 세션을 유지할 수 있다.

### 파티룸 공용 helper

플레이리스트 생성, DJ 등록, 파티룸 퇴장/종료처럼 여러 시나리오에서 반복되는 UI 동작은 `helpers/partyroom.helpers.ts`에 둔다. 특히 `registerAsDj()`는 플레이리스트 선택 직후 DJ 가이드가 뜨면 `Don't show again`을 먼저 눌러 이후 DJ queue 검증을 방해하지 않게 한다. 이미 사용자 preference에 가이드 숨김 값이 저장된 컨텍스트에서는 이 단계를 건너뛴다.

---

## Selector 기준

E2E selector는 "UI 구현 세부사항에 덜 묶이고, 로케일/동적 데이터 변화에도 덜 깨지는 방식"을 우선한다. `data-testid`를 금지하지는 않지만, 모든 컴포넌트에 기본적으로 심는 방식은 지양한다.

우선순위:

1. `getByRole`
2. `getByLabel`, `getByPlaceholder`, `getByText`
3. 필요한 경우에만 `data-testid`

### `getByRole`을 우선 사용하는 경우

- 버튼, 탭, 다이얼로그, 텍스트박스처럼 접근 가능한 semantic role이 분명한 요소
- 영어/한글 텍스트가 크게 바뀌지 않고, 테스트 의도가 사용자 행동과 직접 맞닿아 있는 요소

예:

- `openPartyroomChatPanel()`은 `getByRole('tab', { name: /chat/i })`를 사용한다.
- `sendChatMessage()`는 마지막 채팅 input을 `getByRole('textbox')`로 찾는다.
- `openAvatarSettingsFromMyProfile()`는 `getByRole('button', { name: /avatar settings/i })`를 사용한다.

### `data-testid`를 허용하는 경우

- 카운트, 닉네임, 번역 문자열처럼 표시값이 자주 바뀌는 요소
- hover 후에만 나타나는 메뉴 버튼/패널
- 반복 리스트 내부에서 특정 row를 안정적으로 좁혀야 하는 요소
- 아바타 URI, reaction type처럼 텍스트 대신 attribute 상태를 검증하는 요소
- Headless UI, portal, overlay처럼 role만으로 안정적으로 집기 어려운 구조

예:

- `partyroomCrewsPanel-tab`: 탭 라벨이 crew count라 텍스트 기반 선택이 불안정할 수 있으므로 `data-testid` 사용
- `chat-message-item`, `crew-list-item-hover`: 반복 리스트에서 특정 항목을 `hasText()`와 함께 좁히기 위해 사용
- `partyroom-current-dj`: `data-avatar-body-uri`, `data-reaction-type` 검증을 위해 anchor element가 필요하므로 사용
- `dialog-panel`, `dialog-backdrop`: overlay 계층 제어를 위해 사용

### 지양하는 방식

- 공용 UI 컴포넌트마다 테스트 전용 prop을 기본 API처럼 추가하는 것
- 하나의 `dataTestId` prop에서 `-nickname`, `-hover` 같은 파생 selector를 여러 개 만드는 것
- 문서화되지 않은 임시 selector를 helper 내부에만 숨겨두는 것

특히 `src/shared`의 재사용 컴포넌트에서 `dataTestId` prop drilling이 시작되면, 테스트 관심사가 컴포넌트 API를 오염시키기 쉽다. 가능하면 feature/root 레벨 container에만 test id를 두고, 내부 탐색은 role/text 기반으로 마무리한다.

### 권장 패턴

- 먼저 role 기반으로 진입한다.
- role만으로 불안정한 구간에 한해 feature 단위 `data-testid`를 둔다.
- 반복 리스트는 "list item anchor + hasText()" 조합으로 찾는다.
- 상태 검증은 텍스트보다 `data-*` attribute가 더 안정적이면 attribute 검증을 사용한다.

---

## C, D 시나리오 정리

이번 라운드에서는 E2E-C, E2E-D에 추가된 selector를 아래 기준으로 유지한다.

### E2E-C moderation

- 채팅 탭, 전체 crew 탭, restriction 탭 진입은 가능하면 role 기반 selector를 우선 사용한다.
- crew count처럼 라벨이 동적인 탭은 `data-testid`를 유지한다.
- 채팅 hover 메뉴, crew hover 메뉴, restriction 리스트는 상호작용 지점이 동적이고 반복 구조이므로 `data-testid`를 유지한다.
- kick / ban / block 액션은 helper에서 캡슐화하고, spec 파일에서는 사용자 흐름만 읽히게 유지한다.

현재 helper에서 유지하는 대표 selector:

- `partyroomCrewsPanel-tab`
- `chat-message-hover-item`
- `crew-list-item-hover`
- `restriction-list-item`
- `restriction-category-BLOCK`
- `crew-menu-kick`, `crew-menu-ban`, `chat-message-menu-block`

### E2E-D avatar / reaction / chat

- 프로필, 아바타 설정 열기, 저장 버튼은 role 기반 selector를 우선 사용한다.
- 아바타 body 목록, 선택된 preview, 현재 DJ 영역은 텍스트 검증보다 상태/attribute 검증이 중요하므로 `data-testid`를 유지한다.
- 현재 DJ 반영 여부는 visible text가 아니라 `data-avatar-body-uri`, `data-reaction-type` 기준으로 검증한다.

현재 helper에서 유지하는 대표 selector:

- `avatar-edit-panel`
- `avatar-body-list-item`
- `avatar-edit-selected-preview`
- `partyroom-current-dj`
- `avatar-reaction`

### 다음 정리 원칙

- C, D에서 추가한 selector는 당장 제거하지 않는다.
- 다만 새 selector를 더 추가할 때는 먼저 role/text로 가능한지 확인한다.
- `src/shared` 공용 컴포넌트에 테스트 전용 prop을 더 퍼뜨리기 전에, feature 레벨 wrapper나 container로 해결 가능한지 먼저 본다.

## `e2e/mobile/` project

모바일 viewport(iPhone 13) 전용 spec 들. `playwright.config.ts` 의 `mobile` project 로 등록돼
`yarn test:e2e` 에 함께 실행된다.

| spec | 검증 |
|---|---|
| `display-board.tos.spec.ts` | YouTube 임베드 **ToS 최소 크기(≥200×200)** 가드 |
| `dj-register.spec.ts` | 모바일 DJ 등록 흐름 |
| `add-tracks.spec.ts` | 곡 검색·추가 |
| `playlist-management.spec.ts` | 플레이리스트 관리 |
| `profile-onboarding.spec.ts` | 프로필 온보딩 |
| `host-cta.spec.ts` | 호스트 CTA |

### ToS 최소 크기 가드 (issue #420)

**과거의 80×45 축소·접기 토글("Mode B")은 정책 위반이라 제거됐다.** 영상은 모든 탭에서
전체너비를 유지한다. 현재 spec 이 잠그는 것:

- 채팅 탭(기본)에서 IFrame viewport **≥ 200×200** + 화면 안 + 시각적으로 hidden 아님
- **크루 탭 / DJ 큐 탭으로 전환해도 축소되지 않음** (사용자 보고 회귀에 대한 가드)
- 재생 비활성 시 placeholder 로 대체

> 이 spec 은 cold-start 여파를 감안해 `test.setTimeout(180_000)` 을 쓴다. 타임아웃이 짧아
> 실패했던 이력이 있으니 임의로 줄이지 말 것.
