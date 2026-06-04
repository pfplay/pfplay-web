# 모바일 신규 소셜 가입자 강제 프로필 온보딩 — 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 신규 소셜 가입자(AM 준회원)가 강제 프로필 온보딩을 모바일에서 완료하고 `/parties`로 진입하게 만들어, 데드엔드 2겹(프로필·아바타 desktop-only 카드)을 해소한다.

**Architecture:** 데스크탑 `ProfileEditFormV1`의 react-hook-form 로직을 공유 훅(`useEditProfileBioForm`)으로 추출(데스크탑 마크업 불변), 신규 모바일 폼이 동일 훅 + 모바일 레이아웃을 소비. `/settings/profile` 모바일 분기를 폼으로 교체. `settings/profile/layout.tsx`를 RSC로 전환해 `x-pf-device`를 읽고 client redirect-guard에 prop 전달 → 모바일 AM은 프로필 후 `/parties`(아바타 강제 단계 생략).

**Tech Stack:** Next.js App Router(RSC + 'use client'), react-hook-form + zod, TanStack Query(useSuspenseFetchMe / useUpdateMyBio), vitest + @testing-library/react, Playwright(`--project=mobile`).

**Spec:** `docs/superpowers/specs/2026-06-05-mobile-profile-onboarding-design.md`

---

## File Structure

| 파일                                                                                                       | 책임                                             | 동작                                    |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | --------------------------------------- |
| `src/features/edit-profile-bio/lib/use-edit-profile-bio-form.ts`                                           | 프로필 바이오 폼 로직(검증·submit·409) 단일 출처 | **신규**                                |
| `src/features/edit-profile-bio/lib/use-edit-profile-bio-form.test.ts`                                      | 훅 단위 테스트                                   | **신규**                                |
| `src/features/edit-profile-bio/ui/v1.component.tsx`                                                        | 데스크탑 프로필 폼(레이아웃)                     | **수정**(훅 소비, 마크업 불변)          |
| `src/features/edit-profile-bio/index.ts`                                                                   | barrel                                           | **수정**(훅 export 추가)                |
| `src/features-mobile/profile/ui/mobile-profile-edit-form.component.tsx`                                    | 모바일 프로필 폼(레이아웃)                       | **신규**                                |
| `src/features-mobile/profile/ui/mobile-profile-edit-form.component.test.tsx`                               | 모바일 폼 테스트                                 | **신규**                                |
| `src/features-mobile/profile/index.ts`                                                                     | barrel                                           | **신규**                                |
| `src/app/settings/profile/page.tsx`                                                                        | device 분기 페이지                               | **수정**(모바일 분기 폼으로)            |
| `src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx` | desktop-only 안내 카드                           | **수정**(`'profile-edit'` variant 제거) |
| `src/app/settings/profile/profile-edit-redirect-guard.tsx`                                                 | me 기반 device-aware 리다이렉트                  | **신규**('use client')                  |
| `src/app/settings/profile/profile-edit-redirect-guard.test.tsx`                                            | guard 5분기 테스트                               | **신규**                                |
| `src/app/settings/profile/layout.tsx`                                                                      | device 읽어 guard에 전달                         | **수정**(RSC 전환)                      |
| `e2e/mobile/profile-onboarding.spec.ts`                                                                    | 모바일 온보딩 happy-path                         | **신규**                                |

빌드 환경 참고: 로컬 검증은 `npx next dev`(http+webpack), `yarn dev` 금지. e2e는 풀스택(backend docker :8080 + next dev :3000).

---

## Chunk 1: 공유 훅 + 데스크탑 무회귀

### Task 1: `useEditProfileBioForm` 훅 추출

**Files:**

- Create: `src/features/edit-profile-bio/lib/use-edit-profile-bio-form.ts`
- Test: `src/features/edit-profile-bio/lib/use-edit-profile-bio-form.test.ts`

- [ ] **Step 1: 실패 테스트 작성**

```ts
import { renderHook, act } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { useEditProfileBioForm } from './use-edit-profile-bio-form';

const updateBioMock = vi.fn();
vi.mock('../api/use-update-my-bio.mutation', () => ({
  useUpdateMyBio: () => ({ mutate: updateBioMock, isPending: false }),
}));
vi.mock('@/entities/me', () => ({
  useSuspenseFetchMe: () => ({ data: { nickname: 'olddata', introduction: 'hi' } }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    common: {
      ec: { char_field_required: 'required', char_limit_12: 'max12', char_limit_50: 'max50' },
    },
    settings: { para: { nickname_taken: '이미 사용 중인 닉네임' } },
  }),
}));

describe('useEditProfileBioForm', () => {
  beforeEach(() => updateBioMock.mockReset());

  test('onSubmit 시 me 기본값으로 updateBio 호출', async () => {
    const { result } = renderHook(() => useEditProfileBioForm());
    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as any);
    });
    expect(updateBioMock).toHaveBeenCalledTimes(1);
    expect(updateBioMock.mock.calls[0][0]).toEqual({ nickname: 'olddata', introduction: 'hi' });
  });

  test('409 응답 시 nickname 에러 셋팅', async () => {
    updateBioMock.mockImplementation((_values, opts) =>
      opts.onError({ response: { data: { code: 409 } } })
    );
    const { result } = renderHook(() => useEditProfileBioForm());
    await act(async () => {
      await result.current.onSubmit({ preventDefault: () => {} } as any);
    });
    expect(result.current.errors.nickname?.message).toBe('이미 사용 중인 닉네임');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/features/edit-profile-bio/lib/use-edit-profile-bio-form.test.ts`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```ts
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSuspenseFetchMe } from '@/entities/me';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { useUpdateMyBio } from '../api/use-update-my-bio.mutation';
import * as Form from '../model/form.model';

export const useEditProfileBioForm = () => {
  const t = useI18n();
  const { data: me } = useSuspenseFetchMe();
  const { mutate: updateBio, isPending } = useUpdateMyBio();

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isValid },
  } = useForm<Form.Model>({
    mode: 'all',
    resolver: zodResolver(Form.getSchema(t)),
    defaultValues: {
      nickname: me.nickname,
      introduction: me.introduction,
    },
  });

  const btnDisabled = Object.keys(errors).length > 0 || !isValid;

  const onSubmit = handleSubmit((values) => {
    updateBio(values, {
      onError: (err) => {
        if (err.response?.data.code === 409) {
          setError('nickname', { message: t.settings.para.nickname_taken });
        }
      },
    });
  });

  return { control, onSubmit, errors, btnDisabled, isPending };
};
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/features/edit-profile-bio/lib/use-edit-profile-bio-form.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/features/edit-profile-bio/lib/use-edit-profile-bio-form.ts src/features/edit-profile-bio/lib/use-edit-profile-bio-form.test.ts
git commit -m "feat(edit-profile-bio): 프로필 바이오 폼 로직 공유 훅 추출 (#393)"
```

### Task 2: 데스크탑 V1을 훅 소비로 리팩터 (마크업 불변)

**Files:**

- Modify: `src/features/edit-profile-bio/ui/v1.component.tsx`
- Modify: `src/features/edit-profile-bio/index.ts` (훅 barrel export 추가)

- [ ] **Step 1: V1 리팩터** — `useForm`/`handleFormSubmit`/`btnDisabled` 로컬 정의를 제거하고 `const { control, onSubmit, errors, btnDisabled, isPending } = useEditProfileBioForm();` 로 대체. `<form onSubmit={handleSubmit(handleFormSubmit)}>` → `<form onSubmit={onSubmit}>`. **두 `Controller`, 두 `FormItem`, `Input`/`TextArea` props, `Button`(variant/size/className/disabled/loading), 모든 className·`data-*` 100% 그대로.** 제거되는 import: `useForm`, `SubmitHandler`, `zodResolver`, `useSuspenseFetchMe`, `useUpdateMyBio`, `Form`. 추가 import: `useEditProfileBioForm`.

- [ ] **Step 2: barrel export** — `src/features/edit-profile-bio/index.ts` 에 `export { useEditProfileBioForm } from './lib/use-edit-profile-bio-form';` 추가.

- [ ] **Step 3: 회귀 게이트** — V1 컴포넌트 단위 테스트는 본래 없음. 회귀 가드 = 타입체크 + 기존 form.model/integration 테스트 + 마크업 무변경.

Run:

```bash
yarn vitest run src/features/edit-profile-bio
npx tsc --noEmit
```

Expected: 기존 테스트 PASS, tsc 0 error

- [ ] **Step 4: 마크업 불변 확인** — `git diff src/features/edit-profile-bio/ui/v1.component.tsx` 로 JSX(`return (...)`) 영역에 className/구조 변경이 없는지 육안 확인(로직 라인만 변경돼야 함).

- [ ] **Step 5: 커밋**

```bash
git add src/features/edit-profile-bio/ui/v1.component.tsx src/features/edit-profile-bio/index.ts
git commit -m "refactor(edit-profile-bio): 데스크탑 V1을 공유 훅 소비로 전환 (마크업 불변, #393)"
```

---

## Chunk 2: 모바일 폼 + 페이지 와이어링

### Task 3: 모바일 프로필 폼 컴포넌트

**Files:**

- Create: `src/features-mobile/profile/ui/mobile-profile-edit-form.component.tsx`
- Create: `src/features-mobile/profile/index.ts`
- Test: `src/features-mobile/profile/ui/mobile-profile-edit-form.component.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** (#390 mobile card 테스트 패턴 — 공유 훅 mock)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import MobileProfileEditForm from './mobile-profile-edit-form.component';

const onSubmitMock = vi.fn((e) => e?.preventDefault?.());
vi.mock('@/features/edit-profile-bio', () => ({
  useEditProfileBioForm: () => ({
    control: { register: () => ({}), _formState: {}, _options: {} } as any,
    onSubmit: onSubmitMock,
    errors: {},
    btnDisabled: false,
    isPending: false,
  }),
}));
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    settings: { title: { nickname: '닉네임', introduction: '소개', who_r_u: 'Who R U' } },
    common: { ec: { char_limit_12: '12자', char_limit_50: '50자' } },
  }),
}));
// react-hook-form Controller 는 control 의존 — render 가 깨지면 Controller 를 얕게 mock
vi.mock('react-hook-form', async (orig) => {
  const actual = await (orig as any)();
  return {
    ...actual,
    Controller: ({ render }: any) =>
      render({ field: { value: '', onChange: () => {}, name: '', ref: () => {} } }),
  };
});

describe('MobileProfileEditForm', () => {
  beforeEach(() => onSubmitMock.mockClear());

  test('닉네임·소개 필드 + CTA 렌더', () => {
    render(<MobileProfileEditForm />);
    expect(screen.getByText('닉네임')).toBeInTheDocument();
    expect(screen.getByText('소개')).toBeInTheDocument();
    expect(screen.getByTestId('mobile-profile-submit')).toBeInTheDocument();
  });

  test('제출 시 onSubmit 호출', () => {
    render(<MobileProfileEditForm />);
    fireEvent.submit(screen.getByTestId('mobile-profile-form'));
    expect(onSubmitMock).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/features-mobile/profile/ui/mobile-profile-edit-form.component.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```tsx
'use client';

import { Controller } from 'react-hook-form';
import { useEditProfileBioForm } from '@/features/edit-profile-bio';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { Button } from '@/shared/ui/components/button';
import { FormItem } from '@/shared/ui/components/form-item';
import { Input } from '@/shared/ui/components/input';
import { TextArea } from '@/shared/ui/components/textarea';

const MobileProfileEditForm = () => {
  const t = useI18n();
  const { control, onSubmit, errors, btnDisabled, isPending } = useEditProfileBioForm();

  return (
    <form
      data-testid='mobile-profile-form'
      onSubmit={onSubmit}
      className='flexCol gap-10 w-full px-app pt-6 pb-10'
    >
      <div className='flexCol gap-8 w-full'>
        <Controller
          control={control}
          name='nickname'
          render={({ field }) => (
            <FormItem
              label={t.settings.title.nickname}
              error={errors.nickname?.message}
              required
              classNames={{ label: 'text-gray-200' }}
            >
              <Input
                {...field}
                maxLength={16}
                placeholder={t.common.ec.char_limit_12}
                classNames={{ container: 'w-full' }}
              />
            </FormItem>
          )}
        />
        <Controller
          control={control}
          name='introduction'
          render={({ field }) => (
            <FormItem
              label={t.settings.title.introduction}
              error={errors.introduction?.message}
              classNames={{ label: 'text-gray-200' }}
            >
              <TextArea
                {...field}
                maxLength={50}
                rows={3}
                placeholder={t.common.ec.char_limit_50}
                classNames={{ container: 'w-full' }}
              />
            </FormItem>
          )}
        />
      </div>

      <Button
        type='submit'
        data-testid='mobile-profile-submit'
        variant={btnDisabled ? 'outline' : 'fill'}
        size='xl'
        className='w-full'
        disabled={btnDisabled}
        loading={isPending}
      >
        Let&apos;s get in
      </Button>
    </form>
  );
};

export default MobileProfileEditForm;
```

barrel `src/features-mobile/profile/index.ts`:

```ts
export { default as MobileProfileEditForm } from './ui/mobile-profile-edit-form.component';
```

> 구현 주의: `Input`/`TextArea`/`Button`/`FormItem` 의 실제 prop 시그니처를 해당 컴포넌트에서 확인 후 맞출 것(`classNames` 키, `data-testid` 전달 가능 여부). `Button` 이 `data-testid` 를 통과시키지 않으면 wrapper 또는 `data-testid` 지원 prop 사용. 데스크탑 V1 의 동일 props 를 baseline 으로 참조([[feedback_mobile_widget_baseline_reflex]]).

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/features-mobile/profile/ui/mobile-profile-edit-form.component.test.tsx`
Expected: PASS (2 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/features-mobile/profile/
git commit -m "feat(모바일): 프로필 편집 폼 컴포넌트 (MobileProfileEditForm, #393)"
```

### Task 4: 페이지 모바일 분기 + 데드코드 variant 제거

**Files:**

- Modify: `src/app/settings/profile/page.tsx`
- Modify: `src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx`

- [ ] **Step 1: 사전 grep** — `'profile-edit'` 참조처 확인.

Run: `git grep -n "feature='profile-edit'\|profile-edit" src`
Expected: `settings/profile/page.tsx` 만(곧 교체). 그 외 참조 없으면 variant 제거 안전.

- [ ] **Step 2: page.tsx 모바일 분기 교체**

```tsx
import { headers } from 'next/headers';
import { MobileProfileEditForm } from '@/features-mobile/profile';
import { ProfileEditFormV1 } from '@/features/edit-profile-bio';
import { getServerDictionary } from '@/shared/lib/localization/get-server-dictionary';
import { BackButton } from '@/shared/ui/components/back-button';

const ProfileSettingsPage = async () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const t = await getServerDictionary();

  if (isMobile) {
    return (
      <div className='flexCol w-full pt-app-header'>
        <h1 className='px-app text-h2 text-white'>{t.settings.title.who_r_u}</h1>
        <MobileProfileEditForm />
      </div>
    );
  }

  return (
    <div className='absolute-user-form-section flexColCenter py-10 px-[60px]'>
      <BackButton text={t.settings.title.who_r_u} className='absolute self-start top-10' />
      <ProfileEditFormV1 />
    </div>
  );
};

export default ProfileSettingsPage;
```

> 주의: `pt-app-header`/`text-h2` 등 유틸 클래스가 실제 tailwind config 에 존재하는지 확인, 없으면 기존 모바일 페이지(`MobileLobby` 등)에서 쓰는 헤더 오프셋/타이포 클래스로 맞출 것. `MobileOnlyDesktopFeatureCard` import 는 제거.

- [ ] **Step 3: `'profile-edit'` variant 제거** — `mobile-only-desktop-feature-card.component.tsx` 의 `MobileOnlyDesktopFeature` 유니온에서 `| 'profile-edit'` 제거, `featureLabel` 맵에서 `'profile-edit': '프로필 편집',` 라인 제거. `'avatar-edit'`, `'withdraw'` 유지.

- [ ] **Step 4: 타입체크 + 카드 테스트**

Run:

```bash
npx tsc --noEmit
yarn vitest run src/shared/ui/components/mobile-only-desktop-feature-card
```

Expected: tsc 0 error(`profile-edit` 미참조 확인), 카드 테스트 PASS(있으면)

- [ ] **Step 5: 커밋**

```bash
git add src/app/settings/profile/page.tsx src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx
git commit -m "feat(모바일): /settings/profile 모바일 분기를 온보딩 폼으로 교체 + profile-edit 안내 variant 제거 (#393)"
```

---

## Chunk 3: 데드엔드 #2 fix — device-aware 리다이렉트

### Task 5: redirect-guard (5분기)

**Files:**

- Create: `src/app/settings/profile/profile-edit-redirect-guard.tsx`
- Test: `src/app/settings/profile/profile-edit-redirect-guard.test.tsx`

- [ ] **Step 1: 실패 테스트 작성** (5분기)

```tsx
import { render } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { AuthorityTier } from '@/shared/api/http/types/@enums';
import ProfileEditRedirectGuard from './profile-edit-redirect-guard';

const replaceMock = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: replaceMock }) }));

let meValue: any;
vi.mock('@/entities/me', () => ({ useSuspenseFetchMe: () => ({ data: meValue }) }));

const renderGuard = (device: 'mobile' | 'desktop') =>
  render(
    <ProfileEditRedirectGuard device={device}>
      <div>child</div>
    </ProfileEditRedirectGuard>
  );

describe('ProfileEditRedirectGuard', () => {
  beforeEach(() => replaceMock.mockReset());

  test('GT → /', () => {
    meValue = { authorityTier: AuthorityTier.GT, profileUpdated: true };
    renderGuard('mobile');
    expect(replaceMock).toHaveBeenCalledWith('/');
  });

  test('profileUpdated=false → 리다이렉트 없음(폼 노출)', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: false };
    renderGuard('mobile');
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('FM + profileUpdated → /parties', () => {
    meValue = { authorityTier: AuthorityTier.FM, profileUpdated: true };
    renderGuard('desktop');
    expect(replaceMock).toHaveBeenCalledWith('/parties');
  });

  test('AM + desktop + profileUpdated → /settings/avatar', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: true };
    renderGuard('desktop');
    expect(replaceMock).toHaveBeenCalledWith('/settings/avatar');
  });

  test('AM + mobile + profileUpdated → /parties (아바타 강제 단계 생략)', () => {
    meValue = { authorityTier: AuthorityTier.AM, profileUpdated: true };
    renderGuard('mobile');
    expect(replaceMock).toHaveBeenCalledWith('/parties');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `yarn vitest run src/app/settings/profile/profile-edit-redirect-guard.test.tsx`
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import { useSuspenseFetchMe } from '@/entities/me';
import { AuthorityTier } from '@/shared/api/http/types/@enums';

type Props = PropsWithChildren<{ device: 'mobile' | 'desktop' }>;

const ProfileEditRedirectGuard = ({ device, children }: Props) => {
  const { data: me } = useSuspenseFetchMe();
  const router = useRouter();

  useEffect(() => {
    if (me.authorityTier === AuthorityTier.GT) {
      router.replace('/');
      return;
    }

    if (me.profileUpdated) {
      if (me.authorityTier === AuthorityTier.AM) {
        router.replace(device === 'mobile' ? '/parties' : '/settings/avatar');
      }
      if (me.authorityTier === AuthorityTier.FM) {
        router.replace('/parties');
      }
    }
  }, [me, device, router]);

  return <>{children}</>;
};

export default ProfileEditRedirectGuard;
```

- [ ] **Step 4: 통과 확인**

Run: `yarn vitest run src/app/settings/profile/profile-edit-redirect-guard.test.tsx`
Expected: PASS (5 tests)

- [ ] **Step 5: 커밋**

```bash
git add src/app/settings/profile/profile-edit-redirect-guard.tsx src/app/settings/profile/profile-edit-redirect-guard.test.tsx
git commit -m "feat(settings): device-aware 프로필 리다이렉트 guard — 모바일 AM은 /parties (#393)"
```

### Task 6: layout.tsx RSC 전환

**Files:**

- Modify: `src/app/settings/profile/layout.tsx`

- [ ] **Step 1: RSC로 교체**

```tsx
import { headers } from 'next/headers';
import { PropsWithChildren } from 'react';
import ProfileEditRedirectGuard from './profile-edit-redirect-guard';

const ProfileEditLayout = ({ children }: PropsWithChildren) => {
  const device = headers().get('x-pf-device') === 'mobile' ? 'mobile' : 'desktop';

  return <ProfileEditRedirectGuard device={device}>{children}</ProfileEditRedirectGuard>;
};

export default ProfileEditLayout;
```

('use client' 제거, `useSuspenseFetchMe`/`useRouter`/`useEffect`/`AuthorityTier` import 제거 — 모두 guard 로 이전됨.)

- [ ] **Step 2: 타입체크 + 관련 테스트**

Run:

```bash
npx tsc --noEmit
yarn vitest run src/app/settings/profile
```

Expected: tsc 0 error, guard 테스트 PASS

- [ ] **Step 3: 커밋**

```bash
git add src/app/settings/profile/layout.tsx
git commit -m "refactor(settings): 프로필 layout RSC 전환 — x-pf-device 읽어 guard 전달 (#393)"
```

---

## Chunk 4: e2e + 전체 품질 게이트

### Task 7: 모바일 온보딩 e2e (happy-path)

**Files:**

- Create: `e2e/mobile/profile-onboarding.spec.ts`

- [ ] **Step 1: spec 작성** — 기존 `e2e/mobile/*.spec.ts`(host-cta·playlist-management) 의 셋업/픽스처/로그인 헬퍼를 참조해 동일 패턴으로 작성. 시나리오:

  1. profileUpdated=false 인 신규 AM 상태로 진입(기존 e2e 의 신규 가입/시드 헬퍼 재사용; 없으면 가장 가까운 로그인 헬퍼 + 백엔드 시드).
  2. `/settings/profile` 로 강제 이동돼 **모바일 폼(닉네임 input + `mobile-profile-submit`)이 노출**되는지(폴백 카드 "데스크탑에서 사용 가능"이 **아님**) 확인.
  3. 닉네임 입력 → 제출.
  4. **`/parties` 로 착지**(아바타 desktop-only 카드를 거치지 않음) 확인 = 데드엔드 2겹 해소 실증.

  로케일 독립 `data-testid` 셀렉터 사용([[reference_pfplay_web_local_e2e_run]]). 로케일 텍스트 단언 회피.

- [ ] **Step 2: 로컬 풀스택 e2e 실행** ([[reference_pfplay_web_local_e2e_run]], [[reference_pfplay_web_local_dev_http_webpack]])

```bash
# 터미널 A: backend docker :8080 (로컬 compose)
# 터미널 B: npx next dev  (http :3000)
E2E_BASE_URL=http://localhost:3000 E2E_API_BASE=http://localhost:8080 \
  npx playwright test e2e/mobile/profile-onboarding.spec.ts --project=mobile
```

Expected: PASS. cold-start IFrame/boundingBox flake 시 warm 재실행. 기존 mobile spec 들도 함께 그린 확인.

- [ ] **Step 3: 커밋**

```bash
git add e2e/mobile/profile-onboarding.spec.ts
git commit -m "test(e2e): 모바일 신규 AM 프로필 온보딩 → /parties happy-path (#393)"
```

### Task 8: 전체 품질 게이트

- [ ] **Step 1: 전체 단위 테스트**

Run: `yarn vitest run`
Expected: 전체 GREEN (신규 테스트 포함, 회귀 0)

- [ ] **Step 2: 타입체크 + lint**

Run:

```bash
npx tsc --noEmit
yarn lint
```

Expected: tsc 0 error, lint 0 error(기존 baseline warning 외)

- [ ] **Step 3: i18n drift 점검** — 신규 키 추가했다면 ko/en json 직접 동기화 확인([[feedback_pfplay_web_i18n_drift]]). 본 계획은 신규 키 없음(재사용만) 전제.

- [ ] **Step 4: 코드 리뷰** — superpowers:requesting-code-review (fresh-eyes 서브에이전트)로 변경 전체 리뷰, must-fix 반영.

- [ ] **Step 5: push + PR**

```bash
git push -u origin feature/mobile-profile-onboarding-393
gh pr create --title "feat(모바일): 신규 소셜 가입자 강제 프로필 온보딩 (#393)" --body "..."  # closes #393, 데드엔드 2겹 해소 요약 + 로컬 e2e 결과
```

dev 머지 = 사용자 게이트.

---

## 회귀/위험 체크리스트

- [ ] 데스크탑 V1 마크업 `git diff` 무변경(로직 라인만)
- [ ] `'profile-edit'` variant 제거 후 tsc 통과(미참조 확인됨)
- [ ] layout RSC 전환 후 `/settings/profile` 데스크탑/모바일 양쪽 정상(폼 노출 + 제출 후 올바른 리다이렉트)
- [ ] 모바일 폼 공통 컴포넌트 props 시그니처 실제와 일치(`classNames` 키, `data-testid` 통과)
- [ ] 로컬 e2e 신규 1 + 기존 mobile spec 그린
