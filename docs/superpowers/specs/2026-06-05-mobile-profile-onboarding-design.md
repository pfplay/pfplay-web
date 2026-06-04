# 모바일 신규 소셜 가입자 강제 프로필 온보딩 — 설계

- 이슈: [pfplay-web#393](https://github.com/pfplay/pfplay-web/issues/393)
- 날짜: 2026-06-05
- 스코프 상위 맥락: 모바일 반응형 개편(이슈 #340) 후속. 전환 깔때기 누수 차단.

## 1. 배경 / 문제

모바일에서 신규 소셜 가입자(지갑인증 X = **AM 준회원**, `AuthorityTier.AM`)가 가입 직후 **강제 리다이렉트 2겹에 모두 막다른 길**로 빠져 이탈한다.

```
신규 AM 모바일 가입
  → parties/layout.tsx: me.profileUpdated === false → router.replace('/settings/profile')
      → settings/profile/page.tsx 모바일 분기: <MobileOnlyDesktopFeatureCard feature='profile-edit'/>  ❌ 데드엔드 #1
  → (프로필 설정 가정) settings/profile/layout.tsx: AM → router.replace('/settings/avatar')
      → settings/avatar/page.tsx 모바일 분기: <MobileOnlyDesktopFeatureCard feature='avatar-edit'/>  ❌ 데드엔드 #2
```

`parties/layout.tsx` 는 `profileUpdated` 가 true 가 될 때까지 `null` 을 렌더하므로, 모바일 신규 회원은 **프로필 설정도 못 하고 어떤 파티에도 진입하지 못한다.** 게스트(GT)는 `profileUpdated=true`/좀비 안전망으로 면제되어 맛보기 깔때기는 작동하지만, 갓 가입한 소셜 회원은 벽에 부딪힌다.

근거(실측, 2026-06-05):

- `src/app/parties/layout.tsx:35` — `if (me && !me.profileUpdated) router.replace('/settings/profile')`, `:42` — `!me.profileUpdated` 면 `null` 렌더
- `src/app/settings/profile/page.tsx:8-9` — 모바일이면 `MobileOnlyDesktopFeatureCard feature='profile-edit'`
- `src/app/settings/profile/layout.tsx:21-28` — `profileUpdated && AM → /settings/avatar`, `FM → /parties`, `GT → /`
- `src/app/settings/avatar/page.tsx:6-7` — 모바일이면 `MobileOnlyDesktopFeatureCard feature='avatar-edit'`
- `src/shared/api/http/types/@enums.ts:144-146` — `FM=Full Crew(지갑인증)`, `AM=Associate Crew(지갑인증 X)`, `GT=Guest`

## 2. 기획 결정 (잠금)

- **프로필만 강제.** 모바일 프로필 편집 화면을 신규 구현한다.
- **아바타는 서버가 자동 셋팅.** 모바일에서 아바타 강제 단계는 불필요하다. 모바일 아바타 '편집' 클릭 시 "데스크탑에서만 가능" 안내(`MobileOnlyDesktopFeatureCard feature='avatar-edit'`)는 **의도된 동작으로 유지**(합의된 타협) — 작업 없음.
- **모바일 AM은 프로필 완료 후 아바타 강제 단계를 건너뛰고 `/parties`로** 간다. 데스크탑 AM 은 기존대로 `/settings/avatar` 유지.

## 3. 작업 범위

1. **모바일 프로필 편집 화면** — `/settings/profile` 모바일 분기를 폴백 카드 → 반응형 강제 온보딩 폼(닉네임 + 소개 → "Let's get in")으로 교체.
2. **데드엔드 #2 fix** — `settings/profile/layout.tsx` 에서 **모바일 AM → `/parties`** (데스크탑 AM 불변).
3. **아바타** — 작업 없음(의도된 데스크탑 전용 안내 유지).

### 범위 밖 (명시)

- 기존 회원의 모바일 프로필 재편집(데스크탑은 사이드바 `ProfileEditFormV2` 전용 — 모바일 사이드바 없음). 후속 과제.
- 모바일 아바타 편집 화면.
- 데스크탑 AM → `/settings/avatar` 동작 변경.

## 4. 접근법 (선택: A)

데스크탑 `ProfileEditFormV1`(`src/features/edit-profile-bio/ui/v1.component.tsx`)은 고정폭(`w-[550px]`)+absolute 버튼이라 모바일에 직접 못 쓴다.

**A. 공유 훅 추출 + 모바일 전용 레이아웃** (채택) — `ProfileEditFormV1` 의 react-hook-form 로직을 훅으로 추출, 데스크탑 V1 은 레이아웃 불변으로 그 훅을 소비하고, 신규 모바일 폼이 동일 훅 + 모바일 레이아웃을 소비. PR #390 `useBeAHost`(데스크탑/모바일 공유 훅 + 폼팩터별 레이아웃)와 동일 패턴. 데스크탑 픽셀/테스트 불변, DRY.

- B(V1 in-place 반응형 개조): 한 파일에 두 폼팩터 혼입 + 데스크탑 회귀 위험 → 기각.
- C(데이터층만 재사용, 폼 로직 별도): 폼 로직 중복(DRY 위반) → 기각.

device-aware 리다이렉트 fix는 클라이언트 layout 이 `x-pf-device`(서버 전용 request 헤더)를 직접 못 읽으므로, **`settings/profile/layout.tsx`를 얇은 RSC로 전환**해 `headers()`로 device 를 읽고 client redirect-guard 에 prop 으로 전달한다(기존 "RSC page.tsx가 headers 읽고 분기" 컨벤션과 일치). 대안(middleware 가 device 쿠키 주입)은 전역 신규 메커니즘이라 YAGNI 기각.

## 5. 컴포넌트 / 파일 설계

### 5.1 공유 훅 추출 (데스크탑 무회귀)

- **신규** `src/features/edit-profile-bio/lib/use-edit-profile-bio-form.ts`
  - 내부: `useI18n()`, `useSuspenseFetchMe()`, `useUpdateMyBio()`
  - `useForm<Form.Model>({ mode: 'all', resolver: zodResolver(Form.getSchema(t)), defaultValues: { nickname: me.nickname, introduction: me.introduction } })`
  - `handleFormSubmit`: `updateBio(values, { onError: 409 → setError('nickname', nickname_taken) })`
  - 반환: `{ control, handleSubmit, onSubmit: handleFormSubmit, errors, btnDisabled, isPending }`
  - `btnDisabled = Object.keys(errors).length > 0 || !isValid`
- **수정** `src/features/edit-profile-bio/ui/v1.component.tsx`
  - 위 훅을 소비하도록 리팩터. **JSX 마크업·className·`data-*`·버튼 배치 100% 불변.** 동작/픽셀/기존 테스트 동일.

### 5.2 모바일 폼 (신규)

- **신규** `src/features-mobile/profile/ui/mobile-profile-edit-form.component.tsx`
  - `useEditProfileBioForm()` 소비.
  - 레이아웃: 세로 스택. `FormItem`(닉네임, 필수, `Input maxLength=16`) + `FormItem`(소개, `TextArea maxLength=50 rows=3`) **full-width**(`w-full`, 모바일 `px-app` 패딩). 하단 full-width "Let's get in" `Button`(`btnDisabled`/`isPending` 바인딩). 데스크탑의 absolute 배치 대신 일반 흐름 하단 고정.
  - 재사용 공통 컴포넌트: `FormItem`, `Input`, `TextArea`, `Button` (`@/shared/ui/components/*`).
- **신규** `src/features-mobile/profile/index.ts` — barrel export.

### 5.3 페이지 와이어링

- **수정** `src/app/settings/profile/page.tsx`
  - 모바일 분기: `MobileOnlyDesktopFeatureCard feature='profile-edit'` → 모바일 컨테이너(제목 `t.settings.title.who_r_u` 헤딩 + `<MobileProfileEditForm/>`). 데스크탑 분기 불변.
- **수정** `src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx`
  - `'profile-edit'` variant + 라벨 제거(데드코드 회피). `'avatar-edit'`, `'withdraw'` 유지.

### 5.4 데드엔드 #2 fix (device-aware AM)

- **수정** `src/app/settings/profile/layout.tsx` — 얇은 **RSC**로 전환. `const device = headers().get('x-pf-device') === 'mobile' ? 'mobile' : 'desktop'`. `<ProfileEditRedirectGuard device={device}>{children}</ProfileEditRedirectGuard>` 렌더. (Server Component 이므로 `useSuspenseFetchMe`/`useRouter` 제거.)
- **신규** `src/app/settings/profile/profile-edit-redirect-guard.tsx` ('use client') — `device: 'mobile'|'desktop'` prop 수신. 기존 me 기반 리다이렉트 이전:
  - `GT` → `/` (불변)
  - `profileUpdated && FM` → `/parties` (불변)
  - `profileUpdated && AM` → **`device === 'mobile' ? '/parties' : '/settings/avatar'`** (유일한 신규 분기)
  - `profileUpdated === false` → 리다이렉트 없음(폼 노출)

## 6. 데이터 흐름

```
me(useSuspenseFetchMe) → nickname/introduction defaultValues + authorityTier
  → 모바일 폼 제출 → useUpdateMyBio PATCH bio
      → onSuccess: invalidate [Me] + track('Bio Updated')
          → me refetch → profileUpdated=true
              → settings/profile/layout guard: AM && mobile → router.replace('/parties')
```

신규 mutation/엔드포인트 0. redirect-in(`parties/layout`)·redirect-out(guard) 모두 기존 메커니즘 재사용.

## 7. 에러 처리

- 닉네임 중복 `409` → `setError('nickname', t.settings.para.nickname_taken)` (공유 훅, 데스크탑 동일)
- zod 검증 실패 → `FormItem` 인라인 에러
- 그 외 mutation 에러 → 기존 동작 유지(별도 처리 없음 — 데스크탑과 동일 수준)

## 8. i18n

기존 키 재사용: `t.settings.title.who_r_u`, `t.settings.title.nickname`, `t.settings.title.introduction`, `t.common.ec.char_limit_12`, `t.common.ec.char_limit_50`, `t.settings.para.nickname_taken`. "Let's get in" 은 데스크탑 V1 과 동일하게 리터럴 유지. **신규 키 없음**(있다면 ko/en json 직접 편집, [[feedback_pfplay_web_i18n_drift]]).

## 9. 테스트 전략

### 단위 (vitest)

- `use-edit-profile-bio-form` — 검증/submit→updateBio 호출/409→setError
- `mobile-profile-edit-form` — 필드 렌더, CTA `disabled`(invalid 시), 제출 호출
- `profile-edit-redirect-guard` — 5분기: `GT→/`, `FM→/parties`, `AM+mobile→/parties`, `AM+desktop→/settings/avatar`, `profileUpdated=false→리다이렉트 없음`
- 데스크탑 `v1.component` 기존 테스트 **그린 유지**(회귀 가드)

### 로컬 풀스택 e2e (Playwright `--project=mobile`)

[[feedback_local_e2e_before_dev_merge]] 게이트. 신규 spec `e2e/mobile/profile-onboarding.spec.ts`:

- 모바일 신규 AM(또는 profileUpdated=false 회원) → `/settings/profile` 모바일 폼 노출 → 닉네임 입력 → 제출 → **`/parties` 착지(아바타 단계 건너뜀)** happy-path 1개 = 데드엔드 2겹 모두 해소 실증.
- 절차: 로컬 backend docker `:8080` + `npx next dev` http `:3000` + `E2E_API_BASE`/`E2E_BASE_URL` inline ([[reference_pfplay_web_local_e2e_run]], [[reference_pfplay_web_local_dev_http_webpack]]).

## 10. 회귀/위험

- 데스크탑 V1 무회귀: 훅 추출은 public 마크업 불변 → 기존 테스트가 가드.
- layout RSC 전환: `useSuspenseFetchMe` Suspense 경계가 guard(client) 로 이동해도 상위 provider 트리(QueryClient) 동일 → 동작 보존. RSC 가 `headers()` 호출 → 해당 route 동적 렌더(이미 page.tsx 가 `headers()` 사용해 동적).
- [[feedback_mobile_widget_baseline_reflex]]: 데스크탑 V1 baseline(필드 구성·검증·mutation) grep·diff 완료 후 모바일 폼 작성.
