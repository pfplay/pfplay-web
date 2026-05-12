# PFPlay Web

PFPlay 사용자 프론트. PFP NFT 기반 라이브 뮤직 파티룸 플랫폼.

[![Node](https://img.shields.io/badge/Node-20.16%2B-339933?logo=nodedotjs)]()
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?logo=next.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=React&logoColor=black)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)]()
[![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?logo=vercel&logoColor=white)]()

- Notion FE 위키: `<TODO notion-fe-wiki>`
- Slack 채널: `<TODO slack-channel>`
- Figma: `<TODO figma-link>`
- 관련 리포: [pfplay-platform](https://github.com/pfplay/pfplay-platform) (backend), [pfplay-admin](https://github.com/pfplay/pfplay-admin) (운영 어드민)

## Table of Contents

1. [빠른 시작](#빠른-시작)
2. [도메인 개요](#도메인-개요)
3. [아키텍처](#아키텍처)
4. [상태 관리 & 데이터 흐름](#상태-관리--데이터-흐름)
5. [백엔드 연결](#백엔드-연결-pfplay-platform)
6. [Web3 & PFP NFT](#web3--pfp-nft)
7. [실시간 통신 (STOMP)](#실시간-통신-stomp)
8. [i18n](#i18n)
9. [Amplitude & Vercel Edge Config](#amplitude--vercel-edge-config)
10. [테스트](#테스트)
11. [CI/CD 및 배포](#cicd-및-배포)
12. [운영 메모(자주 부딪히는 함정)](#운영-메모자주-부딪히는-함정)
13. [외부 링크 & 참고](#외부-링크--참고)

## 빠른 시작

### Prerequisites

- **Node.js 20.16+** (`package.json#engines` 강제)
- **yarn 1.22+** (`packageManager: yarn@1.22.22` 명시. npm/pnpm 사용 금지)
- 로컬 백엔드(`pfplay-platform`)가 띄워져 있어야 의미가 있습니다

### 설치

```bash
yarn   # 첫 설치 시 `prepare` 훅에서 husky install + svgr 실행
```

### 환경변수

프로젝트 루트에 다음 파일들을 만들고 채웁니다 (구체값은 Notion 환경변수 페이지 참고):

```bash
touch .env.local .env.development.local .env.production.local
```

핵심 키:

- 백엔드 base URL
- OAuth client IDs (Google / Twitter)
- WalletConnect project ID
- Alchemy API key
- Amplitude API key
- Vercel Edge Config endpoint

### 개발 서버 실행

```bash
yarn dev               # next dev --experimental-https --turbo (https://localhost:3000)
yarn build             # production build
yarn start             # 빌드 산출물 실행
yarn test              # vitest run
yarn test:type         # tsc --noEmit
yarn test:e2e          # playwright e2e
yarn test:e2e:headed   # playwright headed
yarn storybook         # storybook (port 6006)
yarn lint              # ESLint --fix --quiet
yarn format            # prettier --write
yarn i18n              # scripts/i18n.js (xlsx ↔ json) — 주의사항은 i18n 섹션
yarn pathmap           # path alias 생성
yarn svgr              # SVG → React component
```

### 첫 진입 흐름

1. `yarn dev` → `https://localhost:3000` (HTTPS 자체 서명 인증서, 브라우저 신뢰 등록 필요)
2. **모바일 UA**로 접속하면 `middleware.ts`가 `/mobile-notice`로 리다이렉트 (데스크탑 전용 UI)
3. Vercel Edge Config의 `system-status.phase`가 `ACTIVE`면 모든 라우트가 `/maintenance`로 rewrite (URL 유지)
4. `(auth)/sign-in`에서 OAuth(Google/Twitter) 또는 게스트 모드 진입
5. `(home)`에서 파티 목록 → `parties/(lobby)` → `parties/(room)`으로 입장

## 도메인 개요

App Router 라우트:

| 라우트             | 종류          | 책임                                          |
| ------------------ | ------------- | --------------------------------------------- |
| `(auth)/sign-in`   | route group   | OAuth(Google/Twitter) 진입, JWT 쿠키 수령     |
| `(auth)/auth`      | route group   | OAuth 콜백 처리                               |
| `(home)`           | route group   | 메인. 파티 목록·검색·추천                     |
| `parties/(lobby)`  | route group   | 파티 진입 전 로비                             |
| `parties/(room)`   | route group   | 실제 파티룸 (재생·DJ·채팅·반응·아바타)        |
| `settings/profile` | nested        | 프로필·자기소개 편집                          |
| `settings/avatar`  | nested        | 아바타 편집 (PFP NFT 가져오기 포함)           |
| `link`             | route         | 외부 공유 링크                                |
| `maintenance`      | route         | 점검 페이지 (middleware rewrite 대상)         |
| `mobile-notice`    | route         | 모바일 UA 안내 (middleware redirect 대상)     |
| `api/og`           | route handler | OG 이미지 생성 (`satori` + `@resvg/resvg-js`) |

라우트별 백엔드 API 매핑은 backend Swagger: `http://localhost:8080/spec/api`

### Features

`src/features/`: `sign-in`, `sign-out`, `withdraw`, `change-language`, `edit-profile-avatar`, `edit-profile-bio`, `partyroom`(메인 기능 집합), `playlist`, `system-announcement`

### Widgets

`src/widgets/`: `partyroom-detail`, `partyroom-avatars`, `partyroom-chat-panel`, `partyroom-crews-panel`, `partyroom-display-board`, `partyroom-djing-dialog`, `partyroom-edit-profile-avatar-dialog`, `partyroom-party-list`, `music-preview-player`, `my-playlist`, `sidebar`, `layouts`

### Entities

`src/entities/`: `me`, `avatar`, `wallet`, `partyroom-info`, `current-partyroom`, `partyroom-client`(STOMP), `playlist`, `music-preview`, `preference`, `ui-state`

## 아키텍처

### FSD + Next.js App Router

```
App      (src/app/)        — Next.js App Router 라우트 + _providers + middleware.ts
  ↓
Widgets  (src/widgets/)    — 페이지 빌딩 블록 (파티룸 패널/사이드바/플레이리스트)
  ↓
Features (src/features/)   — 도메인 기능 (각 슬라이스 = api/ + model/ + ui/)
  ↓
Entities (src/entities/)   — 도메인 객체 (DTO, store, STOMP client)
  ↓
Shared   (src/shared/)     — 가로지르는 인프라 (api/, config/, lib/, ui/)
```

admin과 달리 별도의 `pages/` 레이어가 없습니다 — App Router의 `app/`이 라우팅을 직접 담당합니다.

### Server / Client 경계

- 서버 컴포넌트가 기본, 인터랙션이 필요한 곳만 `'use client'` 명시
- 데이터 페칭: TanStack Query는 클라이언트, server component는 `@tanstack/react-query-next-experimental`로 prefetch 후 hydrate
- 인증·쿠키: `cookies-next`로 server/client 양쪽 접근

### middleware.ts (edge runtime)

`src/middleware.ts`가 세 가지 가드를 담당합니다:

1. **점검 가드** — Vercel Edge Config `system-status.phase === 'ACTIVE'`면 모든 라우트를 `/maintenance`로 rewrite (URL은 유지, 컨텐츠만 가림)
2. **모바일 가드** — User-Agent 기반으로 모바일 감지 시 `/mobile-notice`로 리다이렉트
3. **언어 쿠키 부트스트랩** — 첫 방문에서 `LANGUAGE_COOKIE_KEY`를 `En`으로 초기화

matcher는 `api/`, `_next/static`, `_next/image`, `favicon.ico`, `images/`, `icons/`, `maintenance`를 제외한 모든 경로.

## 상태 관리 & 데이터 흐름

| 종류            | 도구                                               | 사용처                                                      |
| --------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| 서버 상태       | TanStack Query 5 + `react-query-next-experimental` | 모든 백엔드 데이터 + RSC prefetch                           |
| 클라이언트 상태 | Zustand 4                                          | 도메인별 entity(me, current-partyroom, wallet, ui-state 등) |
| 폼              | React Hook Form + Zod                              | 모든 form                                                   |
| 실시간          | `@stomp/stompjs` + `partyroom-client` entity       | 파티룸 이벤트                                               |
| HTTP 클라이언트 | axios                                              | 백엔드 호출                                                 |
| 쿠키            | `cookies-next`                                     | 인증 쿠키, 언어 쿠키                                        |
| 분석            | `@amplitude/analytics-browser`                     | 사용자 이벤트                                               |
| 드래그          | `@dnd-kit/*`                                       | 플레이리스트 트랙 재배치                                    |
| Web3            | wagmi + viem + RainbowKit                          | 지갑 연결·서명                                              |

**원칙**: server state는 React Query, 도메인 클라이언트 상태는 entity별 Zustand store. 단일 거대 store(`shared/store`) 패턴을 만들지 마세요 — 도메인 단위로 분산되어 있습니다.

## 백엔드 연결 (pfplay-platform)

pfplay-web은 [pfplay-platform](https://github.com/pfplay/pfplay-platform) 백엔드에 의존합니다.

### 인증 — OAuth2 + JWT cookie

- **Google / Twitter OAuth2**로 진입 (admin과 달리 password 로그인은 없음)
- **게스트 모드**: 익명 진입 가능 (`/users/guests/sign/**`)
- JWT는 쿠키로 관리: `access_token`(24h), `refresh_token`(7d)

### Cookie 도메인 (shared)

- `COOKIE_DOMAIN=.pfplay.xyz`, SameSite=**Lax**
- admin의 `admin.pfplay.xyz` Strict와는 의도적으로 분리되어 있습니다 (운영 메모 참고)

### V15 temp user 호환

- 백엔드 V15 schema에 임시 유저 컬럼이 추가되었습니다 (PR #196 / #198)
- 임시 유저 → 풀 멤버 전환 흐름은 백엔드가 담당. 프론트는 호환만 보장
- prod에는 `/temporary/full-member`류 임시 엔드포인트 차단 가드가 백엔드 측에 있어야 합니다 (검증 outstanding)

### 신고 (V13)

- 파티룸 신고 기능 (UI는 `features/partyroom` 내부)
- 처리는 admin 콘솔(`pfplay-admin /reports`)에서 수행

### 시스템 공지 (V14)

- backend V14 schema. 1분 cron으로 활성 공지를 배포
- 프론트는 `features/system-announcement`에서 polling/표시

## Web3 & PFP NFT

PFPlay의 핵심 차별점은 **PFP NFT를 아바타로 가져오는 것**입니다.

### 스택

- **RainbowKit 2.2** — 지갑 연결 UI (MetaMask, WalletConnect 등)
- **wagmi 2.10** — React hooks for Ethereum
- **viem 2.21** — Ethereum 클라이언트
- **alchemy-sdk** — NFT 메타데이터 / 소유권 조회

### 흐름

1. 사용자가 `settings/avatar`에서 "PFP 가져오기" 진입
2. RainbowKit으로 지갑 연결
3. 지갑 주소로 Alchemy에서 보유 NFT 목록 조회
4. PFP 선택 → 백엔드 아바타 리소스로 연결

`src/entities/wallet`이 연결 상태·주소를 책임지고, `src/features/edit-profile-avatar`가 NFT 선택·등록을 책임집니다. 지갑 연결은 로그인의 **옵션**이며, 지갑 없이도 게스트/OAuth로 진입 가능합니다.

## 실시간 통신 (STOMP)

파티룸은 STOMP/WebSocket으로 동기화됩니다.

### 연결

- 엔드포인트: 백엔드 `/ws` (JWT를 handshake에서 검증)
- 클라이언트: `@stomp/stompjs`
- 추상화: `src/entities/partyroom-client`

### 주요 구독 토픽

- `/sub/events/{partyroomId}/chat-message`
- `/sub/events/{partyroomId}/partyroom-access` (입·퇴장)
- `/sub/events/{partyroomId}/playback-start` / `playback-skip`
- `/sub/events/{partyroomId}/playback-reaction` / `playback-reaction-motion`
- `/sub/events/{partyroomId}/crew-grade` / `crew-penalty`
- `/sub/events/{partyroomId}/profile-update` / `notice-update`
- `/sub/events/{partyroomId}/partyroom-deactivation`

### 첫 DJ 등록 직후 silent deactivate

- `enqueueDj` 직후 `PLAYBACK_DEACTIVATED` + 빈 djs 배열이 오면, 첫 트랙 길이가 룸의 `playbackTimeLimit`를 초과한 케이스입니다
- 백엔드의 의도된 동작이며, 사용자 친화적인 UX 메시지로 해석하는 책임은 프론트에 있습니다
- `DjQueueChangedEvent` payload는 AFTER_COMMIT 시점 late binding이므로 stale 가능성을 항상 고려

## i18n

### 구성

- 소스: `scripts/i18n.xlsx` (Excel)
- 출력: `public/locales/{ko,en}/...json` (i18next 형식)
- 변환: `scripts/i18n.js` (`exceljs`로 xlsx → json)
- 명령: `yarn i18n`
- Lint: `eslint-plugin-i18next` (literal string 검출)

### ⚠️ xlsx ↔ JSON drift 주의

xlsx와 ko/en json의 sync가 실제로 깨져 있습니다. `yarn i18n`을 무지성으로 실행하면 **drift 상태의 키가 삭제될 위험**이 있습니다.

권장 방침:

- 작은 추가/수정은 **ko/en json을 직접 수정**
- xlsx는 신뢰 가능한 시점에만 동기화
- xlsx 갱신 후에는 git diff로 키 삭제 여부를 반드시 검토

## Amplitude & Vercel Edge Config

### Amplitude

- `@amplitude/analytics-browser`로 사용자 이벤트 계측
- 이벤트 분류표: `<TODO event-taxonomy-link>`

### super-admin 자동 opt-out (B1)

- super-admin이 `user_id < 5자` 형태로 발급되면 Amplitude SDK가 자동으로 `reset()` + `optOut()`을 호출합니다
- 운영자가 사용자 화면에 진입했을 때 super-admin 이벤트가 분석 결과를 오염시키지 않도록 하는 가드
- 일반 사용자 id가 5자 미만이 되지 않도록 백엔드 ID 발급 정책으로 보장
- 관련: pfplay-web PR #285 / pfplay-platform issue #204

### Vercel Edge Config

- `@vercel/edge-config` 사용처:
  - **점검 가드** — `system-status.phase === 'ACTIVE'`로 즉시 점검 모드 전환 (middleware에서 edge runtime으로 조회)
  - **β 시스템 공지 토글**
- middleware에서 동기적으로 조회되므로 응답 지연이 사용자에게 노출됩니다. 페이로드를 작게 유지하세요.

## 테스트

- **Vitest 4** + **Testing Library** + **MSW 2** + **jsdom** — 단위/통합
- **Playwright 1.59** — e2e
- **Storybook 7** — 시각·인터랙션
- **eslint-plugin-i18next** — 하드코딩 문자열 검출

```bash
yarn test           # vitest run
yarn test:type      # tsc --noEmit
yarn test:e2e       # playwright
yarn test:e2e:headed
yarn storybook
yarn build-storybook
```

## CI/CD 및 배포

### Vercel

- prod: `https://pfplay.xyz` (`main` 브랜치)
- preview/dev: `https://pfplay-web.vercel.app` (`development` 브랜치)
- Vercel native git integration이 PR/브랜치별 preview를 자동 생성합니다

### GitHub Actions

`.github/workflows/`:

- **lint-check.yml** — PR 시 ESLint
- **vercel-build-check.yml** — `development` / `main` 대상 PR 빌드 검증
- **vercel-preview-e2e.yml** — `development` push 시 preview 배포 + Playwright e2e
- **vercel-production.yml** — `main` push 시 prod 배포

> Vercel native integration과 GHA의 vercel-\* 워크플로가 **동시에** 동작합니다. 두 경로 모두 빌드가 도는 점을 유념하세요.

### 문서/README만 바꿔도 빌드 발생

현재 path filter가 없어 README 변경만으로도 워크플로 전체와 Vercel preview 배포가 돕니다.

## 운영 메모(자주 부딪히는 함정)

코드만 봐서는 의도를 알기 어려운 결정들입니다. **변경 제안 전에 반드시 확인**하세요.

### i18n.xlsx ↔ JSON drift

실제로 sync가 깨져 있어 `yarn i18n` 무지성 실행은 위험합니다. ko/en json 직접 수정 권장. 자세한 사항은 i18n 섹션.

### Cookie 도메인 통일 금지

- pfplay-web은 shared `.pfplay.xyz` (Lax)
- admin은 분리된 `admin.pfplay.xyz` (Strict)
- 분리는 admin 쿠키가 사용자 도메인으로 새지 않게 하는 의도된 보안 경계입니다.

### V15 temp user 호환

- 백엔드 V15 schema에 V14 호환 컬럼이 추가되어 있습니다
- 임시 유저 → 풀 멤버 전환은 backend에서 처리됨. prod 측 `/temporary/full-member` 차단 가드가 outstanding
- pfplay-web#282 이슈는 클로즈됨

### Amplitude super-admin opt-out (5자 미만 룰)

- `user_id`가 5자 미만이면 super-admin으로 간주 → SDK reset/optOut
- 일반 사용자 id가 5자 미만이 되지 않도록 백엔드 ID 정책 보장 필요

### Web3 + OAuth 듀얼 인증

- 로그인은 OAuth(Google/Twitter)가 담당
- 지갑 연결은 별도의 옵션. "지갑 없이는 진입 불가"가 아닙니다
- 게스트 모드도 존재합니다

### 첫 DJ 등록 직후 silent deactivate

- 의도된 백엔드 동작. UX 메시지 책임은 프론트
- 자세한 사항은 "실시간 통신" 섹션 참고

### KST 시각 가정

- 백엔드 JVM TZ는 `Asia/Seoul` 고정 (Dockerfile ENV TZ + ClockConfig)
- 프론트도 KST 가정으로 시각을 표시합니다 (사용자 timezone과 무관)

### HTTPS dev 인증서

- `yarn dev`는 `--experimental-https`로 자체 서명 인증서를 자동 생성 (`certificates/`)
- 처음 접속 시 브라우저가 "안전하지 않음" 경고를 띄울 수 있습니다. 로컬 신뢰 등록 필요

### Maintenance / Mobile-notice는 middleware 책임

- 점검 모드와 모바일 UA 차단은 `src/middleware.ts` 한 곳에서 처리
- 페이지 단에서 같은 로직을 중복하지 마세요 (edge에서 가로채는 게 더 cheap합니다)

## 외부 링크 & 참고

### PFPlay 프로젝트 링크

- Notion FE 위키: `<TODO notion-fe-wiki-url>`
- Notion 환경변수 페이지: `<TODO notion-env-page>`
- Slack 채널: `<TODO slack-channel>`
- Figma: `<TODO figma-link>`

### 관련 리포

- [pfplay-platform](https://github.com/pfplay/pfplay-platform) — backend (Spring Boot 3, Java 21)
- [pfplay-admin](https://github.com/pfplay/pfplay-admin) — 운영 어드민 콘솔 (React + Vite, Cloudflare Pages)

### 기술 레퍼런스

- [Next.js App Router](https://nextjs.org/docs/app)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [TanStack Query](https://tanstack.com/query/latest)
- [RainbowKit](https://www.rainbowkit.com/) — 지갑 연결
- [wagmi](https://wagmi.sh/) — React hooks for Ethereum
- [viem](https://viem.sh/)
- [STOMP over WebSocket](https://stomp.github.io/)

---

Built with Next.js 14 + React 18 + TypeScript 5 on Vercel.
