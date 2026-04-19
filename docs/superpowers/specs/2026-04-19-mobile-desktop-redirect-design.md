# 모바일 데스크탑 유도 페이지

> **작성일**: 2026-04-19
> **브랜치**: `feat/mobile-desktop-redirect` > **상태**: 설계 확정

---

## 목적

모바일로 접속한 사용자에게 데스크탑 접속을 안내하는 전용 페이지를 표시한다. 반응형 개편이 완료되기 전까지의 임시 대응이다.

## 요구사항

- 모바일로 접속하면 **모든 페이지**에서 유도 페이지로 리다이렉트
- 안내 텍스트만 표시, 별도 행동(URL 복사, 우회 접속 등) 없음
- 기존 서비스 디자인 패턴(다크 테마, 로고, 중앙 정렬) 준수
- 다국어 지원 (KO/EN)

## 감지 방식

### 서버 (1차): Next.js 미들웨어

`src/middleware.ts`에서 `User-Agent` 헤더를 파싱하여 모바일 여부를 판단한다. 모바일이면 `/mobile-notice`로 리다이렉트한다.

**모바일 판정 기준**: UA에 `Mobile`, `Android`, `iPhone` 등의 키워드 포함 여부. 정규식:

```
/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i
```

> **iPad 제외 사유**: iPadOS 13+부터 iPad는 데스크탑 Safari UA를 전송한다. 별도로 `iPad`를 포함시켜도 실제 최신 iPad를 감지하지 못하며, 오히려 iPad Pro 등 충분한 뷰포트를 가진 기기를 잘못 차단할 수 있다.

**리다이렉트 루프 방지**: `/mobile-notice` 경로 자체는 리다이렉트 대상에서 제외한다.

### 클라이언트 (2차): MobileGuard 컴포넌트

Root Layout(`src/app/layout.tsx`)에 `MobileGuard` 클라이언트 컴포넌트를 추가한다. `window.innerWidth < 768`(tablet 브레이크포인트 미만)이면 `/mobile-notice`로 라우터 푸시한다. 이미 `/mobile-notice`에 있으면 스킵.

**768px 선택 근거**: 프로젝트 Tailwind 설정에서 `tablet: 768px`이 정의되어 있다. PFPlay UI는 파티룸 사이드패널(채팅·DJ큐·크루목록)과 메인 영역의 2컬럼 레이아웃을 전제로 설계되어 있어, 768px 미만에서는 정상적인 사용이 불가능하다. `mobile: 400px` 브레이크포인트는 이 용도에 적합하지 않다.

**resize 이벤트 미처리**: MobileGuard는 마운트 시점에 1회만 뷰포트를 확인한다. resize 이벤트를 감지하지 않는다. 데스크탑 브라우저 창 크기 조절 시 갑작스러운 리다이렉트를 방지하기 위함이다.

**목적**: UA가 데스크탑이지만 뷰포트가 좁은 경우(태블릿 가로모드→세로 전환 등) 보정.

## 페이지 구성

### URL

`/mobile-notice`

### 레이아웃

헤더/푸터 없는 단독 레이아웃. 기존 홈페이지와 동일한 `bg-onboarding` 배경 사용.

**기존 에셋 재사용 원칙**:

- **폰트**: Root Layout에서 적용되는 `pretendardVariable` (Pretendard Variable) 폰트를 그대로 상속받는다. mobile-notice layout에서 별도 폰트 설정 불필요.
- **로고**: 기존 워드마크 이미지 `/images/Logo/wordmark_medium_white.png` 재사용.
- **배경**: 기존 `bg-onboarding` Tailwind 클래스 재사용.
- **색상**: 기존 Tailwind 테마 색상(gray 계열, 브랜드 레드 등) 활용.

> **Viewport meta**: Next.js App Router가 기본 제공하는 `<meta name="viewport" content="width=device-width, initial-scale=1">` 설정을 그대로 사용한다. 이 페이지는 모바일에서 렌더링되는 유일한 페이지이므로 별도 viewport 설정이 불필요하다.

### 콘텐츠 (수직 중앙 정렬)

1. **PFPlay 로고** — 기존 워드마크 이미지 재사용 (`/images/Logo/wordmark_medium_white.png`, 홈·로그인 페이지와 동일)
2. **모니터 아이콘** — 데스크탑을 상징하는 인라인 SVG (기존 아이콘 시스템에 데스크탑 아이콘이 없으므로 신규 작성)
3. **제목**
   - KO: "파티는 큰 화면에서!"
   - EN: "The party's better on a big screen!"
4. **설명**
   - KO: "PFPlay는 현재 데스크탑에서 즐길 수 있어요. PC나 노트북으로 접속해주세요!"
   - EN: "PFPlay is currently available on desktop. Please visit us from your PC or laptop!"
5. **URL 텍스트** — `pfplay.xyz` (회색, 하단)

## 파일 구조

```
src/
├── middleware.ts                                    ← 수정 (모바일 UA 감지 추가)
├── app/
│   ├── layout.tsx                                   ← 수정 (MobileGuard 추가)
│   ├── mobile-notice/
│   │   ├── layout.tsx                               ← 신규
│   │   └── page.tsx                                 ← 신규
├── shared/
│   ├── lib/
│   │   ├── functions/
│   │   │   └── is-mobile-ua.ts                      ← 신규
│   │   └── localization/
│   │       └── dictionaries/
│   │           ├── ko.json                          ← 수정 (mobileNotice 키 추가)
│   │           └── en.json                          ← 수정 (mobileNotice 키 추가)
│   └── ui/
│       └── components/
│           └── mobile-guard/
│               ├── mobile-guard.component.tsx       ← 신규
│               └── index.ts                         ← 신규 (barrel export)
```

## i18n 키

```json
{
  "mobileNotice": {
    "title": "파티는 큰 화면에서!",
    "description": "PFPlay는 현재 데스크탑에서 즐길 수 있어요. PC나 노트북으로 접속해주세요!"
  }
}
```

```json
{
  "mobileNotice": {
    "title": "The party's better on a big screen!",
    "description": "PFPlay is currently available on desktop. Please visit us from your PC or laptop!"
  }
}
```

## 미들웨어 변경 상세

기존 미들웨어는 언어 쿠키만 처리한다. 모바일 감지 로직을 **기존 로직 앞에** 추가한다:

```ts
export const middleware = (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // 1. 모바일 UA 감지 → 리다이렉트 (단, /mobile-notice 자체는 제외)
  if (pathname !== '/mobile-notice') {
    const ua = req.headers.get('user-agent') || '';
    if (isMobileUA(ua)) {
      return NextResponse.redirect(new URL('/mobile-notice', req.url));
    }
  }

  // 2. 기존 언어 쿠키 로직 (모든 요청에 적용, /mobile-notice 포함)
  const response = NextResponse.next();
  // ... (기존 코드)
};
```

> **주의**: `/mobile-notice` 요청도 언어 쿠키 로직을 통과해야 한다. 첫 방문 모바일 사용자도 언어 쿠키가 설정되어야 i18n이 정상 동작한다.

## matcher 설정

기존 matcher를 유지한다. `/mobile-notice`는 matcher에 포함되지만, 미들웨어 내부에서 `pathname === '/mobile-notice'`로 early return한다.

## 테스트

- `is-mobile-ua.ts` 유닛 테스트: iPhone, Android, iPad, 데스크탑 Chrome/Firefox/Safari UA 문자열 판별
- `MobileGuard` 컴포넌트 테스트: 뷰포트 너비에 따른 라우터 푸시 동작

## 향후 제거

반응형 개편이 완료되면:

1. 미들웨어에서 모바일 감지 로직 제거
2. `MobileGuard` 컴포넌트 제거
3. `/mobile-notice` 페이지 제거
4. i18n 키 제거
