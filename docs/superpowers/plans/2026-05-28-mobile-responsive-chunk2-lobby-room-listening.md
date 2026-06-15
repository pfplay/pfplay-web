# 모바일 반응형 — Chunk 2 (로비 + 룸 청취) 구현 Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 모바일 반응형 5-chunk PR 시리즈의 **Chunk 2 (로비 + 룸 청취)** — 모바일 진입자에게 chunk 1 의 임시 fallback 카드 대신 실제 모바일 화면(로비 1컬럼 카드 리스트 · 룸 sticky 전광판 + YouTube 오디오 + 리액션 inline + 크루 리스트)을 제공. 채팅·DJ 큐 탭 wiring 은 chunk 3·4 후속. 데스크탑 동작은 그대로.

**Architecture:**

- 모바일 트리 `widgets-mobile/` 신규: `partyroom-page-mobile/{lobby, room}` shell + `partyroom-display-board` + `partyroom-crews-panel` 사본 (스펙 §1.7).
- 모바일 features 트리 `features-mobile/partyroom/list` (로비 1컬럼 카드).
- `shared/ui/components/mobile-only-desktop-feature-card` (스펙 §2.4).
- `(lobby)/page.tsx`·`(room)/[id]/page.tsx` 의 모바일 분기를 `MobileFallbackCard` → 신규 mobile shell 로 교체.
- 데스크탑 전용 라우트(`/settings/avatar` 등)에 가드 적용.
- **모바일 display-board 가 YoutubePlayer 를 mount** (= 오디오 재생, 청취 핵심).
- **`ActionButtons` 는 mobile 사본 fork** (widgets-mobile → widgets/_ parts/_ 경계 위반 회피, C3 격리 유지).

**Tech Stack:** Next.js 14 App Router (RSC + Client), TypeScript, Vitest + RTL, Tailwind v3 (mobile-first, tablet=768px)

**선행 문서:**

- 아키텍처 스펙: `docs/superpowers/specs/2026-05-28-mobile-responsive-architecture-design.md` (§1.4·§1.6·§1.7·§2.4·§3.3 Chunk 2·§4.2~4.5)
- 스코프 스펙: `docs/superpowers/specs/2026-05-22-mobile-responsive-scope-design.md`
- 선행 PR: #354 (chunk 1 Foundation `dcf0c89`) + #355 (chunk 1.1 polish `12cf87f`)
- GH 이슈: pfplay-web#340

**관련 메모리:** [[feedback_pr_series_workflow]] · [[feedback_commit_consolidation_before_push]] · [[feedback_korean_issue_commit_pr]] · [[feedback_elegant_no_code_dirtying]] · [[wait-all-ci-incl-e2e-before-merge]] · [[reference_pfplay_web_local_dev_http_webpack]] · [[project_mobile_responsive_chunk1_ready]]

---

## Baseline (정찰 완료, 본 plan 의 code block 에 반영됨)

본 plan 의 모든 code block 은 아래 baseline 을 확인한 후 작성되었습니다 (Phase 0 의 정찰 결과).

### 데이터 모델

**`PartyroomSummary`** (`src/shared/api/http/types/partyrooms.ts:42`):

```ts
type PartyroomSummary = {
  partyroomId: number;
  stageType: StageType;
  title: string;
  introduction: string;
  crewCount: number;
  playbackActivated: boolean;
  playback?: { name: string; thumbnailImage: string; duration: string };
  primaryIcons: { avatarIconUri: string }[];
};
```

→ **`linkDomain` · `djNickname` · `nowPlayingTitle` · `thumbnailUri` 모두 없음.** Link route 는 `/parties/${partyroomId}?source=list` (데스크탑 카드와 동일 패턴).

**`PartyroomCrew` + `Crew.Model`** (`src/shared/api/http/types/partyrooms.ts:69`, `src/entities/current-partyroom/model/crew.model.ts:4`):

```ts
type PartyroomCrew = {
  crewId: number;
  nickname: string;
  gradeType: GradeType;
  avatarBodyUri: string;
  avatarFaceUri: string;
  avatarIconUri: string;        // ← icon 필드명은 avatarIconUri
  // ...avatarCompositionType, combinePositionX/Y, offsetX/Y, scale
};
type Crew.Model = PartyroomCrew & { motionType: MotionType; reactionType?: ReactionType };
```

→ **`isDj` 필드 없음.** DJ 식별은 `state.currentDj?.crewId === crew.crewId` 로 cross-ref.

**`PartyroomPlayback`** (`src/shared/api/http/types/partyrooms.ts:84` 부근):

```ts
type PartyroomPlayback = {
  id: number;
  name: string;
  linkId: string;
  thumbnailImage: string;
  duration: string;
  endTime: number /* UTC UNIX timestamp */;
  // ... 기타
};
```

→ 모바일 display-board 가 표시할 것 = `name`(제목), `thumbnailImage`. **`title`·`artist` 없음.** 오디오 재생은 `linkId` 로 YoutubePlayer mount.

**`current-partyroom.store`** (`src/entities/current-partyroom/model/current-partyroom.store.ts`):

- `state.id`, `state.playbackActivated: boolean`, `state.playback?: PartyroomPlayback`
- `state.currentDj?: Pick<Crew.Model, 'crewId'>` ← crewId 만, 닉네임은 crews lookup
- `state.crews: Crew.Model[]`
- ⚠️ **`state.title` 필드 없음** (store 에 룸 이름 없음). 룸 이름은 별도 fetch: `useFetchPartyroomDetailSummary(partyroomId, true)?.title` (from `@/features/partyroom/get-summary`). 데스크탑 룸도 동일 패턴.

**`PartyroomDetailSummary`** (`useFetchPartyroomDetailSummary` 반환):

- `title: string` (룸 이름)
- 기타 introduction · linkDomain · primaryHostNickname 등 (사본 시 확인)

### Hooks · 사용

- `useFetchGeneralPartyrooms()` → `useQuery<PartyroomSummary[]>`, return `{ data: PartyroomSummary[] | undefined, ... }` (infinite query 아님). 사용: `const { data } = useFetchGeneralPartyrooms(); const rooms = data ?? [];`
- `useCurrentPartyroomCrews()` (= `useCrews`) → `Crew.Model[]`. import: `import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews'`.
- `useStores().useCurrentPartyroom` selector → playback/currentDj/crews state.

### 데스크탑 baseline 패턴 (참조용)

- `src/features/partyroom/list/ui/partyroom-card.component.tsx`: link href = `/parties/${roomId}?source=list`. summary 그대로 prop.
- `src/widgets/partyroom-display-board/ui/parts/video.component.tsx`: YoutubePlayer mount + linkId 로 재생, DJ nickname = `crews.find(c => c.crewId === currentDj?.crewId)?.nickname`.
- `src/widgets/partyroom-crews-panel/ui/parts/all-crews-panel.component.tsx`: 데스크탑 패널의 crew row + DJ 표식 패턴.

### 라우트 존재 확인

- ✅ `/settings/avatar/page.tsx` 존재 — **'use client'** (RSC 변환 필요)
- ✅ `/settings/profile/page.tsx` 존재 — **RSC** (가드 trivial)
- ❌ `/parties/create` 없음 — skip
- ❌ `/withdraw` 없음 — skip

---

## File Structure

### 생성

| 경로                                                                                                       | 책임                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/widgets-mobile/partyroom-page-mobile/lobby.component.tsx`                                             | 모바일 로비 page-level shell                                                                                                   |
| `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`                                              | 모바일 룸 page-level shell (헤더 + 전광판 + 크루 임시 노출)                                                                    |
| `src/widgets-mobile/partyroom-page-mobile/index.ts`                                                        | barrel                                                                                                                         |
| `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`                         | 모바일 전광판 — 헤더(룸이름·뒤로·⋮) + sticky now-playing + YoutubePlayer + 리액션 inline                                       |
| `src/widgets-mobile/partyroom-display-board/ui/parts/action-buttons.component.tsx`                         | 데스크탑 ActionButtons 의 모바일 사본 (C3 격리 — Issue: 데스크탑 → widgets/\* parts/ 경계 위반 회피)                           |
| `src/widgets-mobile/partyroom-display-board/index.ts`                                                      | barrel                                                                                                                         |
| `src/widgets-mobile/partyroom-crews-panel/partyroom-crews-panel.component.tsx`                             | 모바일 크루 패널                                                                                                               |
| `src/widgets-mobile/partyroom-crews-panel/index.ts`                                                        | barrel                                                                                                                         |
| `src/features-mobile/partyroom/list/partyroom-card.component.tsx`                                          | 모바일 1컬럼 카드 (PartyroomSummary 직접 받음)                                                                                 |
| `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx`                                     | 단위 테스트                                                                                                                    |
| `src/features-mobile/partyroom/list/partyroom-list.component.tsx`                                          | 모바일 리스트 (useFetchGeneralPartyrooms 재사용)                                                                               |
| `src/features-mobile/partyroom/list/index.ts`                                                              | barrel                                                                                                                         |
| `src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx` | 가드 카드                                                                                                                      |
| `src/shared/ui/components/mobile-only-desktop-feature-card/index.ts`                                       | barrel                                                                                                                         |
| `src/widgets/avatar-settings-page-desktop/avatar-settings-page-desktop.component.tsx`                      | 기존 `/settings/avatar` page.tsx 의 'use client' 본문을 흡수한 desktop shell (RSC 변환 패턴, chunk 1 (lobby)/page.tsx 와 동일) |
| `src/widgets/avatar-settings-page-desktop/index.ts`                                                        | barrel                                                                                                                         |

### 수정

| 경로                                   | 변경                                                                                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/app/parties/(lobby)/page.tsx`     | mobile 분기 → `<MobileLobby />`                                                                                                                                 |
| `src/app/parties/(room)/[id]/page.tsx` | mobile 분기 → `<MobileRoom partyroomId={...} />`                                                                                                                |
| `src/app/settings/avatar/page.tsx`     | `'use client'` 제거 → RSC, `headers().get('x-pf-device') === 'mobile'` 분기로 `<MobileOnlyDesktopFeatureCard />` 또는 신규 `<AvatarSettingsPageDesktop />` 렌더 |
| `src/app/settings/profile/page.tsx`    | RSC 그대로 + 가드. 단 `ProtectedLayout` 의 `profileUpdated` redirect 가 먼저라 첫 가입 첫 진입은 가드 영향 0                                                    |

### 보존 (chunk 5 제거)

| 경로                                | 사유                                                |
| ----------------------------------- | --------------------------------------------------- |
| `src/widgets/mobile-fallback-card/` | chunk 2~4 wiring 완료 후 chunk 5 catch-up 에서 제거 |

---

## Phase 0: 추가 정찰 (`Baseline` 섹션 정확성 재검증)

본 plan 의 Baseline 은 이미 정찰 완료. 단 plan 실행 시점에 baseline 이 변경됐을 가능성을 차단하기 위한 single-task verification.

### Task 0.1: Baseline 재검증

**Files:** 없음 (read-only 명령)

- [ ] **Step 1: 파일 정합성 grep**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
# PartyroomSummary 필드 정합
grep -A12 "export type PartyroomSummary" src/shared/api/http/types/partyrooms.ts | head -15
# useFetchGeneralPartyrooms 반환
cat src/features/partyroom/list/api/use-fetch-general-partyrooms.query.ts
# useCurrentPartyroomCrews barrel
cat src/features/partyroom/list-crews/index.ts
# Crew.Model
sed -n '1,15p' src/entities/current-partyroom/model/crew.model.ts
# current-partyroom store state slices
grep -E "playback:|currentDj:|playbackActivated:|crews:" src/entities/current-partyroom/model/current-partyroom.store.ts | head -10
# avatar page.tsx 의 RSC/Client 구분
head -1 src/app/settings/avatar/page.tsx
head -1 src/app/settings/profile/page.tsx
```

Expected: 본 plan 의 Baseline 섹션과 일치. 불일치 발견 시 → 본 plan 의 해당 code block 수정 후 진행.

- [ ] **Step 2: YoutubePlayer 사용 패턴 확인**

```bash
# 데스크탑 video.component.tsx 가 YoutubePlayer 를 어떻게 mount 하는지 확인
grep -n "YoutubePlayer\|YouTube\|react-youtube" src/widgets/partyroom-display-board/ui/parts/video.component.tsx | head -10
# import 경로
grep -n "from.*youtube\|youtube-player" src/widgets/partyroom-display-board/ui/parts/video.component.tsx | head -5
```

Expected: `<YoutubePlayer videoId={playback.linkId} ... />` 같은 패턴 확인. **본 정찰 결과를 Phase 3 Task 3.2 의 code block 에 반영**.

- [ ] **Step 3: 정찰 결과 노트**

plan 본문에 직접 수정이 필요한 항목 발견 시 commit 메시지에 기록 (예: "Phase 3 Task 3.2 의 YoutubePlayer import 경로 정정").

- [ ] **Step 4: 사전 정찰 commit (단 변경 사항 있을 때만)**

```bash
# 변경 사항 있으면:
git add docs/superpowers/plans/2026-05-28-mobile-responsive-chunk2-lobby-room-listening.md
git commit -m "docs(plan/chunk2): Phase 0 정찰 결과 반영"
# 변경 사항 없으면 skip
```

---

## Phase 1: features-mobile/partyroom/list (로비 카드)

### Task 1.1: 모바일 카드 컴포넌트

**Files:**

- Create: `src/features-mobile/partyroom/list/partyroom-card.component.tsx`
- Create: `src/features-mobile/partyroom/list/partyroom-card.component.test.tsx`

- [ ] **Step 1: failing 테스트**

```tsx
// src/features-mobile/partyroom/list/partyroom-card.component.test.tsx
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
  test('룸 제목·인원·now-playing 을 표시한다', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByText('토요일밤 파티')).toBeTruthy();
    expect(screen.getByText(/12/)).toBeTruthy();
    expect(screen.getByText('Song Title')).toBeTruthy();
  });

  test('카드 전체가 /parties/{id}?source=list 로 이동한다 (데스크탑 카드 패턴과 동일)', () => {
    render(<MobilePartyroomCard roomId={baseSummary.partyroomId} summary={baseSummary} />);
    expect(screen.getByRole('link').getAttribute('href')).toBe('/parties/1?source=list');
  });

  test('playbackActivated=false 일 때 now-playing 영역에 placeholder 를 표시한다', () => {
    render(
      <MobilePartyroomCard
        roomId={baseSummary.partyroomId}
        summary={{ ...baseSummary, playbackActivated: false, playback: undefined }}
      />
    );
    expect(screen.getByText(/재생 중인 곡이 없어요/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: 테스트 실행 (Red)**

```bash
npx vitest run src/features-mobile/partyroom/list/partyroom-card.component.test.tsx
```

Expected: import fail.

- [ ] **Step 3: 컴포넌트 구현**

```tsx
// src/features-mobile/partyroom/list/partyroom-card.component.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { PartyroomSummary } from '@/shared/api/http/types/partyrooms';
import { cn } from '@/shared/lib/functions/cn';

interface Props {
  roomId: number;
  summary: PartyroomSummary;
  onClose?: () => void;
}

/**
 * 모바일 로비 1컬럼 카드 (§4.4).
 *
 * - 풀폭 + 썸네일(now-playing) + 룸 제목 + 인원 + now-playing 1줄
 * - Link href: `/parties/${roomId}?source=list` (데스크탑 카드와 동일 attribution 패턴)
 * - DJ 닉네임은 list 엔드포인트가 제공하지 않음 → 표시 X (룸 진입 후 확인)
 */
const MobilePartyroomCard: FC<Props> = ({ roomId, summary, onClose }) => {
  return (
    <Link
      href={`/parties/${roomId}?source=list`}
      onClick={onClose}
      className={cn(
        'block w-full rounded-xl overflow-hidden bg-gray-900',
        'transition-colors hover:bg-gray-800 active:bg-gray-800'
      )}
    >
      <div className='relative w-full aspect-video bg-gray-800'>
        {summary.playback?.thumbnailImage ? (
          <Image
            src={summary.playback.thumbnailImage}
            alt={summary.playback.name}
            fill
            className='object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center text-gray-600 text-xs'>
            준비 중
          </div>
        )}
      </div>
      <div className='p-4 space-y-1.5'>
        <h3 className='text-base font-semibold text-white truncate'>{summary.title}</h3>
        <p className='text-xs text-gray-400'>👥 {summary.crewCount}명</p>
        {summary.playbackActivated && summary.playback ? (
          <p className='text-xs text-gray-500 truncate'>{summary.playback.name}</p>
        ) : (
          <p className='text-xs text-gray-600'>재생 중인 곡이 없어요</p>
        )}
      </div>
    </Link>
  );
};

export default MobilePartyroomCard;
```

- [ ] **Step 4: 테스트 실행 (Green)**

```bash
npx vitest run src/features-mobile/partyroom/list/partyroom-card.component.test.tsx
```

Expected: PASS.

- [ ] **Step 5: tsc + lint**

```bash
npx tsc --noEmit
npx eslint src/features-mobile/partyroom/list/
```

Expected: error 0.

- [ ] **Step 6: 커밋**

```bash
git add src/features-mobile/partyroom/list/partyroom-card.component.tsx \
        src/features-mobile/partyroom/list/partyroom-card.component.test.tsx
git commit -m "feat(features-mobile/partyroom/list): 모바일 1컬럼 카드 컴포넌트

PartyroomSummary 직접 받음 (데스크탑 카드와 동일 prop 패턴).
Link href = /parties/{id}?source=list (attribution 일관성).
DJ 닉네임은 list 엔드포인트 미제공이라 표시 X — 룸 진입 후 확인."
```

---

### Task 1.2: 모바일 리스트 + barrel

**Files:**

- Create: `src/features-mobile/partyroom/list/partyroom-list.component.tsx`
- Create: `src/features-mobile/partyroom/list/index.ts`

- [ ] **Step 1: 구현**

```tsx
// src/features-mobile/partyroom/list/partyroom-list.component.tsx
'use client';

import { FC } from 'react';
import { useFetchGeneralPartyrooms } from '@/features/partyroom/list/api/use-fetch-general-partyrooms.query';
import MobilePartyroomCard from './partyroom-card.component';

/**
 * 모바일 로비 1컬럼 카드 리스트.
 *
 * useFetchGeneralPartyrooms 는 regular useQuery (infinite 아님) — 반환 = PartyroomSummary[].
 * 데스크탑 hooks 그대로 재사용 (스펙 §1.6 entities/features 공통 경계).
 */
const MobilePartyroomList: FC = () => {
  const { data } = useFetchGeneralPartyrooms();
  const rooms = data ?? [];

  if (rooms.length === 0) {
    return (
      <div className='w-full py-12 text-center text-sm text-gray-500'>
        지금 열려 있는 파티가 없어요.
      </div>
    );
  }

  return (
    <ul className='flexCol gap-4 w-full'>
      {rooms.map((summary) => (
        <li key={summary.partyroomId}>
          <MobilePartyroomCard roomId={summary.partyroomId} summary={summary} />
        </li>
      ))}
    </ul>
  );
};

export default MobilePartyroomList;
```

- [ ] **Step 2: barrel**

```ts
// src/features-mobile/partyroom/list/index.ts
export { default as MobilePartyroomList } from './partyroom-list.component';
export { default as MobilePartyroomCard } from './partyroom-card.component';
```

- [ ] **Step 3: tsc + 회귀**

```bash
npx tsc --noEmit
npx vitest run src/features-mobile/
```

- [ ] **Step 4: 커밋**

```bash
git add src/features-mobile/partyroom/list/partyroom-list.component.tsx \
        src/features-mobile/partyroom/list/index.ts
git commit -m "feat(features-mobile/partyroom/list): 모바일 리스트 + barrel"
```

---

## Phase 2: widgets-mobile/partyroom-page-mobile/lobby + (lobby)/page.tsx wiring

### Task 2.1: 모바일 로비 shell (`MobileLobby`)

**Files:**

- Create: `src/widgets-mobile/partyroom-page-mobile/lobby.component.tsx`
- Create: `src/widgets-mobile/partyroom-page-mobile/index.ts`

- [ ] **Step 1: 구현**

```tsx
// src/widgets-mobile/partyroom-page-mobile/lobby.component.tsx
'use client';

import { FC } from 'react';
import { MobilePartyroomList } from '@/features-mobile/partyroom/list';

/**
 * 모바일 로비 page-level shell (§4.4 · §4.5).
 *
 * 데스크탑 `<Header />` 는 page.tsx 가 desktop 분기에서만 렌더 — 모바일 로비는 자체
 * 헤더("파티 찾기" + ⋮) 가짐 (스펙 §4.5).
 */
const MobileLobby: FC = () => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <header className='sticky top-0 z-10 bg-black border-b border-gray-900 px-4 h-12 flex items-center justify-between'>
        <h1 className='text-base font-semibold text-white'>파티 찾기</h1>
        <button
          aria-label='메뉴'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
          // chunk 3·4 에 menu 확장
        >
          ⋮
        </button>
      </header>
      <div className='flex-1 px-app pt-4 pb-8'>
        <MobilePartyroomList />
      </div>
    </main>
  );
};

export default MobileLobby;
```

- [ ] **Step 2: barrel**

```ts
// src/widgets-mobile/partyroom-page-mobile/index.ts
export { default as MobileLobby } from './lobby.component';
// MobileRoom 은 Task 5.1 에서 추가
```

- [ ] **Step 3: tsc + 커밋**

```bash
npx tsc --noEmit
git add src/widgets-mobile/partyroom-page-mobile/
git commit -m "feat(widgets-mobile/partyroom-page-mobile): 모바일 로비 shell"
```

---

### Task 2.2: `(lobby)/page.tsx` mobile 분기 교체

**Files:**

- Modify: `src/app/parties/(lobby)/page.tsx`

기존(chunk 1, commit 108556f): page.tsx 는 이미 RSC, `<Header />` 가 **데스크탑 분기에만** sibling (barrel 의 RSC-only Footer transitive import 차단 목적, `lobby.component.tsx` 14-21 JSDoc 참조). 본 task 는 mobile 분기를 `MobileFallbackCard` → `<MobileLobby />` 로 교체. **모바일 분기에 `<Header />` 추가 금지** — 모바일 로비 헤더는 `MobileLobby` 내부에서 자체 렌더 (§4.5 의 "파티 찾기 ⋮").

- [ ] **Step 1: 변경 (Header desktop-only 패턴 유지)**

```tsx
// src/app/parties/(lobby)/page.tsx
import { headers } from 'next/headers';
import { Header } from '@/widgets/layouts';
import { MobileLobby } from '@/widgets-mobile/partyroom-page-mobile';
import { DesktopLobby } from '@/widgets/partyroom-page-desktop';

const PartyLobbyPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileLobby />;
  return (
    <>
      <Header />
      <DesktopLobby />
    </>
  );
};

export default PartyLobbyPage;
```

> 모바일 로비 헤더(파티 찾기 + ⋮ 메뉴)는 `MobileLobby` 가 자체 가짐 (§4.5). 본 chunk 2 의 Task 2.1 에 mobile lobby header 추가 — minimal "파티 찾기" 텍스트, ⋮ 는 chunk 3·4 메뉴 확장 시.

- [ ] **Step 2: 로컬 SSR 분기 검증 (curl)**

```bash
# dev server 가동 가정. [[reference_pfplay_web_local_dev_http_webpack]]
curl -s http://localhost:3000/parties -H 'User-Agent: Mozilla/5.0 (Windows) Chrome/120 Safari' | grep -oE "DesktopLobby|MobileLobby" | sort -u
# Expected: DesktopLobby
curl -s http://localhost:3000/parties -H 'User-Agent: Mozilla/5.0 (iPhone) Mobile Safari' | grep -oE "DesktopLobby|MobileLobby" | sort -u
# Expected: MobileLobby
```

- [ ] **Step 3: tsc + 단위 회귀**

```bash
npx tsc --noEmit
npx vitest run
```

- [ ] **Step 4: 커밋**

```bash
git add 'src/app/parties/(lobby)/page.tsx'
git commit -m "feat(parties/lobby): page.tsx 모바일 분기를 MobileLobby 로 교체"
```

---

## Phase 3: widgets-mobile/partyroom-display-board (전광판 + 오디오)

본 phase 는 chunk 2 의 **청취 핵심**. mobile display-board 가 ActionButtons (리액션) + YoutubePlayer mount (오디오) + now-playing UI 를 모두 가짐.

### Task 3.1: ActionButtons + ActionButton 모바일 사본 (C3 격리)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/action-buttons.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/ui/parts/action-button.component.tsx` (sibling 의존)

ActionButtons 가 sibling `./action-button.component` 을 import 함 (확인: `src/widgets/partyroom-display-board/ui/parts/action-buttons.component.tsx` 의 import). 두 파일 모두 사본.

- [ ] **Step 1: 두 desktop 파일 읽기**

```bash
cat src/widgets/partyroom-display-board/ui/parts/action-buttons.component.tsx
cat src/widgets/partyroom-display-board/ui/parts/action-button.component.tsx
```

- [ ] **Step 2: 두 파일 모두 사본 (relative sibling import `./action-button.component` 유지)**

`src/widgets-mobile/partyroom-display-board/ui/parts/action-button.component.tsx` ← desktop `action-button.component.tsx` 본문 그대로.
`src/widgets-mobile/partyroom-display-board/ui/parts/action-buttons.component.tsx` ← desktop `action-buttons.component.tsx` 본문 그대로 (`./action-button.component` import 가 새 sibling 가리킴).

- [ ] **Step 3: 모듈 경계 grep 검증**

```bash
grep -E "from '@/widgets/" \
  src/widgets-mobile/partyroom-display-board/ui/parts/action-buttons.component.tsx \
  src/widgets-mobile/partyroom-display-board/ui/parts/action-button.component.tsx | head
```

Expected: 매칭 0 (entities/features/shared 만 import 이어야 함). 매칭 있으면 해당 import 도 사본 (별 sub-task 분리).

- [ ] **Step 4: tsc + 커밋**

```bash
npx tsc --noEmit
git add src/widgets-mobile/partyroom-display-board/ui/parts/
git commit -m "feat(widgets-mobile/partyroom-display-board): ActionButtons + ActionButton 모바일 사본 (C3 격리)"
```

---

### Task 3.2: 모바일 display-board (전광판 + 헤더 + YoutubePlayer)

**Files:**

- Create: `src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx`
- Create: `src/widgets-mobile/partyroom-display-board/index.ts`

본 컴포넌트 = mobile 룸의 fixed top chrome. 헤더(뒤로·룸이름·⋮) + now-playing + 오디오 mount + 리액션. sticky top.

- [ ] **Step 1: 구현**

```tsx
// src/widgets-mobile/partyroom-display-board/partyroom-display-board.component.tsx
'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { useStores } from '@/shared/lib/store/stores.context';
import { cn } from '@/shared/lib/functions/cn';
// Phase 0 의 정찰 결과로 정확한 import 결정. 데스크탑 video.component.tsx 의 mount
// 패턴을 그대로 활용 — YoutubePlayer 또는 react-youtube 의 Player 컴포넌트.
import { YoutubePlayer } from '@/widgets/partyroom-display-board/ui/parts/video.component'; // ⚠️ Phase 0 Step 2 결과로 정확한 경로/이름 결정
import ActionButtons from './ui/parts/action-buttons.component';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 전광판 (§4.2):
 * - sticky top — 헤더 + now-playing + progress + 리액션 inline 모두 한 묶음
 * - YoutubePlayer (visible=false 또는 1px) — **오디오 재생**
 * - 리액션 inline (플로팅 X — 채팅·키보드 충돌 회피)
 *
 * Audio mount 가 본 chunk 의 청취 핵심. desktop video.component.tsx 의 mount 패턴을
 * 그대로 사용 (state 동기화 hooks 모두 entities/store 에서 제공).
 *
 * Header (룸이름·뒤로·⋮ 메뉴) 는 본 컴포넌트 안에서 직접 렌더 — page.tsx 는 mobile
 * 룸에서 `<Header />` (글로벌) 미렌더.
 */
const MobilePartyroomDisplayBoard: FC<Props> = () => {
  const router = useRouter();
  const { useCurrentPartyroom } = useStores();
  const playbackActivated = useCurrentPartyroom((state) => state.playbackActivated);
  const playback = useCurrentPartyroom((state) => state.playback);
  const currentDj = useCurrentPartyroom((state) => state.currentDj);
  const crews = useCurrentPartyroom((state) => state.crews);
  const partyroomTitle = useCurrentPartyroom((state) => state.title); // ⚠️ Phase 0 Step 1 의 store grep 결과로 정확한 필드명 확인 (state.partyroom?.title 일 수도)

  const currentDjNickname = currentDj
    ? (crews.find((c) => c.crewId === currentDj.crewId)?.nickname ?? null)
    : null;

  return (
    <div className={cn('sticky top-0 z-20 w-full bg-black border-b border-gray-800')}>
      {/* 헤더 row: 뒤로 · 룸 이름 · ⋮ (⋮ 메뉴는 chunk 3·4 에 확장) */}
      <header className='flex items-center justify-between px-4 h-12'>
        <button
          aria-label='뒤로'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
          onClick={() => router.push('/parties')}
        >
          ←
        </button>
        <h1 className='flex-1 text-center text-base font-semibold text-white truncate px-2'>
          {partyroomTitle ?? ''}
        </h1>
        <button
          aria-label='메뉴'
          className='w-11 h-11 flex items-center justify-center text-gray-300'
          // chunk 3·4 에 menu 확장 (share, room info, exit)
        >
          ⋮
        </button>
      </header>

      {/* now-playing + 리액션 */}
      <div className='px-4 py-3 space-y-3'>
        {playbackActivated && playback ? (
          <>
            <p className='text-base font-semibold text-white truncate'>{playback.name}</p>
            {currentDjNickname && <p className='text-xs text-gray-500'>🎧 {currentDjNickname}</p>}
            <p className='text-xs text-gray-600'>{playback.duration}</p>
          </>
        ) : (
          <p className='text-sm text-gray-500'>지금 재생 중인 곡이 없어요</p>
        )}

        <ActionButtons />
      </div>

      {/* YoutubePlayer = 오디오 mount. visible=false 또는 1px 으로 숨김 */}
      {playbackActivated && playback && (
        <div className='absolute -z-10 pointer-events-none w-px h-px overflow-hidden opacity-0'>
          {/* ⚠️ Phase 0 Step 2 결과로 정확한 component name·props 사용
             데스크탑 패턴 예: <YoutubePlayer videoId={playback.linkId} ... /> */}
          <YoutubePlayer videoId={playback.linkId} />
        </div>
      )}
    </div>
  );
};

export default MobilePartyroomDisplayBoard;
```

> **⚠️ Phase 0 Step 1·2 의존성:** 본 task 의 두 가지가 정찰로 확정되어야 함:
>
> 1. `state.title` 또는 `state.partyroom?.title` 등 룸 이름 selector 의 정확한 경로
> 2. YoutubePlayer 컴포넌트의 정확한 import path 와 props 시그니처 (data 흐름: linkId · start time · 자동재생)
>
> 정찰 결과로 위 code block 의 두 곳(`partyroomTitle` selector, `YoutubePlayer` import) 을 정확한 값으로 대체.

- [ ] **Step 2: barrel**

```ts
// src/widgets-mobile/partyroom-display-board/index.ts
export { default as MobilePartyroomDisplayBoard } from './partyroom-display-board.component';
```

- [ ] **Step 3: tsc + 단위 회귀**

```bash
npx tsc --noEmit
npx vitest run
```

Expected: error 0, 회귀 0.

- [ ] **Step 4: 커밋**

```bash
git add src/widgets-mobile/partyroom-display-board/
git commit -m "feat(widgets-mobile/partyroom-display-board): sticky 전광판 + 헤더 + YoutubePlayer 오디오 mount + 리액션 inline

§4.2 mobile layout. YoutubePlayer 가 1px hidden 으로 오디오만 재생 (모바일 청취 핵심).
헤더는 본 컴포넌트 내부 (뒤로·룸이름·⋮; ⋮ menu 확장은 chunk 3·4).
ActionButtons 는 mobile 사본 (Task 3.1, C3 격리)."
```

---

## Phase 4: widgets-mobile/partyroom-crews-panel

### Task 4.1: 모바일 크루 패널

**Files:**

- Create: `src/widgets-mobile/partyroom-crews-panel/partyroom-crews-panel.component.tsx`
- Create: `src/widgets-mobile/partyroom-crews-panel/index.ts`

- [ ] **Step 1: 구현**

```tsx
// src/widgets-mobile/partyroom-crews-panel/partyroom-crews-panel.component.tsx
'use client';

import Image from 'next/image';
import { FC } from 'react';
import { useCurrentPartyroomCrews } from '@/features/partyroom/list-crews';
import { useStores } from '@/shared/lib/store/stores.context';
import { cn } from '@/shared/lib/functions/cn';

/**
 * 모바일 크루 패널 (§4.3):
 * - 세그먼트 헤더 "N명 청취 중" (scroll container 기준 sticky top-0 — display-board
 *   sticky 와 충돌 회피)
 * - 1컬럼 리스트, 각 row = avatarIconUri 32×32 + nickname + DJ 표식
 * - DJ 식별: state.currentDj?.crewId === crew.crewId (Crew.Model 에 isDj 필드 없음)
 * - 모더레이션 액션 X (§OUT)
 */
const MobilePartyroomCrewsPanel: FC = () => {
  const crews = useCurrentPartyroomCrews();
  const { useCurrentPartyroom } = useStores();
  const currentDj = useCurrentPartyroom((state) => state.currentDj);

  return (
    <div className='w-full'>
      <div
        className={cn(
          'sticky top-0 z-[5] bg-black px-4 py-2',
          'text-xs text-gray-400 border-b border-gray-800'
        )}
      >
        {crews.length}명 청취 중
      </div>
      <ul className='divide-y divide-gray-900'>
        {crews.map((crew) => {
          const isDj = currentDj?.crewId === crew.crewId;
          return (
            <li key={crew.crewId} className='flex items-center gap-3 px-4 py-3 min-h-[44px]'>
              <div className='relative w-8 h-8 rounded-full overflow-hidden bg-gray-800 shrink-0'>
                {crew.avatarIconUri && (
                  <Image src={crew.avatarIconUri} alt='' fill className='object-cover' />
                )}
              </div>
              <span className='text-sm text-white truncate flex-1'>{crew.nickname}</span>
              {isDj && <span className='text-[10px] text-red-400 font-bold shrink-0'>DJ</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MobilePartyroomCrewsPanel;
```

- [ ] **Step 2: barrel + tsc + 커밋**

```ts
// src/widgets-mobile/partyroom-crews-panel/index.ts
export { default as MobilePartyroomCrewsPanel } from './partyroom-crews-panel.component';
```

```bash
npx tsc --noEmit
git add src/widgets-mobile/partyroom-crews-panel/
git commit -m "feat(widgets-mobile/partyroom-crews-panel): 모바일 크루 패널

scroll container 기준 sticky top-0 (display-board 의 viewport sticky 와 충돌 회피).
DJ 식별 = state.currentDj?.crewId === crew.crewId (Crew.Model 에 isDj 필드 없음).
모더레이션 액션 미포함 (§OUT)."
```

---

## Phase 5: widgets-mobile/partyroom-page-mobile/room + (room)/[id]/page.tsx wiring

### Task 5.1: 모바일 룸 shell

**Files:**

- Create: `src/widgets-mobile/partyroom-page-mobile/room.component.tsx`
- Modify: `src/widgets-mobile/partyroom-page-mobile/index.ts`

본 shell = 모바일 룸의 합성: display-board (sticky · 헤더 · 오디오 · 리액션) + 크루 패널 (chunk 2 시점 임시 직접 노출). 채팅·DJ 큐 탭은 chunk 3·4.

- [ ] **Step 1: 구현**

```tsx
// src/widgets-mobile/partyroom-page-mobile/room.component.tsx
'use client';

import { FC } from 'react';
import { MobilePartyroomCrewsPanel } from '@/widgets-mobile/partyroom-crews-panel';
import { MobilePartyroomDisplayBoard } from '@/widgets-mobile/partyroom-display-board';

interface Props {
  partyroomId: number;
}

/**
 * 모바일 룸 page-level shell (§4.2 베이스).
 *
 * 본 chunk 2 의 prod 상태:
 * - display-board = 헤더(뒤로·룸이름·⋮) + sticky now-playing + YoutubePlayer 오디오 + 리액션
 * - 크루 패널 직접 노출 (scroll container 안에 sticky-top 헤더 가짐, display-board sticky 와 무충돌)
 *
 * Deferred (chunk 3·4):
 * - 탭바 (채팅/크루/큐)
 * - 채팅 패널
 * - DJ 큐 패널
 *
 * enter/teardown 효과는 `(room)/[id]/layout.tsx` 가 device 무관 처리.
 */
const MobileRoom: FC<Props> = ({ partyroomId }) => {
  return (
    <main className='min-h-screen bg-black flex flex-col'>
      <MobilePartyroomDisplayBoard partyroomId={partyroomId} />
      <div className='flex-1 overflow-y-auto'>
        <MobilePartyroomCrewsPanel />
        {/* chunk 3: 탭바 + 채팅 패널 wiring */}
        {/* chunk 4: DJ 큐 패널 wiring */}
      </div>
    </main>
  );
};

export default MobileRoom;
```

- [ ] **Step 2: index.ts 갱신**

```ts
// src/widgets-mobile/partyroom-page-mobile/index.ts
export { default as MobileLobby } from './lobby.component';
export { default as MobileRoom } from './room.component';
```

- [ ] **Step 3: tsc + 커밋**

```bash
npx tsc --noEmit
git add src/widgets-mobile/partyroom-page-mobile/room.component.tsx \
        src/widgets-mobile/partyroom-page-mobile/index.ts
git commit -m "feat(widgets-mobile/partyroom-page-mobile): 모바일 룸 shell

display-board (헤더+sticky+오디오+리액션) + 크루 패널 직접 노출.
탭바/채팅/DJ 큐 wiring 은 chunk 3·4."
```

---

### Task 5.2: `(room)/[id]/page.tsx` mobile 분기 교체

**Files:**

- Modify: `src/app/parties/(room)/[id]/page.tsx`

- [ ] **Step 1: 변경**

```tsx
// src/app/parties/(room)/[id]/page.tsx
import { headers } from 'next/headers';
import { MobileRoom } from '@/widgets-mobile/partyroom-page-mobile';
import { DesktopRoom } from '@/widgets/partyroom-page-desktop';

const PartyroomPage = ({ params }: { params: { id: string } }) => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  const partyroomId = Number(params.id);
  return isMobile ? (
    <MobileRoom partyroomId={partyroomId} />
  ) : (
    <DesktopRoom partyroomId={partyroomId} />
  );
};

export default PartyroomPage;
```

> 룸 page.tsx 는 글로벌 Header 미렌더 — 모바일 룸의 헤더(뒤로·룸이름·⋮) 는 MobileDisplayBoard 가, 데스크탑 룸의 헤더는 DesktopRoom 내부 chrome 이 가짐.

- [ ] **Step 2: 로컬 검증**

```bash
curl -s http://localhost:3000/parties/1 -H 'User-Agent: Mozilla/5.0 (iPhone) Mobile Safari' | grep -oE "DesktopRoom|MobileRoom" | sort -u
# Expected: MobileRoom
curl -s http://localhost:3000/parties/1 -H 'User-Agent: Mozilla/5.0 (Windows) Chrome' | grep -oE "DesktopRoom|MobileRoom" | sort -u
# Expected: DesktopRoom
```

- [ ] **Step 3: vitest 전체 + 커밋**

```bash
npx vitest run
git add 'src/app/parties/(room)/[id]/page.tsx'
git commit -m "feat(parties/room): page.tsx 모바일 분기를 MobileRoom 로 교체"
```

---

## Phase 6: MobileOnlyDesktopFeatureCard + 가드 (avatar = RSC 변환 동반)

### Task 6.1: 가드 카드 컴포넌트

**Files:**

- Create: `src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx`
- Create: `src/shared/ui/components/mobile-only-desktop-feature-card/index.ts`

- [ ] **Step 1: 구현**

```tsx
// src/shared/ui/components/mobile-only-desktop-feature-card/mobile-only-desktop-feature-card.component.tsx
'use client';

import Link from 'next/link';
import { FC } from 'react';

export type MobileOnlyDesktopFeature =
  | 'avatar-edit'
  | 'profile-edit'
  | 'room-create'
  | 'moderation'
  | 'bug-report'
  | 'withdraw';

const featureLabel: Record<MobileOnlyDesktopFeature, string> = {
  'avatar-edit': '아바타 편집',
  'profile-edit': '프로필 편집',
  'room-create': '룸 생성',
  moderation: '모더레이션',
  'bug-report': '버그 리포트',
  withdraw: '회원 탈퇴',
};

interface Props {
  feature: MobileOnlyDesktopFeature;
}

const MobileOnlyDesktopFeatureCard: FC<Props> = ({ feature }) => {
  return (
    <main className='min-h-screen flex items-center justify-center px-6 py-10 bg-black'>
      <div className='max-w-md w-full text-center space-y-5'>
        <div className='text-5xl'>🖥️</div>
        <h1 className='text-xl font-bold text-white'>
          {featureLabel[feature]} 은 데스크탑에서 사용 가능합니다
        </h1>
        <p className='text-sm text-gray-400'>
          데스크탑 브라우저로 접속하시면 이 기능을 이용하실 수 있습니다.
        </p>
        <Link
          href='/parties'
          className='inline-block px-6 py-3 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors'
        >
          ← 파티 찾기로 돌아가기
        </Link>
      </div>
    </main>
  );
};

export default MobileOnlyDesktopFeatureCard;
```

- [ ] **Step 2: barrel + tsc + 커밋**

```ts
// src/shared/ui/components/mobile-only-desktop-feature-card/index.ts
export {
  default as MobileOnlyDesktopFeatureCard,
  type MobileOnlyDesktopFeature,
} from './mobile-only-desktop-feature-card.component';
```

```bash
npx tsc --noEmit
git add src/shared/ui/components/mobile-only-desktop-feature-card/
git commit -m "feat(shared/ui/components): MobileOnlyDesktopFeatureCard 데스크탑 전용 가드"
```

---

### Task 6.2: avatar 라우트 RSC 변환 + 가드 (chunk 1 (lobby)/page.tsx 패턴)

**Files:**

- Create: `src/widgets/avatar-settings-page-desktop/avatar-settings-page-desktop.component.tsx`
- Create: `src/widgets/avatar-settings-page-desktop/index.ts`
- Modify: `src/app/settings/avatar/page.tsx`

`/settings/avatar/page.tsx` 가 `'use client'` 라 `headers()` 사용 불가. chunk 1 의 `(lobby)/page.tsx` 와 동일 패턴 — 기존 'use client' 본문을 desktop shell 위젯으로 추출 + page.tsx 를 RSC thin shim 으로 변환.

- [ ] **Step 1: 기존 avatar page.tsx 본문 확인 + desktop shell 로 추출**

```bash
cat src/app/settings/avatar/page.tsx
```

기존 본문을 `widgets/avatar-settings-page-desktop/avatar-settings-page-desktop.component.tsx` 로 그대로 복사 (`'use client'` 유지, import 그대로). chunk 1 의 DesktopLobby/DesktopRoom 패턴 참조.

```tsx
// src/widgets/avatar-settings-page-desktop/avatar-settings-page-desktop.component.tsx
'use client';

// ⚠️ 기존 src/app/settings/avatar/page.tsx 의 import + body 를 그대로 복사 (변경 0).
// 본 plan 의 reviewer 가 page 본문을 직접 read 한 후 정확히 복사.

const AvatarSettingsPageDesktop = () => {
  // 기존 body
};

export default AvatarSettingsPageDesktop;
```

- [ ] **Step 2: barrel**

```ts
// src/widgets/avatar-settings-page-desktop/index.ts
export { default as AvatarSettingsPageDesktop } from './avatar-settings-page-desktop.component';
```

- [ ] **Step 3: page.tsx 를 RSC + 가드 + 데스크탑 shell 렌더로 교체**

```tsx
// src/app/settings/avatar/page.tsx
import { headers } from 'next/headers';
import { MobileOnlyDesktopFeatureCard } from '@/shared/ui/components/mobile-only-desktop-feature-card';
import { AvatarSettingsPageDesktop } from '@/widgets/avatar-settings-page-desktop';

const AvatarSettingsPage = () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileOnlyDesktopFeatureCard feature='avatar-edit' />;
  return <AvatarSettingsPageDesktop />;
};

export default AvatarSettingsPage;
```

- [ ] **Step 4: tsc + next build 검증 (RSC 동적 페이지 확인)**

```bash
npx tsc --noEmit
npx vitest run
npx next build
# Expected: 빌드 성공, /settings/avatar 가 ƒ (Dynamic) 으로 표기
```

- [ ] **Step 5: 로컬 SSR 분기 검증**

```bash
curl -s http://localhost:3000/settings/avatar -H 'User-Agent: Mozilla/5.0 (iPhone) Mobile Safari' | grep -oE "MobileOnlyDesktopFeatureCard|아바타 편집"
# Expected: 가드 카드 텍스트
curl -s http://localhost:3000/settings/avatar -H 'User-Agent: Mozilla/5.0 (Windows) Chrome' | grep -oE "AvatarSettingsPageDesktop|MobileOnlyDesktopFeatureCard"
# Expected: AvatarSettingsPageDesktop (또는 데스크탑 본문 마커)
```

- [ ] **Step 6: 커밋**

```bash
git add src/widgets/avatar-settings-page-desktop/ src/app/settings/avatar/page.tsx
git commit -m "feat(settings/avatar): page.tsx RSC 변환 + 모바일 가드

기존 'use client' 본문을 AvatarSettingsPageDesktop 위젯으로 추출 (chunk 1
(lobby)/page.tsx 와 동일 패턴). page.tsx 가 headers() 보고 모바일은 가드 카드,
데스크탑은 desktop shell 렌더."
```

---

### Task 6.3: profile 라우트 가드 (RSC 그대로, trivial 1줄)

**Files:**

- Modify: `src/app/settings/profile/page.tsx`

`/settings/profile/page.tsx` 는 이미 RSC (`async function`, no `'use client'`). 가드 1줄만 추가. ProtectedLayout 의 `profileUpdated` redirect 가 첫 가입 케이스를 먼저 처리하므로 (가드 발동 전 redirect), 첫 가입 모바일 사용자에게 가드가 잘못 노출되는 케이스 없음.

- [ ] **Step 1: 기존 page.tsx top 에 가드 분기 추가**

```tsx
// src/app/settings/profile/page.tsx (예시 — 기존 본문 유지하면서 첫 부분에 가드)
import { headers } from 'next/headers';
import { MobileOnlyDesktopFeatureCard } from '@/shared/ui/components/mobile-only-desktop-feature-card';

const ProfileSettingsPage = async () => {
  const isMobile = headers().get('x-pf-device') === 'mobile';
  if (isMobile) return <MobileOnlyDesktopFeatureCard feature='profile-edit' />;
  // 기존 본문 그대로
};
```

> 정확한 시그니처(`async` 여부, props) 는 실 코드 확인 후 매칭.

- [ ] **Step 2: 로컬 SSR 분기 + tsc + 커밋**

```bash
npx tsc --noEmit
curl -s http://localhost:3000/settings/profile -H 'User-Agent: Mozilla/5.0 (iPhone) Mobile Safari' | grep -oE "MobileOnlyDesktopFeatureCard|프로필 편집"
git add src/app/settings/profile/page.tsx
git commit -m "feat(settings/profile): 모바일 가드 (RSC 그대로 1줄 추가)"
```

---

## Phase 7: 검증 + GH 코멘트 + 마무리

### Task 7.1: 전체 스위트 검증

- [ ] **Step 1: vitest 전체 + tsc + eslint**

```bash
cd "C:/Users/Eisen/Desktop/Labs/[projects] pfplay/pfplay-web"
npx vitest run
npx tsc --noEmit
npx eslint src/
```

Expected: 전체 PASS, 회귀 0.

- [ ] **Step 2: next build**

```bash
npx next build
```

Expected:

- 빌드 성공
- `/parties` · `/parties/[id]` · `/settings/avatar` 모두 `ƒ (Dynamic)` (chunk 1 + chunk 2 RSC 변환 결과)
- 빌드 경고 fixed_modal 등 chunk 1 baseline 과 동일 (회귀 0)

- [ ] **Step 3: 데스크탑 헤드드 수동 확인**

```bash
npx next dev
```

브라우저 확인:

1. 데스크탑 viewport: `/parties` (기존 로비), `/parties/1` (기존 룸), `/settings/avatar` (기존 본문) — 모두 변경 0
2. DevTools 디바이스 시뮬레이션 (iPhone 13):
   - `/parties` = 1컬럼 카드 리스트
   - `/parties/1` = sticky 전광판(헤더·뒤로·⋮·now-playing·리액션) + 크루 리스트 + **YouTube 오디오 들림** (청취 핵심)
   - `/settings/avatar` = 가드 카드 ("아바타 편집은 데스크탑에서...")
   - `/settings/profile` = 가드 카드 ("프로필 편집은...")
3. DevTools Console → hydration mismatch 경고 없음 확인

---

### Task 7.2: GH 이슈 #340 진행 코멘트

- [ ] **Step 1: 코멘트**

```bash
gh issue comment 340 --body '## chunk 2 (로비 + 룸 청취) 완료

- 모바일 진입자가 chunk 1 의 임시 fallback 대신 실제 모바일 화면을 보게 됨.
- /parties = 1컬럼 카드 리스트 (PartyroomSummary 직접 매핑)
- /parties/1 = sticky 전광판(헤더·뒤로·⋮·now-playing) + YouTube 오디오 mount + 리액션 inline + 크루 리스트
- /settings/avatar · /settings/profile 에 가드 카드 ("…데스크탑에서 사용 가능")

데스크탑 동작은 그대로. 탭바·채팅·DJ 큐 wiring 은 chunk 3·4.'
```

---

### Task 7.3: 커밋 정리 + push 게이트

- [ ] **Step 1: 커밋 시리즈 확인**

```bash
git log --oneline origin/development..HEAD
```

본 chunk 의 task 단위 = 논리 단위. squash 불요 ([[feedback_commit_consolidation_before_push]]).

- [ ] **Step 2: push (사용자 트리거)**

```bash
git push -u origin feature/mobile-responsive-spec-2
gh pr create -B development -H feature/mobile-responsive-spec-2 \
  --title "feat(mobile-responsive): chunk 2 — 로비 + 룸 청취" \
  --body "..." # 한글, spec/plan/이슈 reference, atomic PR caveat, YoutubePlayer 청취 명시
```

---

## 마무리 체크리스트

- [ ] Phase 0~7 의 task step 전부 완료 + 체크
- [ ] `git log --oneline origin/development..HEAD` 가 의도된 commit 시리즈와 일치
- [ ] vitest · tsc · eslint · next build 모두 green
- [ ] 데스크탑 헤드드 smoke 통과 (변경 없음 확인)
- [ ] 모바일 헤드드 smoke 통과 (로비·룸·오디오·가드 카드 동작)
- [ ] GH 이슈 #340 진행 상황 코멘트
- [ ] 사용자에게 push/PR 트리거 요청

## 롤백

본 chunk 2 의 모든 commit 은 단일 PR 로 머지. 데스크탑 회귀 발견 시 전체 revert (partial revert 금지). 로컬 단계라면 `git reset --hard origin/development`.

## 다음 chunk

본 chunk 2 PR 머지 + dev/stg 안정화 후 chunk 3 (채팅 + 크루 탭 wiring) plan 작성.
