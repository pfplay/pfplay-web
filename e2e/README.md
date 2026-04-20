# E2E 테스트 가이드

Playwright 기반 e2e 테스트. 현재 2개의 시나리오(E2E-A, E2E-B)로 파티룸 핵심 기능을 검증한다.

---

## 디렉토리 구조

```
e2e/
├── .auth/                          # storageState 저장 위치 (gitignore)
│   ├── user1.json                  # User1 (Full Crew / HOST) 인증 상태
│   └── user2.json                  # User2 (Associate Crew) 인증 상태
├── fixtures/                       # 테스트 전 반복 세팅을 재사용할 수 있게 추상화하는 전처리 레이어 (실행 전 필요한 것을 setup, 끝난 후 정리하는 tearup)
│   ├── ethereum-mock.ts            # window.ethereum mock (wagmi/RainbowKit 초기화용)
│   └── auth.fixtures.ts            # user1Context / user2Context Playwright fixture
├── helpers/                        # 파티룸/플레이리스트/DJ 등록 등 e2e 공용 동작
│   └── partyroom.helpers.ts        # 시나리오에 공통적으로 사용되는 helper 함수
|                                     # e.g. playlist 생성, DJ 등록, 파티룸 퇴장/종료
├── auth.setup.ts                   # 인증 세션 저장 (최초 1회 또는 만료 시 실행)
├── e2e-a.partyroom-join-sync.spec.ts   # 파티룸 생성 + Late Join 상태 동기화
└── e2e-b.dj-state-machine.spec.ts      # DJ 상태 머신 + 다중 클라이언트 동기화
```

---

## 실행 방법

### 0. dev server 시작

```bash
yarn dev
```

### 1. 인증 세션 저장 (최초 1회 또는 세션 만료 시)

```bash
yarn playwright test e2e/auth.setup.ts --project=auth-setup
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

매 테스트마다 로그인하면 느리고 불안정하다. `auth.setup.ts`에서 한 번 로그인 후 쿠키+localStorage를 `.auth/*.json`에 저장하고, 이후 모든 테스트는 해당 상태를 복원해 시작한다.

### 독립된 브라우저 컨텍스트

`user1Context`, `user2Context` fixture는 각각 독립된 `BrowserContext`이므로 같은 테스트 내에서 두 사용자가 동시에 다른 세션을 유지할 수 있다.

### 파티룸 공용 helper

플레이리스트 생성, DJ 등록, 파티룸 퇴장/종료처럼 여러 시나리오에서 반복되는 UI 동작은 `helpers/partyroom.helpers.ts`에 둔다. 특히 `registerAsDj()`는 플레이리스트 선택 직후 DJ 가이드가 뜨면 `Don't show again`을 먼저 눌러 이후 DJ queue 검증을 방해하지 않게 한다. 이미 사용자 preference에 가이드 숨김 값이 저장된 컨텍스트에서는 이 단계를 건너뛴다.
