# PFPlay PWA: 설치형 전환 + 시스템 공지 Web Push

- **작성일**: 2026-06-16
- **이슈**: web #404 (PWA 전환)
- **스코프 결정 게이트**: 사용자 (확정 완료)
- **대상 레포**: pfplay-web (주), pfplay-platform, pfplay-admin

## 1. 목적과 범위

pfplay-web 모바일 경험을 **설치형 PWA**로 전환하고, **운영 시스템 공지를 Web Push로 브로드캐스트**한다.

확정 스코프:

- **Tier 1 — 설치형(installable)**: 홈 화면 standalone 설치. (web 단독)
- **Tier 2 — 푸시(Web Push)**: 어드민이 발행하는 시스템 공지("20:00에 xx 컨셉 파티룸이 열립니다" 같은 운영 공지)를 구독 회원에게 1:N 브로드캐스트. (web + platform + admin)

명시적 **비범위(Non-goals)**:

- **Tier 3(offline 데이터/앱셸 캐싱) 제외.** 앱이 realtime-heavy(WS: playback/chat/presence)라 service worker가 API 응답·앱셸을 캐싱하면 stale state를 증폭한다(과거 유령재생 #299, web #403, WS 재연결 resync 부재 #402 클래스와 정면 충돌). PWA 캐싱은 도입하지 않는다 — 라이브 데이터는 항상 네트워크/WS.
- **친구/팔로우(소셜 그래프) 없음.** 푸시는 운영 공지 브로드캐스트 수준만. 개인화/타겟팅 푸시는 비범위.
- 게스트(비로그인) 구독 비범위 — 로그인 회원만.

## 2. 핵심 결정 (확정)

| 항목        | 결정                                                                                                                 |
| ----------- | -------------------------------------------------------------------------------------------------------------------- |
| PWA 도구    | Next 네이티브 `app/manifest.ts` + 최소 수제 service worker. **캐싱 플러그인(serwist/next-pwa) 미도입.**              |
| 푸시 트리거 | 어드민이 공지 생성 시 **건별 "Web Push 발송" 토글**(`sendPush`). 공지 타입(MAINTENANCE_NOTICE/EVENT/EMERGENCY) 무관. |
| 권한 UX     | 설정의 **명시적 "알림 받기" 토글** 클릭 시에만 권한 요청. (자동 프롬프트 금지 → 영구 차단 방지)                      |
| 구독 대상   | **로그인 회원만**, 구독을 `userId`에 연결.                                                                           |

### 도구 선택 근거 (네이티브 + 최소 SW)

필요한 능력은 "설치 가능 + 푸시 수신"뿐이다. precaching/런타임 캐싱은 비범위이므로 `serwist`/`@ducanh2912/next-pwa`의 빌드 래핑은 불필요하고, 그 래핑은 `next.config.js`의 점검모드 SSR 게이팅·realtime 흐름과 충돌 여지가 있다(YAGNI 위반). 수제 SW는 응답을 가로채지 않으므로 점검모드 게이팅과 **충돌 0**, realtime stale 리스크 0.

## 3. 아키텍처 개요

기존 공지 시스템은 **도메인 이벤트 + 브로드캐스터 어댑터** 패턴이다:

```
어드민 공지 생성 → SystemAnnouncementCommandService (DB 커밋)
                 → AnnouncementPublishedEvent (도메인 이벤트)
                 → AnnouncementBroadcaster  @TransactionalEventListener(AFTER_COMMIT)
                       → WS 송출 (/sub/system/announcements)  [기존]
```

푸시는 **같은 이벤트에 리스너를 하나 더** 붙이는 식으로 들어간다 — 기존 코드 수정 최소, 책임 분리 유지:

```
                 → AnnouncementPushNotifier  @TransactionalEventListener(AFTER_COMMIT)  [신규]
                       → if event.entity.pushEnabled:
                           구독 전체 조회 → web-push 비동기 fan-out → 만료(404/410) prune
```

전체 데이터 흐름:

```
[어드민]  공지 생성 (sendPush=true)
   │
[platform]  커밋 → AnnouncementPublishedEvent
   ├─ AnnouncementBroadcaster ─→ WS (앱 열린 클라이언트, 기존 동작 무변)
   └─ AnnouncementPushNotifier ─→ web-push → 각 구독 endpoint
                                       │
[브라우저 SW]  'push' 이벤트 → showNotification(구독 lang 기준 title/message)
   │
[사용자]  알림 클릭 → 'notificationclick' → 앱 포커스/오픈(start_url 또는 지정 URL)
```

## 4. 단계별 설계 (독립 배포 가능 순서)

각 Phase는 독립 PR. 순서는 의존성 기준(A는 iOS 푸시 전제, B는 D의 백엔드, C는 B의 필드).

### Phase A — 설치형 PWA (pfplay-web 단독, 백엔드 무관)

**목적**: 홈 화면 standalone 설치 가능 + iOS 16.4+ 푸시 전제(설치 필수) 충족.

**구성 단위**:

1. `src/app/manifest.ts` (Next App Router 네이티브 `MetadataRoute.Manifest`)
   - `name`, `short_name`, `description`, `start_url: '/'`, `display: 'standalone'`, `background_color`, `theme_color`, `icons`(192·512 + 512 maskable), `lang`, `orientation`(선택).
   - **인터페이스**: Next가 `/manifest.webmanifest`로 자동 서빙. 의존성: 아이콘 자산.
2. 루트 `layout.tsx` 메타 보강
   - `metadata`에 `manifest`, `appleWebApp`(capable, statusBarStyle, title), `themeColor`, `viewport`(또는 `viewport` export) 추가. `apple-touch-icon` 링크.
   - **점검모드 분기**(layout의 maintenance ACTIVE 경로)에서도 manifest 링크는 유지되도록 — 단, SW가 응답을 가로채지 않으므로 점검 화면 자체엔 영향 없음.
3. `public/sw.js` — 최소 service worker (~40줄)
   - `install`/`activate`: `skipWaiting` + `clients.claim` (즉시 활성).
   - `fetch`: **network-passthrough**(가로채지 않음 = 캐싱·shell 서빙 없음). 설치 가능성 충족 목적의 no-op 핸들러.
   - `push`: 이벤트 data(JSON) → `showNotification(title, { body, icon, badge, data: { url } })`. (Phase D에서 실제 구독 연결되면 동작)
   - `notificationclick`: 알림 닫고 `clients.matchAll`로 기존 탭 포커스, 없으면 `clients.openWindow(url)`.
   - **인터페이스**: Phase D의 등록 코드가 `navigator.serviceWorker.register('/sw.js')`로 로드. 의존성 없음(self-contained).
4. 아이콘 자산: 현재 `public/`엔 `favicon.ico` + SVG + 로고 PNG(`public/images/Logo/Symbol_*`)만 있고 **192/512/512-maskable PNG·apple-touch-icon은 없음** → Symbol 로고에서 파생 생성(계획의 구체 자산 작업).

**완료 기준**: Chrome devtools "Installable" 통과, 홈 화면 설치 후 standalone 실행, Lighthouse PWA installable 항목 통과.

### Phase B — 푸시 구독·발송 (pfplay-platform)

**목적**: 구독 저장/관리 + 공지 이벤트 → web-push fan-out.

**구성 단위**:

1. **저장소**: `member_push_subscription` 테이블 (Flyway 신규 마이그레이션, 슬롯 점프 주의)
   - 컬럼: `id`(PK), `user_id`(FK/인덱스), `endpoint`(UNIQUE, 길이 충분히 — TEXT/VARCHAR(512+)), `p256dh`, `auth`, `lang`(KO/EN), `created_at`, `updated_at`, `revoked_at`(nullable, soft delete).
   - 동일 endpoint 재구독 = upsert(갱신). 동일 user의 여러 기기 = 여러 row.
   - **soft-delete 부활 경로 명시**: 이전에 `revoked_at`된 endpoint를 재구독하면 UNIQUE 충돌을 일으키지 않고 기존 row를 되살린다(`revoked_at=NULL`, keys/lang 갱신). 테스트로 부활 경로를 단언한다.
2. **구독 API** (인증 필수, 회원만)
   - `POST /v1/push/subscriptions` — body: `{ endpoint, keys: { p256dh, auth }, lang }`. upsert. 멱등.
   - `DELETE /v1/push/subscriptions` — body 또는 query: `{ endpoint }`. soft delete(`revoked_at`).
   - `GET /v1/push/vapid-public-key` — VAPID 공개키 반환 (또는 web 빌드 env로 주입; §6 참조).
3. **VAPID + 발송 어댑터**
   - VAPID 키페어(public/private) + subject(mailto)를 설정으로 주입(env 3곳 패턴 — OPENAI_API_KEY 선례 참조: local/dev/prod). **private는 시크릿**.
   - 라이브러리 `nl.martijndwars:web-push`(BouncyCastle 동반). 포트/어댑터로 감싼다(`WebPushSender` 포트 → `MartijndwarsWebPushAdapter`).
4. **공지 이벤트 → 푸시 리스너** `AnnouncementPushNotifier`
   - `@TransactionalEventListener(phase = AFTER_COMMIT, fallbackExecution = true)` on `AnnouncementPublishedEvent`. (기존 `AnnouncementBroadcaster`와 동일 컨벤션, 별도 컴포넌트로 책임 분리)
   - `event.entity().isPushEnabled()`가 false면 no-op.
   - true면: 활성 구독(`revoked_at IS NULL`) 페이지네이션 조회 → 비동기(`@Async` 또는 전용 executor) fan-out 발송. payload = 구독 `lang`에 따라 `titleKo/titleEn`·`messageKo/messageEn` 선택 + `data.url`(start_url 또는 공지 deep link).
   - 발송 결과 **404/410(Gone)** → 해당 구독 soft delete(prune). 기타 5xx는 로깅(재시도는 V1 비범위 — YAGNI; 운영 공지는 best-effort).
   - **중복 발송 허용**: `fallbackExecution=true` + best-effort라 드물게 리스너가 2회 실행되면 중복 푸시가 갈 수 있다. 이는 가드 대상이 아니라 **용인되는 결과**(운영 공지 특성). 멱등 보장은 V1 비범위.
   - **fan-out 경계 고정**(계획 단계): 페이지 크기 + 전용 executor 풀/큐 크기를 구체값으로 지정해 대규모 브로드캐스트가 스레드풀을 고갈시키거나 푸시 endpoint를 폭격하지 않도록 한다.
   - **`push_enabled` 범위 주의**: `SystemAnnouncementData`는 `AnnouncementCancelledEvent`/`MaintenanceStartedEvent`/`MaintenanceEndedEvent`도 운반하지만, 푸시는 **`AnnouncementPublishedEvent`에만** 연결한다. `push_enabled` 컬럼은 다른 이벤트엔 의미 없음 — cancel/maintenance 흐름에 푸시를 실수로 엮지 않는다.
5. **`sendPush` 필드 전파**
   - `AnnouncementCreateRequest`에 `sendPush: boolean`(기본 false).
   - 도메인 엔티티 `SystemAnnouncementData`에 `pushEnabled` 필드 + 마이그레이션 컬럼(`push_enabled` default false). `AnnouncementPublishedEvent`는 entity를 그대로 전달하므로 추가 변경 불필요.

**완료 기준**: 유닛+IT — 구독 upsert/soft-delete, 리스너 fan-out(pushEnabled gating), prune(404/410 mock), lang 분기 payload. 라이브 스모크 — 실 web-push 발송 1건 수신.

### Phase C — 어드민 토글 (pfplay-admin)

**목적**: 어드민이 공지별 푸시 발송 여부 선택.

**구성 단위**:

- 공지 생성 폼에 "Web Push 발송" 체크박스 → `sendPush` 전송.
- 발송 시 "이 공지가 구독자 전체에게 푸시됩니다" 확인/주의 문구(되돌릴 수 없는 외부 발송이므로).
- pfplay-admin은 GHA 없음(Vercel/Cloudflare native) — 대시보드 확인.

**완료 기준**: 토글 ON으로 공지 생성 → 구독 기기에서 알림 수신(Phase B/D 통합 후 라이브 검증).

### Phase D — 설정 토글·구독 와이어링 (pfplay-web)

**목적**: 사용자가 알림을 켜고/끄고, SW가 푸시를 표시.

**구성 단위**:

1. **구독 훅/모듈** (`features/push-notification` 정도)
   - `subscribe()`: SW 등록 보장 → `Notification.requestPermission()` → 거부 시 안내 종료 → 허용 시 `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: VAPID공개키 })` → 결과를 `POST /v1/push/subscriptions`(현재 lang 포함).
   - `unsubscribe()`: `subscription.unsubscribe()` + `DELETE /v1/push/subscriptions`.
   - 현재 상태 조회: `Notification.permission` + 기존 `pushManager.getSubscription()` 동기화.
2. **설정 토글 UI**: 프로필/메뉴 설정 영역에 "알림 받기" 토글. 상태 = 권한+구독 종합. 토글 ON→subscribe, OFF→unsubscribe.
3. **환경/디바이스 가드**:
   - iOS: standalone(설치) + 16.4+에서만 푸시 가능 → 미설치 iOS는 "홈 화면에 추가 후 알림 가능" 안내, 토글 비활성.
   - 권한 `denied` 상태: 토글 비활성 + "브라우저 설정에서 알림 차단 해제" 안내(앱이 재요청 불가).
   - 미지원 브라우저: 토글 숨김/비활성.
4. **SW 푸시 핸들러 활성화**: Phase A에서 만든 `sw.js`의 `push`/`notificationclick`가 실제 구독으로 동작.

**완료 기준**: 유닛 — 구독/해지 훅(권한 mock, 가드 분기), 토글 상태 머신. e2e/라이브 — 토글 ON → 실 알림 수신 → 클릭 시 앱 오픈.

## 5. 컴포넌트 경계 요약

| 단위                                      | 책임                                  | 인터페이스                                                   | 의존                |
| ----------------------------------------- | ------------------------------------- | ------------------------------------------------------------ | ------------------- |
| `manifest.ts` (web)                       | 설치 메타데이터                       | `/manifest.webmanifest`                                      | 아이콘              |
| `sw.js` (web)                             | 푸시 수신·표시, 설치 충족 fetch no-op | SW 이벤트(`push`,`notificationclick`,`fetch`)                | 없음                |
| `features/push-notification` (web)        | 구독 라이프사이클·권한·가드           | `subscribe()/unsubscribe()/status`                           | push API, SW        |
| 설정 토글 UI (web)                        | 사용자 on/off                         | 훅 호출                                                      | 위 모듈             |
| `PushSubscription` 저장소 (platform)      | 구독 영속                             | repository                                                   | DB/Flyway           |
| 구독 API (platform)                       | 구독 CRUD                             | `POST/DELETE /v1/push/subscriptions`, `GET vapid-public-key` | 저장소              |
| `WebPushSender` 포트/어댑터 (platform)    | 실 발송                               | `send(subscription, payload)`                                | web-push lib, VAPID |
| `AnnouncementPushNotifier` (platform)     | 이벤트→fan-out→prune                  | `@TransactionalEventListener`                                | 저장소, sender      |
| `sendPush`/`pushEnabled` (platform/admin) | 공지별 발송 토글                      | 요청 필드/엔티티 컬럼                                        | —                   |

## 6. 횡단 관심사

### iOS 제약

- Web Push는 iOS 16.4+ & **홈 화면 설치(standalone) 후에만** 동작. Phase A가 전제. Phase D UX가 미설치 iOS를 안내·차단.

### 권한 영구차단 방지

- `requestPermission()`은 사용자가 토글을 명시적으로 켤 때만 호출. 자동/페이지로드 시 호출 금지(영구 차단 유발).

### 점검모드 비충돌

- SW가 `fetch`를 가로채지 않으므로(network-passthrough), layout의 점검모드 SSR 게이팅·middleware rewrite와 충돌 없음. SW가 셸을 서빙하지 않아 점검 우회 불가.

### 다국어

- 공지는 `titleKo/En`·`messageKo/En` 보유. 구독 row에 `lang` 저장 → 발송 시 분기. (i18n.xlsx↔JSON drift 규칙 준수: 새 UI 문구는 json 직접 수정)

### 보안

- 구독 API는 회원 인증 필수. VAPID private 키는 시크릿(local/dev/prod 분리). 구독 endpoint는 사용자 소유 검증(타인 구독 삭제 방지) — userId 스코프.

### VAPID 공개키 전달

- 옵션1: `GET /v1/push/vapid-public-key`(런타임 fetch). 옵션2: web 빌드 env(`NEXT_PUBLIC_VAPID_PUBLIC_KEY`). 공개키는 노출 무방 → **빌드 env 권장**(런타임 의존 제거). 키 회전 빈도 낮음. (계획 단계에서 확정)

### 만료 구독 정리

- 발송 시 404/410 → soft delete. 별도 배치 정리는 V1 비범위(YAGNI).

## 7. 테스트 전략

- **web 유닛**: manifest 형태, 구독/해지 훅(권한·iOS·denied·미지원 가드 분기), 토글 상태.
- **platform 유닛+IT**: 구독 upsert/멱등/soft-delete, userId 스코프, `AnnouncementPushNotifier` fan-out·pushEnabled gating·lang payload·prune(404/410 mock), 직렬화.
- **라이브 스모크**(필수): 실 web-push 직렬화·전송 경로는 라이브만 잡힌다(CDC 라이브 2버그 교훈). 어드민 공지(sendPush=true) → 실제 기기 알림 수신 → 클릭 오픈.
- **로컬 풀스택 e2e**(dev 머지 전): Installable 검증 + 구독 토글 + (가능 시) 실 알림 수신. 단위 GREEN ≠ 배포 안전 원칙.

## 8. 리스크 / 오픈 이슈

- web-push Java 라이브러리(BouncyCastle) JDK 21 호환 확인 필요(계획 단계).
- Flyway 슬롯 번호 — 최신 마이그레이션 확인 후 번호 배정(슬롯 점프 회복 규칙).
- 알림 클릭 deep link 목적지(start_url vs 공지 상세) — V1은 start_url로 단순화 권장.
- prod 발송은 되돌릴 수 없는 외부 행위 — 어드민 발송 시 확인 문구 + 첫 배포 후 내부 테스트 발송으로 검증.

## 9. 배포 순서

A(web) → B(platform) → C(admin) → D(web). dev 환경에서 통합 라이브 검증 후 prod 승격은 기존 릴리스 방식(development→main, release 게이트). 각 단계 머지는 사용자 게이트.
