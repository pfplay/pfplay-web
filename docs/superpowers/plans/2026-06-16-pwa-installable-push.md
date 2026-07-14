# PFPlay PWA (설치형 + 시스템 공지 Web Push) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** pfplay-web을 홈 화면 설치형 PWA로 만들고, 어드민이 발행하는 시스템 공지를 구독 회원에게 Web Push로 브로드캐스트한다.

**Architecture:** Next App Router 네이티브 `manifest.ts` + 캐싱 없는 최소 service worker(설치 충족 + 푸시 수신). 백엔드는 기존 `AnnouncementPublishedEvent`에 `@TransactionalEventListener(AFTER_COMMIT) + @Async` 리스너를 하나 더 붙여, `push_enabled`인 공지를 구독 전체에 web-push로 fan-out하고 만료 구독(404/410)을 prune한다. 구독은 로그인 회원만, userId에 연결.

**Tech Stack:** Next.js 14 (App Router, TS, FSD), React Query, axios, zod, vitest+MSW (web) · Spring Boot 3 / JDK 21, JPA, Flyway, `nl.martijndwars:web-push` (platform) · Vite+React, Radix, zod (admin).

**Spec:** `docs/superpowers/specs/2026-06-16-pwa-installable-push-design.md`

**레포/브랜치:** 단일 git 루트가 아님. 레포마다 `origin/develop`(web은 `development`)에서 분기. 권장 브랜치명: `feat/pwa-installable-404`(web Phase A), `feat/web-push-subscriptions`(platform Phase B), `feat/announcement-push-toggle`(admin Phase C), `feat/push-notification-settings-404`(web Phase D). 각 Phase = 독립 PR. JDK 빌드 prefix: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7"`.

**배포 순서:** A(web) → B(platform) → C(admin) → D(web). dev 통합 라이브 검증 후 prod 승격은 기존 릴리스 방식. 각 머지는 사용자 게이트.

---

## Chunk 1: Phase A — 설치형 PWA (pfplay-web 단독)

목표: Chrome "Installable" 통과 + iOS standalone 설치 가능(푸시 전제 충족). 백엔드 무관. SW는 fetch를 가로채지 않아 점검모드와 충돌 없음.

작업 디렉터리: `pfplay-web/`. 브랜치: `feat/pwa-installable-404` (`origin/development` 기준).

### Task A0: 브랜치 준비

- [ ] **Step 1: 분기**

```bash
cd "pfplay-web"
git fetch origin
git checkout development && git pull --ff-only
git checkout -b feat/pwa-installable-404
```

### Task A1: PWA 아이콘 자산 생성

`public/`엔 현재 192/512 PNG가 없음. `public/images/Logo/Symbol_large_*.png`에서 파생한다. ⚠️ `public/icons/`는 이미 SVG 자산 하위폴더(Action/Music 등)가 있는 기존 디렉터리 — 새 파일(`pwa-*.png`/`apple-touch-icon.png`)은 충돌 없으나 **디렉터리를 비우거나 덮어쓰지 말 것**.

**Files:**

- Create: `public/icons/pwa-192x192.png` (정사각, any)
- Create: `public/icons/pwa-512x512.png` (정사각, any)
- Create: `public/icons/pwa-maskable-512x512.png` (512, maskable — 안전영역 위해 ~20% safe-zone 패딩)
- Create: `public/icons/apple-touch-icon.png` (180x180, 불투명 배경)

- [ ] **Step 1: 소스 아트 확인**

Run: `ls -la public/images/Logo/Symbol_large_*.png`
Expected: `Symbol_large_black.png`, `Symbol_large_red.png` 존재.

- [ ] **Step 2: 아이콘 4종 생성**

ImageMagick(또는 sharp/온라인 도구)로 Symbol_large_red(브랜드색) 또는 black을 배경(`theme_color` 또는 흰색) 위에 합성해 생성. ImageMagick 예:

```bash
# 흰 배경 정사각 192/512 (any). 심볼을 80% 크기로 중앙 배치.
magick -size 192x192 xc:white \( public/images/Logo/Symbol_large_red.png -resize 154x154 \) -gravity center -composite public/icons/pwa-192x192.png
magick -size 512x512 xc:white \( public/images/Logo/Symbol_large_red.png -resize 410x410 \) -gravity center -composite public/icons/pwa-512x512.png
# maskable: 안전영역 위해 심볼을 ~60%로 (패딩 큼)
magick -size 512x512 xc:white \( public/images/Logo/Symbol_large_red.png -resize 307x307 \) -gravity center -composite public/icons/pwa-maskable-512x512.png
# apple-touch-icon 180 불투명
magick -size 180x180 xc:white \( public/images/Logo/Symbol_large_red.png -resize 144x144 \) -gravity center -composite public/icons/apple-touch-icon.png
```

> ImageMagick 미설치 시: 사용자에게 `! magick ...` 실행 요청하거나 sharp 스크립트 사용. 배경색은 manifest `theme_color`와 맞춘다(아래 A3에서 확정).

- [ ] **Step 3: 생성 확인**

Run: `ls -la public/icons/pwa-*.png public/icons/apple-touch-icon.png`
Expected: 4개 파일, 각 크기 정확(`magick identify public/icons/pwa-192x192.png` → 192x192).

- [ ] **Step 4: Commit**

```bash
git add public/icons/pwa-192x192.png public/icons/pwa-512x512.png public/icons/pwa-maskable-512x512.png public/icons/apple-touch-icon.png
git commit -m "feat(pwa): PWA 설치 아이콘 자산 추가 (192/512/maskable/apple-touch)"
```

### Task A2: 최소 service worker (`public/sw.js`)

캐싱 없음. fetch는 no-op(가로채지 않음). push/notificationclick만 실제 동작. Phase D에서 구독 연결 시 동작 개시.

**Files:**

- Create: `public/sw.js`

- [ ] **Step 1: sw.js 작성**

```javascript
// pfplay PWA service worker — 캐싱 없음(앱이 realtime-heavy → stale 방지).
// 책임: (1) 설치 가능성 충족용 no-op fetch, (2) Web Push 수신·표시.
// 라이브 데이터는 항상 네트워크/WS. 앱셸/API 캐싱 금지(spec §1 Non-goals).

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// no-op: 응답을 가로채지 않음 → 캐싱/셸 서빙 없음, 점검모드 게이팅과 무충돌.
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: 'PFPlay', body: event.data.text() };
  }
  const title = payload.title || 'PFPlay';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/pwa-192x192.png',
    badge: '/icons/pwa-192x192.png',
    data: { url: payload.url || '/' },
    tag: payload.tag, // 같은 tag는 알림 합치기(공지 중복 완화)
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});
```

- [ ] **Step 2: 문법 검증**

Run: `node --check public/sw.js`
Expected: 출력 없음(성공).

- [ ] **Step 3: Commit**

```bash
git add public/sw.js
git commit -m "feat(pwa): 최소 service worker (no-op fetch + push/notificationclick)"
```

### Task A3: `manifest.ts` (Next 네이티브)

**Files:**

- Create: `src/app/manifest.ts`

- [ ] **Step 1: manifest 작성**

```typescript
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PFPlay',
    short_name: 'PFPlay',
    description: 'PFP Playground for music',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/pwa-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
```

> `theme_color`/`background_color`는 앱 다크 테마에 맞춰 `#000000`. A1 아이콘 배경과 시각적으로 어긋나면 통일.

- [ ] **Step 2: 서빙 확인 (dev 부팅)**

Run (별도 터미널, [[reference_windows_spaced_path_nextjs_dev_workaround]] 따라 `.next` 충돌 시 삭제):

```bash
npx next dev
```

그 후: `curl -s http://localhost:3000/manifest.webmanifest`
Expected: 위 JSON(아이콘 3종 포함) 반환.

- [ ] **Step 3: Commit**

```bash
git add src/app/manifest.ts
git commit -m "feat(pwa): app/manifest.ts (standalone, 설치 메타데이터)"
```

### Task A4: 루트 layout 메타 — manifest 링크 + iOS 메타 + SW 등록

**Files:**

- Modify: `src/app/layout.tsx` (metadata export ~31-37, 그리고 SW 등록용 클라이언트 컴포넌트 마운트)
- Create: `src/app/_components/sw-register.tsx` (클라이언트, SW 등록)

- [ ] **Step 1: SW 등록 클라이언트 컴포넌트**

`src/app/_components/sw-register.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

/** /sw.js 등록만 담당. 구독/권한은 Phase D(features/push-notification). */
const ServiceWorkerRegister = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    const onLoad = () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        // 등록 실패는 앱 동작에 영향 없음(설치/푸시만 비활성) — 조용히 로깅.
        console.warn('[pwa] service worker registration failed', err);
      });
    };
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    return () => window.removeEventListener('load', onLoad);
  }, []);
  return null;
};

export default ServiceWorkerRegister;
```

- [ ] **Step 2: layout.tsx metadata 보강 + viewport export**

`src/app/layout.tsx` 상단 `Metadata` import 옆에 `Viewport` 추가, metadata 교체, viewport export 추가:

```typescript
import { Metadata, Viewport } from 'next';
```

```typescript
export const metadata: Metadata = {
  title: 'PFPlay',
  description: 'PFP Playground for music',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'PFPlay',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};
```

- [ ] **Step 3: layout 트리에 SW 등록 마운트**

`src/app/layout.tsx`: 정상 트리(`maintenance?.phase !== 'ACTIVE'` 경로)의 `<body>` 안, `{children}` 인근에 `<ServiceWorkerRegister />` 추가. 점검 ACTIVE 분기(`return <html>...<body>{children}</body>`)에는 **마운트하지 않는다**(점검 중엔 부팅 기계 미마운트 정책 일관). import 추가:

```typescript
import ServiceWorkerRegister from './_components/sw-register';
```

정상 분기 body 내부(예: `<DialogProvider>` 형제 위치 또는 `<div id={DomId.DrawerRoot} />` 근처)에 `<ServiceWorkerRegister />` 삽입.

- [ ] **Step 4: 기존 layout 테스트 확인**

Run: `npx vitest run src/app/layout.test.tsx`
Expected: PASS (메타/viewport 추가가 기존 테스트를 깨지 않음). 깨지면 스냅샷/단언 업데이트.

- [ ] **Step 5: 빌드 타입체크**

Run: `npx tsc --noEmit`
Expected: 에러 0.

- [ ] **Step 6: Commit**

```bash
git add src/app/layout.tsx src/app/_components/sw-register.tsx
git commit -m "feat(pwa): manifest 링크·iOS 메타·viewport + SW 등록 마운트"
```

### Task A5: 설치 가능성 수동 검증 (게이트)

- [ ] **Step 1: 풀스택/dev 부팅 후 Chrome DevTools 검증**

`npx next dev` 상태에서 Chrome → DevTools → Application → Manifest: 아이콘 로드·"Installable" 경고 없음 확인. Lighthouse "Installable" 통과. (헤드리스 함정 주의 [[reference_frontend_playwright_debug]] — 실제 브라우저로)

- [ ] **Step 2: e2e — manifest/SW 등록 스모크 (선택, 가능 시)**

`src/app/__e2e__` 또는 기존 Playwright 위치에 manifest 200 + `navigator.serviceWorker` 등록 확인 스펙 추가. ([[reference_pfplay_web_local_e2e_run]] 절차) 없으면 Step 1 수동 검증으로 대체하고 PR 설명에 기록.

### Task A6: Phase A PR

- [ ] **Step 1: 전체 유닛 회귀**

Run: `npx vitest run`
Expected: 전부 GREEN.

- [ ] **Step 2: 이슈/PR (한글)**

이슈 먼저 등록([[feedback_korean_issue_commit_pr]]) 후 PR. base=`development`. CI(빌드+테스트) CLEAN + 모든 CheckRun conclusion 확인([[feedback_wait_all_ci_before_merge]]) 후 머지=사용자 게이트.

---

## Chunk 2: Phase B — 푸시 구독·발송 (pfplay-platform)

목표: 구독 저장/관리 API(회원) + VAPID 설정 + `AnnouncementPublishedEvent` → `push_enabled`면 web-push fan-out + 404/410 prune. `sendPush` 필드를 공지 생성 체인에 전파.

작업 디렉터리: `pfplay-platform/`. 브랜치: `feat/web-push-subscriptions` (`origin/develop` 기준). 빌드 prefix: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7"`.

패키지 베이스: `com.pfplaybackend.api`. 신규 슬라이스 권장 경로: `app/.../api/notification` (hexagonal: `adapter/in/web`, `adapter/out/persistence`, `adapter/out/push`, `application/service`, `domain/...`). 회원 식별: `ThreadLocalContext.getAuthContext().getUserId()`(반환 `UserId`, `.getUid()`).

### Task B0: 브랜치 + 의존성

- [ ] **Step 1: 분기**

```bash
cd "pfplay-platform"
git fetch origin && git checkout develop && git pull --ff-only
git checkout -b feat/web-push-subscriptions
```

- [ ] **Step 2: web-push 의존성 추가**

`app/build.gradle`의 `dependencies` 블록에:

```gradle
    // Web Push (VAPID, RFC 8291). BouncyCastle 동반.
    implementation 'nl.martijndwars:web-push:5.1.1'
    implementation 'org.bouncycastle:bcprov-jdk18on:1.78.1'
```

- [ ] **Step 3: 의존성 해석 확인 (JDK 21)**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:dependencies --configuration runtimeClasspath -q | grep -i web-push`
Expected: `nl.martijndwars:web-push:5.1.1` 노드 표시. (해석 실패/JDK21 비호환 시 spec §8 리스크 — 버전 조정 또는 대안 라이브러리)

- [ ] **Step 4: Commit**

```bash
git add app/build.gradle
git commit -m "build(push): web-push(VAPID) 의존성 추가"
```

### Task B1: Flyway 마이그레이션 — 구독 테이블 + 공지 push_enabled 컬럼

**Files:**

- Create: `app/src/main/resources/db/migration/V25__create_push_subscription_and_announcement_push_flag.sql`

- [ ] **Step 1: 최신 슬롯 재확인 (점프 방지)**

Run: `ls app/src/main/resources/db/migration/ | sort -V | tail -3`
Expected: 최신이 `V24__create_virtual_dj.sql`이면 다음은 `V25`. 다르면 번호 조정([[feedback_flyway_slot_renumber]]).

- [ ] **Step 2: user_id 컬럼 타입 = BIGINT (확정)**

`UserId.getUid()`는 **`Long`** 반환, 기존 per-user 테이블(`crew.user_id` 등)은 **`BIGINT`**. → `user_id BIGINT` 사용(전 코드 샘플 Long/BIGINT로 통일). 확인용:
Run: `grep -riE 'user_id' app/src/main/resources/db/migration/*.sql | head`
Expected: 기존이 `bigint`임을 확인(컨벤션 일치 확인용 — 타입은 BIGINT로 확정).

- [ ] **Step 3: created_at/updated_at 컬럼 정의 = BaseEntity 컨벤션 확인**

`BaseEntity`(SystemAnnouncementData 등이 상속, `@CreatedDate`/`@LastModifiedDate` 감사 컬럼)의 실제 `columnDefinition`을 본다.
Run: `grep -rnA2 'createdAt\|created_at\|columnDefinition' app/src/main/java/com/pfplaybackend/api/common/**/BaseEntity.java`
Expected: 기존이 `datetime default current_timestamp`류. → 마이그레이션도 동일 정의로 맞춘다(`DATETIME(6)` 강제하지 말 것 — Hibernate validate drift 회피).

- [ ] **Step 4: 마이그레이션 작성** (user_id=BIGINT, 감사컬럼은 BaseEntity 정의에 맞춤)

```sql
-- V25: Web Push 구독 테이블 + 공지 push_enabled 플래그
-- 구독: 로그인 회원만(user_id=BIGINT). endpoint UNIQUE, soft-delete(revoked_at) + 부활 upsert.
-- created_at/updated_at 정의는 Step 3에서 확인한 BaseEntity 컨벤션과 동일하게 둔다.

CREATE TABLE push_subscription (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    endpoint    VARCHAR(512) NOT NULL,
    p256dh      VARCHAR(255) NOT NULL,
    auth        VARCHAR(255) NOT NULL,
    lang        VARCHAR(8)   NOT NULL DEFAULT 'EN',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,        -- BaseEntity 컨벤션에 맞춤(Step 3)
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    revoked_at  DATETIME     NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_push_subscription_endpoint (endpoint),
    KEY idx_push_subscription_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE system_announcement
    ADD COLUMN push_enabled TINYINT(1) NOT NULL DEFAULT 0;
```

- [ ] **Step 5: ⚠️ 테스트는 V25를 검증하지 않는다 — docker 부팅이 유일 게이트**

`application-test.yml`은 `spring.flyway.enabled: false` + `ddl-auto: create-drop`라 **IT는 JPA 엔티티로 스키마를 만들고 V25를 실행하지 않는다.** 즉 V25 오타/깨짐을 CI가 못 잡는다([[reference_ddl_auto_create_drop_hides_migration_drift]]). 실제 validate 게이트는 **B9의 로컬 docker compose 부팅**(Flyway enabled)뿐 — 그 단계에서 V25 적용·validate를 반드시 확인. (선택 강화: Flyway 활성 프로파일의 전용 마이그레이션 테스트 슬라이스 추가.)

- [ ] **Step 5: Commit**

```bash
git add app/src/main/resources/db/migration/V25__create_push_subscription_and_announcement_push_flag.sql
git commit -m "feat(push): V25 push_subscription 테이블 + system_announcement.push_enabled"
```

### Task B2: PushSubscriptionData 엔티티 + repository

**Files:**

- Create: `app/.../api/notification/domain/entity/data/PushSubscriptionData.java`
- Create: `app/.../api/notification/adapter/out/persistence/PushSubscriptionRepository.java`

- [ ] **Step 1: 엔티티 작성** (기존 `SystemAnnouncementData` 스타일 — `BaseEntity` 상속, `@Table`, 정적 팩토리)

```java
@Entity
@Table(name = "push_subscription")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PushSubscriptionData extends BaseEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // user_id = BIGINT/Long (UserId.getUid()는 Long, 기존 per-user 테이블 컨벤션).
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(nullable = false, length = 512)
    private String endpoint;
    @Column(nullable = false, length = 255)
    private String p256dh;
    @Column(nullable = false, length = 255)
    private String auth;
    @Column(nullable = false, length = 8)
    private String lang;
    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    public static PushSubscriptionData create(Long userId, String endpoint, String p256dh,
                                              String auth, String lang) {
        PushSubscriptionData s = new PushSubscriptionData();
        s.userId = userId; s.endpoint = endpoint; s.p256dh = p256dh;
        s.auth = auth; s.lang = lang; s.revokedAt = null;
        return s;
    }

    /** soft-delete된 row 재구독 부활 + 키/lang 갱신. */
    public void revive(Long userId, String p256dh, String auth, String lang) {
        this.userId = userId; this.p256dh = p256dh; this.auth = auth;
        this.lang = lang; this.revokedAt = null;
    }

    public void revoke(LocalDateTime now) { this.revokedAt = now; }
    public boolean isActive() { return revokedAt == null; }
}
```

> `created_at`/`updated_at`은 `BaseEntity`가 제공한다고 가정(SystemAnnouncementData도 BaseEntity 상속). 아니면 명시 필드 추가.

- [ ] **Step 2: repository**

```java
public interface PushSubscriptionRepository extends JpaRepository<PushSubscriptionData, Long> {
    Optional<PushSubscriptionData> findByEndpoint(String endpoint);

    @Query("SELECT s FROM PushSubscriptionData s WHERE s.revokedAt IS NULL")
    List<PushSubscriptionData> findAllActive();

    long countByRevokedAtIsNull();
}
```

> 대규모 대비 페이지네이션이 필요하면 `Slice<PushSubscriptionData> findByRevokedAtIsNull(Pageable)` 추가(B5 fan-out에서 사용).

- [ ] **Step 3: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/notification/domain/entity/data/PushSubscriptionData.java app/src/main/java/com/pfplaybackend/api/notification/adapter/out/persistence/PushSubscriptionRepository.java
git commit -m "feat(push): PushSubscriptionData 엔티티 + repository"
```

### Task B3: 구독 서비스 (upsert/부활 + soft-delete) — TDD

**Files:**

- Create: `app/.../api/notification/application/service/PushSubscriptionService.java`
- Test: `app/src/test/java/com/pfplaybackend/api/notification/PushSubscriptionServiceTest.java`

- [ ] **Step 1: 실패 테스트 작성** (부활 경로가 핵심 — spec advisory)

```java
// 신규 endpoint → 새 row. 기존(active) endpoint → 갱신. revoked endpoint → 부활(revoked_at=null), UNIQUE 충돌 없음.
@Test
void 재구독시_revoked_row를_부활시킨다() {
    Long user = 1001L;
    Long id = service.subscribe(user, "https://ep/1", "k", "a", "KO");
    service.unsubscribe(user, "https://ep/1");            // soft delete
    Long id2 = service.subscribe(user, "https://ep/1", "k2", "a2", "EN"); // 부활
    assertThat(id2).isEqualTo(id);                        // 같은 row
    PushSubscriptionData row = repository.findByEndpoint("https://ep/1").orElseThrow();
    assertThat(row.isActive()).isTrue();
    assertThat(row.getAuth()).isEqualTo("a2");
}
```

(추가 케이스: 신규 생성, active 갱신 멱등, 타 user의 endpoint 삭제 시도 거부 — userId 스코프.)

- [ ] **Step 2: 실패 확인**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PushSubscriptionServiceTest" -q`
Expected: 컴파일 에러/FAIL (service 미구현).

- [ ] **Step 3: 서비스 구현**

```java
@Service
@RequiredArgsConstructor
public class PushSubscriptionService {
    private final PushSubscriptionRepository repository;
    private final Clock clock;

    @Transactional
    public Long subscribe(Long userId, String endpoint, String p256dh, String auth, String lang) {
        return repository.findByEndpoint(endpoint)
            .map(existing -> { existing.revive(userId, p256dh, auth, lang); return existing.getId(); })
            .orElseGet(() -> repository.save(
                PushSubscriptionData.create(userId, endpoint, p256dh, auth, lang)).getId());
    }

    @Transactional
    public void unsubscribe(Long userId, String endpoint) {
        repository.findByEndpoint(endpoint)
            .filter(s -> s.getUserId().equals(userId))   // 타인 구독 삭제 방지
            .ifPresent(s -> s.revoke(LocalDateTime.now(clock)));
    }
}
```

- [ ] **Step 4: 통과 확인**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PushSubscriptionServiceTest" -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/notification/application/service/PushSubscriptionService.java app/src/test/java/com/pfplaybackend/api/notification/PushSubscriptionServiceTest.java
git commit -m "feat(push): 구독 서비스 (upsert·부활·soft-delete·userId 스코프)"
```

### Task B4: 구독 API 컨트롤러 (회원)

**Files:**

- Create: `app/.../api/notification/adapter/in/web/PushSubscriptionController.java`
- Create: `app/.../api/notification/adapter/in/web/payload/request/PushSubscribeRequest.java`
- Create: `app/.../api/notification/adapter/in/web/payload/request/PushUnsubscribeRequest.java`

- [ ] **Step 1: 요청 DTO**

```java
public record PushSubscribeRequest(
    @NotBlank String endpoint,
    @NotBlank String p256dh,
    @NotBlank String auth,
    @NotBlank String lang   // "KO" | "EN"
) {}

public record PushUnsubscribeRequest(@NotBlank String endpoint) {}
```

- [ ] **Step 2: 컨트롤러** (CrewBlockCommandController 패턴 — `/api/v1`, ApiCommonResponse, cookieAuth, 회원은 ThreadLocalContext)

```java
@Tag(name = "Push API")
@RequestMapping("/api/v1/push/subscriptions")
@RestController
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionService service;

    @Operation(summary = "푸시 구독 등록/갱신")
    @SecurityRequirement(name = "cookieAuth")
    @PostMapping
    public ResponseEntity<ApiCommonResponse<Map<String, Long>>> subscribe(
            @Valid @RequestBody PushSubscribeRequest req) {
        Long userId = ThreadLocalContext.getAuthContext().getUserId().getUid();
        Long id = service.subscribe(userId, req.endpoint(), req.p256dh(), req.auth(), req.lang());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiCommonResponse.success(Map.of("subscriptionId", id)));
    }

    @Operation(summary = "푸시 구독 해지")
    @SecurityRequirement(name = "cookieAuth")
    @DeleteMapping
    public ResponseEntity<Void> unsubscribe(@Valid @RequestBody PushUnsubscribeRequest req) {
        Long userId = ThreadLocalContext.getAuthContext().getUserId().getUid();
        service.unsubscribe(userId, req.endpoint());
        return ResponseEntity.noContent().build();
    }
}
```

> `UserId.getUid()`는 `Long` 반환(확정). 엔티티 `user_id`(BIGINT/Long)와 일치.

- [ ] **Step 3: 컴파일/부팅**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:compileJava -q`
Expected: 성공. (SecurityConfig 기본이 `/api/** → authenticated()`이고 permitAll 화이트리스트에 push 경로가 없으므로 `/api/v1/push/**`는 기본 인증 보호됨 — 화이트리스트에 추가만 하지 않으면 됨. 한 줄 확인.)

- [ ] **Step 4: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/notification/adapter/in/web/
git commit -m "feat(push): 구독 등록/해지 API (회원, /api/v1/push/subscriptions)"
```

### Task B5: VAPID 설정 + WebPushSender 포트/어댑터

**Files:**

- Create: `app/.../api/notification/config/WebPushProperties.java`
- Create: `app/.../api/notification/application/port/WebPushSender.java`
- Create: `app/.../api/notification/adapter/out/push/MartijndwarsWebPushAdapter.java`
- Modify: `app/src/main/resources/application.yml` (web-push 설정 블록)

- [ ] **Step 1: 설정 프로퍼티** (JwtProperties/VercelEdgeConfigProperties 패턴)

```java
@Data
@Configuration
@ConfigurationProperties(prefix = "app.web-push")
public class WebPushProperties {
    private boolean enabled = false;     // 키 미설정 환경(local/test) 안전 차단
    private String publicKey;
    private String privateKey;
    private String subject = "mailto:admin@pfplay.io";
}
```

- [ ] **Step 2: application.yml 블록 추가**

```yaml
app:
  web-push:
    enabled: ${WEB_PUSH_ENABLED:false}
    public-key: ${WEB_PUSH_VAPID_PUBLIC_KEY:}
    private-key: ${WEB_PUSH_VAPID_PRIVATE_KEY:}
    subject: ${WEB_PUSH_SUBJECT:mailto:admin@pfplay.io}
```

> VAPID 키페어는 별도 생성(예: `web-push generate-vapid-keys` npm CLI 또는 Java 유틸 1회). public은 web `NEXT_PUBLIC_VAPID_PUBLIC_KEY`와 **동일 값**. private는 시크릿(dev/prod env 주입, 절대 커밋 금지). [[project_virtual_dj_p3_entry]]의 OPENAI_API_KEY 3곳 주입 선례 참조.

- [ ] **Step 3: 포트 인터페이스**

```java
public interface WebPushSender {
    enum Result { OK, GONE, FAILED }   // GONE = 404/410 → prune
    Result send(String endpoint, String p256dh, String auth, String payloadJson);
}
```

- [ ] **Step 4: 어댑터 구현** (nl.martijndwars)

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class MartijndwarsWebPushAdapter implements WebPushSender {
    private final WebPushProperties props;
    private PushService pushService;

    @PostConstruct
    void init() throws Exception {
        if (!props.isEnabled()) { log.warn("[push] web-push DISABLED (키 미설정)"); return; }
        // 멱등 가드 — web-push 라이브러리가 이미 등록했을 수 있음.
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        this.pushService = new PushService(props.getPublicKey(), props.getPrivateKey(), props.getSubject());
    }

    @Override
    public Result send(String endpoint, String p256dh, String auth, String payloadJson) {
        if (pushService == null) return Result.FAILED;
        try {
            Notification n = new Notification(endpoint, p256dh, auth, payloadJson.getBytes(StandardCharsets.UTF_8));
            HttpResponse res = pushService.send(n);
            int sc = res.getStatusLine().getStatusCode();
            if (sc == 404 || sc == 410) return Result.GONE;
            if (sc >= 200 && sc < 300) return Result.OK;
            log.warn("[push] send non-2xx status={} endpoint={}", sc, endpoint);
            return Result.FAILED;
        } catch (Exception e) {
            log.warn("[push] send error endpoint={}", endpoint, e);
            return Result.FAILED;
        }
    }
}
```

> ⚠️ **web-push 5.1.1 API 미검증**: 위 코드는 구 Apache-HttpClient 기반(`HttpResponse.getStatusLine().getStatusCode()`)이다. 실제 5.x는 `send` 오버로드(`send(Notification)`/`sendAsync`/`send(Notification, Encoding)`)·반환 타입이 다를 수 있음. **B0 Step 3에서 좌표 존재 확인 + 이 단계에서 정확 시그니처를 Maven 소스/문서로 검증**하고 status→Result 매핑을 맞출 것. 포트(`WebPushSender`)로 격리돼 있어 영향은 어댑터 내부에 한정. 동기 `send`는 fan-out에서 `@Async` 실행.

- [ ] **Step 5: 어댑터 status→Result 매핑 단위테스트 (라이브 전 de-risk)**

`MartijndwarsWebPushAdapterTest`: `PushService`를 mock/스파이해 200→OK, 404→GONE, 410→GONE, 500→FAILED, 예외→FAILED 매핑을 단언. (실 발송은 B/D 라이브 스모크에서.)

- [ ] **Step 6: 컴파일 + 매핑 테스트**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:compileJava -q && JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*MartijndwarsWebPushAdapterTest" -q`
Expected: 성공 + PASS.

- [ ] **Step 7: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/notification/config/WebPushProperties.java app/src/main/java/com/pfplaybackend/api/notification/application/port/WebPushSender.java app/src/main/java/com/pfplaybackend/api/notification/adapter/out/push/MartijndwarsWebPushAdapter.java app/src/main/resources/application.yml
git commit -m "feat(push): VAPID 설정 + WebPushSender 포트/어댑터(fail-closed)"
```

### Task B6: sendPush 전파 — 공지 생성 체인

**Files:**

- Modify: `app/.../administration/adapter/in/web/payload/request/AnnouncementCreateRequest.java`
- Modify: `app/.../administration/adapter/in/web/AdminAnnouncementController.java`
- Modify: `app/.../administration/application/service/SystemAnnouncementCommandService.java`
- Modify: `app/.../administration/domain/entity/data/SystemAnnouncementData.java`

- [ ] **Step 1: 엔티티에 pushEnabled 필드 + create 파라미터**

`SystemAnnouncementData`에 `@Column(name = "push_enabled", nullable = false) private boolean pushEnabled;` 추가. 정적 팩토리 `create(...)`에 `boolean pushEnabled` 파라미터 추가하고 세팅. getter는 Lombok `@Getter`로 `isPushEnabled()` 생성.

- [ ] **Step 2: 요청 DTO에 필드 추가**

`AnnouncementCreateRequest` record에 `boolean sendPush` 추가(끝에). (record라 nullable 불가 — 어드민이 항상 전송. 구버전 호환 필요하면 `Boolean sendPush`로 두고 null→false 처리.)

- [ ] **Step 3: 컨트롤러·서비스 전파**

`AdminAnnouncementController.publish`가 `req.sendPush()`를 `commandService.publish(..., administratorId, req.sendPush())`로 전달. `SystemAnnouncementCommandService.publish` 시그니처에 `boolean sendPush` 추가 → `SystemAnnouncementData.create(..., sendPush)`. **`AnnouncementPublishedEvent`는 entity를 그대로 운반하므로 이벤트 변경 불필요.**

> ⚠️ `push_enabled`는 `AnnouncementCancelledEvent`/`MaintenanceStartedEvent`/`MaintenanceEndedEvent`엔 의미 없음 — 푸시는 publish 이벤트에만 연결(B7). cancel/maintenance 흐름에 푸시 엮지 말 것(spec advisory).

- [ ] **Step 4: 전체 테스트 컴파일 (positional 생성자 호출 전수 검출)**

`AnnouncementCreateRequest`(record)·`SystemAnnouncementData.create(...)`·`commandService.publish(...)`는 positional로 호출되므로, 필드/파라미터 추가 시 fixture·타 서비스 등 **모든** 호출부가 컴파일 깨질 수 있다. 필터드 말고 전체 컴파일로 잡는다:
Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:compileTestJava -q`
Expected: 성공. 깨진 호출부는 전부 `sendPush=false`(또는 `pushEnabled=false`) 인자로 수선. 이어 `--tests "*Announcement*"`로 동작 회귀 확인.

- [ ] **Step 5: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/administration/
git commit -m "feat(push): 공지 생성에 sendPush→push_enabled 전파"
```

### Task B7: 이벤트 → fan-out → prune — TDD

⚠️ **설계 주의(Spring footgun):** `@TransactionalEventListener(AFTER_COMMIT)` + `@Async` + `@Transactional`을 **한 메서드에 삼중**으로 얹으면 async 프록시와 transactional 프록시의 순서 의존으로 prune(dirty update)의 영속이 불안정하다. 기존 선례(`UserActivityLogListener`)도 `AFTER_COMMIT + @Async`만 쓰고 `@Transactional`은 안 붙인다. → **책임 분리**: 리스너(`AnnouncementPushNotifier`, `@Async`)는 디스패치만, 실제 fan-out+prune은 별도 빈(`PushFanoutService`, `@Transactional`)에 위임한다. 그러면 transactional 프록시가 독립적으로 적용돼 revoke가 커밋에 확실히 flush된다.

**Files:**

- Create: `app/.../api/notification/adapter/in/listener/AnnouncementPushNotifier.java` (리스너 — 디스패치)
- Create: `app/.../api/notification/application/service/PushFanoutService.java` (@Transactional — fan-out+prune)
- Modify: `app/.../api/common/config/AsyncConfig.java` (push executor 빈)
- Test: `app/src/test/java/com/pfplaybackend/api/notification/PushFanoutServiceTest.java` (단위)

- [ ] **Step 1: push executor 빈 추가** (AsyncConfig 기존 패턴)

```java
public static final String WEB_PUSH_EXECUTOR_BEAN = "webPushExecutor";

@Bean(name = WEB_PUSH_EXECUTOR_BEAN)
public ThreadPoolTaskExecutor webPushExecutor() {
    ThreadPoolTaskExecutor exec = new ThreadPoolTaskExecutor();
    exec.setCorePoolSize(2);
    exec.setMaxPoolSize(4);
    exec.setQueueCapacity(500);          // 대규모 브로드캐스트 버퍼
    exec.setThreadNamePrefix("webpush-");
    exec.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
    exec.setTaskDecorator(new MdcTaskDecorator());
    exec.setWaitForTasksToCompleteOnShutdown(true);
    exec.setAwaitTerminationSeconds(15);
    exec.initialize();
    return exec;
}
```

- [ ] **Step 2: 실패 테스트 — `PushFanoutServiceTest` (gating·lang payload·prune 로직)**

```java
// pushEnabled=false → sender 미호출.
// pushEnabled=true → 활성 구독마다 send 1회, payload는 구독 lang으로 title/message 선택.
// send가 GONE 반환 → 해당 구독 revoke(soft delete).
@Test
void push_enabled면_활성구독에_fanout하고_GONE은_prune한다() {
    // given: repository.findAllActive() → 구독 2개(KO endpoint=ep-ko, EN endpoint=ep-en)
    // sender mock: ep-ko → OK, ep-en → GONE
    fanoutService.fanout(announcement);   // pushEnabled=true
    // then
    verify(sender).send(eq("ep-ko"), any(), any(), contains("제목ko"));
    verify(sender).send(eq("ep-en"), any(), any(), contains("titleEn"));
    assertThat(repository.findByEndpoint("ep-en").get().isActive()).isFalse(); // pruned(revoke)
    assertThat(repository.findByEndpoint("ep-ko").get().isActive()).isTrue();
}

@Test
void push_disabled면_아무것도_보내지_않는다() {
    fanoutService.fanout(disabledAnnouncement);   // pushEnabled=false
    verifyNoInteractions(sender);
}
```

- [ ] **Step 3: 실패 확인**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PushFanoutServiceTest" -q`
Expected: FAIL/컴파일 에러.

- [ ] **Step 4: 구현 — fan-out 서비스(@Transactional) + 디스패치 리스너(@Async)**

`PushFanoutService` (실제 fan-out+prune, 자체 TX):

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class PushFanoutService {
    private final PushSubscriptionRepository repository;
    private final WebPushSender sender;
    private final ObjectMapper objectMapper;
    private final Clock clock;

    @Transactional   // 독립 TX — revoke(dirty update)가 커밋에 확실히 flush된다.
    public void fanout(SystemAnnouncementData a) {
        if (!a.isPushEnabled()) return;
        // 중복 발송은 용인(best-effort) — 멱등 가드 없음(spec).
        for (PushSubscriptionData s : repository.findAllActive()) {
            String payload = buildPayload(a, s.getLang());
            WebPushSender.Result r = sender.send(s.getEndpoint(), s.getP256dh(), s.getAuth(), payload);
            if (r == WebPushSender.Result.GONE) s.revoke(LocalDateTime.now(clock));  // dirty → flush on commit
        }
    }

    private String buildPayload(SystemAnnouncementData a, String lang) {
        boolean ko = "KO".equalsIgnoreCase(lang);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", ko ? a.getTitleKo() : a.getTitleEn());
        body.put("body", ko ? a.getMessageKo() : a.getMessageEn());
        body.put("url", "/");                 // V1: start_url (spec §8)
        body.put("tag", "announcement-" + a.getId());
        try { return objectMapper.writeValueAsString(body); }
        catch (JsonProcessingException e) { throw new IllegalStateException(e); }
    }
}
```

`AnnouncementPushNotifier` (리스너 — AFTER_COMMIT 후 별 스레드에서 fan-out 서비스 호출만):

```java
@Slf4j
@Component
@RequiredArgsConstructor
public class AnnouncementPushNotifier {
    private final PushFanoutService fanoutService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    @Async(AsyncConfig.WEB_PUSH_EXECUTOR_BEAN)
    public void on(AnnouncementPublishedEvent event) {
        // 디스패치만. 실제 TX는 fanoutService.fanout의 @Transactional 프록시가 연다(footgun 회피).
        fanoutService.fanout(event.entity());
    }
}
```

> ⚠️ `event.entity()`는 원 TX에서 로드된 detached 엔티티 — `fanout` 내부는 `getTitleKo()` 등 **읽기만**(이미 로드된 필드) + `findAllActive()`로 **재조회한** 구독에만 revoke를 건다. 공지 엔티티 자체는 수정하지 않으므로 detached여도 안전.
> 대규모면 `findAllActive()`를 페이지네이션(B2 Slice)으로 교체(YAGNI).

- [ ] **Step 5: 통과 확인**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PushFanoutServiceTest" -q`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add app/src/main/java/com/pfplaybackend/api/notification/application/service/PushFanoutService.java app/src/main/java/com/pfplaybackend/api/notification/adapter/in/listener/AnnouncementPushNotifier.java app/src/main/java/com/pfplaybackend/api/common/config/AsyncConfig.java app/src/test/java/com/pfplaybackend/api/notification/PushFanoutServiceTest.java
git commit -m "feat(push): fan-out 서비스(@Transactional)+디스패치 리스너(@Async) — prune 영속 보장"
```

### Task B8: 통합 테스트 — 구독 API + 이벤트→prune 영속 (async)

**Files:**

- Create: `app/src/test/java/com/pfplaybackend/api/notification/PushSubscriptionIntegrationTest.java`
- Create: `app/src/test/java/com/pfplaybackend/api/notification/AnnouncementPushFlowIntegrationTest.java`

> ⚠️ **이 IT는 V25를 검증하지 않는다.** `application-test.yml`이 `flyway.enabled=false`+`ddl-auto=create-drop`라 스키마는 JPA 엔티티에서 생성됨. V25 마이그레이션 검증 게이트는 **B9의 docker 부팅**뿐(거기서 `flyway validate`). 이 IT의 가치는 JPA 매핑·서비스·리스너 배선·async prune 영속이다.

- [ ] **Step 1: 구독 API IT** (POST→DELETE→재구독 부활)

기존 IT 스타일(`@SpringBootTest`, MySQL test 프로파일/컨테이너) 재사용. 구독 POST→active, DELETE→revoked, 재구독 POST→같은 row 부활(`revoked_at=null`). 동시성 단언은 DB 제약(UNIQUE) 불변식만([[reference_jpa_merge_idempotency_concurrency_flake]]).

- [ ] **Step 2: 🔴 이벤트→prune 영속 IT (footgun 직접 가드 — 최고가치)**

`@SpringBootTest`에서 `WebPushSender`만 mock(특정 endpoint → GONE 반환). 활성 구독 2개 저장 → `push_enabled=true` 공지를 실제 발행(`SystemAnnouncementCommandService.publish(...)`, AFTER_COMMIT 이벤트 실발화) → `@Async` 완료를 await(`Awaitility` 또는 executor latch) → **DB 재조회로 GONE endpoint의 `revoked_at != null`을 단언**. 이게 `AFTER_COMMIT + @Async` 위임 구조에서 prune이 실제 커밋되는지 검증한다(없으면 prod에서 silent no-op).

```java
await().atMost(5, SECONDS).untilAsserted(() -> {
    PushSubscriptionData gone = repository.findByEndpoint("ep-gone").orElseThrow();
    assertThat(gone.getRevokedAt()).isNotNull();          // prune 영속 확인
    PushSubscriptionData ok = repository.findByEndpoint("ep-ok").orElseThrow();
    assertThat(ok.isActive()).isTrue();
});
verify(sender, times(2)).send(any(), any(), any(), any());
```

> ⚠️ **테스트 프로파일 @Async 확인**: 일부 `@SpringBootTest` 슬라이스가 `@EnableAsync`를 끄거나 executor를 동기 실행하면 prune은 통과하지만 **cross-thread TX 경계를 안 타** 게이트 가치가 사라진다. 이 IT가 실제 별 스레드(webpush- executor)에서 도는지(또는 의도적으로 동기면 그 사실을) 확인/기록할 것.
> 또한 `fanout`을 `AnnouncementPushNotifier`에 인라인하지 말 것(프록시 우회 시 revoke 미flush) — 반드시 별 빈 주입 호출. `SystemAnnouncementData.create(...)`의 `pushEnabled`는 `sentByAdministratorId` 뒤 **맨 끝** 파라미터로(스케줄 검증 블록의 positional 순서 불변 유지).

- [ ] **Step 3: 실행**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test --tests "*PushSubscriptionIntegrationTest" --tests "*AnnouncementPushFlowIntegrationTest" -q`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add app/src/test/java/com/pfplaybackend/api/notification/PushSubscriptionIntegrationTest.java app/src/test/java/com/pfplaybackend/api/notification/AnnouncementPushFlowIntegrationTest.java
git commit -m "test(push): 구독 API IT + 이벤트→async prune 영속 IT"
```

### Task B9: 풀 회귀 + Phase B PR

- [ ] **Step 1: 전체 테스트**

Run: `JAVA_HOME="C:/Users/Eisen/.jdks/ms-21.0.7" ./gradlew :app:test`
Expected: 전부 GREEN.

- [ ] **Step 2: 로컬 docker 부팅 = V25 마이그레이션 검증 유일 게이트 (필수)**

테스트는 V25를 실행하지 않으므로(B8 주의), 여기가 마이그레이션 정합성을 잡는 유일한 지점이다. 로컬 docker compose 백엔드 부팅([[reference_local_docker_compose]]) — Flyway가 V25를 실제 적용 + `validate` 통과 + Hibernate `ddl-auto: validate`(있다면)로 엔티티↔테이블 매핑 일치 + 앱 기동 확인. ([[reference_ddl_auto_create_drop_hides_migration_drift]])

- [ ] **Step 3: 이슈/PR (한글), base=develop**

CI 전부 GREEN([[feedback_wait_all_ci_before_merge]]) 확인. 머지=사용자 게이트. ⚠️ web-push `enabled=false`라 prod에도 dormant(fail-closed) — 활성화는 VAPID env 주입+`WEB_PUSH_ENABLED=true` 별도.

---

## Chunk 3: Phase C — 어드민 토글 (pfplay-admin)

목표: 공지 생성 폼에 "Web Push 발송" 체크박스 → `sendPush` 전송. Vite+React, zod, Radix Checkbox.

작업 디렉터리: `pfplay-admin/`. 브랜치: `feat/announcement-push-toggle`. ⚠️ pfplay-admin GHA 없음 — Vercel/Cloudflare native, 대시보드 확인([[reference_pfplay_admin_no_gha]]).

### Task C1: 스키마/타입에 sendPush 추가

**Files:**

- Modify: `src/features/announcements/model/mutation-schema.ts` (baseSchema)

- [ ] **Step 1: 분기 + 스키마 필드**

```bash
cd "pfplay-admin" && git fetch origin && git checkout develop && git pull --ff-only && git checkout -b feat/announcement-push-toggle
```

`baseSchema`에 추가:

```ts
  sendPush: z.boolean().default(false),
```

- [ ] **Step 2: Commit**

```bash
git add src/features/announcements/model/mutation-schema.ts
git commit -m "feat(announcement): 요청 스키마에 sendPush 추가"
```

### Task C2: 폼 상태 + 체크박스 UI + 제출 — TDD

**Files:**

- Modify: `src/features/announcements/ui/announcement-launch-form.tsx`
- Test: `src/features/announcements/ui/announcement-launch-form.test.tsx`

- [ ] **Step 1: 실패 테스트** (체크박스 토글 → 제출 body에 sendPush 포함)

⚠️ 기존 `announcement-launch-form.test.tsx`는 mutation을 spy하지 않고 **요청 인터셉션/부수효과(navigate·toast)**로 단언한다. 같은 컨벤션 사용 — `createAnnouncement`(또는 `useCreateAnnouncement`)를 mock해 **전달된 body 인자**를 캡처/단언(mutation.mutate 내부 spy로 싸우지 말 것).

```tsx
test('Web Push 발송 체크 시 전달 body에 sendPush=true가 포함된다', async () => {
  // render → 필수필드 입력 → push 체크박스 클릭 → 제출 → mock된 create 호출 body.sendPush === true
});
test('기본값은 sendPush=false다', async () => {
  /* 미체크 제출 → body.sendPush === false */
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn test announcement-launch-form` (또는 `npx vitest run src/features/announcements/ui/announcement-launch-form.test.tsx`)
Expected: FAIL.

- [ ] **Step 3: 구현**

`FormState` interface에 `sendPush: boolean` 추가, `INITIAL`에 `sendPush: false`. severity fieldset 뒤에 Radix Checkbox + Label 삽입(`create-administrator-dialog.tsx` 패턴):

```tsx
<div className='flex items-center gap-2'>
  <Checkbox
    id='ann-send-push'
    checked={state.sendPush}
    onCheckedChange={(c) => set('sendPush', c === true)}
    aria-label='Web Push 발송'
  />
  <Label htmlFor='ann-send-push' className='text-sm font-normal cursor-pointer'>
    Web Push 발송 — 구독자 전체에게 즉시 푸시됩니다 (되돌릴 수 없음)
  </Label>
</div>
```

`handleSubmit`의 body에 `sendPush: state.sendPush` 추가.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/features/announcements/ui/announcement-launch-form.test.tsx`
Expected: PASS.

- [ ] **Step 5: 타입체크 + Commit**

```bash
npx tsc --noEmit
git add src/features/announcements/ui/announcement-launch-form.tsx src/features/announcements/ui/announcement-launch-form.test.tsx
git commit -m "feat(announcement): Web Push 발송 체크박스 + sendPush 제출"
```

### Task C3: Phase C PR

- [ ] **Step 1: 전체 테스트 + 빌드**

Run: `yarn test && yarn build` (또는 vite build)
Expected: GREEN.

- [ ] **Step 2: 이슈/PR (한글)** — GHA 없음, Vercel/Cloudflare 대시보드로 배포 확인. base=develop. 머지=사용자 게이트.

---

## Chunk 4: Phase D — 설정 토글·구독 와이어링 (pfplay-web)

목표: 설정에 "알림 받기" 토글. ON → SW 등록 보장 → 권한 요청 → pushManager.subscribe → POST. OFF → unsubscribe + DELETE. iOS 미설치/denied/미지원 가드. SW push 핸들러가 실제 동작.

작업 디렉터리: `pfplay-web/`. 브랜치: `feat/push-notification-settings-404` (`origin/development`, Phase A 머지 후 development 기준). 의존: Phase B(백엔드 엔드포인트) dev 배포 완료.

### Task D1: 분기 + env(VAPID 공개키) + push service 메서드

**Files:**

- Modify: `src/shared/config/client-env.ts` (zod 스키마 + parse 호출)
- Modify: `.env.example`
- Modify: `src/shared/api/http/services/*` (push 서비스 추가) + `src/shared/api/http/types/*` (요청 타입)

- [ ] **Step 1: 분기**

```bash
cd "pfplay-web" && git fetch origin && git checkout development && git pull --ff-only && git checkout -b feat/push-notification-settings-404
```

- [ ] **Step 2: env 스키마에 VAPID 공개키**

`ClientEnvSchema`에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),`(미설정 환경 허용 — 토글이 런타임 가드). `parseClientEnv` 호출 객체에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,` 추가. `.env.example`에 `NEXT_PUBLIC_VAPID_PUBLIC_KEY=` 주석과 함께 추가. `vitest.setup.ts`에 stub 추가(테스트 env).

> 값은 platform `WEB_PUSH_VAPID_PUBLIC_KEY`와 **동일**. dev/prod Vercel env에 주입.

- [ ] **Step 3: push API 서비스 + 타입**

`src/shared/api/http/types/`에 `push.ts`: `PushSubscribeRequest { endpoint; p256dh; auth; lang }`, `PushUnsubscribeRequest { endpoint }`. 신규 `PushService extends HTTPClient`(users.ts 패턴), 라우트 `v1/push/subscriptions`:

```ts
public subscribe(req: PushSubscribeRequest) { return this.post<{ subscriptionId: number }>('v1/push/subscriptions', req); }
public unsubscribe(req: PushUnsubscribeRequest) { return this.delete<void>('v1/push/subscriptions', { data: req }); }
```

services index에 singleton 등록(`pushService`).

- [ ] **Step 4: 타입체크 + Commit**

```bash
npx tsc --noEmit
git add src/shared/config/client-env.ts .env.example vitest.setup.ts src/shared/api/http/types/push.ts src/shared/api/http/services/
git commit -m "feat(push): VAPID 공개키 env + push 구독 API 서비스"
```

### Task D2: 구독 라이프사이클 유틸 (권한·VAPID 변환·가드) — TDD

**Files:**

- Create: `src/features/push-notification/lib/push-support.ts` (순수 함수: 지원 여부·iOS·standalone·VAPID base64→Uint8Array)
- Test: `src/features/push-notification/lib/push-support.test.ts`

- [ ] **Step 1: 실패 테스트** (가드 분기 — 결정론적 순수 함수)

```ts
// urlBase64ToUint8Array: 알려진 입력→정확한 바이트.
// canUsePush(env): SW/PushManager/Notification 미존재 → false.
// iosNeedsInstall(ua, standalone): iOS && !standalone → true.
```

> ⚠️ `isStandalone()`은 `window.matchMedia`를 호출 — jsdom 기본 미구현. 테스트 setup에서 `window.matchMedia`를 mock(`vi.fn().mockReturnValue({ matches: false })`)해야 `matchMedia is not a function`을 피한다.

- [ ] **Step 2~4: 구현·통과**

```ts
export const urlBase64ToUint8Array = (base64: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const isIOS = (ua: string): boolean => /iPhone|iPad|iPod/i.test(ua);
export const isStandalone = (): boolean =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true);
export const iosNeedsInstall = (ua: string, standalone: boolean): boolean =>
  isIOS(ua) && !standalone;
```

Run: `npx vitest run src/features/push-notification/lib/push-support.test.ts` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/push-notification/lib/push-support.ts src/features/push-notification/lib/push-support.test.ts
git commit -m "feat(push): 구독 지원/가드 순수 유틸 + 테스트"
```

### Task D3: 구독 훅 (subscribe/unsubscribe/status) — TDD

**Files:**

- Create: `src/features/push-notification/lib/use-push-subscription.ts`
- Test: `src/features/push-notification/lib/use-push-subscription.test.ts`
- Create: `src/features/push-notification/index.ts`

- [ ] **Step 1: 실패 테스트** (vi.mock으로 navigator.serviceWorker/Notification/pushManager·pushService mock)

```ts
// permission 'denied' → subscribe는 권한요청 없이 'denied' 상태, pushService.subscribe 미호출.
// permission 'granted' + pushManager.subscribe 성공 → pushService.subscribe가 {endpoint, p256dh, auth, lang} 으로 호출(키는 toJSON().keys.*).
// enable() 진행 중(requestPermission/subscribe round-trip) → status 'pending'으로 전이, 완료 후 'on'.
// lang 정규화: useLang()가 'En'/'Ko'든 'en'/'ko'든 payload lang은 'EN'|'KO' 대문자.
// unsubscribe → subscription.unsubscribe() + pushService.unsubscribe 호출, status 'off'.
```

(`reference_vi_mock_proxy_for_stubEnv_consumers`·sign-out 테스트 패턴 참조.)

- [ ] **Step 2~4: 구현·통과**

훅이 노출: `{ status: 'unsupported'|'needs-install'|'denied'|'off'|'on'|'pending', enable(), disable() }`. `pending`은 `enable()` 비동기 round-trip 동안 set, 결과(`on`/`denied`)로 clear. `enable()`:

1. `isPushSupported()` 아니면 'unsupported'.
2. `iosNeedsInstall` → 'needs-install'.
3. status='pending'. SW ready(`navigator.serviceWorker.ready`) 확보.
4. `Notification.requestPermission()` → 'denied'면 status='denied' 종료.
5. `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(VAPID) })`.
6. **키 추출 명시**: `const json = subscription.toJSON(); const { p256dh, auth } = json.keys!;` → `pushService.subscribe({ endpoint: subscription.endpoint, p256dh, auth, lang: normalizeLang(currentLang) })`. (⚠️ `subscription.p256dh` 직접 접근 아님 — `toJSON().keys.*`.) status='on'.

`normalizeLang(l)`: `String(l).toUpperCase().startsWith('KO') ? 'KO' : 'EN'` — 백엔드 `"KO".equalsIgnoreCase(lang)`(B7) 계약과 일치.
`disable()`: `getSubscription()` → `unsubscribe()` + `pushService.unsubscribe({ endpoint })`, status='off'. 현재 lang은 `useLang()` 활용.

Run: `npx vitest run src/features/push-notification/lib/use-push-subscription.test.ts` → PASS.

- [ ] **Step 5: index 배럴 + Commit**

```bash
git add src/features/push-notification/
git commit -m "feat(push): 구독 훅(enable/disable/status) + 권한·가드 분기"
```

### Task D4: 설정 토글 UI

**Files:**

- Create: `src/features/push-notification/ui/notification-toggle.component.tsx`
- Test: `src/features/push-notification/ui/notification-toggle.component.test.tsx`
- Modify: 설정 페이지에 마운트 — `src/app/settings/profile/page.tsx` 하단 또는 신규 섹션(데스크탑/모바일 분기 둘 다). i18n: `ko.json`/`en.json`에 문구 추가.

- [ ] **Step 1: i18n 문구 추가** (json 직접 수정 [[feedback_pfplay_web_i18n_drift]])

`ko.json`/`en.json` `settings`에 `notifications` 타이틀 + 상태별 문구(`push_on`/`push_off`/`install_first`/`denied_help`/`unsupported`).

- [ ] **Step 2: 토글 컴포넌트** (status별 렌더 — Checkbox/Switch + 안내문)

`use-push-subscription` 상태로: 'on'/'off'는 토글, 'pending'은 토글 비활성+로딩, 'needs-install'은 비활성+"홈 화면 추가 후" 안내, 'denied'는 비활성+"브라우저 설정 해제" 안내, **'unsupported'는 섹션 전체 미렌더(숨김)로 확정**. (UA는 `navigator.userAgent` 클라이언트에서 — A-탐색의 iOS 가드 패턴.)

- [ ] **Step 3: 테스트** (status별 렌더·토글 호출)

각 status 렌더 단언: 'unsupported'→섹션 미렌더(`queryBy...` null), 'needs-install'/'denied'→토글 disabled+안내문, 'on'/'off'→토글 클릭이 enable/disable 호출.
Run: `npx vitest run src/features/push-notification/ui/notification-toggle.component.test.tsx` → PASS.

- [ ] **Step 4: 설정 페이지 마운트 + 타입체크**

Run: `npx tsc --noEmit` → 에러 0.

- [ ] **Step 5: Commit**

```bash
git add src/features/push-notification/ui/ src/app/settings/ src/shared/lib/localization/dictionaries/ko.json src/shared/lib/localization/dictionaries/en.json
git commit -m "feat(push): 설정 알림 토글 UI(상태별 가드) + i18n"
```

### Task D5: 통합/라이브 검증 (게이트) + Phase D PR

- [ ] **Step 1: 전체 유닛 회귀**

Run: `npx vitest run`
Expected: 전부 GREEN.

- [ ] **Step 2: 로컬 풀스택 + 라이브 푸시 스모크** ([[feedback_local_e2e_before_dev_merge]] · [[reference_carry_cdc_pipeline_broken_live]])

dev 배포된 platform(또는 로컬 백엔드에 VAPID env+`WEB_PUSH_ENABLED=true`) 대상으로: `npx next dev`([[reference_pfplay_web_local_e2e_run]]) → 설치 → 토글 ON → 권한 허용 → 어드민에서 `sendPush=true` 공지 발행 → **실제 알림 수신 + 클릭 시 앱 오픈** 확인. 실 web-push 직렬화/전송은 라이브만 잡힘.

- [ ] **Step 3: 이슈/PR (한글), base=development**

CI 전부 GREEN 확인. 머지=사용자 게이트.

---

## 통합/릴리스 (전 Phase 머지 후)

- [ ] dev 환경에서 A+B+C+D 통합 라이브 검증: 설치 → 구독 → 어드민 공지(sendPush) → 알림 수신 → 클릭 오픈. KO/EN 양쪽 payload.
- [ ] prod 승격: 기존 릴리스 방식(web development→main, platform develop→release→main). VAPID env(public=web, private=platform) prod 주입 + `WEB_PUSH_ENABLED=true`. 첫 발송은 내부 테스트 공지로 검증(되돌릴 수 없는 외부 발송).
- [ ] 메모리 갱신: `project_pwa_conversion_scope` → 구현 완료/머지 상태로.

## 리스크 / 검증 포인트 (실행 중 확인)

- web-push 5.1.1 `PushService` 생성자/`send` 시그니처·반환 타입 — 라이브러리 버전 확정 후 정확 검증(B5).
- `UserId.getUid()` 반환 타입(UUID/Long) ↔ `push_subscription.user_id` 컬럼 타입 일치(B1/B2/B4).
- SecurityConfig: `/api/v1/push/**`가 인증 필요 경로로 잡히는지(permitAll 화이트리스트 제외) — B4.
- VAPID 키 생성·3환경 주입(public/private 분리, private 시크릿).
- iOS 16.4+ standalone에서만 푸시 — D4 가드가 정확히 동작하는지 실기기 확인.
