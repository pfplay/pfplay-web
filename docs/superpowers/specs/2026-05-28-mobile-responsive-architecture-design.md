# 모바일 반응형 — 아키텍처·레이아웃·마이그레이션 설계

- **작성일**: 2026-05-28
- **상태**: 설계 확정 (구현 미착수, 5-chunk PR 시리즈 예정)
- **선행 문서**: [`2026-05-22-mobile-responsive-scope-design.md`](./2026-05-22-mobile-responsive-scope-design.md) — 스코프 확정
- **관련 이슈**: [pfplay-web#340](https://github.com/pfplay/pfplay-web/issues/340)
- **후속**: writing-plans 스킬로 구현 계획 단계 진입 예정

---

## TL;DR

스코프(05-22)가 "무엇을 모바일로 가져갈까(IN/OUT)" 만 잠갔고, "어디에 코드를 두느냐(호스팅·디렉터리·격리)" · "어떻게 보일까(레이아웃)" 는 공란이었다. 본 스펙이 그 빈 칸을 메운다.

핵심 결정:

1. **호스팅 = 같은 도메인(pfplay.xyz) + 강한 코드 격리** — 단일 route tree(`app/parties/(lobby)/page.tsx`·`app/parties/[id]/page.tsx`) + middleware 가 UA 감지해 **서버측 request 헤더 `x-pf-device` 주입**. 각 page.tsx 가 그 헤더 보고 데스크탑/모바일 page-level 위젯을 분기 렌더. URL 동일(공유링크 invariant) + 코드 트리 분리.
2. **격리 강도 = C3** — page-level 위젯·features 의 모바일 사본을 별도 트리(`widgets-mobile/`·`features-mobile/`)에 둠. entities·shared 만 공통.
3. **모바일 게스트 채팅 = 허용** (스코프 §확정결정 5번 갱신: "차단" → "허용"). 근거: WS 이미 연결·체험 가치·데스크탑↔모바일 일관성.
4. **레이아웃** — 룸 = 헤더 + 전광판(sticky·리액션 inline) + 탭3(채팅/크루/큐) + 탭바. 로비 = 1컬럼 카드 리스트. 가로 회전 = 모바일 트리 그대로(미최적, 의도).
5. **5-chunk PR 시리즈** — Foundation → 로비+청취 → 채팅+크루 → DJ+큐잉 → 정리. **Chunk 5 는 pfplay-web + pfplay-platform 동반 PR**(ROLE_GUEST 회귀 가드).
6. **Chunk 1 = layout/page 재구성 동반** — 현재 page.tsx 들이 `'use client'` 라 `next/headers` 못 씀. RSC 로 변환 + 기존 client 로직과 desktop chrome(overlays·Header) 을 desktop shell 위젯으로 이동.

신규 컴포넌트 = **11개** (widgets-mobile 7 [모바일 shell 2 + 사본 5] + features-mobile 3 + shared 1[`MobileOnlyDesktopFeatureCard`]). `widgets/partyroom-page-desktop/*` 는 _재구성_ 이라 신규 카운트 미포함. `useIsGuest` 는 기존 `@/entities/me` 재사용. 자세한 분해는 §1.7.

## 컨텍스트

현재 모바일은 `src/middleware.ts` 의 `isMobileUA` 판정으로 모든 페이지가 `/mobile-notice` 로 전면 차단된다(선행: `docs/superpowers/specs/2026-04-19-mobile-desktop-redirect-design.md`). 스코프(05-22) 가 차단을 반응형으로 뒤집는 방향과 IN/OUT 5결정을 잠갔으나, "구조적 함의" 섹션이 "stacked 구조로 재배치 필요 — _방향성일 뿐 확정 아님_" 로 끝났다. 본 스펙은 다음을 결정한다:

- 호스팅·라우팅 전략 (반응형 vs 별도호스트 vs 같은도메인+격리)
- 코드 격리 단위 (페이지/widgets/features 어디까지 분리)
- 자동 승계 항목 영향 검증 (점검·i18n·presence·WS)
- 데스크탑 전용 기능에 모바일 진입 시 동작
- 룸·로비 실제 레이아웃
- 마이그레이션 시퀀스 (빅뱅 vs 점진)

---

## §1 아키텍처 — 호스팅·라우팅·격리

### 1.1 한 줄 요약

같은 도메인·같은 URL 유지. **단일 route tree** 의 page.tsx 가 middleware 가 주입한 `x-pf-device` 요청 헤더 보고 desktop/mobile page-level 위젯을 **server-side conditional 렌더**. 라우팅·URL 무영향, Route Group 분기 안 씀. widgets·features 의 모바일 사본은 별도 트리(`widgets-mobile/`·`features-mobile/`), entities·shared 만 공통.

> **참고**: 초기 안은 Next.js Route Group `(desktop)/(mobile)` 페이지 트리 분리 + middleware URL rewrite 였으나, 동일 URL 로 resolve 되는 두 `page.tsx` 존재로 빌드 충돌. 헤더 conditional 패턴으로 교체(스펙 리뷰 1회차 반영). 결정 이력 참조.

### 1.2 호스팅 전략 선택 (3안 비교)

| 안                       | 도메인·URL                   | 격리 | 공유링크                                                | 인프라                                    | 동기(클린 격리) 정합 |
| ------------------------ | ---------------------------- | ---- | ------------------------------------------------------- | ----------------------------------------- | -------------------- |
| A 반응형                 | 같은 URL, viewport 분기      | 약함 | ✅                                                      | 변경 0                                    | ✗                    |
| B 별도 호스트            | m.pfplay.xyz                 | 최강 | ⚠️ UA 리다이렉트 부활(= 현 isMobileUA 제거 방향과 충돌) | +1 Vercel · DNS · 쿠키 공유 · WS endpoint | ✅ 단 인프라 비용    |
| **C 같은 도메인 + 격리** | 같은 URL, middleware rewrite | 강함 | ✅                                                      | 변경 0                                    | ✅                   |

**채택 = C.** B 의 격리 가치(번들·라이프사이클 독립·데스크탑 무영향) 약 90% 를 호스트 분리 비용 0 · 결정 1번(공유링크 유입 전환) 보존 으로 확보한다.

### 1.3 격리 강도 — C 내부 3단계

| 단계   | 분리                        | 공통                              |
| ------ | --------------------------- | --------------------------------- |
| C1     | 페이지(Route Group)만       | widgets · features (variant prop) |
| C2     | 페이지 + widgets            | features · entities · shared      |
| **C3** | 페이지 + widgets + features | **entities · shared 만**          |

**채택 = C3.** 데스크탑 코드가 모바일을 깰 표면적 경로 = entities/shared 변경뿐. 그 경계는 작아서 가시·통제 가능.

트레이드오프 (수용):

- (+) 데스크탑 수정이 모바일 깨지 않음 (교차 의존 0)
- (+) 모바일 전용 차이(터치·레이아웃) 자유롭게
- (−) widgets 일부 재구현 필요 (display-board · chat panel 등)
- (−) 컴포넌트 수 증가

### 1.4 디렉터리 구조 + 기존 코드 재구성

#### 1.4.1 현 구조 (변경 전, 참고)

```
src/app/parties/
  layout.tsx                ← 'use client' ProtectedLayout: auth 게이트 + desktop overlay (MyPlaylist · SidebarPlayer · ModalPlayer)
  (lobby)/
    layout.tsx              ← Header 렌더 + main wrapper
    page.tsx                ← 'use client', Sidebar + 로비 UI
  (room)/[id]/
    layout.tsx              ← 'use client', enter/teardown 효과 + ?source 정리 + main wrapper (bg image)
    page.tsx                ← 'use client', 룸 UI (전광판 · 사이드바 · 채팅 · 크루 패널 · cinema toggle 등)
```

#### 1.4.2 본 개편 후 구조 (목표)

```
src/
  app/
    parties/
      layout.tsx              ← 'use client' ProtectedLayout — auth 게이트만 유지. desktop overlay 3개(MyPlaylist · SidebarPlayer · ModalPlayer) 는 desktop shell 로 이동.
      (lobby)/
        layout.tsx            ← 'use client' 또는 RSC. Header 렌더 제거(→ desktop shell). 최소 wrapper (혹은 main 만 유지).
        page.tsx              ← RSC 변환. headers().get('x-pf-device') 보고 desktop/mobile shell 분기 (얇은 shim).
      (room)/[id]/
        layout.tsx            ← 'use client' 유지. enter/teardown · ?source 정리는 device 무관 유지. main wrapper 의 bg 이미지는 desktop shell 로 이동(또는 device-neutral 유지 결정 — plan 단계).
        page.tsx              ← RSC 변환. 동일 패턴 (`partyroomId={params.id}` 전달).
    link/[linkDomain]/         ← 공유링크 진입점 (변경 없음)
    sign-in/                   ← 단순 페이지(공통 컴포넌트, 변경 없음)
    mobile-notice/             ← chunk 5 catch-up 에서 삭제 예정
    middleware.ts              ← x-pf-device 헤더 주입 단계 추가, mobile redirect 제거 (§1.5.2)

  widgets/                     ← 데스크탑 전용으로 의미 고정 (rename 없이 의미만)
    partyroom-page-desktop/    ← **재구성**: 기존 (lobby)/page.tsx + (room)/[id]/page.tsx 의 'use client' 본문 + (lobby)/layout.tsx 의 Header + parties/layout.tsx 의 overlay 3개를 흡수
      lobby.tsx                ← 'use client'
      room.tsx                 ← 'use client'
  widgets-mobile/              ← 신규 트리
    partyroom-page-mobile/
      lobby.tsx                ← 신규 'use client' shell
      room.tsx                 ← 신규 'use client' shell (탭바 · 전광판 sticky 등)
    partyroom-display-board/   ← 신규 사본
    partyroom-chat-panel/      ← 신규 사본
    partyroom-crews-panel/     ← 신규 사본
    partyroom-djing-dialog/    ← 신규 사본
    music-preview-player/      ← 신규 사본
  features/                    ← 데스크탑 전용
  features-mobile/             ← 신규 사본: UI 다른 것만 (list 로비, select-playlist-for-djing, playlist/add-tracks)

  entities/                    ← 공통 (current-partyroom · me · partyroom-client · 기타)
    me/lib/use-is-guest.hook.tsx  ← 기존 hook 그대로 사용(§2.7). async 시그니처에 주의(plan 단계 활용 패턴 결정).
  shared/                      ← 공통 (api/http · i18n · ui/components · hooks · store · lib)
    lib/functions/is-mobile-ua.ts  ← 기존 util, 그대로 재사용 (이름·경로 무변경)
    ui/components/mobile-only-desktop-feature-card/  ← 신규 (§2.4)
```

#### 1.4.3 RSC ↔ Client 경계

- `page.tsx` = **RSC** (headers() 사용)
- `layout.tsx` = **client 가능** (Next.js App Router 는 client layout 안에 server child 허용)
- shell widgets (`partyroom-page-desktop/*`, `partyroom-page-mobile/*`) = **'use client'**
- 따라서 RSC page.tsx 는 단순히 헤더 보고 client shell 을 picker 로 선택. 모든 stateful 로직은 shell 안.

#### 1.4.4 import 그래프와 bundle

page.tsx 는 thin shim 으로 **양 트리(desktop·mobile shell) 를 모두 import**. 동일 빌드에 포함되므로 _bundle isolation 은 비목표_ — C3 의 목표는 _source isolation_ 이며 (`widgets-mobile/` 수정이 `widgets/` 에 영향 0, 역도 동일) 이는 import 그래프 분리만으로 달성. 향후 필요 시 `dynamic()` 으로 split 가능 (v1 미포함).

### 1.5 middleware 합성 (기존 + 신규)

#### 1.5.1 현재 middleware (참고, 변경 전)

`src/middleware.ts` 는 한 함수에서 순차적으로:

1. 점검 ACTIVE → `/maintenance` rewrite
2. 모바일 UA → `/mobile-notice` redirect (**본 개편에서 제거**)
3. 언어 쿠키 default 설정 (broad matcher 적용)

matcher: `'/((?!maintenance|api|_next/static|_next/image|favicon.ico|images|icons).*)'`

#### 1.5.2 본 개편 후 middleware (목표)

```ts
// src/middleware.ts (구체 합성)
import { NextRequest, NextResponse } from 'next/server';

import { getEdgeConfigMaintenance } from '@/shared/api/system-status';
import { TEN_YEARS } from '@/shared/config/time';
import { isMobileUA } from '@/shared/lib/functions/is-mobile-ua';
import { LANGUAGE_COOKIE_KEY, Language } from './shared/lib/localization/constants';

const DEVICE_HEADER = 'x-pf-device';

export const middleware = async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1) 점검 ACTIVE — rewrite. 변경 없음.
  const maintenance = await getEdgeConfigMaintenance();
  if (maintenance?.phase === 'ACTIVE') {
    const url = req.nextUrl.clone();
    url.pathname = '/maintenance';
    url.searchParams.set('messageKo', maintenance.messageKo);
    url.searchParams.set('messageEn', maintenance.messageEn);
    url.searchParams.set('endAt', maintenance.endAt);
    return NextResponse.rewrite(url);
  }

  // 2) (제거) 모바일 UA → /mobile-notice redirect.
  //    이 블록을 본 개편에서 제거한다. /mobile-notice 자체도 chunk 5 catch-up 에서 삭제.

  // 3) UA → x-pf-device 요청 헤더 주입. page.tsx 의 conditional 렌더 입력값.
  const ua = req.headers.get('user-agent') ?? '';
  const isMobile = isMobileUA(ua);
  const reqHeaders = new Headers(req.headers);
  reqHeaders.set(DEVICE_HEADER, isMobile ? 'mobile' : 'desktop');

  // 4) 언어 쿠키 default. NextResponse.next 호출 한 번으로 합쳐서 처리.
  //    기존 setCookieToRequestHeader helper 는 본 패턴에 흡수되어 불필요해짐 (chunk 1 에서 제거).
  const needsLanguageCookie = !req.cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  if (needsLanguageCookie) {
    // SSR 일관성: 현재 요청부터 새 쿠키를 본다 — req Cookie 헤더에도 합성
    const existingCookie = reqHeaders.get('cookie') ?? '';
    reqHeaders.set(
      'cookie',
      existingCookie
        ? `${existingCookie}; ${LANGUAGE_COOKIE_KEY}=${Language.En}`
        : `${LANGUAGE_COOKIE_KEY}=${Language.En}`
    );
  }

  const response = NextResponse.next({ request: { headers: reqHeaders } });
  if (needsLanguageCookie) {
    response.cookies.set(LANGUAGE_COOKIE_KEY, Language.En, {
      path: '/',
      maxAge: TEN_YEARS,
      secure: true,
    });
  }
  return response;
};

export const config = {
  matcher: ['/((?!maintenance|api|_next/static|_next/image|favicon.ico|images|icons).*)'],
};
```

> **합성 노트**: 기존 middleware 는 cookie set 후 별도 `setCookieToRequestHeader` helper 로 `x-middleware-override-headers` 를 조립한다. 본 패턴에선 `NextResponse.next({ request: { headers } })` 를 단 한 번 호출하며, headers 안에 device 헤더 + cookie 헤더(language 쿠키 합성) 를 모두 담는다. 결과: helper 불필요, override 헤더가 device 헤더를 덮어쓰는 사이드이펙트 회피. chunk 1 에서 helper 제거.

#### 1.5.3 page.tsx 분기 패턴 (RSC)

```ts
// src/app/parties/(lobby)/page.tsx — 'use client' 제거, RSC
import { headers } from 'next/headers';
import DesktopLobbyPage from '@/widgets/partyroom-page-desktop/lobby';
import MobileLobbyPage from '@/widgets-mobile/partyroom-page-mobile/lobby';

export default function LobbyPage() {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  return isMobile ? <MobileLobbyPage /> : <DesktopLobbyPage />;
}
```

```ts
// src/app/parties/(room)/[id]/page.tsx — RSC, params 전달
import { headers } from 'next/headers';
import DesktopRoomPage from '@/widgets/partyroom-page-desktop/room';
import MobileRoomPage from '@/widgets-mobile/partyroom-page-mobile/room';

export default function RoomPage({ params }: { params: { id: string } }) {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const partyroomId = Number(params.id);
  return isMobile ? <MobileRoomPage partyroomId={partyroomId} /> : <DesktopRoomPage partyroomId={partyroomId} />;
}
```

기존 page.tsx 의 모든 client 상태·UI 는 desktop shell 위젯(`widgets/partyroom-page-desktop/{lobby,room}.tsx`) 으로 이동. Mobile shell 은 신규 작성.

#### 1.5.4 핵심 정책

- **URL 무변경** — middleware 는 rewrite/redirect 안 함(점검 외). 헤더만 주입.
- **`isMobileUA` 기존 util 재사용** — `shared/lib/functions/is-mobile-ua.ts`. 이름·경로 무변경. 단위 테스트는 본 개편 chunk 1 에서 보강(iPhone/Android/iPad/Desktop/봇 매트릭스).
- **`x-pf-device` 헤더는 request 측만** — response 에 노출 X (클라이언트 가시 불필요).
- **force-desktop opt-out v1 미포함** (YAGNI). 필요해지면 쿠키 escape hatch 추가.
- iPad 는 최신 Safari 에서 desktop UA → 자연스럽게 데스크탑 트리. 의도된 동작.
- **층위 1(점검)이 헤더 주입 전 단락**(early return) — 점검 화면은 디바이스 무관 단일 카드(§2.6)라 의도된 동작.

### 1.6 shared 경계 (불변)

| 레이어                            | 데스크탑        | 모바일          | 정책                                                         |
| --------------------------------- | --------------- | --------------- | ------------------------------------------------------------ |
| `app/parties/(...)/page.tsx`      | 공유(thin shim) | 공유(thin shim) | 단일 진입점, 헤더 보고 분기 import (§1.5.3)                  |
| `widgets/` ↔ `widgets-mobile/`   | 데스크탑        | 모바일          | 의도적 사본 (page-level shell 포함)                          |
| `features/` ↔ `features-mobile/` | 데스크탑        | 모바일          | UI 다른 것만 사본 (mutation·hook 만 쓰는 features 는 재사용) |
| `entities/*`                      | 공통            | 공통            | 도메인 모델·store·query 키 단일 진실                         |
| `shared/*`                        | 공통            | 공통            | api/http · ui/components · i18n · hooks · lib                |

데스크탑 ↔ 모바일 충돌 표면 = entities · shared · `page.tsx` shim 변경뿐. page.tsx shim 은 분기 코드 자체가 단순(`isMobile ? <M /> : <D />`) 이라 사실상 변경 빈도 0. 그 외 경로로 깨질 수 없음.

### 1.7 사본 인벤토리 + chunk 배정

스펙(05-22) §IN 기준으로 모바일에서 쓰는 컴포넌트 분류 + §3.3 chunk 배정:

| 항목                                                    | 사본?      | chunk                      | 사유                                                                                                                                                                   |
| ------------------------------------------------------- | ---------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `widgets/partyroom-page-desktop/lobby`                  | **재구성** | 1                          | 기존 (lobby)/page.tsx + (lobby)/layout.tsx Header + parties layout overlay 흡수. 신규 카운트 미포함                                                                    |
| `widgets/partyroom-page-desktop/room`                   | **재구성** | 1                          | 기존 (room)/[id]/page.tsx + parties layout overlay 흡수. 신규 카운트 미포함                                                                                            |
| `widgets-mobile/partyroom-page-mobile/lobby`            | **신규**   | 2                          | 모바일 로비 page-level shell (page.tsx 가 import)                                                                                                                      |
| `widgets-mobile/partyroom-page-mobile/room`             | **신규**   | 2(베이스) → 3·4(탭 wiring) | 모바일 룸 page-level shell. 베이스+전광판(2), 채팅·크루 탭 wiring(3), 큐 탭 wiring(4)                                                                                  |
| `widgets-mobile/partyroom-display-board`                | **사본**   | 2                          | stacked 레이아웃 · 터치 · sticky · 리액션 inline                                                                                                                       |
| `widgets-mobile/partyroom-crews-panel`                  | **사본**   | 2(컴포넌트)/3(탭 wiring)   | 컴포넌트는 chunk 2(룸 shell 안에 임시 직접 노출 가능). 탭 구조 wiring 은 chunk 3                                                                                       |
| `widgets-mobile/partyroom-chat-panel`                   | **사본**   | 3                          | 탭 + 키보드 + 입력부                                                                                                                                                   |
| `widgets-mobile/partyroom-djing-dialog`                 | **사본**   | 4                          | 풀스크린 sheet                                                                                                                                                         |
| `widgets-mobile/music-preview-player`                   | **사본**   | 4                          | 좁은 화면 변형                                                                                                                                                         |
| `features-mobile/partyroom/list` (로비 그리드 → 리스트) | **사본**   | 2                          | 카드 1컬럼 리스트                                                                                                                                                      |
| `features-mobile/playlist/add-tracks`                   | **사본**   | 4                          | 좁은 화면에서 검색→프리뷰→큐 흐름 재설계                                                                                                                               |
| `features-mobile/partyroom/select-playlist-for-djing`   | **사본**   | 4                          | 모바일 셀렉터                                                                                                                                                          |
| `shared/ui/components/mobile-only-desktop-feature-card` | **신규**   | 2                          | 데스크탑 전용 라우트 모바일 진입 가드(§2.4). chunk 2 에 첫 사용                                                                                                        |
| `entities/me/lib/use-is-guest.hook.tsx`                 | **재사용** | —                          | 기존 hook 확인됨. async (`() => async () => boolean`). render-time 분기는 `useFetchMe()` + 인라인 `me?.authorityTier === GT` 권장(plan 단계 패턴 결정). 신규 추가 없음 |
| `features/partyroom/enter`·`exit`                       | 재사용     | 2                          | mutation만                                                                                                                                                             |
| `features/partyroom/evaluate-current-playback`          | 재사용     | 2                          | mutation만 (백엔드 ROLE_GUEST 허용 확정)                                                                                                                               |
| `features/partyroom/grab-current-playback`              | 재사용     | 4                          | mutation만                                                                                                                                                             |
| `features/partyroom/list-crews`                         | 재사용     | 3                          | hook만                                                                                                                                                                 |
| `features/partyroom/list-chat-messages`                 | 재사용     | 3                          | hook만                                                                                                                                                                 |
| `features/partyroom/send-chat-message`                  | 재사용     | 3                          | children 패턴(headless)이라 입력부만 모바일에서 다르게 구성                                                                                                            |
| `features/partyroom/list-djing-queue`                   | 재사용     | 4                          | hook만                                                                                                                                                                 |
| `features/partyroom/share-link`                         | 재사용     | 2 또는 4                   | mutation+간단 UI (헤더 ⋮ 메뉴에 묶임)                                                                                                                                  |
| `features/sign-in/by-social`                            | 재사용     | —                          | 페이지 그대로, 디바이스 무관                                                                                                                                           |

**신규 카운트** = widgets-mobile **7** (page-level shell 2 + 사본 5) + features-mobile **3** + shared **1** (`MobileOnlyDesktopFeatureCard`) = **약 11 신규 컴포넌트**. `widgets/partyroom-page-desktop/*` 는 *재구성*이며 신규 카운트 미포함. `useIsGuest` 는 기존 hook 재사용.

---

## §2 자동 승계 + 모바일 게이트

### 2.1 자동 승계 항목 — 영향 검증

| 인프라                                   | 위치                                                                     | 모바일 영향              | 조치                                                                                                                                                             |
| ---------------------------------------- | ------------------------------------------------------------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 점검/공지 미들웨어 page rewrite          | `middleware.ts` 상단 분기                                                | 없음                     | middleware **단계 순서** 잠금(§1.5.2): (1) 점검 rewrite (early return) → (2) `x-pf-device` 헤더 주입 → (3) 언어 쿠키 default. 모바일 redirect 단계는 제거.       |
| WS overlay (점검·시스템공지)             | `widgets/system-announcement-overlay` 등                                 | 없음 (layout 에서 mount) | 모바일 layout 도 동일 mount                                                                                                                                      |
| i18n ko/en                               | `shared/lib/localization`, `next-locale` 쿠키                            | 없음 (쿠키 도메인 동일)  | 모바일 layout 에서 동일 provider                                                                                                                                 |
| presence · WS 단일룸 구독 invariant      | `entities/partyroom-client` (Cluster A 통합 잠금)                        | 없음 (entities 공통)     | 그대로                                                                                                                                                           |
| `app/parties/layout.tsx` ProtectedLayout | auth gate + 3 desktop overlay (MyPlaylist · SidebarPlayer · ModalPlayer) | **있음**                 | auth 게이트는 device 무관 유지. **3 overlay 는 desktop shell 로 이동(chunk 1)** — 모바일 shell 은 해당 overlay 미렌더. plan 단계에서 overlay 별 device-only 확인 |
| `(lobby)/layout.tsx` Header 렌더         | `<Header />` (desktop chrome)                                            | **있음**                 | Header 렌더는 desktop shell 로 이동(chunk 1). lobby layout 은 minimal wrapper 로 축소                                                                            |
| `(room)/[id]/layout.tsx` enter/teardown  | enter mutation + teardown + ?source strip                                | 없음 (device 무관)       | 유지. `<main className='bg-partyRoom ...'>` 의 bg 이미지는 desktop shell 로 이동(또는 device-neutral 유지 — plan 단계 결정)                                      |

→ **백엔드 무변경**. middleware 단계 순서 + layout 책임 재배치만 명시 잠금.

### 2.2 게스트 차단 매트릭스 (스펙 §5 갱신 반영)

| 기능                                         | 데스크탑           | 모바일                                     |
| -------------------------------------------- | ------------------ | ------------------------------------------ |
| 채팅 송신                                    | 게스트 허용        | **게스트 허용** ✅ (변경: "차단" → "허용") |
| DJ 큐 등록/해제                              | 게스트 차단 (기존) | 게스트 차단 (기존)                         |
| 최소 큐잉 (add-tracks)                       | 게스트 차단 (기존) | 게스트 차단 (기존)                         |
| grab                                         | 게스트 차단 (기존) | 게스트 차단 (기존)                         |
| 리액션                                       | 누구나 (백엔드 ✅) | 누구나                                     |
| 입장 · 동기화 청취 · 크루 목록 · 로비 · 공유 | 누구나             | 누구나                                     |

**§5 변경 근거**: WS 이미 연결되어 채팅 송신은 추가 인프라 비용 0 · 모바일에서만 막으면 데스크탑↔모바일 일관성 깨짐 · 게스트의 채팅 참여 자체가 "혼자 아니다" 핵심 체험 가치라 막으면 깔때기 결정적 칸이 비워짐. 전환 압력은 DJ/큐잉/grab 게이트만으로 충분.

→ **모바일 신규 게이트 0건**. 모바일은 "데스크탑 정책 + 좁은 화면 레이아웃". 백엔드 무변경.

### 2.3 게이트 구현 위치

기존 데스크탑 게이트는 features 재사용으로 자동 상속:

- DJ 큐 / 큐잉 / grab → mutation 직전 가드 또는 백엔드 401 (현행)
- 채팅 → 게이트 없음 (모바일도 허용)
- 리액션 → 게이트 없음 (백엔드 ROLE_GUEST 허용 확정)

### 2.4 데스크탑 전용 라우트 모바일 진입 처리

스펙(05-22) §OUT 의 데스크탑 전용 라우트(`/settings/avatar`, `/parties/create`, 모더레이션, withdraw, bug-report 등) 에 모바일 디바이스로 직접 진입하면?

**3안 비교**:

| 안              | 동작                                          | 트레이드오프                         |
| --------------- | --------------------------------------------- | ------------------------------------ |
| A 통과          | 데스크탑 페이지가 모바일에서 그대로 렌더      | 좁은 화면에 UX 깨짐, 명시 안내 없음  |
| B 로비 redirect | `/parties` 로 튕김                            | 사용자가 왜 튕겼는지 모름            |
| **C 카드 안내** | "이 기능은 데스크탑에서 사용 가능합니다" 카드 | UX 명확, 데스크탑 안내 + 룸 복귀 CTA |

**채택 = C.** 가장 정직하고 사용자 친화적.

구현:

- middleware: 모바일 사본 없는 경로는 rewrite 안 함, 그대로 통과
- 해당 라우트 page top 에 `<MobileOnlyDesktopFeatureCard feature="..." />` 가드 1줄
- 카드 UI: "🖥️ 이 기능은 데스크탑에서 사용 가능합니다 — 룸으로 돌아가기" CTA
- 컴포넌트 1개(`shared/ui/components/mobile-only-desktop-feature-card`) 신규

**가드 대상 라우트** (스코프 §OUT 기반, chunk 2 일괄 가드 적용):

- `app/settings/avatar/**` (아바타 편집)
- `app/parties/create/**` (룸 생성)
- `app/settings/profile/**` (프로필 편집) — 단, 첫 가입 직후 강제 진입 케이스는 예외 처리 필요(plan 단계)
- `app/withdraw/**` (회원 탈퇴)
- 모더레이션 다이얼로그(block-crew · impose/lift-penalty · adjust-grade · lock/unlock-djing-queue · skip-playback) — 룸 안에 있는 trigger 라 모바일 shell 안에서 노출 자체 안 함(가드 카드 미사용)
- `features/bug-report` — 같은 패턴, plan 단계 확정

태스크 단위: chunk 2 의 "데스크탑 전용 가드 일괄 적용" sub-task 에서 라우트 별 가드 wiring.

### 2.5 self-routing 정책

| 상황                                            | 메서드                         | 사유                                                                              |
| ----------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------- |
| 게이트 (DJ/큐잉/grab) → sign-in                 | `router.replace`               | history 잔존 회피 ([[reference_oauth_callback_back_nav_pkce_bug]] PKCE 모달 패턴) |
| 모바일에서 데스크탑전용 라우트 진입 → 카드 표시 | navigation 없음                | 그 자리에서 안내                                                                  |
| 점검 중 → /maintenance                          | middleware rewrite (자동 승계) | 변경 없음                                                                         |

### 2.6 점검 페이지 자체

`/maintenance` 는 단일 — short message + 새로고침 hint. 데스크탑·모바일 분기 불필요(반응형 카드 1개). 점검 기능 자체는 자동 승계 (§2.1).

### 2.7 신규 컴포넌트 요약

| 컴포넌트                       | 위치                                                    | chunk | 용도                                                                                                           |
| ------------------------------ | ------------------------------------------------------- | ----- | -------------------------------------------------------------------------------------------------------------- |
| `MobileOnlyDesktopFeatureCard` | `shared/ui/components/mobile-only-desktop-feature-card` | 2     | 데스크탑 전용 라우트 모바일 진입 가드 카드. chunk 2 가 모바일 진입자가 잘못된 데스크탑 라우트 진입하는 첫 시점 |

§2 의 shared 신규 = **1개** (위 표). 게스트 판별은 기존 `@/entities/me` 의 `useIsGuest` 또는 `useFetchMe()` 결과 인라인 비교 사용. §1.7 의 사본 인벤토리에 합산됨 (총 신규 11).

---

## §3 정리 + 테스트 + 마이그레이션

### 3.1 본 개편이 트리거하는 정리

선행문서 `2026-04-19-mobile-desktop-redirect-design.md` "향후 제거" 1~4:

| 항목                               | 위치                                          | 처리                                                                                                                |
| ---------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `isMobileUA` util                  | `src/shared/lib/functions/is-mobile-ua.ts`    | **재사용**(util 자체는 유지·이름·경로 무변경; middleware §1.5.2 가 헤더 set 에 사용). chunk 1 에서 단위 테스트 보강 |
| middleware 내 mobile redirect 분기 | `src/middleware.ts` 차단 분기                 | **제거** (chunk 1; 동일 위치에 헤더 주입 단계 추가)                                                                 |
| `MobileGuard`                      | `app/_providers/mobile-guard.tsx` (또는 유사) | **제거** (chunk 5)                                                                                                  |
| `/mobile-notice` 라우트            | `app/mobile-notice/page.tsx`                  | **제거** (chunk 5)                                                                                                  |
| 관련 i18n 키                       | `ko.json`·`en.json` `mobile_notice_*` 군      | **제거** (chunk 5; xlsx 직접 수정 + 두 json 동기, [[feedback_pfplay_web_i18n_drift]] 적용)                          |

본 PR 시리즈 마지막 chunk 의 catch-up 으로 정리 ([[feedback_pr_series_workflow]] §12 패턴).

### 3.2 테스트 전략

| 레벨        | 대상                                                                                                                      | 도구·위치                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 단위        | `isMobileUA` util 매트릭스 보강 (iPhone·Android·iPad·Desktop·봇·임베디드 WebView)                                         | vitest, `src/shared/lib/functions/is-mobile-ua.test.ts` (신규 또는 보강)                     |
| 단위        | `widgets-mobile`·`features-mobile` 컴포넌트 렌더·이벤트                                                                   | vitest + RTL                                                                                 |
| 통합        | middleware 단계 합성 (점검 → `x-pf-device` 주입 → 언어 쿠키) + page.tsx 헤더 분기 (mock NextRequest, mock `next/headers`) | vitest                                                                                       |
| E2E         | 모바일 viewport (Playwright `devices['iPhone 13']`) + UA emulation. 게스트 룸 입장·청취·리액션·채팅, 멤버 DJ 등록·grab    | playwright, `e2e/mobile/*.spec.ts` 신규                                                      |
| 회귀 가드   | ROLE_GUEST 백엔드 케이스 (현 `PlaybackReactionCommandControllerTest` 가 ROLE_MEMBER + 무인증만 검증, GUEST 부재)          | platform 작은 동반 PR (1 테스트 케이스) [[reference_voc_bug_report_guest_test_lock_pending]] |
| 헤드드 측정 | 스코프 §후속확인 #4 "온기" 측정 ([[reference_frontend_playwright_debug]])                                                 | playwright headed, layout 측정                                                               |

모바일 E2E 는 **별도 워크플로우 트리거 추가** (PR 트리거 무거워지지 않게 nightly 또는 manual; 평시는 단위·통합 위주).

### 3.3 마이그레이션 — 빅뱅 ✗ → 점진 5-chunk

```
[Chunk 1] Foundation (layout/page 재구성 + middleware)
  - middleware 합성 변경 (§1.5.2): mobile redirect 분기 제거 + `x-pf-device` 헤더 주입 단계 추가
     + `setCookieToRequestHeader` helper 제거(merged-headers 패턴으로 흡수)
  - `isMobileUA` util 단위 테스트 보강 (매트릭스 명세 §3.2)
  - **layout/page 재구성** (§1.4.1 → §1.4.2):
     · `widgets/partyroom-page-desktop/lobby.tsx` 신설 — 기존 `(lobby)/page.tsx` 의 'use client' 본문
       + `(lobby)/layout.tsx` 의 `<Header />` + `app/parties/layout.tsx` 의 overlay 3개(MyPlaylist · SidebarPlayer · ModalPlayer) 흡수
     · `widgets/partyroom-page-desktop/room.tsx` 신설 — 기존 `(room)/[id]/page.tsx` 의 'use client' 본문
       + `(room)/[id]/layout.tsx` 의 `<main className='bg-partyRoom ...'>` bg 이미지 흡수(plan 단계 device-neutral 유지 옵션 검토)
     · `(lobby)/page.tsx` `'use client'` 제거 → RSC 변환, headers() 분기 (§1.5.3)
     · `(room)/[id]/page.tsx` `'use client'` 제거 → RSC 변환, headers() 분기
     · `(lobby)/layout.tsx` Header 렌더 제거 (minimal wrapper)
     · `app/parties/layout.tsx` ProtectedLayout 의 3 overlay 제거 (auth gate 만 유지)
     · `(room)/[id]/layout.tsx` enter/teardown · ?source strip 유지 (device 무관)
  - 모바일 shell placeholder (chunk 1 시점엔 mobile shell 미존재 — page.tsx 가 `<MobileFallbackCard />` 임시 카드 렌더, chunk 2 에서 실제 mobile shell 로 교체)
  - `/mobile-notice` 진입 redirect 작동 안 함(분기 제거됨) — 라우트 파일 자체는 chunk 5 에서 제거
  - 선행 catch-up: 2026-05-22 scope spec 트래킹 시작 (이미 본 브랜치 첫 commit `79e6ba4`)
  - GH 이슈 #340 본문에 §확정결정 5번 갱신(채팅 허용) 코멘트 추가
  → PR 1 (layout/page 재구성 + middleware 변경 — 데스크탑 동작 무변경 회귀 게이트가 본 PR 의 핵심 검증)

[Chunk 2] 로비 + 룸 청취
  - `widgets-mobile/partyroom-page-mobile/lobby` (모바일 로비 shell, page.tsx 분기 대상)
  - `widgets-mobile/partyroom-page-mobile/room` (모바일 룸 shell — 베이스 + 전광판만, 탭 콘텐츠는 chunk 3·4)
  - `widgets-mobile/partyroom-display-board` (전광판 sticky · 리액션 inline)
  - `widgets-mobile/partyroom-crews-panel` (크루 탭 콘텐츠 — chunk 3 의 탭 구조에서 사용)
  - `features-mobile/partyroom/list` (로비 1컬럼 카드)
  - `shared/ui/components/mobile-only-desktop-feature-card` (데스크탑 전용 라우트 모바일 진입 가드, §2.4)
     데스크탑 전용 페이지 top 에 가드 적용 (avatar·create·withdraw·moderation 등 일괄)
  - 게스트 청취·리액션 동작
  → PR 2

[Chunk 3] 채팅 + 크루 탭
  - `widgets-mobile/partyroom-chat-panel` (탭 + 키보드 + 입력부)
  - 모바일 룸 shell 의 탭 구조 (채팅/크루/큐) + 탭바 활성화 (chunk 2 의 베이스 위에)
  - 크루 탭 콘텐츠 wiring (chunk 2 의 crews-panel 사용)
  - 게스트 채팅 허용 (별도 게이트 없음 — §2.2 갱신)
  → PR 3

[Chunk 4] DJ + 큐잉
  - `widgets-mobile/partyroom-djing-dialog` (풀스크린 sheet)
  - `widgets-mobile/music-preview-player` (좁은 화면 변형)
  - `features-mobile/playlist/add-tracks` (검색→프리뷰→큐 흐름)
  - `features-mobile/partyroom/select-playlist-for-djing` (모바일 셀렉터)
  - 큐 탭 콘텐츠 (게스트 → 로그인 CTA / 멤버 → 액션)
  - grab + DJ 등록 동작
  → PR 4

[Chunk 5] 정리 catch-up
  - `MobileGuard` · `/mobile-notice` 라우트 · `mobile_notice_*` i18n 키 완전 제거 (§3.1)
  - 모바일 fallback 카드(chunk 1 도입분) 제거 — 본 chunk 시점엔 모든 페이지 채워짐
  - 모바일 E2E 시나리오 (Playwright)
  - ROLE_GUEST 백엔드 회귀 테스트 동반 (pfplay-platform 작은 동반 PR: `PlaybackReactionCommandControllerTest` 에 GUEST 케이스 1건)
  → PR 5 (pfplay-web) + PR 5b (pfplay-platform 회귀 가드)
```

**Chunk 1↔2 사이 prod 상태**: 모바일 UA 진입자는 page.tsx shim 의 모바일 분기(null + fallback 카드) 를 만남 — 빈 페이지 아닌 명시 안내. chunk 2 부터 카드가 실제 모바일 페이지로 교체된다.

**Chunk 2↔3 사이 prod 상태**: 모바일 룸 입장 가능, 전광판·리액션·크루(panel만, 탭바 없음 또는 임시 wiring) 동작. 채팅 탭/큐 탭 wiring 미완 — chunk 2 의 룸 shell 이 탭바 placeholder 와 "곧 채팅·큐 출시" 카드 노출. 사용자 체험 = 청취·리액션·로비 (게스트 맛보기 절반 출시).

**Chunk 5 cross-repo**: pfplay-web PR 5 와 pfplay-platform PR 5b 는 독립 머지 가능(테스트만 추가). 동시 머지 권장하나 비동기 OK.

### 3.4 안전망

- Chunk 1 직후 prod 모바일 진입자가 빈 페이지 보지 않게 fallback 카드 + 데스크탑 안내 (현 `/mobile-notice` 와 동일 톤). chunk 5 에서 제거.
- 각 chunk dev/stg 머지 후 사용자 헤드드 확인 슬롯 (스코프 §후속확인 #4 "온기" 측정 은 chunk 2 직후가 자연스러움 — display-board·crew 가 같이 나가는 시점).
- chunk 별 prod 중간 상태는 §3.3 의 chunk 사이 prod 상태 노트 참조.

### 3.5 PR 시리즈 정책 (메모리 적용)

- [[feedback_pr_series_workflow]] 5-PR 시리즈, chunk 단위 confirm, polish follow-up 패턴, 마지막 chunk §catch-up
- [[feedback_commit_consolidation_before_push]] 각 PR push 전 logical squash
- [[feedback_korean_issue_commit_pr]] 한글 PR/이슈/커밋. GH 이슈 먼저 등록
- [[feedback_main_squash_merge]] develop 으로는 merge 보존, main 승격 시 squash/merge 판단
- 각 PR: spec(필요 시 리뷰) + plan(리뷰) + B 모드(직접 구현 + 최종 holistic reviewer) ([[project_observability_b1b2_merged]] 통찰 — 중간 규모 단일 feature 는 풀 subagent-driven 의 review 무게 과중)
- [[wait-all-ci-incl-e2e-before-merge]] 머지 전 전 CI green 확인 + web 은 머지=stg 배포라 post-merge E2E 모니터링

### 3.6 진실 원천

- 본 스펙 = `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` (본 파일)
- 선행 스코프 = `docs/superpowers/specs/2026-05-22-mobile-responsive-scope-design.md` (본 브랜치 첫 커밋 `79e6ba4` 에 이미 트래킹됨)
- GH 이슈 #340 본문은 §확정결정 5번 갱신(채팅 허용) 을 **chunk 1 PR 시점** 에 코멘트로 반영 (가장 이른 시점, 후속 chunk 의 게이트 처리 정합 확보)

---

## §4 레이아웃

### 4.1 디자인 기준 (잠금)

- **기준 폭 = 375px** (iPhone SE2/3). 더 넓은 모바일은 자연 늘어남.
- **세로 사용 가정.** 가로는 동작은 하지만 미최적(의도).
- **터치 타겟 ≥ 44×44** (iOS HIG)
- **세이프 에어리어 존중** (notch / 홈인디케이터)
- **기존 디자인 시스템 재사용** — `shared/ui/components` 토큰·typography·color·spacing. 모바일 전용 토큰 추가 없음
- **Tailwind v3** 그대로. 모바일 트리는 모바일에서만 렌더됨이 보장이라 `md:` 같은 분기 불필요

### 4.2 파티룸 페이지 (가장 복잡 — 본 개편 핵심)

구조: 헤더 → 전광판(상단 sticky) → 탭 콘텐츠 → 하단 탭바.

```
iPhone SE2/3 (375 × 667) 기준 — useful height ≈ 643

┌─ safe-area-inset-top (notch) ─┐  20–47
├────────────────────────────────┤
│  ←   룸 이름 · 입장중 (점멸)  ⋮ │  헤더 48
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │ ▶ Track Title              │ │
│ │   Artist                    │ │
│ │   🎧 DJ Nickname            │ │  전광판 ~210
│ │   ━━━━━━━━━━━ 02:34 / 4:21 │ │  (sticky)
│ │                             │ │
│ │   [👍 12]  [💚 5]  [👎 2]   │ │  리액션 inline
│ └────────────────────────────┘ │
├────────────────────────────────┤  탭 콘텐츠 (flex-1, 스크롤)
│                                 │
│  Nick: 좋다 이거                 │
│  Nick: ㅋㅋㅋㅋ                  │
│  Nick: 🔥🔥🔥                   │
│  ...                            │
│                                 │
│ ┌────────────────────┬────────┐│  채팅 입력 (탭 내 하단 sticky)
│ │ 메시지 입력 …       │  →     ││
│ └────────────────────┴────────┘│
├────────────────────────────────┤
│ [💬 채팅]  [👥 12]  [🎧 큐 3]   │  탭바 56
├─ safe-area-inset-bottom ──────┤  0–34
```

#### 4.2.1 탭 3개

| 탭          | 콘텐츠                      | 게이트                          |
| ----------- | --------------------------- | ------------------------------- |
| 💬 채팅     | 메시지 스크롤 + 입력부      | 누구나 (게스트 포함, §2.2 갱신) |
| 👥 크루 (N) | DJ + 청취자 리스트 (썸네일) | 누구나                          |
| 🎧 큐 (N)   | DJ 큐 + 큐잉 액션           | 게스트 → 로그인 CTA             |

**기본 진입 탭 = 채팅** (가장 흔히 보는 것). URL `#crew` · `#queue` hash 로 탭 상태 보존(공유링크는 hash 없으면 채팅). hash 는 브라우저 단에서만 처리되어 서버에 안 가므로 middleware 의 `x-pf-device` 헤더 주입과 무충돌. 단 SSR 초기 렌더 시점에 hash 를 읽을 수 없으므로(`window` 미존재) **클라이언트 mount 후 hash 읽어 활성 탭 결정** — 깜빡임 1프레임 수용(또는 default = 채팅 으로 stub). 구체 router·sync 패턴은 plan 단계.

#### 4.2.2 전광판 sticky 정책

- 항상 상단 고정. 스크롤·탭 전환·키보드와 무관하게 노출.
- CSS `position: sticky; top: <헤더높이>` + 키보드 핸들링 (모바일 키보드 올라올 때 자연스럽게 가려져도 무방).
- 리액션 버튼은 전광판 inline (플로팅 X 권장). 플로팅은 채팅·키보드와 충돌.

#### 4.2.3 헤더 우측 ⋮ 메뉴

- 공유 (`features/partyroom/share-link`)
- 룸 정보
- 나가기 (확인 모달)

### 4.3 크루 탭

```
├────────────────────────────────┤
│ 12명 청취 중                    │  세그먼트 헤더 (sticky)
│ ─────────────────────────       │
│ [🎵] Nick (DJ)                  │  44px 터치 타겟, DJ 표식 강조
│ [👤] Nick                       │
│ [👤] Nick                       │
│  ...                            │  스크롤
└────────────────────────────────┘
```

- 아바타 썸네일 32×32 + 닉 + DJ 표식. 탭/롱탭 액션은 v1 미포함 (스코프 §OUT: 모더레이션 데스크탑 전용).

### 4.4 큐 탭 (게스트 vs 멤버)

**멤버**:

```
├────────────────────────────────┤
│ DJ 큐                           │
│ 1. Nick — Playlist "토요일밤"   │
│ 2. Nick — Playlist "Chill"      │
│ 3. (대기 슬롯)                  │
│ ─────────────────────────       │
│  ▾ 내 플레이리스트 선택          │  큐잉 액션 (하단 sticky)
│  [ + DJ 등록 ]                  │
└────────────────────────────────┘
```

**게스트**:

```
├────────────────────────────────┤
│ DJ 큐                           │
│ 1. Nick — Playlist "..."        │  큐 자체는 보임(체험)
│ 2. Nick — Playlist "..."        │
│ ─────────────────────────       │
│ ┌─────────────────────────────┐ │  로그인 CTA
│ │ 🎧 음악을 직접 틀어보세요    │ │
│ │   3초만에 가입 →             │ │
│ └─────────────────────────────┘ │
└────────────────────────────────┘
```

### 4.5 로비 페이지 (`/parties` mobile)

```
┌─ 헤더 ────────────────────────┐
│  파티 찾기                  ⋮   │
├────────────────────────────────┤
│ ┌────────────────────────────┐ │
│ │ [▶ 썸네일 큰 사이즈]        │ │  카드 그리드 → 풀폭 1컬럼
│ │  룸 이름                     │ │
│ │  🎧 DJ Nick · 👥 12명        │ │
│ │  지금 듣는 곡 · Artist       │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ ...                          │ │
│ └────────────────────────────┘ │
│  (무한 스크롤)                  │
└────────────────────────────────┘
```

- 카드 하나에 충분한 정보 (썸네일·DJ·인원·now-playing)
- 룸 생성 버튼 = OUT (스코프 §OUT) → 모바일 헤더에 표시 안 함

### 4.6 기타 페이지

| 페이지                                         | 처리                                                                                               |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/sign-in`                                     | 그대로 사용 (이미 모바일 적절). page.tsx 분기 불필요 — 단일 컴포넌트 디자인이 모바일·데스크탑 호환 |
| `/link/[linkDomain]`                           | redirect-only 페이지 (그대로)                                                                      |
| `/maintenance`                                 | 단일 페이지 반응형 카드                                                                            |
| 데스크탑 전용 진입 (avatar·create·withdraw 등) | `MobileOnlyDesktopFeatureCard` 표시 (§2.4)                                                         |

### 4.7 가로 회전 · 큰 모바일 · 태블릿

| 상황                            | 동작                                                |
| ------------------------------- | --------------------------------------------------- |
| iPhone 세로                     | 정확히 §4.2 레이아웃                                |
| iPhone 가로                     | 모바일 트리 그대로 (CSS 자연 늘어남, 미최적 — 의도) |
| Pro Max (430px+)                | 자연 늘어남, 더 여유                                |
| iPad (최신 Safari = desktop UA) | 데스크탑 트리로 들어감 (의도)                       |
| Android 360 (가장 좁음)         | 폰트·간격 약간 좁아지나 전부 표시                   |

### 4.8 §3 마이그레이션 정합

| Chunk        | 본 §4 영역                                                                   | 정합 |
| ------------ | ---------------------------------------------------------------------------- | ---- |
| 1 Foundation | middleware + page.tsx shim + fallback 카드 (실제 UI 0)                       | ✅   |
| 2 로비+청취  | 로비 1컬럼 + 룸 헤더 + 전광판(sticky·리액션 inline) + 데스크탑전용 가드 카드 | ✅   |
| 3 채팅+크루  | 탭바 + 채팅 탭 + 크루 탭 wiring                                              | ✅   |
| 4 DJ+큐잉    | 큐 탭 (게스트 CTA / 멤버 액션) + add-tracks 모바일                           | ✅   |
| 5 정리       | fallback 카드·`/mobile-notice`·MobileGuard·i18n 제거 + E2E + 백엔드 동반 PR  | ✅   |

→ 시퀀스 무수정.

---

## 비목표 (Non-goals)

- m.pfplay.xyz 별도 호스트
- `?desktop=1` force-desktop opt-out v1 (escape hatch 만 가능성 보존)
- 모더레이션 · 아바타 편집 · 룸 생성의 모바일화 (스코프 §OUT 그대로)
- cinema 모드 모바일
- 모바일 전용 디자인 토큰
- 가로 모드 최적화
- 데스크탑 UX 변경

---

## 결정 이력

| 날짜       | 결정                                                                                               | 내용                                                                                                                                                                                                                                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-22 | 스코프 5건 잠금                                                                                    | 신규 (선행 스펙)                                                                                                                                                                                                                                                                                                                          |
| 2026-05-28 | 호스팅 = C (같은 도메인 + 강한 격리)                                                               | 신규 (3안 비교 후 채택)                                                                                                                                                                                                                                                                                                                   |
| 2026-05-28 | 격리 강도 = C3 (페이지+widgets+features 분리)                                                      | 신규 (3단계 비교 후 채택)                                                                                                                                                                                                                                                                                                                 |
| 2026-05-28 | 모바일 게스트 채팅 = **허용**                                                                      | 갱신 (05-22 §5 "차단" → "허용")                                                                                                                                                                                                                                                                                                           |
| 2026-05-28 | 데스크탑전용 라우트 모바일 진입 = 카드 안내                                                        | 신규 (3안 비교 후 C 채택)                                                                                                                                                                                                                                                                                                                 |
| 2026-05-28 | 5-chunk 마이그레이션 시퀀스                                                                        | 신규                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-28 | 룸 = 탭3 + 전광판 sticky + 리액션 inline                                                           | 신규 (스코프 "방향성" 확정)                                                                                                                                                                                                                                                                                                               |
| 2026-05-28 | 가로 모드 = 모바일 트리 그대로 (미최적)                                                            | 신규                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-28 | force-desktop v1 = 미포함                                                                          | 신규 (escape hatch 가능성만)                                                                                                                                                                                                                                                                                                              |
| 2026-05-28 | **C 구현 패턴 = page.tsx 헤더 conditional 렌더** (Route Group `(desktop)/(mobile)` 더블 스택 폐기) | 정정 (스펙 리뷰 1회차 반영) — 초기 안의 두 `page.tsx` 가 동일 URL 로 resolve 되는 Next.js App Router 빌드 충돌 회피. C/C3/공유링크 보존/코드 격리 등 상위 결정은 그대로, 구현 메커니즘만 교체                                                                                                                                             |
| 2026-05-28 | **Chunk 1 = layout/page 재구성 명시** + middleware merged-headers + useIsGuest 기존 재사용         | 정정 (스펙 리뷰 2회차 반영) — page.tsx 들이 `'use client'` 였고 ProtectedLayout 과 (lobby)/layout 이 desktop overlay·Header 를 렌더하던 사실을 반영. 기존 client 로직 + Header + overlay 3개를 desktop shell 로 이동, page.tsx RSC 변환. `useIsGuest` 가 `@/entities/me` 에 이미 존재(async)함 확인 — 신규 추가 없음. 신규 카운트 12 → 11 |

---

## 관련 메모리

- [[project_mobile_responsive_scope_340]] — 스코프 진입점
- [[feedback_pr_series_workflow]] — PR 시리즈 패턴
- [[feedback_commit_consolidation_before_push]] — push 전 squash
- [[feedback_korean_issue_commit_pr]] — 한글 + GH 이슈 먼저
- [[feedback_elegant_no_code_dirtying]] — 우아한 구현
- [[feedback_pfplay_web_i18n_drift]] — i18n 키 제거 시 xlsx ↔ json 동기
- [[reference_voc_bug_report_guest_test_lock_pending]] — ROLE_GUEST 회귀 가드 정신
- [[reference_oauth_callback_back_nav_pkce_bug]] — router.replace 정책 출처
- [[reference_frontend_playwright_debug]] — 헤드드 측정 패턴
- [[wait-all-ci-incl-e2e-before-merge]] — 머지 게이트
- [[reference_branch_env_mapping]] — pfplay-web 2-tier (development=stg)
- [[project_observability_b1b2_merged]] — B 모드 (직접 구현 + 최종 reviewer) 통찰
- [[single-partyroom-subscription-invariant]] — Cluster A 정합 유지

---

## 트리거되는 정리 (PR 시리즈 catch-up 으로 처리)

선행문서 `2026-04-19-mobile-desktop-redirect-design.md` "향후 제거" 1~4:

- `isMobileUA` 미들웨어 차단 분기 (chunk 1 에서 제거)
- `MobileGuard` (chunk 1)
- `/mobile-notice` 라우트 (chunk 5)
- 관련 i18n 키 (chunk 5, xlsx 동기 동반)

2026-05-22 scope spec (현재 untracked) — chunk 1 의 catch-up 으로 git 트래킹 시작.

---

## 후속

본 brainstorm 종결 후 writing-plans 스킬로 구현 계획 단계 진입. Chunk 1 (Foundation) 부터 spec → plan → TDD 또는 B 모드(직접 구현 + 최종 reviewer) 로 5-chunk 시리즈 시작.
