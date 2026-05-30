# 모바일 lobby 카드 데스크탑 catch-up (chunk 5) Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MobilePartyroomCard` 를 데스크탑 `PartyroomCard` 와 동일한 BackdropBlur 단일 카드 패턴으로 rewrite. shared 컴포넌트 (`BackdropBlurContainer`, `Typography`, `Crews`) 차용 + `MainStageLabel` sub-컴포넌트로 i18n 의존 격리.

**Architecture:** 단일 파일 rewrite 가 핵심. spec §4.2 의 코드 명세를 ground truth 로 사용. TDD 는 컴포넌트 단위 (case 6개 일괄 red → rewrite → all green). list 컴포넌트는 isMain prop 전달 한 줄 변경.

**Tech Stack:** Next.js 14 (App Router), TypeScript ^5.5, vitest ^4.0, @testing-library/react, tailwindcss 3.

**Spec:** `docs/superpowers/specs/2026-05-30-mobile-lobby-card-catchup-design.md`
**Issue:** pfplay-web#377
**Branch:** `feature/mobile-responsive-chunk5` (origin/development 동기화 후 분기, spec 4 commits ahead)

---

## Chunk 1: 단위 test 6 케이스 갱신 + 카드 rewrite (TDD)

### Phase 0: Pre-flight

**Files:** 없음 (확인만)

- [ ] **Step 0.1: 브랜치 / 상태 확인**

Run:

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
git status
git log --oneline -5
git branch --show-current
```

Expected:

- branch = `feature/mobile-responsive-chunk5`
- HEAD log 에 `docs(mobile/chunk-5)` commit 4건 (101a3ca / 96d8ca2 / 7cdcedf / 12ef856)
- working tree clean

- [ ] **Step 0.2: PFPersonFilled import 가능성 사전 확인 (dry-run)**

Spec §4.8 Mock 정리 마지막 bullet 의 advisory — Crews 컴포넌트가 `PFPersonFilled` 를 import 한다. vitest 가 svg 컴포넌트를 그대로 처리할 수 있는지 확인.

Run:

```bash
yarn vitest run src/features/partyroom/list/ui/crews.component 2>&1 | head -30
```

Expected: "No test files found" (Crews 는 test 가 없음). 단 import 자체가 에러 없이 해결되는지 확인 → 에러 메시지 있으면 PFPersonFilled mock 추가 필요. 보통 SvgComponent 는 transformer 로 처리되므로 mock 불필요할 가능성 높음.

Confirm:

```bash
ls src/shared/ui/icons/ | head -20
```

Expected: PFPersonFilled 가 svg/tsx 파일로 존재 (e.g. `PFPersonFilled.tsx` 또는 index re-export).

판정:

- import 에러 없으면 → Phase 1 의 mock 정의에서 PFPersonFilled mock 생략
- import 에러 있으면 → Phase 1 Step 1.1 의 mock 정의에 `vi.mock('@/shared/ui/icons', ...)` 추가

---

### Phase 1: 단위 test 6 케이스 갱신 (red)

**Files:**

- Modify: `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx`

- [ ] **Step 1.1: test 파일 6 케이스 갱신**

기존 3 케이스 (case 1·2·3) 중 case 3 (placeholder 동작) 만 단언 변경. case 4·5·6 추가. i18n mock 은 vi.mock 으로 파일 상단 전역 적용 (케이스 1·2·3·4 는 MainStageLabel 미마운트라 영향 없음, 케이스 5·6 만 mock 키 참조).

Replace `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx` 전체:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { StageType } from '@/shared/api/http/types/@enums';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import MobilePartyroomCard from './partyroom-card.component';

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} alt={props.alt ?? ''} />,
}));
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, onClick }: any) => (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  ),
}));

// MainStageLabel 분기 (isMain=true 케이스) 전용 mock.
// 케이스 1·2·3·4 는 MainStageLabel 미마운트라 useI18n 호출 X — mock 영향 받지 않음을 단언으로 검증.
vi.mock('@/shared/lib/localization/i18n.context', () => ({
  useI18n: () => ({
    lobby: {
      para: {
        pfplay_main_stage: 'PFPlay Main Stage',
      },
    },
  }),
}));

const baseSummary: PartyroomSummary = {
  partyroomId: 1,
  stageType: StageType.GENERAL,
  title: '토요일밤 파티',
  introduction: '같이 들어요',
  crewCount: 12,
  playbackActivated: true,
  playback: { name: 'Song Title', thumbnailImage: '/thumb.png', duration: '3:30' },
  primaryIcons: [{ avatarIconUri: '/avatar.png' }],
};

describe('MobilePartyroomCard', () => {
  test('제목·인원·now-playing 을 표시한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByText('토요일밤 파티')).toBeTruthy();
    expect(screen.getByText(/12/)).toBeTruthy();
    expect(screen.getByText('Song Title')).toBeTruthy();
  });

  test('카드 전체가 /parties/{id}?source=list 로 이동한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/parties/1?source=list');
  });

  test('playbackActivated=false 일 때 now-playing 영역이 렌더되지 않는다', () => {
    render(
      <MobilePartyroomCard
        roomId={baseSummary.partyroomId}
        summary={{ ...baseSummary, playbackActivated: false, playback: undefined }}
      />
    );
    // v1 placeholder "재생 중인 곡이 없어요" 는 삭제됨 (BackdropBlur fallback 이미지로 대체)
    expect(screen.queryByText(/재생 중인 곡이 없어요/)).toBeNull();
    // now-playing 곡 썸네일 영역 부재
    expect(screen.queryByAltText('playback thumbnail')).toBeNull();
  });

  test('primaryIcons 개수만큼 아바타가 렌더된다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    // Crews 컴포넌트가 primaryIcons.slice(0, 3) 으로 alt='party crew' 의 <Image /> 렌더
    expect(screen.getAllByAltText('party crew').length).toBe(1);
  });

  test('isMain=true 일 때 "PFPlay Main Stage" 라벨이 표시된다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} isMain />);
    expect(screen.getByText('PFPlay Main Stage')).toBeTruthy();
  });

  test('isMain 이 falsy 일 때 "PFPlay Main Stage" 라벨이 표시되지 않는다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.queryByText('PFPlay Main Stage')).toBeNull();
  });
});
```

- [ ] **Step 1.2: test 실행하여 red 확인**

Run:

```bash
yarn vitest run src/features-mobile/partyroom/list/partyroom-card.component.test.tsx 2>&1 | tail -40
```

Expected:

- 6 case 중 다음이 fail:
  - **case 3** (placeholder 단언 변경): v1 코드의 "재생 중인 곡이 없어요" placeholder 가 아직 존재 → `screen.queryByText(/재생 중인 곡이 없어요/)` 가 truthy → fail
  - **case 4** (아바타): v1 코드는 emoji 만 → `getAllByAltText('party crew')` 0건 → fail
  - **case 5** (Main 라벨 표시): v1 코드는 `isMain` prop 자체가 없음 → 라벨 미렌더 → fail
- case 1·2·6 은 통과 가능 (case 6 은 라벨 미표시가 v1 의 default 동작).

이 fail pattern 이 다음 step 의 정답 시그널.

- [ ] **Step 1.3: commit (red baseline)**

```bash
git add src/features-mobile/partyroom/list/partyroom-card.component.test.tsx
git -c user.email="livinglikekrillin@gmail.com" -c user.name="정주영" commit -m "test(mobile/chunk-5): 카드 단위 test 6 케이스 갱신 (red, #377)

- case 3: 'playback=false' placeholder 단언 → 미렌더 단언으로 변경
- case 4 신규: primaryIcons 개수만큼 아바타 렌더
- case 5 신규: isMain=true 일 때 'PFPlay Main Stage' 라벨 표시
- case 6 신규: isMain falsy 일 때 라벨 미표시
- i18n mock 추가 (case 5·6 의 MainStageLabel 분기용)

case 3·4·5 가 v1 코드에서 fail (예상된 red baseline).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Phase 2: 카드 컴포넌트 rewrite (green)

**Files:**

- Replace: `src/features-mobile/partyroom/list/partyroom-card.component.tsx`

- [ ] **Step 2.1: 카드 컴포넌트를 spec §4.2 명세로 rewrite**

Replace `src/features-mobile/partyroom/list/partyroom-card.component.tsx` 전체:

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import Crews from '@/features/partyroom/list/ui/crews.component';
import { getPartyroomCardBackdropProps } from '@/features/partyroom/list/ui/partyroom-card-backdrop';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { useI18n } from '@/shared/lib/localization/i18n.context';
import { BackdropBlurContainer } from '@/shared/ui/components/backdrop-blur-container';
import { Typography } from '@/shared/ui/components/typography';

interface Props {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
  /** Main 카드일 때 true → "PFPlay Main Stage" 라벨 표시 */
  isMain?: boolean;
}

/**
 * Main 라벨 sub-컴포넌트.
 *
 * isMain=true 분기에서만 마운트 → `useI18n` 호출이 라벨 케이스에 한정.
 * 일반 카드 (isMain=false) 는 이 컴포넌트를 마운트하지 않으므로 i18n provider 의존 X.
 * (기존 v1 카드 단위 test 들이 i18n mock 없이 통과하는 invariant 보존.)
 */
const MainStageLabel: FC = () => {
  const t = useI18n();
  return (
    <Typography type='caption2' className='text-gray-300 uppercase tracking-wide'>
      {t.lobby.para.pfplay_main_stage}
    </Typography>
  );
};

/**
 * 모바일 로비 1컬럼 카드 (chunk 5 = 데스크탑 baseline catch-up).
 *
 * - 데스크탑 PartyroomCard 와 동일한 BackdropBlur 단일 카드 패턴, 모바일 폼팩터로 축소.
 * - shared 컴포넌트 (BackdropBlurContainer, Typography, Crews) 차용.
 * - PFInfoOutline 은 모바일에서 의도적으로 제외 (정보 기능 없는 정적 아이콘).
 * - isMain=true 일 때 title2 위 caption2 chip 으로 "PFPlay Main Stage" 라벨 (MainStageLabel sub-컴포넌트로 분리).
 */
const MobilePartyroomCard: FC<Props> = ({ roomId, summary, onClose, isMain }) => {
  return (
    <BackdropBlurContainer
      src={summary.playback?.thumbnailImage}
      {...getPartyroomCardBackdropProps(summary.playback?.thumbnailImage)}
    >
      <Link
        href={`/parties/${roomId}?source=list`}
        onClick={onClose}
        className='h-full flexCol justify-between gap-10 py-5 px-5 backdrop-blur-sm bg-backdrop-black/80'
      >
        <div className='flexCol gap-1.5'>
          {isMain && <MainStageLabel />}
          <Typography type='title2' className='text-gray-50'>
            {summary.title}
          </Typography>
        </div>

        <div className='gap-3 flexCol max-w-full'>
          {summary.playback && (
            <div className='flex-1 max-w-full min-w-0 flexRowCenter gap-3 rounded'>
              <div className='w-[64px] h-[36px] bg-gray-700 shrink-0'>
                <Image
                  priority
                  src={summary.playback.thumbnailImage}
                  alt='playback thumbnail'
                  width={64}
                  height={36}
                  className='w-full h-full object-contain select-none'
                />
              </div>
              <Typography
                type='caption1'
                overflow='ellipsis'
                className='flex-1 text-gray-50 select-none'
              >
                {summary.playback.name}
              </Typography>
            </div>
          )}
          <div className='bg-gray-600 h-[1px]' />
          <Crews
            count={summary.crewCount}
            icons={summary.primaryIcons.map((a) => a.avatarIconUri)}
          />
        </div>
      </Link>
    </BackdropBlurContainer>
  );
};

export default MobilePartyroomCard;
```

- [ ] **Step 2.2: 카드 단위 test 6 케이스 GREEN 확인**

Run:

```bash
yarn vitest run src/features-mobile/partyroom/list/partyroom-card.component.test.tsx 2>&1 | tail -20
```

Expected: `Tests  6 passed (6)` / `Test Files  1 passed (1)`.

만약 case 1 의 `screen.getByText(/12/)` 가 fail 한다면 Crews 컴포넌트의 count 렌더 형식 확인 — Crews 는 Typography body3 로 숫자만 표시 (suffix 없음). v1 의 "👥 12명" → 변경된 "12" → `getByText(/12/)` 로 정규식이라 통과해야 함.

만약 case 4 의 `getAllByAltText('party crew')` 가 fail 한다면:

- Crews 컴포넌트 line 26 `alt={'party crew'}` 확인
- mock `next/image` 가 `alt` prop 을 제대로 forward 하는지 확인 (현 mock 정의 `alt={props.alt ?? ''}` 적용됨)

PFPersonFilled 미해결 import 에러 발생 시 Phase 0 Step 0.2 의 판정대로 mock 추가:

```tsx
vi.mock('@/shared/ui/icons', async () => {
  const actual = await vi.importActual<typeof import('@/shared/ui/icons')>('@/shared/ui/icons');
  return {
    ...actual,
    PFPersonFilled: (props: any) => <svg data-testid='pf-person-filled' {...props} />,
  };
});
```

- [ ] **Step 2.3: typecheck clean**

Run:

```bash
yarn typecheck 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 2.4: lint clean (해당 파일)**

Run:

```bash
yarn lint --max-warnings 0 src/features-mobile/partyroom/list/partyroom-card.component.tsx 2>&1 | tail -10
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 2.5: commit (green)**

```bash
git add src/features-mobile/partyroom/list/partyroom-card.component.tsx
git -c user.email="livinglikekrillin@gmail.com" -c user.name="정주영" commit -m "feat(mobile/chunk-5): 카드 rewrite (BackdropBlur 단일, Crews, Typography, MainStageLabel) (#377)

데스크탑 PartyroomCard 와 동일한 BackdropBlur 단일 카드 패턴으로
rewrite. 모바일 폼팩터로 spacing 축소 (px-5/py-5/gap-10).

- BackdropBlurContainer + 80% 불투명 오버레이 (데스크탑 검증된 가독성)
- Crews 아바타 (PFPersonFilled + count + 아바타 최대 3개)
- Typography 토큰 (title2 / caption1 / caption2)
- MainStageLabel sub-컴포넌트 분리 — useI18n 호출이 라벨 케이스에 한정
- PFInfoOutline 제외 (정보 기능 없는 정적 아이콘, 깔때기 lens redundant)
- 사용자 가시 동작 변화: 'playback=false' placeholder 텍스트 제거
  → BackdropBlur fallback 이미지로 대체

6 unit tests GREEN.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Phase 3: list 컴포넌트 isMain prop 전달

**Files:**

- Modify: `src/features-mobile/partyroom/list/partyroom-list.component.tsx`

- [ ] **Step 3.1: list 컴포넌트의 Main 카드 prepend 부분 수정**

기존 list (spread + map) 를 **명시적 분리 prepend** 로 변경. Main 카드에 `isMain` prop 전달.

Replace return 블록 (line 24~42):

```tsx
const MobilePartyroomList: FC = () => {
  const { data: mainRoom } = useSuspenseFetchMainPartyroom();
  const { data: generalRooms } = useFetchGeneralPartyrooms();

  if (!mainRoom && (!generalRooms || generalRooms.length === 0)) {
    return (
      <div className='w-full py-12 text-center text-sm text-gray-500'>
        지금 열려 있는 파티가 없어요.
      </div>
    );
  }

  return (
    <ul className='flexCol gap-4 w-full'>
      {mainRoom && (
        <li key={mainRoom.partyroomId}>
          <MobilePartyroomCard roomId={mainRoom.partyroomId} summary={mainRoom} isMain />
        </li>
      )}
      {generalRooms?.map((summary) => (
        <li key={summary.partyroomId}>
          <MobilePartyroomCard roomId={summary.partyroomId} summary={summary} />
        </li>
      ))}
    </ul>
  );
};
```

**주의**: 기존 빈 상태 ("지금 열려 있는 파티가 없어요") 표시 조건이 `rooms.length === 0` 이었는데, 분리 후 `!mainRoom && (!generalRooms || generalRooms.length === 0)` 으로 정정 — 의미 동일.

상단 import / 컴포넌트 주석 (line 1~19) 은 유지. 단 line 12 주석의 "맨 앞 prepend" 표현 그대로 valid.

- [ ] **Step 3.2: typecheck clean**

Run:

```bash
yarn typecheck 2>&1 | tail -10
```

Expected: 0 errors.

- [ ] **Step 3.3: 회귀 unit test (전체) clean**

Run:

```bash
yarn vitest run src/features-mobile 2>&1 | tail -10
```

Expected: 전체 features-mobile 단위 test 모두 GREEN.

- [ ] **Step 3.4: commit**

```bash
git add src/features-mobile/partyroom/list/partyroom-list.component.tsx
git -c user.email="livinglikekrillin@gmail.com" -c user.name="정주영" commit -m "feat(mobile/chunk-5): list 의 Main 카드에 isMain prop 전달 (#377)

mainRoom prepend 와 generalRooms map 을 명시적으로 분리. isMain 판정
로직이 컴포넌트 위치(idx)가 아닌 데이터 소스에 직접 매핑됨 — generalRooms
정렬 변경에 fragile 한 idx 기반 대안 회피.

빈 상태 표시 조건 의미 동일하게 정정 (rooms.length === 0
  → !mainRoom && (!generalRooms || generalRooms.length === 0)).

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

---

### Phase 4: e2e 영향 점검

**Files:** 없음 (조사만, 발견 시 follow-up commit)

- [ ] **Step 4.1: e2e 영향 grep**

Run:

```bash
rg "재생 중인 곡이 없어요|MobilePartyroomCard|partyroom-card\.component" e2e/ 2>&1
```

Expected: 모바일 lobby 카드 텍스트 단언이나 컴포넌트 직접 참조 0건이 이상적. 발견 시 항목 정리:

| 파일:line      | 단언 | 영향 |
| -------------- | ---- | ---- |
| (발견 시 채움) |      |      |

- [ ] **Step 4.2: 발견된 영향 수정 (있을 때만)**

영향 spec 에서 placeholder 텍스트 단언이 있으면:

- 단언 제거 또는 새 동작 (now-playing 영역 부재) 단언으로 교체
- BackdropBlur 카드 구조 단언 (예: 카드 배경에 `bg-backdrop-black/80` 클래스 존재) 추가 검토

수정 후:

```bash
git add e2e/<영향파일>
git -c user.email="livinglikekrillin@gmail.com" -c user.name="정주영" commit -m "test(e2e/mobile): chunk 5 카드 rewrite 영향 단언 갱신 (#377)

<구체적 변경 설명>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>"
```

발견 없으면 skip + 별도 commit 불필요.

---

### Phase 5: 로컬 실측 (user surface)

**Files:** 없음

> **User memory `reference_pfplay_web_local_dev_http_webpack`**: 로컬 검증은 `npx next dev` (http+webpack). `yarn dev` (--experimental-https --turbo) 는 금지 — https/webpack mixed-content 또는 Turbopack /parties/[id] SSR 워커 크래시.

- [ ] **Step 5.1: 로컬 dev 서버 띄우기 (user 가 직접 실행)**

본 step 은 agent 가 background 로 띄울 수 있으나 사용자가 브라우저에서 실측해야 valid. User 에게 surface:

```
로컬 dev 검증 부탁드립니다:

  cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
  npx next dev

브라우저 http://localhost:3000/parties (또는 lobby 경로) 진입:

[모바일 viewport 검증]
- DevTools 모바일 뷰 (예: iPhone 13)
- lobby 카드가 BackdropBlur 배경 + 80% 어두운 오버레이로 렌더되는가
- 카드 우하단에 PFInfoOutline 아이콘이 없는가 (제외 확인)
- Crews 영역에 아바타 (최대 3개) + count 가 표시되는가
- Main 카드 (맨 위) 에 "PFPlay Main Stage" 라벨 (작은 chip) 이 보이는가
- 일반 카드에는 라벨이 없는가
- playbackActivated=false 인 룸이 있다면 "재생 중인 곡이 없어요" 텍스트가 없는가

[데스크탑 viewport 검증]
- 데스크탑 뷰포트에서 lobby 카드 (MainPartyroomCard + PartyroomCard) 디자인이 변경 없이 유지되는가
```

User 가 결과 confirm 한 후 다음 step.

- [ ] **Step 5.2: 발견 회귀 / 시각 이슈 대응 (있을 때만)**

발견 시 spec / plan 으로 회귀해서 수정 + 추가 commit.

---

### Phase 6: PR 준비

**Files:** PR description (GitHub)

- [ ] **Step 6.1: 브랜치 push**

Run:

```bash
git push -u origin feature/mobile-responsive-chunk5
```

Expected: 새 브랜치 origin push 성공.

- [ ] **Step 6.2: PR 생성 (한국어, closes #377)**

User memory `feedback_korean_issue_commit_pr`: PR body 한국어. memory `feedback_commit_consolidation_before_push`: push 직전 commit 정돈 (단 micro commit 보존 합의 가능).

본 plan 의 commit 수 ≤ 5 (test red / 카드 rewrite / list / [선택] e2e / [선택] docs). squash 없이 누적 머지 가능 (memory `feedback_main_squash_merge` — 소량이면 squash 도 OK).

Run:

```bash
gh pr create --title "[모바일 반응형 chunk 5] lobby 카드 데스크탑 catch-up" --body "$(cat <<'EOF'
closes #377

## 요약

`MobilePartyroomCard` 를 데스크탑 `PartyroomCard` 와 동일한 **BackdropBlur 단일 카드 패턴** 으로 rewrite. shared 컴포넌트 (`BackdropBlurContainer`, `Typography`, `Crews`) 차용 + `MainStageLabel` sub-컴포넌트로 i18n 의존 격리.

## 변경

- `src/features-mobile/partyroom/list/partyroom-card.component.tsx` rewrite (BackdropBlur 단일 패턴, Typography 토큰, Crews 차용, MainStageLabel sub-컴포넌트)
- `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx` 케이스 6개 (기존 3 유지/수정 + 신규 3)
- `src/features-mobile/partyroom/list/partyroom-list.component.tsx` Main 카드에 `isMain` prop 전달

영향 파일 = **3개**. 데스크탑 카드 무영향.

## 사용자 가시 동작 변화 (1건)

- `playbackActivated=false` 일 때 "재생 중인 곡이 없어요" placeholder 텍스트 제거 → BackdropBlur fallback 이미지 `/images/Background/Partyroom.png` 로 대체 (데스크탑 카드와 동일 동작)

## 결정 잠금 (spec)

| # | 결정 | 답 |
| --- | --- | --- |
| Q1 | 1차 목적 | 전환 깔때기 강화 (#340 정합) |
| Q2 | 카드 구조 | A. BackdropBlur 단일 |
| Q3 | Main 카드 | a. 일반 카드 + Main 라벨 |
| Q4 | PFInfoOutline | 제외 |
| Q5 | 스코프 | `MobilePartyroomCard` 1개 파일 |
| Q6 | 구현 | A2. shared 컴포넌트 차용 rewrite |

## 검증

- [x] 단위 test 6 케이스 GREEN
- [x] typecheck 0 오류
- [x] lint clean
- [x] 로컬 `npx next dev` 모바일/데스크탑 viewport 실측
- [x] e2e 영향 점검 (모바일 lobby 카드 텍스트 단언 검색)

## 설계 문서

`docs/superpowers/specs/2026-05-30-mobile-lobby-card-catchup-design.md`

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)" --base development
```
