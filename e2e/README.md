# E2E 테스트 가이드

Playwright 기반 e2e 테스트. 현재 4개의 시나리오(E2E-A, E2E-B, E2E-C, E2E-D)로 파티룸 핵심 기능을 검증한다.

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
├── e2e-a.partyroom-join-sync.spec.ts   # 파티룸 생성 + Late Join 상태 동기화
├── e2e-b.dj-state-machine.spec.ts      # DJ 상태 머신 + 다중 클라이언트 동기화
├── e2e-c.partyroom-moderation.spec.ts  # block / kick / ban moderation
└── e2e-d.profile-avatar-reaction-chat.spec.ts # avatar / reaction / chat
```

---

## 실행 방법

### 0. dev server 시작

```bash
yarn dev
```

### 1. 인증 세션 저장

```bash

```

### 2. 전체 테스트 실행

```bash
yarn test:e2e
```

### 3. 기타 실행 옵션

```bash
yarn test:e2e:headed   # 브라우저 화면을 보면서 실행
yarn test:e2e:ui       # Playwright UI 모드
yarn test:e2e:debug    # 디버그 모드 (step-by-step)
yarn test:e2e:report   # 마지막 실행 리포트 열기
```

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
