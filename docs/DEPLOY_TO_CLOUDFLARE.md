# Cloudflare Workers 배포 이전기

PFPlay 웹 프론트엔드를 기존 Node.js 서버 기반 배포에서 Cloudflare Workers로 이전하는 과정을 기록한다.

---

## 목차

1. [왜 Cloudflare Workers인가](#1-왜-cloudflare-workers인가)
2. [배포 구조의 차이 이해하기](#2-배포-구조의-차이-이해하기)
3. [이전 작업 개요](#3-이전-작업-개요)
4. [추가된 파일들의 역할](#4-추가된-파일들의-역할)
5. [호환성 문제 1: Next.js 버전](#5-호환성-문제-1-nextjs-버전)
6. [호환성 문제 2: OG 이미지 라우트](#6-호환성-문제-2-og-이미지-라우트)
7. [보안 검토](#7-보안-검토)
8. [남은 과제](#8-남은-과제)

---

## 1. 왜 Cloudflare Workers인가

기존 배포 방식은 EC2 위에서 PM2로 Next.js standalone 서버를 직접 운영하는 방식이었다. 관리 포인트가 많고, 글로벌 엣지 배포가 어려우며, 트래픽 급증 시 수동 대응이 필요했다.

Cloudflare Workers는 다음 이점을 제공한다.

- **글로벌 엣지 배포**: 별도 설정 없이 전 세계 300개 이상의 PoP(Point of Presence)에서 응답
- **서버리스**: 항상 떠있는 프로세스 없이 요청이 올 때만 실행, 인프라 관리 부담 감소
- **정적 에셋 CDN 내장**: Cloudflare의 CDN이 자동으로 정적 파일을 캐시 및 서빙
- **비용 구조**: 요청 수 기반 과금으로 트래픽이 없을 때 비용 없음

PFPlay는 프론트엔드 중심의 서비스로, API 라우트는 백엔드 API를 프록시하거나 OG 이미지를 생성하는 정도로 가볍다. Cloudflare Workers 이전에 적합한 구조였다.

---

## 2. 배포 구조의 차이 이해하기

### 기존: Node.js Standalone 서버

```
next build → standalone 빌드
└── server.js          ← Node.js HTTP 서버 (항상 실행 중)
└── node_modules/      ← 서버 실행 의존성
└── .next/server/      ← SSR 코드

실행: node server.js (PM2로 프로세스 관리)
```

standalone 모드는 Node.js 프로세스가 **항상 메모리에 떠있으면서** 들어오는 요청을 처리한다. 파일시스템 접근, Node.js 내장 모듈, 네이티브 바이너리 등을 자유롭게 쓸 수 있다.

### 이후: Cloudflare Workers

```
opennextjs-cloudflare build → Workers 빌드
└── .open-next/worker.js    ← 단일 번들 파일 (요청마다 실행)
└── .open-next/assets/      ← 정적 파일 (Cloudflare CDN이 직접 서빙)

실행: 요청이 올 때만 V8 Isolate에서 실행, 종료
```

Workers는 실행 모델 자체가 다르다.

| 항목              | Node.js Standalone      | Cloudflare Workers                |
| ----------------- | ----------------------- | --------------------------------- |
| 런타임            | Node.js                 | V8 Isolate                        |
| 실행 방식         | 항상 실행 중인 프로세스 | 요청당 이벤트 드리븐              |
| 파일시스템        | 접근 가능               | **불가**                          |
| Node.js 내장 모듈 | 완전 지원               | 일부만 (`nodejs_compat` 플래그로) |
| 메모리 상태       | 요청 간 유지 가능       | 요청 간 유지 안됨                 |
| 네이티브 바이너리 | 실행 가능               | **불가**                          |

`opennextjs-cloudflare build`는 이 차이를 메워주는 어댑터로, Next.js 앱을 Workers 런타임 제약에 맞게 변환하고 단일 JS 파일로 번들링한다.

---

## 3. 이전 작업 개요

### 설치한 패키지

```bash
yarn add @opennextjs/cloudflare
yarn add -D wrangler
```

### 추가/수정된 파일

| 파일                                                   | 유형 | 역할                                          |
| ------------------------------------------------------ | ---- | --------------------------------------------- |
| `wrangler.jsonc`                                       | 신규 | Cloudflare Workers 배포 설정                  |
| `open-next.config.ts`                                  | 신규 | OpenNext 어댑터 설정                          |
| `public/_headers`                                      | 신규 | 정적 에셋 캐시 헤더                           |
| `next.config.js`                                       | 수정 | 개발 환경 Cloudflare 런타임 시뮬레이션 추가   |
| `package.json`                                         | 수정 | `cf:*` 스크립트 추가, Next.js 버전 업그레이드 |
| `src/app/api/og/route.tsx`                             | 수정 | Workers 호환 방식으로 OG 이미지 생성 교체     |
| `src/app/layout.tsx`                                   | 수정 | Next.js 15 API 변경 대응                      |
| `src/shared/lib/localization/get-server-dictionary.ts` | 수정 | Next.js 15 API 변경 대응                      |
| `src/app/link/[linkDomain]/layout.tsx`                 | 수정 | Next.js 15 API 변경 대응                      |

---

## 4. 추가된 파일들의 역할

### `wrangler.jsonc`

Wrangler(Cloudflare의 CLI 도구)가 읽는 배포 설정 파일이다. Vercel의 `vercel.json`과 유사한 역할을 한다.

```jsonc
{
  "main": ".open-next/worker.js", // 워커 진입점
  "name": "pfplay",
  "compatibility_date": "2026-03-12",
  "compatibility_flags": [
    "nodejs_compat", // Node.js API 일부 허용
    "global_fetch_strictly_public", // fetch를 공개 인터넷으로만 제한
  ],
  "assets": {
    "directory": ".open-next/assets", // 정적 파일 위치
    "binding": "ASSETS",
  },
  "images": {
    "binding": "IMAGES", // Cloudflare Images 서비스 바인딩
  },
}
```

`nodejs_compat` 플래그는 Workers에서 `crypto`, `Buffer` 같은 Node.js 내장 API를 쓸 수 있게 해준다. 이 플래그 없이는 많은 npm 패키지들이 동작하지 않는다.

`global_fetch_strictly_public`은 Workers에서 보내는 `fetch` 요청을 공개 인터넷 주소로만 허용하는 플래그다. 내부 프라이빗 네트워크로의 요청을 차단한다. PFPlay의 백엔드 API(`pfplay-api.app`)가 공개 인터넷에서 접근 가능하기 때문에 적용 가능했다.

### `open-next.config.ts`

```ts
import { defineCloudflareConfig } from '@opennextjs/cloudflare';
export default defineCloudflareConfig({});
```

현재는 기본 설정만 사용한다. 추후 캐싱 전략, ISR 설정, 커스텀 미들웨어 등을 여기서 제어할 수 있다.

### `public/_headers`

```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

Next.js가 빌드하는 정적 에셋(`_next/static/` 경로의 JS 청크, CSS 등)에 1년 캐시를 적용한다.

**왜 1년이어도 안전한가:** Next.js는 파일 내용이 바뀔 때 파일명의 해시도 함께 바꾼다.

```
패치 전: /_next/static/chunks/layout-a3f9c2d1.js
패치 후: /_next/static/chunks/layout-b7e1f042.js  ← URL 자체가 달라짐
```

브라우저는 URL 기준으로 캐시하므로, 코드가 바뀌면 새 URL로 새 파일을 받는다. `immutable`은 "이 URL의 파일은 절대 바뀌지 않으니 서버에 재검증 요청도 보내지 말라"는 선언이다. CDN과 브라우저 모두 불필요한 네트워크 요청을 완전히 생략하게 된다.

### `next.config.js`에 추가된 코드

```js
if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then((m) => m.initOpenNextCloudflareForDev());
}
```

`yarn dev`로 로컬 개발할 때 Cloudflare Workers 런타임 환경을 시뮬레이션해주는 초기화 코드다. 이게 없으면 로컬에서는 Node.js 환경으로 잘 돌다가, Workers에 배포하면 런타임 차이로 에러가 발생하는 상황을 발견하기 어렵다.

---

## 5. 호환성 문제 1: Next.js 버전

### 문제 발견

`@opennextjs/cloudflare@^1.17.1`의 `peerDependencies`를 확인하니 Next.js 14를 지원하지 않았다.

```json
"next": "~15.0.8 || ~15.1.12 || ~15.2.9 || ~15.3.9 || ..."
```

프로젝트는 Next.js `14.2.15`를 사용 중이었다. 처음에는 `--dangerouslyUseUnsupportedNextVersion` 플래그로 빌드를 우회했는데, 이는 프로덕션에서 예상치 못한 런타임 에러를 유발할 수 있는 임시방편이었다.

### 해결: Next.js 15로 업그레이드

타겟 버전으로 `~15.2.9`를 선택했다. 가장 안정적인 15.x 버전이면서 `@opennextjs/cloudflare`가 공식 지원하는 버전이기 때문이다.

Next.js 15에서 breaking change가 있는 API를 코드베이스 전체에서 탐색했다.

#### `cookies()` 비동기 전환 (2곳)

Next.js 15에서 `cookies()`가 동기 함수에서 비동기 함수로 변경됐다.

```ts
// Before (Next.js 14)
const lang = cookies().get(LANGUAGE_COOKIE_KEY)?.value;

// After (Next.js 15)
const lang = (await cookies()).get(LANGUAGE_COOKIE_KEY)?.value;
```

영향받은 파일:

- `src/app/layout.tsx`
- `src/shared/lib/localization/get-server-dictionary.ts`

#### `params` 타입 변경 (1곳)

Next.js 15에서 `generateMetadata`와 페이지 컴포넌트의 `params`가 `Promise` 타입으로 변경됐다.

```ts
// Before (Next.js 14)
type Props = { params: { linkDomain: string } };

export async function generateMetadata({ params }: Props) {
  const partyroom = await fetchPartyroomByLink(params.linkDomain);
  // ...
  images: [`/api/og?linkDomain=${params.linkDomain}`],
}

// After (Next.js 15)
type Props = { params: Promise<{ linkDomain: string }> };

export async function generateMetadata({ params }: Props) {
  const { linkDomain } = await params;
  const partyroom = await fetchPartyroomByLink(linkDomain);
  // ...
  images: [`/api/og?linkDomain=${linkDomain}`],
}
```

영향받은 파일:

- `src/app/link/[linkDomain]/layout.tsx`

#### 결과

변경 범위가 예상보다 작았다. 프로젝트가 App Router를 사용하고 있었고, 서버 컴포넌트에서 `cookies()`, `headers()` 같은 dynamic API를 많이 쓰지 않는 구조였기 때문이다. TypeScript 타입 체크(`yarn test:type`) 기준으로 Next.js 버전 업그레이드로 인한 새로운 타입 에러는 없었다.

---

## 6. 호환성 문제 2: OG 이미지 라우트

### OG 이미지 라우트의 역할

`/api/og`는 파티룸 링크를 카카오톡, 트위터, 슬랙 등 SNS에 공유할 때 미리보기로 노출되는 OG(Open Graph) 이미지를 동적으로 생성하는 서버 라우트다.

```
사용자가 파티룸 링크를 SNS에 공유
→ SNS 크롤러가 <meta property="og:image" content="/api/og?linkDomain=xxx" /> 읽음
→ /api/og 라우트 실행
→ 해당 파티룸의 제목, 소개, 현재 재생 중인 곡의 썸네일을 백엔드 API에서 조회
→ 조회 결과를 담은 1200×630 이미지 생성 후 응답
```

파티룸마다 다른 내용이 이미지로 표시되어야 하므로 정적 이미지가 아닌 동적 생성이 필요했고, 서버 사이드에서 JSX 렌더링으로 이미지를 만드는 방식을 택했다.

### 문제 발견

기존 구현은 다음 라이브러리들을 사용했다.

```ts
import { readFile } from 'node:fs/promises'; // Node.js 파일시스템
import { Resvg } from '@resvg/resvg-js'; // Rust 기반 네이티브 바이너리
import satori from 'satori'; // JSX → SVG 변환 라이브러리
```

흐름은 `JSX → satori(SVG 생성) → Resvg(PNG 변환)` 3단계였다. satori가 폰트 데이터를 직접 받아야 하기 때문에 `readFile`로 `public/fonts/NotoSansKR-Regular.otf`를 읽어 주입했고, 로고 이미지 역시 `readFile`로 base64 인코딩 후 사용했다.

Workers 환경에서는 두 가지 이유로 이 코드가 동작할 수 없다.

1. **파일시스템 없음**: Workers에는 디스크가 없다. `readFile` 자체가 실행 오류를 낸다.
2. **네이티브 바이너리 불가**: `@resvg/resvg-js`는 Rust로 컴파일된 네이티브 바이너리다. Workers의 V8 Isolate는 JS/WASM만 실행할 수 있어 네이티브 바이너리 로딩이 불가하다.

### 1차 해결: `next/og`의 `ImageResponse`로 교체

```ts
import { ImageResponse } from 'next/og';

return new ImageResponse(
  <div style={{ ... }}>...</div>,
  { width: 1200, height: 630 }
);
```

`next/og`는 내부적으로 satori를 사용하지만, 파일시스템 없이 Web API만으로 동작하도록 설계되어 있어 Workers에서 실행된다. `@resvg/resvg-js` 없이도 PNG를 직접 생성한다. 3단계 파이프라인이 한 줄로 줄어드는 부수 효과도 있었다.

### Pros / Cons 비교

|               | 기존 (satori + Resvg)         | 변경 후 (next/og)     |
| ------------- | ----------------------------- | --------------------- |
| Workers 호환  | 불가                          | 가능                  |
| 코드 복잡도   | 높음 (3단계 파이프라인)       | 낮음                  |
| 커스텀 폰트   | 로컬 파일 직접 로딩           | `fetch()`로 로딩 필요 |
| 렌더링 제어   | Resvg 옵션으로 세밀 제어 가능 | 블랙박스              |
| CSS 지원 범위 | satori 제약과 동일            | satori 제약과 동일    |
| 번들 크기     | `@resvg/resvg-js` 포함        | 불필요 의존성 제거    |

### 2차 문제: 한글 폰트

1차 교체 후 새로운 문제가 드러났다. 기존 코드에서 `readFile`로 읽어 satori에 주입하던 한글 폰트(`NotoSansKR-Regular.otf`)가 사라진 것이다. 폰트 없이 렌더링하면 파티룸 제목, 소개 등 한글 텍스트가 깨진다.

이 시점에서 `public/` 디렉토리 전반에 대한 Workers 접근 방식을 다시 정리할 필요가 있었다.

**`public/` 파일에 접근하는 두 가지 방식:**

| 방식                               | Node.js | Workers                         |
| ---------------------------------- | ------- | ------------------------------- |
| `fs.readFile('/public/fonts/...')` | 가능    | **불가** (파일시스템 없음)      |
| `fetch('https://host/fonts/...')`  | 가능    | **가능** (정적 에셋은 CDN 서빙) |

`public/icons`, `public/images`의 파일들은 브라우저가 URL로 요청하는 방식으로만 쓰이기 때문에 Workers 이전에 영향이 없다. 문제는 서버 코드에서 `fs`로 읽는 경우뿐이고, OG 라우트만 해당됐다.

폰트 파일은 `opennextjs-cloudflare build` 시 `.open-next/assets/`로 복사되어 Cloudflare CDN을 통해 URL 접근이 가능하다. 따라서 `fs.readFile` 대신 `fetch()`로 같은 파일을 가져올 수 있다.

### 2차 해결: 정적 에셋 URL로 폰트 fetch

```ts
// fs.readFile 대신 fetch로 정적 에셋 요청
const fontRes = await fetch(new URL('/fonts/NotoSansKR-Regular.otf', request.url));
const fontData = await fontRes.arrayBuffer();

return new ImageResponse(
  <div style={{ fontFamily: 'NotoSansKR' }}>...</div>,
  {
    width: WIDTH,
    height: HEIGHT,
    fonts: [
      {
        name: 'NotoSansKR',
        data: fontData,
        weight: 400,
        style: 'normal',
      },
    ],
  }
);
```

`new URL('/fonts/NotoSansKR-Regular.otf', request.url)`은 현재 요청의 origin을 base로 삼아 URL을 구성한다. 로컬 개발(`localhost:3000`), 스테이징, 프로덕션 등 환경마다 origin이 달라도 하드코딩 없이 올바른 URL이 만들어진다.

---

## 7. 보안 검토

```bash
# 로컬 개발 (Cloudflare 런타임 시뮬레이션 포함)
yarn dev

# Cloudflare용 빌드
yarn cf:build

# 로컬에서 Cloudflare 환경으로 미리보기
yarn cf:preview

# Cloudflare Workers로 배포
yarn cf:deploy

# wrangler 바인딩 타입 자동 생성
yarn cf:typegen
```
