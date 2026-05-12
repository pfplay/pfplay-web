# ADR-016: middleware 점검 가드 (Vercel Edge Config)

- **상태**: 채택
- **일자**: 2026-05 (V14 시스템 공지 도입과 함께)

## 맥락

V14 시스템 공지(ADR-013, pfplay-platform ADR-007)의 첫 prod 유스케이스는 예정 점검 공지였다. 점검 시작 시 사용자가 일반 라우트에 접근하지 못하도록 막아야 하는데, 어디서 막을지가 설계 지점이다:

| 가드 위치                | 장단점                                                                          |
| ------------------------ | ------------------------------------------------------------------------------- |
| **백엔드 API 응답**      | 모든 API 호출이 점검 응답을 반환 — 정적 페이지·SSG는 통과해버림                 |
| **클라이언트 페이지 단** | 페이지마다 점검 체크 로직 중복; 자바스크립트 미로드 시점 / 정적 fallback에 누수 |
| **edge middleware**      | 모든 라우트 진입을 가로채 즉시 차단 — 백엔드 무관, 정적/동적 모두 커버          |

Vercel 배포 환경에서 `middleware.ts`는 edge runtime에 위치하며 모든 요청에 대해 백엔드 왕복 없이 동작한다. 점검 상태를 빠르게 조회할 source로 **Vercel Edge Config**가 자연스러운 선택이다 — 동기 read API, 분 단위 전파.

추가로 모바일 UA 차단(데스크탑 전용 UI)과 언어 쿠키 부트스트랩도 모든 요청에 적용해야 하므로 같은 middleware에서 처리한다.

## 결정

`src/middleware.ts`(edge runtime)에 세 가지 가드를 순서대로 구현한다.

### 1. 점검 가드 (V14, 최우선)

```typescript
const maintenance = await getEdgeConfigMaintenance();
if (maintenance?.phase === 'ACTIVE') {
  const url = req.nextUrl.clone();
  url.pathname = '/maintenance';
  url.searchParams.set('messageKo', maintenance.messageKo);
  url.searchParams.set('messageEn', maintenance.messageEn);
  url.searchParams.set('endAt', maintenance.endAt);
  return NextResponse.rewrite(url);
}
```

- `system-status` Edge Config 키를 동기 조회
- `phase === 'ACTIVE'`면 모든 요청을 `/maintenance`로 rewrite (URL은 유지, 컨텐츠만 차단)
- 백엔드 왕복 없이 즉시 차단

### 2. 모바일 UA 가드

```typescript
if (pathname !== '/mobile-notice' && isMobileUA(req.headers.get('user-agent') ?? '')) {
  return NextResponse.redirect(new URL('/mobile-notice', req.url));
}
```

- 모바일 User-Agent 감지 시 `/mobile-notice`로 redirect
- `/mobile-notice` 자체는 예외 처리

### 3. 언어 쿠키 부트스트랩

- 쿠키 미존재 시 `LANGUAGE_COOKIE_KEY = 'En'`을 10년 TTL로 설정
- Vercel의 알려진 SSR/RSC 쿠키 전파 이슈 회피 패턴 적용 (Next.js #49442)

### Matcher

```typescript
matcher: ['/((?!maintenance|api|_next/static|_next/image|favicon.ico|images|icons).*)'];
```

점검 페이지 자체와 정적 자원은 제외.

## 결과

- **점검 진입이 즉시·전역적**: 백엔드 의존 없이 모든 라우트 차단. 정적 페이지·SSG/RSC 모두 커버
- **백엔드 broadcast(`/sub/system/announcements`)와 분리**: 이미 페이지에 머문 사용자는 STOMP 알림으로 인지(ADR-013), 새로 진입하는 사용자는 middleware로 차단 — 두 경로가 보완적
- **trade-off**: middleware는 매 요청마다 Edge Config를 동기 조회. 응답 지연이 미세하게 발생 (Vercel Edge Config는 ms 수준이라 무시할 수준)
- **Edge Config payload는 작게**: `phase`, `messageKo`, `messageEn`, `endAt` 정도. JSON 전체 페이로드 1KB 미만 유지

## 관련

- 백엔드 측: pfplay-platform [ADR-007 시스템 공지 아키텍처](https://github.com/pfplay/pfplay-platform/blob/develop/docs/adr/007-system-announcement-architecture.md)
- 사용자 측 알림 처리: [ADR-013 시스템 공지 feature 도메인 설계](./013-system-announcement-feature.md)
- FLOW.md 다이어그램 4 (점검 + 시스템 공지 흐름)
- middleware 코드: `src/middleware.ts`
- Vercel Edge Config 어댑터: `src/shared/api/system-status/`
